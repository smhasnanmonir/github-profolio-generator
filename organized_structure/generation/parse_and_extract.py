"""
Feature Extraction Module for Portfolio Generation
Extracts and processes features from GitHub data for ML model consumption
"""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any


def extract_repo_features(repos: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Extract repository features from GitHub data for ML models.
    
    Args:
        repos: List of repository dictionaries from GitHub API
        
    Returns:
        DataFrame with repository features
    """
    if not repos:
        return pd.DataFrame()
    
    repo_data = []
    
    for repo in repos:
        try:
            # Parse dates and make timezone-naive for comparison
            created_at = pd.to_datetime(repo.get('createdAt', ''))
            updated_at = pd.to_datetime(repo.get('updatedAt', ''))
            pushed_at = pd.to_datetime(repo.get('pushedAt', ''))
            
            # Remove timezone info to allow comparison with datetime.now()
            if not pd.isna(created_at) and created_at.tz is not None:
                created_at = created_at.tz_localize(None)
            if not pd.isna(updated_at) and updated_at.tz is not None:
                updated_at = updated_at.tz_localize(None)
            if not pd.isna(pushed_at) and pushed_at.tz is not None:
                pushed_at = pushed_at.tz_localize(None)
            
            # Calculate age
            now = datetime.now()
            repo_age_days = (now - created_at).days if not pd.isna(created_at) else 0
            
            # Get language info
            primary_lang = repo.get('primaryLanguage', {})
            lang_name = primary_lang.get('name', '') if primary_lang else ''
            
            # Get all languages
            languages = repo.get('languages', {}).get('edges', [])
            all_langs = [edge.get('node', {}).get('name', '') for edge in languages]
            total_lang_size = repo.get('languages', {}).get('totalSize', 0)
            total_lang_count = repo.get('languages', {}).get('totalCount', 0)
            
            # Extract metrics
            stars = repo.get('stargazerCount', 0) or 0
            forks = repo.get('forkCount', 0) or 0
            watchers = repo.get('watchers', {}).get('totalCount', 0) if isinstance(repo.get('watchers'), dict) else 0
            deployments = repo.get('deployments', {}).get('totalCount', 0) if isinstance(repo.get('deployments'), dict) else 0
            
            # Boolean flags
            is_fork = repo.get('isFork', False)
            is_archived = repo.get('isArchived', False)
            is_template = repo.get('isTemplate', False)
            has_issues = repo.get('hasIssuesEnabled', True)
            has_wiki = repo.get('hasWikiEnabled', True)
            
            # Activity metrics
            days_since_update = (now - updated_at).days if not pd.isna(updated_at) else 999
            days_since_push = (now - pushed_at).days if not pd.isna(pushed_at) else 999
            
            repo_features = {
                'name': repo.get('name', ''),
                'nameWithOwner': repo.get('nameWithOwner', ''),
                'description': repo.get('description', ''),
                'url': repo.get('url', ''),
                'primaryLanguage': lang_name,
                'all_languages': all_langs,
                'total_lang_size': total_lang_size,
                'languages_total_size': total_lang_size,  # For ranking model
                'languages_total_count': total_lang_count,  # For ranking model
                'stars': stars,
                'forks': forks,
                'watchers': watchers,
                'deployments': deployments,  # For ranking model
                'is_fork': is_fork,
                'is_archived': is_archived,
                'is_template': is_template,
                'has_issues': has_issues,
                'has_wiki': has_wiki,
                'repo_age_days': repo_age_days,
                'days_since_update': days_since_update,
                'days_since_push': days_since_push,
                'is_active': days_since_push < 180,  # Active if pushed in last 6 months
                'popularity_score': np.log1p(stars) + np.log1p(forks) * 0.5,
                'engagement_score': stars + forks * 2 + watchers,
                'createdAt': repo.get('createdAt', ''),
                'updatedAt': repo.get('updatedAt', ''),
                'isFork': is_fork,  # Add these for filtering logic
                'isEmpty': repo.get('isEmpty', False),
                'isArchived': is_archived,
            }
            
            repo_data.append(repo_features)
            
        except Exception as e:
            print(f"Warning: Error processing repo {repo.get('name', 'unknown')}: {e}")
            continue
    
    df = pd.DataFrame(repo_data)
    
    # Add computed features for ML models
    if not df.empty:
        df['stars_log'] = np.log1p(df['stars'])
        df['forks_log'] = np.log1p(df['forks'])
        df['stars_per_day'] = df['stars'] / (df['repo_age_days'] + 1)
        df['forks_per_day'] = df['forks'] / (df['repo_age_days'] + 1)
        df['fork_ratio'] = df['forks'] / (df['stars'] + 1)
    
    return df


def extract_user_features(contributions: Dict[str, Any], repos_df: pd.DataFrame, user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract user-level features from contributions and repository data.
    
    Args:
        contributions: Contributions collection from GitHub API
        repos_df: DataFrame of repository features
        user_data: Raw user data from GitHub API
        
    Returns:
        Dictionary of user features for ML models
    """
    # Parse account age and make timezone-naive
    created_at = pd.to_datetime(user_data.get('createdAt', ''))
    if not pd.isna(created_at) and created_at.tz is not None:
        created_at = created_at.tz_localize(None)
    account_age_days = (datetime.now() - created_at).days if not pd.isna(created_at) else 1
    
    # Contribution statistics
    total_commits = contributions.get('totalCommitContributions', 0) or 0
    total_issues = contributions.get('totalIssueContributions', 0) or 0
    total_prs = contributions.get('totalPullRequestContributions', 0) or 0
    total_pr_reviews = contributions.get('totalPullRequestReviewContributions', 0) or 0
    
    # Repository statistics
    total_repos = len(repos_df) if not repos_df.empty else 0
    total_stars = repos_df['stars'].sum() if not repos_df.empty and 'stars' in repos_df else 0
    total_forks = repos_df['forks'].sum() if not repos_df.empty and 'forks' in repos_df else 0
    
    # Active repositories (updated in last 6 months)
    active_repos = repos_df[repos_df['is_active']].shape[0] if not repos_df.empty and 'is_active' in repos_df else 0
    
    # Language diversity
    if not repos_df.empty and 'primaryLanguage' in repos_df:
        primary_languages = repos_df['primaryLanguage'].value_counts()
        language_diversity = len(primary_languages)
        most_used_language = primary_languages.index[0] if len(primary_languages) > 0 else ''
    else:
        language_diversity = 0
        most_used_language = ''
    
    # Social metrics
    followers = user_data.get('followers', {}).get('totalCount', 0) if isinstance(user_data.get('followers'), dict) else 0
    following = user_data.get('following', {}).get('totalCount', 0) if isinstance(user_data.get('following'), dict) else 0
    
    # Activity rates
    commits_per_day = total_commits / max(account_age_days, 1)
    prs_per_day = total_prs / max(account_age_days, 1)
    issues_per_day = total_issues / max(account_age_days, 1)
    
    # Collaboration metrics
    pr_review_ratio = total_pr_reviews / max(total_prs, 1)
    collaboration_score = (total_prs + total_pr_reviews + total_issues) / max(total_commits, 1)
    
    # Popularity metrics
    stars_per_repo = total_stars / max(total_repos, 1)
    forks_per_repo = total_forks / max(total_repos, 1)
    follower_ratio = followers / max(following, 1)
    
    user_features = {
        'account_age_days': account_age_days,
        'total_commits': total_commits,
        'total_issues': total_issues,
        'total_prs': total_prs,
        'total_pr_reviews': total_pr_reviews,
        'total_repos': total_repos,
        'total_stars': total_stars,
        'total_forks': total_forks,
        'active_repos': active_repos,
        'language_diversity': language_diversity,
        'most_used_language': most_used_language,
        'followers': followers,
        'following': following,
        'commits_per_day': commits_per_day,
        'prs_per_day': prs_per_day,
        'issues_per_day': issues_per_day,
        'pr_review_ratio': pr_review_ratio,
        'collaboration_score': collaboration_score,
        'stars_per_repo': stars_per_repo,
        'forks_per_repo': forks_per_repo,
        'follower_ratio': follower_ratio,
        # Composite scores
        'activity_score': commits_per_day * 0.4 + prs_per_day * 0.3 + issues_per_day * 0.3,
        'popularity_score': np.log1p(followers) * 0.4 + np.log1p(total_stars) * 0.6,
        'engagement_score': np.log1p(total_commits + total_prs + total_issues + total_pr_reviews),
    }
    
    return user_features


def prepare_features_for_models(user_features: Dict[str, Any], repos_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Prepare feature vectors for ML model predictions.
    
    Args:
        user_features: Dictionary of user-level features
        repos_df: DataFrame of repository features
        
    Returns:
        Dictionary containing feature vectors for different models
    """
    # Feature vector for behavior classification (53 features to match model training)
    total_repos = max(user_features.get('total_repos', 1), 1)
    account_age = max(user_features.get('account_age_days', 1), 1)
    total_commits = max(user_features.get('total_commits', 1), 1)
    
    # Create DataFrame with proper column names for ColumnTransformer
    behavior_features = pd.DataFrame({
        # Basic activity metrics (5 features)
        'commits_per_day': [user_features.get('commits_per_day', 0)],
        'prs_per_day': [user_features.get('prs_per_day', 0)],
        'issues_per_day': [user_features.get('issues_per_day', 0)],
        'total_commits': [user_features.get('total_commits', 0)],
        'total_prs': [user_features.get('total_prs', 0)],
        
        # Collaboration metrics (5 features)
        'pr_review_ratio': [user_features.get('pr_review_ratio', 0)],
        'collaboration_score': [user_features.get('collaboration_score', 0)],
        'total_pr_reviews': [user_features.get('total_pr_reviews', 0)],
        'total_issues': [user_features.get('total_issues', 0)],
        'engagement_score': [user_features.get('engagement_score', 0)],
        
        # Repository metrics (7 features)
        'total_repos': [user_features.get('total_repos', 0)],
        'active_repos': [user_features.get('active_repos', 0)],
        'total_stars': [user_features.get('total_stars', 0)],
        'total_forks': [user_features.get('total_forks', 0)],
        'stars_per_repo': [user_features.get('stars_per_repo', 0)],
        'forks_per_repo': [user_features.get('forks_per_repo', 0)],
        'active_repo_ratio': [user_features.get('active_repos', 0) / total_repos],
        
        # Social metrics (3 features)
        'followers': [user_features.get('followers', 0)],
        'following': [user_features.get('following', 0)],
        'follower_ratio': [user_features.get('follower_ratio', 0)],
        
        # Language diversity (2 features)
        'language_diversity': [user_features.get('language_diversity', 0)],
        'language_diversity_log': [np.log1p(user_features.get('language_diversity', 0))],
        
        # Account metrics (2 features)
        'account_age_days': [user_features.get('account_age_days', 0)],
        'account_age_log': [np.log1p(account_age)],
        
        # Composite scores (3 features)
        'activity_score': [user_features.get('activity_score', 0)],
        'popularity_score': [user_features.get('popularity_score', 0)],
        'engagement_score_composite': [user_features.get('engagement_score', 0)],
        
        # Log-transformed metrics (7 features)
        'total_commits_log': [np.log1p(user_features.get('total_commits', 0))],
        'total_prs_log': [np.log1p(user_features.get('total_prs', 0))],
        'total_issues_log': [np.log1p(user_features.get('total_issues', 0))],
        'total_stars_log': [np.log1p(user_features.get('total_stars', 0))],
        'total_forks_log': [np.log1p(user_features.get('total_forks', 0))],
        'followers_log': [np.log1p(user_features.get('followers', 0))],
        'total_repos_log': [np.log1p(user_features.get('total_repos', 0))],
        
        # Ratios and rates (5 features)
        'commits_per_account_day': [user_features.get('total_commits', 0) / account_age],
        'stars_per_repo_calc': [user_features.get('total_stars', 0) / total_repos],
        'prs_per_commit': [user_features.get('total_prs', 0) / total_commits],
        'issues_per_pr': [user_features.get('total_issues', 0) / max(user_features.get('total_prs', 1), 1)],
        'active_repos_per_year': [user_features.get('active_repos', 0) / account_age * 365],
        
        # Additional engineered features (14 features to reach 53)
        # Language & tech stack (3 features)
        'avg_languages_per_repo': [user_features.get('language_diversity', 0) / total_repos],
        'language_specialization': [1.0 / max(user_features.get('language_diversity', 1), 1)],
        'tech_stack_breadth': [user_features.get('language_diversity', 0)],
        
        # Activity & velocity (4 features)
        'development_velocity': [(user_features.get('total_commits', 0) + user_features.get('total_prs', 0)) / account_age],
        'repo_active_score': [user_features.get('active_repos', 0) / total_repos],
        'work_consistency': [min(user_features.get('commits_per_day', 0) * 10, 1.0)],
        'repo_creation_rate': [total_repos / account_age * 365],
        
        # Collaboration & social (3 features)
        'code_review_participation': [user_features.get('total_pr_reviews', 0) / total_commits],
        'mentorship_score': [user_features.get('total_pr_reviews', 0) / account_age * 365],
        'community_engagement_score': [(user_features.get('total_prs', 0) + user_features.get('total_issues', 0)) / total_commits],
        
        # Quality & impact (4 features)
        'showcase_score': [np.log1p(user_features.get('total_stars', 0))],
        'viral_repo_score': [user_features.get('total_stars', 0) / total_repos],
        'maintenance_score': [user_features.get('active_repos', 0) / account_age * 365],
        'influence_growth_rate': [user_features.get('followers', 0) / account_age * 365],
        
        # Additional missing columns from model training (37 features)
        # Repository-level aggregates
        'stargazer_count': [user_features.get('total_stars', 0)],
        'fork_count': [user_features.get('total_forks', 0)],
        'watchers_count': [user_features.get('total_stars', 0)],  # Approximation
        'repo_stars': [user_features.get('total_stars', 0)],
        'repo_forks': [user_features.get('total_forks', 0)],
        'repo_watchers': [user_features.get('total_stars', 0)],  # Approximation
        
        # Language metrics
        'repo_lang_count': [user_features.get('language_diversity', 0)],
        'repo_lang_size': [user_features.get('language_diversity', 0) * 1000],  # Approximation
        'languages_total_count': [user_features.get('language_diversity', 0)],
        'languages_total_size': [user_features.get('language_diversity', 0) * 1000],  # Approximation
        
        # More repository metrics
        'max_stars_repo': [user_features.get('total_stars', 0)],  # Max stars approximation
        'max_forks_repo': [user_features.get('total_forks', 0)],  # Max forks approximation
        'avg_stars_per_repo': [user_features.get('stars_per_repo', 0)],
        'avg_forks_per_repo': [user_features.get('forks_per_repo', 0)],
        'avg_repo_size': [user_features.get('total_commits', 0) / total_repos],
        
        # Language & diversity
        'repo_language_diversity': [user_features.get('language_diversity', 0)],
        'language_balance': [0.5],  # Neutral balance
        
        # Activity & engagement
        'code_change_rate': [user_features.get('total_commits', 0) / account_age],
        'contribution_consistency': [user_features.get('commits_per_day', 0)],
        'activity_intensity_score': [user_features.get('activity_score', 0)],
        'total_commit_contributions': [user_features.get('total_commits', 0)],
        
        # Collaboration & social
        'collaboration_ratio': [user_features.get('collaboration_score', 0)],
        'code_review_index': [user_features.get('pr_review_ratio', 0)],
        'leadership_score': [user_features.get('total_pr_reviews', 0) / account_age * 365],
        'social_coding_index': [user_features.get('followers', 0) / account_age * 365],
        
        # Quality & impact
        'reputation_score': [np.log1p(user_features.get('total_stars', 0))],
        'impact_factor': [user_features.get('total_stars', 0) / total_repos],
        'network_influence': [user_features.get('followers', 0) / max(user_features.get('following', 1), 1)],
        
        # Recency & activity
        'recency_score': [1.0 / max((user_features.get('active_repos', 1) / total_repos), 0.1)],
        'recent_activity_ratio': [user_features.get('active_repos', 0) / total_repos],
        'recent_activity_ratio_full': [user_features.get('active_repos', 0) / total_repos],
        
        # Additional metrics
        'public_repo_ratio': [1.0],  # All public repos for portfolio
        'profile_completeness': [0.8],  # High completeness assumed
        'fork_contribution_rate': [user_features.get('total_prs', 0) / total_repos],
        'multitasking_score': [user_features.get('active_repos', 0) / total_repos],
        'generalist_score': [user_features.get('language_diversity', 0) / 10.0],
        'project_complexity': [np.log1p(user_features.get('total_commits', 0)) / total_repos],
        'rank_target': [0.5],  # Neutral rank target
    })
    
    # Feature vector for skills extraction (includes user_features for 43-feature model)
    skills_features = {
        'languages': repos_df['primaryLanguage'].value_counts().to_dict() if not repos_df.empty else {},
        'all_languages': repos_df['all_languages'].explode().value_counts().to_dict() if not repos_df.empty else {},
        'total_stars': user_features.get('total_stars', 0),
        'language_diversity': user_features.get('language_diversity', 0),
        'user_features': user_features,  # Pass all user features for the 43-feature model
    }
    
    # Repository features for ranking (with all engineered features)
    if not repos_df.empty:
        # Start with existing features
        ranking_features = repos_df[['stars', 'forks', 'popularity_score', 'engagement_score', 
                                     'is_active', 'repo_age_days', 'days_since_push']].copy()
        
        # Add engineered features that the ranking model expects
        total_repos = len(repos_df)
        account_age = max(user_features.get('account_age_days', 1), 1)
        
        # Add user-level features to each repo row
        ranking_features['total_repos'] = user_features.get('total_repos', 0)
        ranking_features['total_stars'] = user_features.get('total_stars', 0)
        ranking_features['total_forks'] = user_features.get('total_forks', 0)
        ranking_features['total_commits'] = user_features.get('total_commits', 0)
        ranking_features['total_prs'] = user_features.get('total_prs', 0)
        ranking_features['total_issues'] = user_features.get('total_issues', 0)
        ranking_features['followers'] = user_features.get('followers', 0)
        ranking_features['following'] = user_features.get('following', 0)
        ranking_features['language_diversity'] = user_features.get('language_diversity', 0)
        ranking_features['active_repos'] = user_features.get('active_repos', 0)
        ranking_features['account_age_days'] = user_features.get('account_age_days', 0)
        
        # Engineered features for each repo
        ranking_features['avg_stars_per_repo'] = user_features.get('stars_per_repo', 0)
        ranking_features['avg_forks_per_repo'] = user_features.get('forks_per_repo', 0)
        ranking_features['max_stars_repo'] = repos_df['stars'].max() if not repos_df.empty else 0
        ranking_features['max_forks_repo'] = repos_df['forks'].max() if not repos_df.empty else 0
        
        # Language features
        ranking_features['repo_language_diversity'] = user_features.get('language_diversity', 0)
        ranking_features['language_specialization'] = 1.0 / max(user_features.get('language_diversity', 1), 1)
        ranking_features['language_balance'] = 0.5  # Placeholder
        ranking_features['tech_stack_breadth'] = user_features.get('language_diversity', 0)
        ranking_features['avg_languages_per_repo'] = user_features.get('language_diversity', 0) / max(total_repos, 1)
        
        # Activity features
        ranking_features['code_change_rate'] = user_features.get('total_commits', 0) / account_age
        ranking_features['repo_creation_rate'] = total_repos / account_age * 365
        ranking_features['contribution_consistency'] = user_features.get('commits_per_day', 0)
        ranking_features['work_consistency'] = min(user_features.get('commits_per_day', 0) * 10, 1.0)
        
        # Collaboration features
        ranking_features['collaboration_ratio'] = user_features.get('collaboration_score', 0)
        ranking_features['code_review_participation'] = user_features.get('total_pr_reviews', 0) / max(user_features.get('total_commits', 1), 1)
        ranking_features['mentorship_score'] = user_features.get('total_pr_reviews', 0) / account_age * 365
        ranking_features['social_coding_index'] = user_features.get('followers', 0) / account_age * 365
        ranking_features['community_engagement_score'] = (user_features.get('total_prs', 0) + user_features.get('total_issues', 0)) / max(user_features.get('total_commits', 1), 1)
        
        # Quality & impact features
        ranking_features['showcase_score'] = np.log1p(user_features.get('total_stars', 0))
        ranking_features['viral_repo_score'] = user_features.get('total_stars', 0) / max(total_repos, 1)
        ranking_features['influence_growth_rate'] = user_features.get('followers', 0) / account_age * 365
        ranking_features['public_repo_ratio'] = 1.0
        ranking_features['profile_completeness'] = 0.8
        
        # Advanced metrics
        ranking_features['maintainer_score'] = user_features.get('active_repos', 0) / account_age * 365
        ranking_features['maintenance_score'] = user_features.get('active_repos', 0) / max(total_repos, 1)
        ranking_features['generalist_score'] = user_features.get('language_diversity', 0) / 10.0
        ranking_features['avg_repo_size'] = user_features.get('total_commits', 0) / max(total_repos, 1)
        ranking_features['fork_contribution_rate'] = user_features.get('total_prs', 0) / max(total_repos, 1)
        ranking_features['multitasking_score'] = user_features.get('active_repos', 0) / max(total_repos, 1)
        
        # Additional missing columns for ranking model (20 features)
        ranking_features['repo_active_score'] = user_features.get('active_repos', 0) / max(total_repos, 1)
        ranking_features['languages_total_count'] = user_features.get('language_diversity', 0)
        ranking_features['leadership_score'] = user_features.get('total_stars', 0) / max(user_features.get('total_commits', 1), 1)
        ranking_features['recent_activity_ratio'] = user_features.get('active_repos', 0) / max(total_repos, 1)
        ranking_features['project_complexity'] = user_features.get('total_commits', 0) / max(total_repos, 1)
        ranking_features['fork_count'] = user_features.get('total_forks', 0)
        ranking_features['watchers_count'] = user_features.get('total_stars', 0)  # Approximation
        ranking_features['recent_activity_ratio_full'] = user_features.get('active_repos', 0) / max(total_repos, 1)
        ranking_features['learning_velocity'] = user_features.get('language_diversity', 0) / account_age * 365
        ranking_features['reputation_score'] = user_features.get('popularity_score', 0)
        ranking_features['network_influence'] = np.log1p(user_features.get('followers', 0))
        ranking_features['total_commit_contributions'] = user_features.get('total_commits', 0)
        ranking_features['stargazer_count'] = user_features.get('total_stars', 0)
        ranking_features['development_velocity'] = (user_features.get('total_commits', 0) + user_features.get('total_prs', 0)) / account_age
        ranking_features['languages_total_size'] = user_features.get('language_diversity', 0) * 1000  # Approximation
        ranking_features['team_player_score'] = user_features.get('pr_review_ratio', 0)
        ranking_features['innovation_index'] = user_features.get('language_diversity', 0) / account_age * 365
        ranking_features['activity_intensity_score'] = user_features.get('activity_score', 0)
        ranking_features['code_review_index'] = user_features.get('total_pr_reviews', 0) / max(user_features.get('total_prs', 1), 1)
        ranking_features['impact_factor'] = user_features.get('total_stars', 0) / max(total_repos, 1)
        
        ranking_features = ranking_features.fillna(0)
    else:
        ranking_features = pd.DataFrame()
    
    return {
        'behavior_features': behavior_features,
        'skills_features': skills_features,
        'ranking_features': ranking_features,
        'user_features': user_features,
    }

