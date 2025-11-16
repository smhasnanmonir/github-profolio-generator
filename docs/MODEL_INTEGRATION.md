# ML Model Integration - Pure Model-Driven Approach

## Overview

The portfolio generation system now relies **completely on your trained ML models**. No hardcoded logic, no fallbacks, no rule-based overrides.

## What Changed

### ✅ Before (Hardcoded)
- Hardcoded behavior mappings (`{0: 'specialist', 1: 'generalist'}`)
- Rule-based fallback logic when models unavailable
- Simple language counting for skills
- Composite scoring for project ranking

### ✅ After (Pure Model Output)
- **Behavior**: Uses raw model predictions directly
- **Skills**: Model predicts and ranks all skills
- **Ranking**: XGBoost model scores determine project selection
- **No fallbacks**: Raises errors if models missing

## Model Requirements

### 1. Behavior Classifier (`behavior_classifier.pkl`)

**Input Features** (10 features):
```python
[
    commits_per_day,          # float
    prs_per_day,             # float
    issues_per_day,          # float
    pr_review_ratio,         # float
    collaboration_score,     # float
    activity_score,          # float
    language_diversity,      # int
    active_repo_ratio,       # float (0-1)
    follower_ratio,          # float
    stars_per_repo          # float
]
```

**Expected Output Formats** (flexible):

Option 1 - Dictionary:
```python
{
    'focus': 'specialist' | 'generalist' | 'maintainer',
    'collaboration_style': 'high' | 'moderate' | 'low',
    'work_rhythm': 'consistent' | 'bursty' | 'sporadic',
    'stability': 'high' | 'medium' | 'low',
    'communication': 'high' | 'medium' | 'low'
}
```

Option 2 - Tuple/List:
```python
['specialist', 'high', 'consistent', 'high', 'medium']
# Order: [focus, collaboration_style, work_rhythm, stability, communication]
```

Option 3 - Single Value:
```python
'specialist'  # Primary behavior indicator
```

### 2. Skills Classifier (`skills_classifier.pkl`)

**Input Features** (5 features):
```python
[
    language_count,          # int - number of languages used
    total_language_usage,    # int - sum of all language usage
    max_language_usage,      # int - most used language count
    total_stars,            # int - total stars across repos
    language_diversity      # int - unique languages
]
```

**Expected Output**:
```python
# Direct skill list
['Python', 'JavaScript', 'TypeScript', 'Docker', 'React']

# Or via predict_proba with classes
model.classes_ = ['Python', 'JavaScript', ...]
model.predict_proba() = [[0.9, 0.7, 0.6, ...]]  # Probabilities for each skill
```

**Alternative Methods Supported**:
- `predict()` - Direct skill list
- `predict_proba()` + `classes_` - Probability-based ranking
- `transform()` - Feature transformation for ranking

### 3. Ranking XGBoost (`ranking_xgboost.pkl`)

**Input Features** (per repository):
```python
DataFrame columns:
- stars (int)
- forks (int)
- popularity_score (float)
- engagement_score (float)
- is_active (bool)
- repo_age_days (int)
- days_since_push (int)
```

**Expected Output**:
```python
# Array of importance scores (one per repository)
[0.95, 0.87, 0.76, 0.45, 0.23, ...]

# Higher score = more important project
# Top N repositories are selected based on these scores
```

## How It Works

### Workflow

```
1. Fetch GitHub Data (fetcher.py)
   ↓
2. Extract Features (parse_and_extract.py)
   ↓
3. Load ML Models (generate_portfolio_improved.py)
   ↓
4. Model Predictions:
   - Behavior Model → behavior_profile
   - Skills Model → skills list
   - Ranking Model → top_projects
   ↓
5. Build Portfolio JSON
   ↓
6. Render HTML/PDF (render_pdf.py)
```

### Prediction Flow

```python
# 1. BEHAVIOR PREDICTION
behavior_features = np.array([[...10 features...]])
behavior_profile = behavior_model.predict(behavior_features)
# → Returns behavior attributes dict

# 2. SKILLS EXTRACTION
skills_features = {
    'all_languages': {'Python': 50, 'JavaScript': 30, ...},
    'total_stars': 1500,
    'language_diversity': 8
}
skills = skills_model.predict(feature_array)
# → Returns ranked skill list

# 3. PROJECT RANKING
ranking_features = DataFrame with repo features
scores = ranking_model.predict(ranking_features)
top_indices = np.argsort(scores)[::-1][:6]
# → Returns indices of top 6 projects
```

## Model Training Requirements

Your models should be trained to output the exact formats expected above. Here's what each model needs to learn:

