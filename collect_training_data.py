"""
Collect Training Data for Ranking Model
This script fetches GitHub data and prepares it for retraining the ranking model
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime
import json
import time

# ============================================================================
# Configuration
# ============================================================================

GITHUB_TOKEN = "YOUR_GITHUB_TOKEN_HERE"  # TODO: Add your token
HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Content-Type": "application/json"
}

# List of GitHub users to collect data from (for training)
# Add more users to get diverse training data
TRAINING_USERS = [
    "torvalds",      # Linux creator
    "gvanrossum",    # Python creator  
    "tj",            # Express.js creator
    "sindresorhus",  # Popular open source contributor
    "YOUR_USERNAME", # Add yourself!
    # Add more users...
]

# ============================================================================
# GraphQL Query
# ============================================================================

REPO_QUERY = """
query($username: String!, $cursor: String) {
  user(login: $username) {
    repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, 
                 orderBy: {field: UPDATED_AT, direction: DESC}) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        name
        nameWithOwner
        description
        url
        primaryLanguage { name }
        stargazerCount
        forkCount
        watchers { totalCount }
        isFork
        isArchived
        isEmpty
        createdAt
        updatedAt
        pushedAt
        languages(first: 10) {
          edges {
            size
            node { name }
          }
          totalSize
        }
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 1) {
                totalCount
              }
            }
          }
        }
      }
    }
  }
}
"""

# ============================================================================
# Data Collection Functions
# ============================================================================

def fetch_user_repos(username):
    """Fetch all repositories for a user"""
    print(f"📥 Fetching repos for {username}...")
    
    all_repos = []
    cursor = None
    has_next = True
    
    while has_next:
        variables = {"username": username, "cursor": cursor}
        response = requests.post(
            "https://api.github.com/graphql",
            json={"query": REPO_QUERY, "variables": variables},
            headers=HEADERS
        )
        
        if response.status_code != 200:
            print(f"  ❌ Error: {response.status_code}")
            break
        
        data = response.json()
        
        if 'errors' in data:
            print(f"  ❌ GraphQL Error: {data['errors']}")
            break
        
        repos = data['data']['user']['repositories']['nodes']
        page_info = data['data']['user']['repositories']['pageInfo']
        
        all_repos.extend(repos)
        
        has_next = page_info['hasNextPage']
        cursor = page_info['endCursor']
        
        print(f"  ✓ Fetched {len(repos)} repos (total: {len(all_repos)})")
        
        # Rate limiting
        time.sleep(0.5)
    
    return all_repos

def process_repo(repo):
    """Extract features from a repository"""
    try:
        # Parse dates
        created_at = pd.to_datetime(repo['createdAt'])
        updated_at = pd.to_datetime(repo['updatedAt'])
        pushed_at = pd.to_datetime(repo['pushedAt'])
        
        # Remove timezone for calculations
        if created_at.tz:
            created_at = created_at.tz_localize(None)
        if updated_at.tz:
            updated_at = updated_at.tz_localize(None)
        if pushed_at.tz:
            pushed_at = pushed_at.tz_localize(None)
        
        now = datetime.now()
        
        # Extract metrics
        stars = repo['stargazerCount']
        forks = repo['forkCount']
        watchers = repo['watchers']['totalCount']
        
        # Get commits count
        commits = 0
        if repo['defaultBranchRef'] and repo['defaultBranchRef']['target']:
            commits = repo['defaultBranchRef']['target']['history']['totalCount']
        
        # Calculate derived features
        repo_age_days = (now - created_at).days
        days_since_update = (now - updated_at).days
        days_since_push = (now - pushed_at).days
        
        # Get primary language
        primary_lang = repo['primaryLanguage']['name'] if repo['primaryLanguage'] else 'Unknown'
        
        # Get all languages
        languages = []
        total_lang_size = repo['languages']['totalSize']
        for edge in repo['languages']['edges']:
            languages.append({
                'name': edge['node']['name'],
                'size': edge['size']
            })
        
        # Calculate features
        features = {
            'name': repo['name'],
            'nameWithOwner': repo['nameWithOwner'],
            'url': repo['url'],
            'description': repo['description'] or '',
            
            # PRIMARY METRICS (what you want to prioritize)
            'stars': stars,
            'watchers': watchers,
            'forks': forks,
            'total_commits': commits,
            'days_since_update': days_since_update,
            
            # Additional metrics
            'repo_age_days': repo_age_days,
            'days_since_push': days_since_push,
            'primaryLanguage': primary_lang,
            'num_languages': len(languages),
            'total_lang_size': total_lang_size,
            
            # Boolean flags
            'isFork': repo['isFork'],
            'isArchived': repo['isArchived'],
            'isEmpty': repo['isEmpty'],
            
            # Derived features
            'is_active': days_since_push < 180,
            'stars_per_day': stars / (repo_age_days + 1),
            'forks_per_day': forks / (repo_age_days + 1),
            'commits_per_day': commits / (repo_age_days + 1),
            'fork_ratio': forks / (stars + 1),
            'engagement_score': stars + (forks * 2) + watchers,
            'popularity_score': np.log1p(stars) + np.log1p(forks) * 0.5,
            
            # Log transforms (help with skewed distributions)
            'stars_log': np.log1p(stars),
            'forks_log': np.log1p(forks),
            'commits_log': np.log1p(commits),
        }
        
        return features
        
    except Exception as e:
        print(f"  ⚠️ Error processing {repo.get('name', 'unknown')}: {e}")
        return None

# ============================================================================
# Main Collection
# ============================================================================

def main():
    print("="*80)
    print("🚀 GitHub Training Data Collection")
    print("="*80)
    
    if GITHUB_TOKEN == "YOUR_GITHUB_TOKEN_HERE":
        print("\n❌ ERROR: Please add your GitHub token to GITHUB_TOKEN variable")
        print("   Get one at: https://github.com/settings/tokens")
        return
    
    all_repo_data = []
    
    for username in TRAINING_USERS:
        repos = fetch_user_repos(username)
        
        print(f"  📊 Processing {len(repos)} repositories...")
        for repo in repos:
            # Skip forks for training (we only want original repos)
            if repo['isFork']:
                continue
            
            features = process_repo(repo)
            if features:
                all_repo_data.append(features)
        
        print(f"  ✅ Collected {len([r for r in all_repo_data if r])} total repos\n")
    
    # Create DataFrame
    df = pd.DataFrame(all_repo_data)
    
    print("\n" + "="*80)
    print(f"✅ Data Collection Complete!")
    print("="*80)
    print(f"Total repositories: {len(df)}")
    print(f"Total users: {len(TRAINING_USERS)}")
    print(f"\nFeatures collected: {df.shape[1]}")
    print(f"Samples: {df.shape[0]}")
    
    # Show statistics
    print(f"\n📊 Dataset Statistics:")
    print(f"  Stars - Mean: {df['stars'].mean():.1f}, Max: {df['stars'].max()}")
    print(f"  Forks - Mean: {df['forks'].mean():.1f}, Max: {df['forks'].max()}")
    print(f"  Watchers - Mean: {df['watchers'].mean():.1f}, Max: {df['watchers'].max()}")
    print(f"  Commits - Mean: {df['total_commits'].mean():.1f}, Max: {df['total_commits'].max()}")
    
    # Save to CSV
    output_file = 'github_training_data.csv'
    df.to_csv(output_file, index=False)
    print(f"\n💾 Saved to: {output_file}")
    
    print("\n📝 Next Steps:")
    print("1. Review the data in github_training_data.csv")
    print("2. Run: python retrain_ranking_model.py")
    print("3. The retrained model will automatically prioritize your metrics!")

if __name__ == "__main__":
    main()

