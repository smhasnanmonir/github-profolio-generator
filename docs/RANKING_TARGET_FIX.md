# Ranking Target Fix - Using Real Data

## Problem
The ranking target was showing warnings and using default values instead of real GitHub metrics:
```
⚠️ Cannot compute total_stars, using default value
⚠️ Cannot compute total_forks, using default value
⚠️ No commit data available, using default value
⚠️ Cannot compute total_watchers, using default value
```

## Root Cause
The script was loading `model_features_shortlist_*.csv` which only contains **engineered features** (42 features), but **NOT the raw metrics** like `total_stars_received`, `total_forks_received`, etc.

These raw metrics exist in `final_features_*.csv` (132 columns) but were not being merged into the ranking calculation.

## Solution
Modified `ml_model.py` (lines 980-1065) to:

1. **Load the full features file** (`final_features_*.csv`)
2. **Extract raw metrics** needed for ranking:
   - `total_stars_received` → stars
   - `total_forks_received` → forks  
   - `total_watchers` → watchers
   - `total_commit_contributions` → commits
   - `recent_activity_ratio` → recency

3. **Merge these columns** into the working dataframe (shortlist)
4. **Map to standard names** for the ranking formula

## New Ranking Formula

```python
# Raw metrics from actual GitHub data
total_stars = df['total_stars_received']       # Real star counts
total_forks = df['total_forks_received']       # Real fork counts  
total_watchers = df['total_watchers']          # Real watcher counts
total_commits = df['total_commit_contributions'] # Real commit counts
recency_score = df['recent_activity_ratio']   # Real activity ratio

# Normalize each to 0-1 using robust scaling
normalized_stars = robust01(total_stars)
normalized_forks = robust01(total_forks)
normalized_watchers = robust01(total_watchers)
normalized_commits = robust01(total_commits)
normalized_recency = robust01(recency_score)

# Weighted combination (YOUR priorities!)
rank_target = (
    0.35 * normalized_stars +      # 35% - Stars (highest priority)
    0.25 * normalized_forks +      # 25% - Forks  
    0.15 * normalized_watchers +   # 15% - Watchers
    0.15 * normalized_commits +    # 15% - Commits
    0.10 * normalized_recency      # 10% - Recent activity
)
```

## Expected Output (Fixed)
```
🎯 Creating NEW rank_target with direct priority metrics:
   Stars > Forks > Watchers > Commits > Recency
   Loading full features from final_features to get raw metrics...
   Loading: training_outputs\final_features_20251117_023323.csv
   ✅ Merged 5 raw metric columns
   ✅ Using total_stars_received for stars metric
   ✅ Using total_forks_received for forks metric
   ✅ Using total_commit_contributions for commits metric
   ✅ Using total_watchers for watchers metric
   ✅ Using recent_activity_ratio for recency score
   
   Normalizing components...
   Weights: {'stars': 0.35, 'forks': 0.25, 'watchers': 0.15, 'commits': 0.15, 'recency': 0.1}
✅ Ranking target created!
   Components used: 5
   Target stats - Mean: X.XXXX, Std: X.XXXX
```

## Verification
Run the training and check for **all green ✅ checkmarks** in the ranking target section.

**NO MORE ⚠️ warnings about default values!**

All metrics now come from **real GitHub data** → **Real ML-driven ranking!**

