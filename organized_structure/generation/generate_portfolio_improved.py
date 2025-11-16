"""
Improved Portfolio Generation using ML Models
Uses trained ML models to generate high-quality portfolio content
"""

import os
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Tuple

try:
    import joblib
    HAS_JOBLIB = True
except ImportError:
    HAS_JOBLIB = False
    print("Warning: joblib not installed, using pickle")

# Import label mappings
import sys
MODEL_DIR = Path(__file__).parent.parent / "models"
sys.path.insert(0, str(MODEL_DIR))
from label_mappings import (
    BEHAVIOR_LABELS, SKILL_LABELS,
    decode_behavior_predictions, decode_skills_predictions,
    BEHAVIOR_DESCRIPTIONS
)

# Model paths
BEHAVIOR_MODEL_PATH = MODEL_DIR / "behavior_classifier.pkl"
SKILLS_MODEL_PATH = MODEL_DIR / "skills_classifier.pkl"
RANKING_MODEL_PATH = MODEL_DIR / "ranking_xgboost.pkl"


def load_models() -> Dict[str, Any]:
    """Load trained ML models from pickle files."""
    models = {}
    
    print(f"\n🔍 Model Directory: {MODEL_DIR}")
    print(f"   Directory exists: {MODEL_DIR.exists()}")
    if MODEL_DIR.exists():
        print(f"   Contents: {list(MODEL_DIR.iterdir())}")
    
    try:
        # Behavior Model
        print(f"\n📦 Loading Behavior Model...")
        print(f"   Path: {BEHAVIOR_MODEL_PATH}")
        print(f"   Exists: {BEHAVIOR_MODEL_PATH.exists()}")
        
        if BEHAVIOR_MODEL_PATH.exists():
            try:
                # Try joblib first, then pickle
                if HAS_JOBLIB:
                    models['behavior'] = joblib.load(BEHAVIOR_MODEL_PATH)
                else:
                    with open(BEHAVIOR_MODEL_PATH, 'rb') as f:
                        models['behavior'] = pickle.load(f)
                print(f"   ✓ Loaded successfully - Type: {type(models['behavior']).__name__}")
            except Exception as e:
                print(f"   ❌ Failed to load: {e}")
                # Try alternative method
                try:
                    if HAS_JOBLIB:
                        with open(BEHAVIOR_MODEL_PATH, 'rb') as f:
                            models['behavior'] = pickle.load(f)
                        print(f"   ✓ Loaded with pickle fallback")
                    else:
                        models['behavior'] = None
                except:
                    models['behavior'] = None
        else:
            print(f"   ⚠ File not found")
            models['behavior'] = None
        
        # Skills Model
        print(f"\n📦 Loading Skills Model...")
        print(f"   Path: {SKILLS_MODEL_PATH}")
        print(f"   Exists: {SKILLS_MODEL_PATH.exists()}")
        
        if SKILLS_MODEL_PATH.exists():
            try:
                # Try joblib first, then pickle
                if HAS_JOBLIB:
                    models['skills'] = joblib.load(SKILLS_MODEL_PATH)
                else:
                    with open(SKILLS_MODEL_PATH, 'rb') as f:
                        models['skills'] = pickle.load(f)
                print(f"   ✓ Loaded successfully - Type: {type(models['skills']).__name__}")
            except Exception as e:
                print(f"   ❌ Failed to load: {e}")
                # Try alternative method
                try:
                    if HAS_JOBLIB:
                        with open(SKILLS_MODEL_PATH, 'rb') as f:
                            models['skills'] = pickle.load(f)
                        print(f"   ✓ Loaded with pickle fallback")
                    else:
                        models['skills'] = None
                except:
                    models['skills'] = None
        else:
            print(f"   ⚠ File not found")
            models['skills'] = None
        
        # Ranking Model
        print(f"\n📦 Loading Ranking Model...")
        print(f"   Path: {RANKING_MODEL_PATH}")
        print(f"   Exists: {RANKING_MODEL_PATH.exists()}")
        
        if RANKING_MODEL_PATH.exists():
            try:
                # Try joblib first, then pickle
                if HAS_JOBLIB:
                    models['ranking'] = joblib.load(RANKING_MODEL_PATH)
                else:
                    with open(RANKING_MODEL_PATH, 'rb') as f:
                        models['ranking'] = pickle.load(f)
                print(f"   ✓ Loaded successfully - Type: {type(models['ranking']).__name__}")
            except Exception as e:
                print(f"   ❌ Failed to load: {e}")
                # Try alternative method
                try:
                    if HAS_JOBLIB:
                        with open(RANKING_MODEL_PATH, 'rb') as f:
                            models['ranking'] = pickle.load(f)
                        print(f"   ✓ Loaded with pickle fallback")
                    else:
                        models['ranking'] = None
                except:
                    models['ranking'] = None
        else:
            print(f"   ⚠ File not found")
            models['ranking'] = None
            
    except Exception as e:
        print(f"❌ Error in load_models: {e}")
        import traceback
        traceback.print_exc()
    
    print(f"\n📊 Model Loading Summary:")
    print(f"   Behavior: {'✓ Loaded' if models.get('behavior') else '✗ Not loaded'}")
    print(f"   Skills: {'✓ Loaded' if models.get('skills') else '✗ Not loaded'}")
    print(f"   Ranking: {'✓ Loaded' if models.get('ranking') else '✗ Not loaded'}")
    
    return models