### Behavior Model Training
```python
# Training labels should be behavior attributes
X_train = behavior_features  # (n_samples, 10)
y_train = behavior_labels    # Can be:
                              # - Multi-output: (n_samples, 5) for 5 attributes
                              # - Single-output: (n_samples,) for primary behavior

# Example training
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier()
model.fit(X_train, y_train)
```

### Skills Model Training
```python
# Training to rank/classify skills based on usage patterns
X_train = skills_features    # (n_samples, 5)
y_train = top_skills         # (n_samples, n_skills) or skill names

# Example training
from sklearn.multioutput import MultiOutputClassifier
model = MultiOutputClassifier(RandomForestClassifier())
model.fit(X_train, y_train)
```

### Ranking Model Training
```python
# Training to score repository importance/quality
X_train = repo_features      # (n_repos, 7)
y_train = importance_scores  # (n_repos,) - continuous scores

# Example training
import xgboost as xgb
model = xgb.XGBRegressor(
    objective='reg:squarederror',
    n_estimators=100
)
model.fit(X_train, y_train)
```

## Error Handling

The system now **requires all models** to be present:

```python
# If models missing:
ValueError: Behavior model is required. Please ensure behavior_classifier.pkl is in models directory.
ValueError: Skills model is required. Please ensure skills_classifier.pkl is in models directory.
ValueError: Ranking model is required. Please ensure ranking_xgboost.pkl is in models directory.
```

## Testing Your Models

### Test Behavior Model
```python
from organized_structure.generation.generate_portfolio_improved import load_models, predict_behavior_profile
import numpy as np

models = load_models()
test_features = np.array([[0.5, 0.3, 0.1, 0.4, 0.3, 0.4, 5, 0.6, 1.2, 10.5]])
profile = predict_behavior_profile(test_features, models['behavior'])
print(profile)
# Expected: {'focus': '...', 'collaboration_style': '...', ...}
```

### Test Skills Model
```python
from organized_structure.generation.generate_portfolio_improved import load_models, extract_skills

models = load_models()
skills_features = {
    'all_languages': {'Python': 50, 'JavaScript': 30, 'TypeScript': 20},
    'total_stars': 1500,
    'language_diversity': 3
}
skills = extract_skills(skills_features, models['skills'], top_n=5)
print(skills)
# Expected: ['Python', 'JavaScript', 'TypeScript', ...]
```

### Test Ranking Model
```python
from organized_structure.generation.generate_portfolio_improved import load_models, rank_repositories
import pandas as pd

models = load_models()
repos_df = pd.DataFrame({
    'stars': [100, 50, 200],
    'forks': [10, 5, 20],
    'popularity_score': [4.5, 3.2, 5.1],
    'engagement_score': [120, 60, 230],
    'is_active': [True, False, True],
    'repo_age_days': [365, 730, 180],
    'days_since_push': [10, 200, 5]
})
top_indices = rank_repositories(repos_df, repos_df, models['ranking'], top_n=3)
print(top_indices)
# Expected: [2, 0, 1] (indices sorted by importance)
```

## Model Output Integration

The portfolio JSON structure directly uses model outputs:

```json
{
  "behavior_profile": {
    // Direct from behavior_model.predict()
    "focus": "specialist",
    "collaboration_style": "high",
    "work_rhythm": "consistent",
    "stability": "high",
    "communication": "medium"
  },
  "skills": [
    // Direct from skills_model.predict()
    "Python", "JavaScript", "Docker", ...
  ],
  "top_projects": [
    // Selected using ranking_model.predict()
    {"name": "project1", "stars": 200, ...},
    {"name": "project2", "stars": 150, ...}
  ]
}
```

## Benefits of Pure Model Approach

1. **No Bias**: Portfolio reflects what models learned from training data
2. **Consistency**: Same features always produce same predictions
3. **Adaptable**: Models can be retrained without code changes
4. **Transparent**: Model predictions are used directly, no hidden logic
5. **Testable**: Easy to validate model outputs match expectations

## Updating Models

To update your models:

1. Train new models with your dataset
2. Save as `.pkl` files with same names
3. Replace files in `organized_structure/models/`
4. Restart backend server
5. New predictions will use updated models immediately

```bash
# Save your trained model
import pickle
with open('organized_structure/models/behavior_classifier.pkl', 'wb') as f:
    pickle.dump(trained_model, f)

# Restart server
uvicorn backend:app --reload
```

## Summary

✅ **100% Model-Driven**: No hardcoded logic or fallbacks  
✅ **Direct Predictions**: Uses model outputs as-is  
✅ **Flexible Format**: Adapts to different model output types  
✅ **Required Models**: Ensures models are always present  
✅ **Pure ML Pipeline**: From features → predictions → portfolio

Your trained models now have complete control over the portfolio generation!

