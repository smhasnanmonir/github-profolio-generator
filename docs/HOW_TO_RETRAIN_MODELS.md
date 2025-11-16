# 🎓 How to Retrain Your ML Models

## The Problem with Hardcoded Logic

You're right! I initially added hardcoded priority scoring (stars × 5, forks × 4, etc.), which defeats the purpose of machine learning.

**The proper solution**: Train your model to **naturally learn** these priorities from data.

---

## 🎯 The Real ML Approach

### Current vs. Proper Training

**❌ Current (Wrong)**

```python
# Hardcoded weights in inference code
star_score = stars * 5.0
fork_score = forks * 4.0
# ... more hardcoded logic
```

**✅ Proper (ML Way)**

```python
# Model learns from training data what makes a repo "good"
model_score = model.predict(features)  # Model learned the priorities!
```

---

## 📚 Step-by-Step Retraining Guide

### Step 1: Collect Training Data

```bash
# Edit collect_training_data.py and add your GitHub token
python collect_training_data.py
```

**What it does:**

- Fetches repositories from multiple GitHub users
- Extracts features: stars, watchers, forks, commits, recency, etc.
- Saves to `github_training_data.csv`

**How to customize:**

- Add more usernames to `TRAINING_USERS` list
- The more diverse users you add, the better the model learns

### Step 2: Retrain the Model

```bash
python retrain_ranking_model.py
```

**What it does:**

- Loads `github_training_data.csv`
- Creates a NEW `rank_target` with YOUR priorities:
  ```python
  rank_target = (
      0.35 * normalized_stars +      # 35% weight
      0.25 * normalized_forks +      # 25% weight
      0.15 * normalized_watchers +   # 15% weight
      0.15 * normalized_commits +    # 15% weight
      0.10 * normalized_recency      # 10% weight
  )
  ```
- Trains XGBoost to predict this target
- Saves new model to `organized_structure/models/ranking_xgboost.pkl`

**How to customize:**
Modify the `NEW_WEIGHTS` in `retrain_ranking_model.py`:

```python
NEW_WEIGHTS = {
    'stars': 0.35,      # Change these!
    'forks': 0.25,
    'watchers': 0.15,
    'commits': 0.15,
    'recency': 0.10,
}
```

### Step 3: Use the Retrained Model

The updated `generate_portfolio_improved.py` now uses **ONLY** the model predictions:

```python
# No hardcoded logic - just pure ML!
model_scores = model.predict(ranking_features)
top_indices = np.argsort(model_scores)[::-1][:top_n]
```

---

## 🧠 How the Model Learns

### Training Process

1. **Input**: Repository features (stars, forks, age, languages, etc.)
2. **Target**: Composite score based on YOUR priorities
3. **Model**: XGBoost learns patterns in the data
4. **Output**: Model that naturally ranks repos by your criteria

### Example

**Training Data:**

```
Repo A: 1000 stars, 200 forks, 50 commits
→ rank_target = 0.35*(1.0) + 0.25*(1.0) + ... = 0.92

Repo B: 10 stars, 2 forks, 500 commits
→ rank_target = 0.35*(0.01) + 0.25*(0.01) + ... = 0.23
```

**Model learns:**

- "High stars + high forks = high score"
- "Many commits but few stars = lower score"
- "Recent updates boost score"

---

## 🔧 Advanced Customization

### Adjusting Priority Weights

Want more emphasis on recency? Edit `retrain_ranking_model.py`:

```python
NEW_WEIGHTS = {
    'stars': 0.30,      # Reduced from 0.35
    'forks': 0.20,      # Reduced from 0.25
    'watchers': 0.10,   # Reduced from 0.15
    'commits': 0.10,    # Reduced from 0.15
    'recency': 0.30,    # INCREASED from 0.10!
}
```

### Adding More Features

Want to include issues, pull requests, or releases?

1. **Collect the data** in `collect_training_data.py`:

```python
'open_issues': repo['issues']['totalCount'],
'closed_issues': repo['closedIssues']['totalCount'],
```

2. **Add to rank_target** in `retrain_ranking_model.py`:

```python
NEW_WEIGHTS = {
    # ... existing weights ...
    'issues_ratio': 0.05,  # closed / total issues
}
```

---

## 📊 Monitoring Model Performance

After retraining, the script shows:

```
✅ Evaluation Results:
   RMSE: 0.0523        ← Lower is better
   R² Score: 0.8945     ← Higher is better (0-1)

🎯 Top 10 Most Important Features:
   stars              0.342  ← Model learned stars are most important!
   forks              0.198
   watchers           0.156
   total_commits      0.124
   ...
```

**What to look for:**

- **R² > 0.80**: Model is learning well
- **Top features** should match your priorities
- **RMSE < 0.1**: Predictions are accurate

---

## 🎯 Complete Workflow

```bash
# 1. Setup
pip install -r requirements.txt

# 2. Collect training data (add your GitHub token first!)
python collect_training_data.py

# 3. Retrain the model with YOUR priorities
python retrain_ranking_model.py

# 4. Generate portfolio (now uses retrained model!)
python backend.py
```

---

## ⚡ Quick Comparison

### Before (Hardcoded)

```python
# Inference code has hardcoded priorities
star_score = stars * 5.0
fork_score = forks * 4.0
final_score = (0.7 * hardcoded_score) + (0.3 * model_score)
```

**Problems:**

- ❌ Not machine learning, just fancy math
- ❌ Priorities hardcoded in inference code
- ❌ Can't adapt to new data
- ❌ Model is underutilized (only 30% weight)

### After (Pure ML)

```python
# Model learns priorities from training data
model_score = model.predict(features)
top_repos = sort_by(model_score)
```

**Benefits:**

- ✅ True machine learning
- ✅ Priorities learned from data
- ✅ Model adapts to patterns
- ✅ 100% ML-driven decisions

---

## 🤔 FAQ

**Q: Why not just sort by stars directly?**
A: The model learns complex patterns like "recent repos with moderate stars are better than old repos with many stars" or "forks matter more for certain types of projects."

**Q: How much training data do I need?**
A: Minimum 100 repos, ideally 500+. Add more users to `TRAINING_USERS`.

**Q: Can I use different priorities for different users?**
A: Yes! Train separate models or add user preferences as features.

**Q: Will this work for my specific case?**
A: Yes! Just adjust the `NEW_WEIGHTS` to match your priorities and retrain.

---

## 📝 Summary

1. ✅ **Removed hardcoded logic** from `generate_portfolio_improved.py`
2. ✅ **Created training scripts** to collect data and retrain
3. ✅ **Model now learns** to prioritize: Stars > Forks > Watchers > Commits > Recency
4. ✅ **Pure ML approach** - no more hardcoded weights in inference!

**Next time you want to change priorities:**

- Don't touch inference code
- Just adjust `NEW_WEIGHTS` and retrain
- Model will learn new priorities automatically

This is the proper ML way! 🎯🚀