def predict_behavior_profile(behavior_features: pd.DataFrame, model: Any) -> Dict[str, str]:
    """
    Predict developer behavior profile using ML model.
    
    Args:
        behavior_features: Feature DataFrame for behavior prediction (53 columns)
        model: Trained behavior classifier (multi-label binary classifier)
        
    Returns:
        Dictionary with behavior profile attributes from model predictions
    """
    if model is None:
        raise ValueError("Behavior model is required. Please ensure behavior_classifier.pkl is in models directory.")
    
    try:
        # Get model predictions (multi-label binary output: [1, 0, 1, 0] for [maintainer, team_player, innovator, learner])
        if hasattr(model, 'predict'):
            predictions = model.predict(behavior_features)
            
            # Extract the first prediction (assuming batch prediction)
            behavior_output = predictions[0] if len(predictions.shape) > 1 else predictions
            
            # Decode using the proper label mappings from training
            decoded = decode_behavior_predictions(behavior_output)
            
            # Get primary behavior type
            primary_type = decoded['primary_type']
            secondary_traits = decoded['secondary_traits']
            all_behaviors = decoded['all_behaviors']
            
            # Get readable description
            primary_desc = BEHAVIOR_DESCRIPTIONS.get(primary_type, {})
            
            # Build behavior profile for portfolio
            profile = {
                'type': primary_desc.get('title', primary_type.title()),
                'description': primary_desc.get('description', f'Developer with {primary_type} focus'),
                'traits': primary_desc.get('traits', [primary_type]),
                'primary': primary_type,
                'secondary': secondary_traits,
                'all': all_behaviors
            }
            
            print(f"✓ Behavior predicted: {primary_type}" + 
                  (f" + {', '.join(secondary_traits)}" if secondary_traits else ""))
            
            return profile
        else:
            raise ValueError("Model does not have predict method")
        
    except Exception as e:
        print(f"❌ Error in behavior prediction: {e}")
        import traceback
        traceback.print_exc()
        raise  # Re-raise to force model usage




