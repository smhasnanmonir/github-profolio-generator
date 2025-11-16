# Ranking Model - Repository-Level Metrics Update

## ✅ Updated Ranking Model

The ranking model now uses **direct repository-level metrics** instead of user-level aggregates.

---

## 🎯 New Metrics (7 Total)

### Repository-Level Metrics (5)

These are aggregated **per user** from their repositories (bigger = better):

1. **`stargazer_count`** (30% weight)
   - Total stars across all user's repositories
   - Primary popularity indicator
2. **`fork_count`** (20% weight)
   - Total forks across all user's repositories
   - Indicates code reuse and utility
3. **`watchers_count`** (10% weight)
   - Total watchers across all user's repositories
   - Shows active community interest
4. **`languages_total_size`** (15% weight) - **NEW!**
   - Total size of code across all languages
   - Bigger value = more comprehensive codebase
   - Measures code volume and project scale
5. **`languages_total_count`** (10% weight) - **NEW!**
   - Total number of different languages used
   - Bigger value = more diverse tech stack
   - Measures technical versatility

### User-Level Metrics (2)

These come from user-level aggregates in `final_features`:

6. **`total_commit_contributions`** (10% weight)
   - Total commits by the user
   - Measures development effort
7. **`recent_activity_ratio`** (5% weight)
   - Recent activity score (0-1)
   - Bonus for active developers

---

## 📊 Weight Distribution

```python
NEW_RANK_WEIGHTS = {
    'stars': 0.30,          # 30% - Repository popularity
    'forks': 0.20,          # 20% - Code reuse
    'watchers': 0.10,       # 10% - Active interest
    'lang_size': 0.15,      # 15% - Code volume (NEW!)
    'lang_count': 0.10,     # 10% - Language diversity (NEW!)
    'commits': 0.10,        # 10% - Development effort
    'recency': 0.05,        # 5%  - Recent activity
}
# Total: 100%
```

**Key Changes:**

- Added `languages_total_size` (15%) - Rewards larger, more comprehensive codebases
- Added `languages_total_count` (10%) - Rewards technical diversity
- Adjusted other weights to accommodate new metrics

---

## 🔄 Data Flow

### 1. Load User Features

```python
df = pd.read_csv("model_features_shortlist_*.csv")  # User-level features
```

### 2. Load User-Level Metrics

```python
df_full = pd.read_csv("final_features_*.csv")
# Extract: total_commit_contributions, recent_activity_ratio
```

### 3. Load Repository-Level Metrics

```python
df_repos = pd.read_csv("github_repos_20251023_064928.csv")
# Extract: stargazer_count, fork_count, watchers_count,
#          languages_total_size, languages_total_count
```

### 4. Aggregate Per User

```python
repo_agg = df_repos.groupby('id').agg({
    'stargazer_count': 'sum',           # Total stars
    'fork_count': 'sum',                # Total forks
    'watchers_count': 'sum',            # Total watchers
    'languages_total_size': 'sum',      # Total code size
    'languages_total_count': 'sum',     # Total language diversity
}).reset_index()
```

### 5. Normalize & Calculate Target

```python
# Normalize each component to 0-1 using robust scaling
normalized_stars = robust01(df['repo_stars'])
normalized_forks = robust01(df['repo_forks'])
# ... (all 7 components)

# Calculate weighted rank target
df["rank_target"] = (
    0.30 * normalized_stars +
    0.20 * normalized_forks +
    0.10 * normalized_watchers +
    0.15 * normalized_lang_size +      # NEW!
    0.10 * normalized_lang_count +     # NEW!
    0.10 * normalized_commits +
    0.05 * normalized_recency
)
```

---

## ✅ Error Handling (No Fallbacks)

All required columns **must exist** in the CSV files:

```python
# Repository CSV must have:
required_repo_cols = [
    'stargazer_count',
    'fork_count',
    'watchers_count',
    'languages_total_size',     # NEW - Required!
    'languages_total_count'     # NEW - Required!
]

# If any column is missing:
raise ValueError("❌ ERROR: Required repository columns missing!")
```

---

## 📈 Expected Impact

### Before (User-Level Aggregates)

- Used pre-aggregated `total_stars_received`, `total_forks_received`
- Limited to 5 metrics (stars, forks, watchers, commits, recency)
- No language diversity consideration
- No code volume consideration

### After (Repository-Level Metrics)

- Direct repository data with 7 metrics
- ✅ Rewards large, comprehensive codebases (`languages_total_size`)
- ✅ Rewards technical diversity (`languages_total_count`)
- ✅ More granular and accurate ranking
- ✅ Better reflects repository quality and scale

---

## 🔍 Verification

To verify the update is working:

```bash
# Run training and check for these messages:
✅ Loaded [N] repositories
✅ Aggregated metrics for [N] users
✅ Merged repository metrics into user dataframe
   Metrics: stargazer_count, fork_count, watchers_count, languages_total_size, languages_total_count
```

---

## 📁 Files Modified

1. **`ml_model.py`** (Lines 985-1115)

   - Updated to load repository CSV directly
   - Added `languages_total_size` and `languages_total_count`
   - Cleaned up obsolete user-level aggregate loading
   - Updated weights and rank_target calculation

2. **`RANKING_MODEL_UPDATE.md`** (NEW)
   - This documentation file

---

## 🎯 Result

**Your ranking model now:**

- ✅ Uses 100% real repository-level data
- ✅ Includes language code size (bigger = better)
- ✅ Includes language diversity (more languages = better)
- ✅ Has proper error handling (no fallbacks)
- ✅ Prioritizes comprehensive, diverse projects

**Top-ranked users will have:**

- Popular repositories (high stars/forks)
- Large, comprehensive codebases (high language size)
- Diverse technical skills (multiple languages)
- Active development (recent commits)

---

_Last Updated: 2025-11-17_
_Status: Ready for training_
