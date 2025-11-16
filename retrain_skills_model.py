"""
Retrain Skills Model with Frequency-Based Ranking
This script retrains the skills model to prioritize:
- Frequency: Skills appearing in more repositories
- Usage Amount: More code written in that language
- Recency: Recent usage weighted higher
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.multioutput import MultiOutputRegressor
from xgboost import XGBRegressor
import joblib
from collections import defaultdict

# ============================================================================
# STEP 1: Load Training Data
# ============================================================================
print("📂 Loading data...")

try:
    df = pd.read_csv('github_training_data.csv')
    print("✅ Data loaded from github_training_data.csv!")
except FileNotFoundError:
    print("❌ ERROR: github_training_data.csv not found!")
    print("\n📝 Please run: python collect_training_data.py first")
    exit(1)

print(f"   Shape: {df.shape}")

# ============================================================================
# STEP 2: Parse Language Data and Create Skill Scores
# ============================================================================
print("\n🎯 Creating skill proficiency scores based on:")
print("   • Frequency: How many repos use this skill")
print("   • Usage: How much code written in that language")
print("   • Recency: Recent usage weighted higher\n")

# Get unique languages across all repos
all_languages = set()
if 'primaryLanguage' in df.columns:
    all_languages.update(df['primaryLanguage'].dropna().unique())

# Get top 30 most common languages
language_counts = df['primaryLanguage'].value_counts().head(30)
TOP_SKILLS = language_counts.index.tolist()

print(f"✅ Found {len(TOP_SKILLS)} top skills:")
print(f"   {', '.join(TOP_SKILLS[:10])}...")

# Group repos by nameWithOwner (user)
if 'nameWithOwner' not in df.columns:
    print("❌ ERROR: Need 'nameWithOwner' column to group repos by user")
    exit(1)

# Extract username from nameWithOwner
df['username'] = df['nameWithOwner'].str.split('/').str[0]

# ============================================================================
# STEP 3: Calculate Skill Proficiency Scores for Each User
# ============================================================================
print("\n📊 Calculating skill proficiency scores per user...")

user_skill_scores = []

for username, user_repos in df.groupby('username'):
    skill_scores = {}
    
    for skill in TOP_SKILLS:
        # Count repos using this skill
        repos_with_skill = user_repos[user_repos['primaryLanguage'] == skill]
        frequency = len(repos_with_skill)
        
        if frequency == 0:
            skill_scores[skill] = 0.0
            continue
        
        # Calculate usage amount (total code size, commits, etc.)
        total_commits = repos_with_skill['total_commits'].sum()
        total_stars = repos_with_skill['stars'].sum()
        
        # Calculate recency bonus (newer repos weighted higher)
        # Repos updated recently get higher weight
        recency_weights = []
        for _, repo in repos_with_skill.iterrows():
            days_old = repo.get('days_since_update', 365)
            # Exponential decay: recent = 1.0, old = 0.1
            weight = np.exp(-days_old / 180.0)  # Half-life of ~180 days
            recency_weights.append(weight)
        
        avg_recency = np.mean(recency_weights) if recency_weights else 0.5
        
        # Composite proficiency score
        # Formula: (frequency * 0.4) + (log(commits) * 0.3) + (log(stars) * 0.2) + (recency * 0.1)
        frequency_score = np.log1p(frequency) * 0.4
        commits_score = np.log1p(total_commits) * 0.3
        stars_score = np.log1p(total_stars) * 0.2
        recency_score = avg_recency * 0.1
        
        proficiency = frequency_score + commits_score + stars_score + recency_score
        skill_scores[skill] = proficiency
    
    # Normalize scores to 0-1 range for this user
    max_score = max(skill_scores.values()) if skill_scores.values() else 1.0
    if max_score > 0:
        skill_scores = {k: v / max_score for k, v in skill_scores.items()}
    
    # Store user features + skill scores
    user_features = {
        'username': username,
        'total_repos': len(user_repos),
        'total_stars': user_repos['stars'].sum(),
        'total_commits': user_repos['total_commits'].sum(),
        'avg_days_since_update': user_repos['days_since_update'].mean(),
        'num_languages': user_repos['primaryLanguage'].nunique(),
    }
    user_features.update(skill_scores)
    user_skill_scores.append(user_features)

# Create DataFrame
users_df = pd.DataFrame(user_skill_scores)

print(f"✅ Proficiency scores calculated!")
print(f"   Total users: {len(users_df)}")
print(f"   Skills tracked: {len(TOP_SKILLS)}")

# Show example
print(f"\n📊 Example skill proficiency for first user:")
example_user = users_df.iloc[0]
print(f"   User: {example_user['username']}")
print(f"   Total repos: {int(example_user['total_repos'])}")
skill_scores_example = {skill: example_user[skill] for skill in TOP_SKILLS[:5]}
for skill, score in sorted(skill_scores_example.items(), key=lambda x: x[1], reverse=True):
    if score > 0:
        print(f"   {skill}: {score:.3f}")

# ============================================================================
# STEP 4: Prepare Features and Targets
# ============================================================================
print("\n🔧 Preparing features and targets...")

# Features: user-level metrics
feature_cols = ['total_repos', 'total_stars', 'total_commits', 'avg_days_since_update', 'num_languages']
X = users_df[feature_cols].copy()

# Targets: skill proficiency scores (continuous, 0-1)
y = users_df[TOP_SKILLS].copy()

print(f"✅ Data prepared!")
print(f"   Features: {X.shape[1]}")
print(f"   Target skills: {y.shape[1]}")
print(f"   Samples: {X.shape[0]}")

# ============================================================================
# STEP 5: Split Data
# ============================================================================
print("\n✂️ Splitting data...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"✅ Split completed!")
print(f"   Training: {X_train.shape}")
print(f"   Test: {X_test.shape}")

# ============================================================================
# STEP 6: Create and Train Multi-Output Regressor
# ============================================================================
print("\n🚀 Training Multi-Output XGBoost for skill proficiency...")

# Preprocessing
preprocessor = ColumnTransformer([
    ("num", Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler(with_mean=False))
    ]), feature_cols)
])

# Multi-output regressor (one XGBoost per skill)
multi_output_model = MultiOutputRegressor(
    XGBRegressor(
        objective="reg:squarederror",
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        random_state=42
    ),
    n_jobs=-1
)

# Complete pipeline
pipeline = Pipeline([
    ("prep", preprocessor),
    ("model", multi_output_model)
])

# Train
print("   This may take a few minutes...")
pipeline.fit(X_train, y_train)

print("✅ Training completed!")

# ============================================================================
# STEP 7: Evaluate
# ============================================================================
print("\n📊 Evaluating model...")

from sklearn.metrics import mean_squared_error, r2_score

y_pred = pipeline.predict(X_test)

# Overall metrics
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print(f"✅ Evaluation Results:")
print(f"   RMSE: {rmse:.4f}")
print(f"   R² Score: {r2:.4f}")

# Per-skill performance (top 5 skills)
print(f"\n🎯 Per-skill RMSE (top 5 skills):")
for i, skill in enumerate(TOP_SKILLS[:5]):
    skill_rmse = np.sqrt(mean_squared_error(y_test.iloc[:, i], y_pred[:, i]))
    print(f"   {skill:15s}: {skill_rmse:.4f}")

# ============================================================================
# STEP 8: Save Model and Skill Labels
# ============================================================================
print("\n💾 Saving model and skill labels...")

# Save pipeline
joblib.dump(pipeline, 'organized_structure/models/skills_classifier.pkl')
print("✅ Model saved to: organized_structure/models/skills_classifier.pkl")

# Save skill labels for reference
with open('organized_structure/models/skill_labels.txt', 'w') as f:
    for skill in TOP_SKILLS:
        f.write(f"{skill}\n")
print("✅ Skill labels saved to: organized_structure/models/skill_labels.txt")

# Update label_mappings.py
print("\n📝 Updating label_mappings.py...")

label_mappings_content = f'''"""
Label mappings for ML model predictions
AUTO-GENERATED by retrain_skills_model.py
"""

from typing import List, Dict, Any
import numpy as np

# --- Behavior Labels (from ml_model.py) ---
BEHAVIOR_LABELS = ["maintainer", "team_player", "innovator", "learner"]

BEHAVIOR_DESCRIPTIONS = {{
    "maintainer": {{
        "title": "Maintainer",
        "description": "Actively maintains and improves existing projects",
        "traits": ["Consistent contributor", "Long-term commitment", "Quality-focused"]
    }},
    "team_player": {{
        "title": "Team Player",
        "description": "Collaborates effectively with others",
        "traits": ["Collaborative", "Communicative", "Supportive"]
    }},
    "innovator": {{
        "title": "Innovator",
        "description": "Focuses on creating new projects and solutions",
        "traits": ["Creative", "Proactive", "Visionary"]
    }},
    "learner": {{
        "title": "Learner",
        "description": "Continuously acquires new skills and technologies",
        "traits": ["Curious", "Adaptable", "Growth-oriented"]
    }}
}}

def decode_behavior_predictions(predictions: np.ndarray) -> Dict[str, Any]:
    """Decode behavior model predictions"""
    if not isinstance(predictions, np.ndarray):
        predictions = np.array(predictions)
    if predictions.ndim > 1:
        predictions = predictions.flatten()
    
    active_behaviors = [BEHAVIOR_LABELS[i] for i, pred in enumerate(predictions) if pred == 1]
    primary_type = active_behaviors[0] if active_behaviors else "generalist"
    
    return {{
        "primary_type": primary_type,
        "secondary_traits": active_behaviors[1:] if len(active_behaviors) > 1 else [],
        "all_behaviors": active_behaviors,
        "traits": BEHAVIOR_DESCRIPTIONS.get(primary_type, {{}}).get("traits", [])
    }}

# --- Skill Labels (AUTO-GENERATED) ---
# These are ordered by frequency and proficiency across training data
SKILL_LABELS = {TOP_SKILLS}

def decode_skills_predictions(predictions: np.ndarray, top_n: int = 10) -> List[str]:
    """
    Decode skills model predictions (now continuous proficiency scores).
    Returns skills sorted by proficiency score.
    
    Args:
        predictions: Array of proficiency scores [0.8, 0.3, 0.9, ...]
        top_n: Number of top skills to return
        
    Returns:
        List of top N skill names sorted by proficiency
    """
    if not isinstance(predictions, np.ndarray):
        predictions = np.array(predictions)
    if predictions.ndim > 1:
        predictions = predictions.flatten()
    
    # Get top N skills by proficiency score
    top_indices = np.argsort(predictions)[::-1][:top_n]
    
    # Filter out skills with very low scores (< 0.1)
    top_skills = [
        SKILL_LABELS[i] 
        for i in top_indices 
        if i < len(SKILL_LABELS) and predictions[i] > 0.1
    ]
    
    return top_skills if top_skills else SKILL_LABELS[:top_n]
'''

with open('organized_structure/models/label_mappings.py', 'w') as f:
    f.write(label_mappings_content)

print("✅ label_mappings.py updated with new skill labels!")

# ============================================================================
# STEP 9: Test Predictions
# ============================================================================
print("\n🧪 Testing predictions on sample users...")

# Test on first 3 test users
for i in range(min(3, len(X_test))):
    test_user = X_test.iloc[i:i+1]
    predicted_scores = pipeline.predict(test_user)[0]
    
    # Get top 5 skills
    top_indices = np.argsort(predicted_scores)[::-1][:5]
    
    print(f"\nUser {i+1}:")
    print(f"  Total repos: {int(test_user['total_repos'].values[0])}")
    print(f"  Top 5 predicted skills:")
    for rank, idx in enumerate(top_indices, 1):
        skill = TOP_SKILLS[idx]
        score = predicted_scores[idx]
        true_score = y_test.iloc[i, idx]
        print(f"    {rank}. {skill:15s}: predicted={score:.3f}, actual={true_score:.3f}")

print("\n" + "="*80)
print("✅ SKILLS MODEL RETRAINING COMPLETE!")
print("="*80)
print("\n📝 What Changed:")
print("   • Model now predicts PROFICIENCY SCORES (0-1) for each skill")
print("   • Scores based on: frequency + usage + recency")
print("   • Skills with higher scores appear first automatically")
print("   • No more binary yes/no - now continuous expertise levels!")
print("\n🎯 The model learned that:")
print("   • Skills in more repos = higher proficiency")
print("   • More code/commits = higher proficiency")
print("   • Recent usage = higher proficiency")
print("\n🚀 Next: Restart your backend and generate portfolio!")