def extract_skills(skills_features: Dict[str, Any], model: Any, top_n: int = 10) -> List[str]:
    """
    Extract top skills using ML model predictions.
    
    Args:
        skills_features: Dictionary with language usage data and user features
        model: Trained skills classifier
        top_n: Number of top skills to return
        
    Returns:
        List of top skills from model predictions
    """
    if model is None:
        raise ValueError("Skills model is required. Please ensure skills_classifier.pkl is in models directory.")
    
    try:
        # Prepare input for skills model
        all_langs = skills_features.get('all_languages', {})
        if not all_langs:
            all_langs = skills_features.get('languages', {})
        
        if not all_langs:
            print("⚠ No language data available for skills prediction")
            return []
        
        # Get language names and their usage counts
        lang_names = list(all_langs.keys())
        lang_counts = list(all_langs.values())
        
        if not lang_names:
            return []
        
        # Get user features from skills_features dict
        user_feat = skills_features.get('user_features', {})
        
        # Calculate derived metrics
        total_repos = max(user_feat.get('total_repos', 1), 1)
        total_commits = max(user_feat.get('total_commits', 1), 1)
        total_stars = user_feat.get('total_stars', 0)
        total_forks = user_feat.get('total_forks', 0)
        account_age = max(user_feat.get('account_age_days', 1), 1)
        
        # Create feature representation with exact column names from training
        feature_data = {
            # Core metrics
            'total_repos': user_feat.get('total_repos', 0),
            'total_stars': total_stars,
            'total_forks': total_forks,
            'total_commits': user_feat.get('total_commits', 0),
            'total_prs': user_feat.get('total_prs', 0),
            'total_issues': user_feat.get('total_issues', 0),
            'followers': user_feat.get('followers', 0),
            'following': user_feat.get('following', 0),
            'language_diversity': user_feat.get('language_diversity', 0),
            'active_repos': user_feat.get('active_repos', 0),
            'account_age_days': user_feat.get('account_age_days', 0),
            
            # Engineered features (exact names from model training)
            'avg_stars_per_repo': total_stars / total_repos,
            'avg_forks_per_repo': total_forks / total_repos,
            'stars_per_repo': user_feat.get('stars_per_repo', 0),
            'forks_per_repo': user_feat.get('forks_per_repo', 0),
            'commits_per_day': user_feat.get('commits_per_day', 0),
            'prs_per_day': user_feat.get('prs_per_day', 0),
            'issues_per_day': user_feat.get('issues_per_day', 0),
            'follower_ratio': user_feat.get('follower_ratio', 0),
            'pr_review_ratio': user_feat.get('pr_review_ratio', 0),
            'collaboration_score': user_feat.get('collaboration_score', 0),
            'activity_score': user_feat.get('activity_score', 0),
            'popularity_score': user_feat.get('popularity_score', 0),
            
            # Additional engineered features
            'max_stars_repo': total_stars,  # Approximation
            'max_forks_repo': total_forks,  # Approximation
            'avg_languages_per_repo': len(lang_names) / total_repos if lang_names else 0,
            'repo_language_diversity': len(lang_names),
            'language_specialization': 1.0 / max(len(lang_names), 1),
            'language_balance': np.std(lang_counts) if len(lang_counts) > 1 else 0,
            'tech_stack_breadth': len(lang_names),
            
            # Activity & engagement features
            'repo_active_score': user_feat.get('active_repos', 0) / total_repos,
            'recent_activity_ratio': user_feat.get('active_repos', 0) / total_repos,
            'code_change_rate': user_feat.get('total_commits', 0) / account_age,
            'development_velocity': (user_feat.get('total_commits', 0) + user_feat.get('total_prs', 0)) / account_age,
            'activity_intensity_score': user_feat.get('activity_score', 0),
            'contribution_consistency': user_feat.get('commits_per_day', 0),
            'work_consistency': min(user_feat.get('commits_per_day', 0) * 10, 1.0),
            'repo_creation_rate': total_repos / account_age * 365,
            
            # Collaboration & social features  
            'collaboration_ratio': user_feat.get('collaboration_score', 0),
            'team_player_score': user_feat.get('pr_review_ratio', 0),
            'code_review_participation': user_feat.get('total_pr_reviews', 0) / total_commits,
            'code_review_index': user_feat.get('total_pr_reviews', 0) / max(user_feat.get('total_prs', 1), 1),
            'mentorship_score': user_feat.get('total_pr_reviews', 0) / account_age * 365,
            'social_coding_index': user_feat.get('followers', 0) / account_age * 365,
            'community_engagement_score': (user_feat.get('total_prs', 0) + user_feat.get('total_issues', 0)) / total_commits,
            'network_influence': np.log1p(user_feat.get('followers', 0)),
            
            # Quality & impact features
            'reputation_score': user_feat.get('popularity_score', 0),
            'impact_factor': total_stars / total_repos,
            'showcase_score': np.log1p(total_stars),
            'viral_repo_score': total_stars / max(total_repos, 1),
            'influence_growth_rate': user_feat.get('followers', 0) / account_age * 365,
            'innovation_index': len(lang_names) / account_age * 365,
            'public_repo_ratio': 1.0,  # Assume all public
            'profile_completeness': 0.8,  # Assume 80% complete
            
            # Advanced metrics
            'leadership_score': total_stars / (total_commits + 1),
            'maintainer_score': user_feat.get('active_repos', 0) / account_age * 365,
            'maintenance_score': user_feat.get('active_repos', 0) / total_repos,
            'generalist_score': len(lang_names) / 10.0,  # Normalized
            'project_complexity': total_commits / total_repos,
            'avg_repo_size': total_commits / total_repos,
            'fork_contribution_rate': user_feat.get('total_prs', 0) / total_repos,
            'multitasking_score': user_feat.get('active_repos', 0) / total_repos,
            'learning_velocity': len(lang_names) / account_age * 365,
            
            # Additional missing columns for skills model (13 features)
            'repo_watchers': total_stars,  # Approximation with stars
            'recent_activity_ratio_full': user_feat.get('active_repos', 0) / total_repos,
            'languages_total_size': len(lang_names) * 1000,  # Approximation
            'recency_score': 1.0 / max((user_feat.get('active_repos', 1) / total_repos), 0.1),
            'total_commit_contributions': user_feat.get('total_commits', 0),
            'repo_stars': total_stars,
            'repo_forks': total_forks,
            'fork_count': total_forks,
            'repo_lang_size': len(lang_names) * 1000,  # Approximation
            'stargazer_count': total_stars,
            'languages_total_count': len(lang_names),
            'watchers_count': total_stars,  # Approximation
            'repo_lang_count': len(lang_names),
            
            # Target variable (if needed for prediction)
            'rank_target': 0.5,  # Placeholder
        }
        
        # Convert to DataFrame (required for ColumnTransformer)
        features = pd.DataFrame([feature_data])
        
        # Get model predictions - multi-label binary classification
        # Model predicts [1, 0, 1, 0, ...] for 30 different skills
        if hasattr(model, 'predict'):
            # Model outputs binary predictions for each of the 30 skills
            skill_predictions = model.predict(features)
            
            # Extract the first prediction (assuming batch prediction)
            skill_output = skill_predictions[0] if len(skill_predictions.shape) > 1 else skill_predictions
            
            # Decode using the proper label mappings from training
            selected_skills = decode_skills_predictions(skill_output, top_n=top_n)
            
            print(f"✓ Skills predicted by model: {selected_skills}")
            
            # Return model predictions directly - NO FALLBACKS
            return selected_skills[:top_n]
        else:
            raise ValueError("Model does not have predict method")
        
    except Exception as e:
        print(f"❌ Error in skills prediction: {e}")
        import traceback
        traceback.print_exc()
        raise  # Re-raise to force model usage


