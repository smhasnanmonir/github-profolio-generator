#!/usr/bin/env python3
"""
Process the new github_contributors_merged.json dataset (6k users) into the format needed for auto-labeling.
"""

import json
import os
from parse_and_extract import load_github_data, extract_repo_features, extract_user_features

def process_new_dataset(input_file='github_contributors_merged.json', output_dir='curated_outputs/raw_new'):
    """Process the new dataset into the format expected by auto-labeling."""

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    print(f"🔄 Processing {input_file}...")

    # Load the new dataset
    with open(input_file, 'r', encoding='utf-8') as f:
        users_data = json.load(f)

    print(f"📊 Found {len(users_data)} users to process")

    processed_count = 0
    skipped_count = 0

    for i, user_entry in enumerate(users_data):
        try:
            # Extract username for filename
            username = user_entry.get('username', f'user_{i}')

            # Load GitHub data using existing function
            user_data, repos, contributions, commit_contributions_by_repo = load_github_data_from_entry(user_entry)

            # Skip users with no repositories
            if not repos:
                print(f"⚠️  Skipping {username}: no repositories")
                skipped_count += 1
                continue

            # Extract features using existing functions
            repos_df = extract_repo_features(repos)
            user_features = extract_user_features(contributions, repos_df, user_data)

            # Create the processed data structure expected by auto-labeling
            processed_data = {
                'user_data': user_data,
                'repo_features': repos_df.to_dict('records'),  # Convert DataFrame to list of dicts
                'user_features': user_features
            }

            # Save to output directory
            output_file = os.path.join(output_dir, f'processed_{i}_{username}.json')
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(processed_data, f, indent=2, ensure_ascii=False)

            processed_count += 1

            # Progress update every 100 users
            if (i + 1) % 100 == 0:
                print(f"✅ Processed {i + 1}/{len(users_data)} users...")

        except Exception as e:
            print(f"❌ Error processing {username}: {e}")
            skipped_count += 1
            continue

    print("\n🎯 PROCESSING COMPLETE:")
    print(f"✅ Successfully processed: {processed_count} users")
    print(f"⚠️  Skipped: {skipped_count} users")
    print(f"📁 Output directory: {output_dir}")

    return processed_count, skipped_count

def load_github_data_from_entry(user_entry):
    """Modified version of load_github_data to work with the new data format."""

    # The user_entry has user_data directly (not nested like final_striped_single.json)
    user_data = user_entry['user_data']

    repos = user_data['repositories']['nodes']
    contributions = user_data['contributionsCollection']

    # Extract commit contributions by repository if available
    commit_contributions_by_repo = []
    if 'commitContributionsByRepository' in contributions:
        commit_contributions_by_repo = contributions['commitContributionsByRepository']

    return user_data, repos, contributions, commit_contributions_by_repo

if __name__ == "__main__":
    processed, skipped = process_new_dataset()
    print(f"\n📈 Summary: {processed} processed, {skipped} skipped")
