# 🚀 Quick Start: Retrain Your Model

## TL;DR

```bash
# 1. Add your GitHub token to collect_training_data.py
# 2. Run these commands:

python collect_training_data.py    # Collect data from GitHub
python retrain_ranking_model.py    # Train model with YOUR priorities
python backend.py                  # Use new model!
```

---

## What You Get

### Before: Hardcoded Logic ❌
```python
star_score = stars * 5.0  # Hardcoded!
fork_score = forks * 4.0  # Hardcoded!
```

### After: Pure ML ✅
```python
model_score = model.predict(features)  # Learned from data!
```

---

## Your Priorities (Customizable)

Default weights in `retrain_ranking_model.py`:

```python
NEW_WEIGHTS = {
    'stars': 0.35,      # 35% - Highest priority
    'forks': 0.25,      # 25% - Second priority
    'watchers': 0.15,   # 15% - Third priority
    'commits': 0.15,    # 15% - Development effort
    'recency': 0.10,    # 10% - Recent activity
}
```

**Want different priorities?** Just change these numbers and retrain!

---

## Files Created

1. **`collect_training_data.py`** - Fetches GitHub data for training
2. **`retrain_ranking_model.py`** - Retrains model with your priorities
3. **`HOW_TO_RETRAIN_MODELS.md`** - Detailed guide
4. **Updated `generate_portfolio_improved.py`** - Removed hardcoded logic!

---

## What Changed

### `generate_portfolio_improved.py` (Lines 407-424)

**Before (70% hardcoded + 30% ML):**
```python
# Hardcoded priority scoring
star_score = stars * 5.0
watcher_score = watchers * 3.0
fork_score = forks * 4.0
...
final_scores = (0.7 * hardcoded) + (0.3 * model)
```

**After (100% ML):**
```python
# Pure model predictions - no hardcoded logic!
model_scores = model.predict(ranking_features)
top_indices = np.argsort(model_scores)[::-1]
```

---

## Next Steps

1. **Get GitHub Token**: https://github.com/settings/tokens
2. **Add token** to `collect_training_data.py` (line 15)
3. **Add training users** to `TRAINING_USERS` list (line 22)
4. **Run collection**: `python collect_training_data.py`
5. **Retrain model**: `python retrain_ranking_model.py`
6. **Done!** Your model now naturally prioritizes your metrics

---

## Benefits

✅ **No more hardcoded logic** - everything learned from data  
✅ **Fully customizable** - change weights and retrain  
✅ **Better predictions** - model learns complex patterns  
✅ **Easy to update** - just retrain, don't touch inference code  

---

## Support

See **`HOW_TO_RETRAIN_MODELS.md`** for detailed explanation!