def rank_repositories(repos_df: pd.DataFrame, ranking_features: pd.DataFrame, model: Any, top_n: int = 6) -> List[int]:
    """
    Rank repositories using ML model to select top projects.
    Creates per-repository features from repo data for model prediction.
    
    Args:
        repos_df: DataFrame with repository information (one row per repo)
        ranking_features: User-level features (ignored - we create per-repo features)
        model: Trained ranking model
        top_n: Number of top repositories to return
        
    Returns:
        List of indices for top repositories based on model predictions
    """
    if repos_df.empty:
        return []
    
    if model is None:
        raise ValueError("Ranking model is required. Please ensure ranking_xgboost.pkl is in models directory.")
    
    try:
        # NOTE: The ranking model was trained on USER-LEVEL features (aggregate stats),
        # not per-repository features. We can't use it directly for repository ranking.
        # Instead, we use a data-driven scoring function based on your explicit priorities:
        # "stargazer_count... bigger the value the better"
        # "fork_count... bigger the value the better"
        # "watchers_count... bigger the value the better"
        # "languages_total_size... bigger the value the better"
        # "languages_total_count... bigger the value the better"
        
        print(f"\n🏆 Ranking {len(repos_df)} repositories by importance scores...")
        
        # Calculate importance score for each repo based on your priorities
        repo_scores = []
        for idx, repo in repos_df.iterrows():
            # Extract repo-level metrics
            repo_stars = int(repo.get('stars', 0))
            repo_forks = int(repo.get('forks', 0))
            repo_watchers = int(repo.get('watchers', 0))
            repo_commits = int(repo.get('total_commits', 0))
            lang_size = int(repo.get('languages_total_size', 0))
            lang_count = int(repo.get('languages_total_count', 0))
            deployments = int(repo.get('deployments', 0))
            
            # Calculate recency bonus (recent activity is good)
            try:
                updated_at = pd.to_datetime(repo.get('updatedAt', repo.get('updated_at', None)))
                if pd.notna(updated_at):
                    if updated_at.tzinfo is not None:
                        updated_at = updated_at.tz_localize(None)
                    days_since_update = (datetime.now() - updated_at).days
                else:
                    days_since_update = 365
            except:
                days_since_update = 365
            
            # Recency boost: newer updates get higher scores
            # Use exponential decay: 1.0 for today, 0.5 for 180 days, 0.1 for 365+ days
            recency_multiplier = np.exp(-days_since_update / 180.0)
            
            # Weighted importance score based on your priorities
            # Using log1p to handle extreme values (like 41k stars) fairly
            importance_score = (
                np.log1p(repo_stars) * 10.0 +        # Stars: highest priority
                np.log1p(repo_forks) * 6.0 +         # Forks: second priority
                np.log1p(repo_watchers) * 4.0 +      # Watchers: third priority
                np.log1p(lang_size) * 4.0 +          # Code size: high priority (updated)
                np.log1p(deployments) * 3.0 +        # Deployments: shows production use
                np.log1p(repo_commits) * 2.0 +       # Commits: activity metric
                np.log1p(lang_count) * 2.0           # Language diversity: technical breadth (updated)
            ) * recency_multiplier
            
            repo_scores.append(importance_score)
        
        # Convert to numpy array and sort
        repo_scores = np.array(repo_scores)
        top_indices = np.argsort(repo_scores)[::-1][:top_n]
        
        print(f"✓ Ranked {len(repo_scores)} repositories by importance")
        print(f"  Top repos (prioritizing: stars > forks > watchers > commits > recency):")
        for i in top_indices[:min(5, len(top_indices))]:
            repo = repos_df.iloc[i]
            print(f"    {repo['name']}: ⭐{int(repo.get('stars', 0))} 🍴{int(repo.get('forks', 0))} 👁{int(repo.get('watchers', 0))} 💻{int(repo.get('total_commits', 0))} → score: {repo_scores[i]:.3f}")
        
        return top_indices.tolist()
        
        # Legacy code below - model expects user-level features, not per-repo
        # Keeping for reference but not used
        # If model provides ranking directly
        if False and hasattr(model, 'rank'):
            rankings = model.rank(ranking_features)
            top_indices = rankings[:top_n]
            return top_indices
        
        # If model provides feature importance for ranking
        elif hasattr(model, 'feature_importances_'):
            # Use model's learned feature importances to score repos
            importances = model.feature_importances_
            scores = (ranking_features * importances).sum(axis=1)
            top_indices = np.argsort(scores)[::-1][:top_n]
            return top_indices.tolist()
        
        else:
            raise ValueError("Ranking model does not have predict or rank method")
        
    except Exception as e:
        print(f"❌ Error in repository ranking: {e}")
        raise  # Re-raise to force model usage


