import json
import os
from parse_and_extract import extract_repo_features, extract_user_features, load_github_data  # Import extraction functions

def curate_user(user_data, output_path):
    """Extract and save features for a single user."""
    repos = user_data['repositories']['nodes']
    contributions = user_data['contributionsCollection']
    repos_df = extract_repo_features(repos)
    user_features = extract_user_features(contributions, repos_df, user_data)
    
    # Combine into a dict for saving (add placeholder for labels)
    curated_data = {
        'user_data': user_data,
        'repo_features': repos_df.to_dict(orient='records'),
        'user_features': user_features,
        'labels': {}  # To be filled manually: top_projects, skills, behavior_profile
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(curated_data, f, indent=2, ensure_ascii=False)

def curate_multiple_users(base_json_path, output_dir, num_users=200):
    """Curate multiple users from JSON array."""
    os.makedirs(os.path.join(output_dir, 'raw'), exist_ok=True)
    
    with open(base_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)  # Assuming array of users
    
    for i, user_entry in enumerate(data[:num_users]):
        # Handle structure: user_data is nested under 'user_data' in multi-user format
        if 'user_data' in user_entry:
            user_data = user_entry['user_data']
        else:
            user_data = user_entry
        
        output_path = os.path.join(output_dir, 'raw', f"curated_{i}_{user_data['login']}.json")
        curate_user(user_data, output_path)
    
    print(f"Extracted features for {min(num_users, len(data))} users to {output_dir}/raw/. Now manually add labels to these files.")

# Example usage
curate_multiple_users('final_striped.json', 'curated_outputs', 200)