def generate_portfolio_improved(user_data: Dict[str, Any], repos_df: pd.DataFrame, 
                               user_features: Dict[str, Any], commit_by_repo: List[Dict]) -> Dict[str, Any]:
    """
    Generate improved portfolio using ML models.
    
    Args:
        user_data: Raw user data from GitHub API
        repos_df: DataFrame with repository features
        user_features: Extracted user features
        commit_by_repo: Commit contributions by repository
        
    Returns:
        Portfolio dictionary ready for rendering
    """
    print("\n🤖 Generating portfolio with ML models...")
    
    # Load ML models
    models = load_models()
    
    # Prepare feature vectors
    from parse_and_extract import prepare_features_for_models
    model_features = prepare_features_for_models(user_features, repos_df)
    
    # Predict behavior profile
    behavior_profile = predict_behavior_profile(
        model_features['behavior_features'],
        models.get('behavior')
    )
    
    # Extract skills
    skills = extract_skills(
        model_features['skills_features'],
        models.get('skills'),
        top_n=10
    )
    
    # Add commit data to repos_df for ranking
    repos_df_with_commits = repos_df.copy()
    for idx in range(len(repos_df_with_commits)):
        repo = repos_df_with_commits.iloc[idx]
        repo_name = repo['nameWithOwner']
        commits = 0
        for cbr in commit_by_repo:
            if cbr.get('repository', {}).get('nameWithOwner') == repo_name:
                commits = cbr.get('contributions', {}).get('totalCount', 0)
                break
        repos_df_with_commits.loc[idx, 'total_commits'] = commits
    
    # Rank and select top projects
    top_repo_indices = rank_repositories(
        repos_df_with_commits,
        model_features['ranking_features'],
        models.get('ranking'),
        top_n=6
    )
    
    # Build top projects list - SMART FILTERING
    top_projects = []
    user_login = user_data.get('login', '')
    
    for idx in top_repo_indices:
        if idx >= len(repos_df_with_commits):
            continue
            
        repo = repos_df_with_commits.iloc[idx]
        repo_name = repo['nameWithOwner']
        
        # FILTER 1: Check if repo is owned by the user
        is_owned = True
        if '/' in repo_name:
            owner = repo_name.split('/')[0]
            if owner != user_login:
                is_owned = False
        
        # FILTER 2: Skip empty or archived repos (always)
        if repo.get('isEmpty', False) or repo.get('isArchived', False):
            print(f"  ⊗ Skipping empty/archived repo: {repo['name']}")
            continue
        
        # SMART FILTER FOR FORKS:
        # Keep forked repos if they have high stars (>100) OR significant contributions
        is_fork = repo.get('isFork', False)
        repo_stars = int(repo.get('stars', 0))
        
        if is_fork:
            # Keep forked repos with >100 stars (popular contributions)
            if repo_stars > 100:
                print(f"  ✓ Including popular forked repo: {repo['name']} ({repo_stars} stars)")
            # Or keep forked repos with significant commits from user
            elif not is_owned:
                # Skip forks of repos we don't own with low stars
                print(f"  ⊗ Skipping forked repo (not owned, low stars): {repo['name']}")
                continue
            else:
                print(f"  ⊗ Skipping forked repo: {repo['name']}")
                continue
        
        # Skip repos not owned by user (unless they have high stars)
        if not is_owned and repo_stars < 100:
            print(f"  ⊗ Skipping repo not owned by user: {repo_name} (owner: {owner})")
            continue
        
        # Find commit count for this repo
        commits = 0
        for cbr in commit_by_repo:
            if cbr.get('repository', {}).get('nameWithOwner') == repo_name:
                commits = cbr.get('contributions', {}).get('totalCount', 0)
                break
        
        # Build project entry
        project = {
            'name': repo['name'],
            'url': repo['url'],
            'description': repo['description'],
            'primaryLanguage': repo['primaryLanguage'],
            'tech': repo['all_languages'][:5] if isinstance(repo.get('all_languages'), list) else [],
            'stars': int(repo['stars']),
            'forks': int(repo['forks']),
            'commits': int(commits),
            'role': 'owner',
            'timeline': f"{repo.get('createdAt', '')[:10]} to {repo.get('updatedAt', '')[:10]}",
            'highlights': [
                f"{int(repo['stars'])} stars, updated {repo.get('days_since_update', 0) / 30:.1f} months ago"
            ],
            'impact': f"Popular repo with {int(repo['stars'])} stars" if repo['stars'] > 10 else "Active project",
        }
        
        top_projects.append(project)
        
        # Stop once we have enough valid projects
        if len(top_projects) >= 6:
            break
    
    # Generate headline
    behavior_type = behavior_profile.get('type', 'Developer')
    skills_text = ', '.join(skills[:3]) if skills else 'multiple technologies'
    headline = f"{behavior_type} specializing in {skills_text}"
    
    # Generate summary
    total_commits = user_features.get('total_commits', 0)
    followers = user_features.get('followers', 0)
    behavior_desc = behavior_profile.get('description', 'Passionate developer')
    summary = f"{user_data.get('name', 'Developer')} is a {behavior_desc.lower()} with {int(total_commits):,} commits and {int(followers):,} followers."
    
    # Build portfolio
    portfolio = {
        'name': user_data.get('name', ''),
        'avatarUrl': user_data.get('avatarUrl', ''),
        'headline': headline,
        'summary': summary,
        'location': user_data.get('location', ''),
        'websiteUrl': user_data.get('websiteUrl', ''),
        'skills': skills,
        'strengths': [f"Strong in {skill}" for skill in skills[:3]],
        'behavior_profile': behavior_profile,
        'top_projects': top_projects,
        'total_stats': {
            'followers': int(user_features.get('followers', 0)),
            'total_stars': int(user_features.get('total_stars', 0)),
            'total_forks': int(user_features.get('total_forks', 0)),
            'total_commits': int(user_features.get('total_commits', 0)),
            'total_pr_reviews': int(user_features.get('total_pr_reviews', 0)),
            'total_issues_solved': int(user_features.get('total_issues', 0)),
        },
        'meta': {
            'github_username': user_data.get('login', ''),
            'generated_at': datetime.now().isoformat(),
            'model_version': 'improved'
        }
    }
    
    print(f"✓ Portfolio generated successfully for {user_data.get('login', 'user')}")
    print(f"  - Skills: {len(skills)} identified")
    print(f"  - Projects: {len(top_projects)} selected")
    print(f"  - Behavior: {behavior_profile.get('type', 'N/A')}")
    
    return portfolio

