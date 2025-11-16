# Documentation Index

All project documentation organized by category.

---

## 🚀 Quick Start

- **[README.md](README.md)** - Main project readme
- **[WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)** - Complete workflow guide
- **[ALL_FIXES_COMPLETE.md](ALL_FIXES_COMPLETE.md)** - Summary of all fixes applied

---

## 📚 Training Guides

### Setup & Configuration
- **[LOCAL_TRAINING_SETUP.md](LOCAL_TRAINING_SETUP.md)** - Local training environment setup
- **[GPU_TRAINING_GUIDE.md](GPU_TRAINING_GUIDE.md)** - GPU acceleration setup
- **[REQUIREMENTS_GUIDE.md](REQUIREMENTS_GUIDE.md)** - Dependencies guide

### How to Train
- **[HOW_TO_RETRAIN_MODELS.md](HOW_TO_RETRAIN_MODELS.md)** - Detailed retraining guide
- **[RETRAINING_QUICK_START.md](RETRAINING_QUICK_START.md)** - Quick reference
- **[TRAIN_VAL_TEST_GUIDE.md](TRAIN_VAL_TEST_GUIDE.md)** - Train/validation/test split guide

### Training Status & Results
- **[TRAINING_STATUS.md](TRAINING_STATUS.md)** - Current training configuration
- **[TRAINING_RESULTS_SUMMARY.md](TRAINING_RESULTS_SUMMARY.md)** - Training results and performance
- **[UPDATED_TRAINING_SUMMARY.md](UPDATED_TRAINING_SUMMARY.md)** - Updated training summary

---

## 🔧 Model Documentation

### Ranking Model
- **[RANKING_MODEL_UPDATE.md](RANKING_MODEL_UPDATE.md)** - Repository-level metrics (PRIMARY)
- **[REPOSITORY_RANKING_UPDATE.md](REPOSITORY_RANKING_UPDATE.md)** - Repository ranking details
- **[RANKING_TARGET_FIX.md](RANKING_TARGET_FIX.md)** - Ranking target calculation fix

### Skills Model
- **[SKILLS_MODEL_FIX.md](SKILLS_MODEL_FIX.md)** - Column mapping and proficiency scoring

### Features
- **[FEATURE_MAPPING_ACTUAL.md](FEATURE_MAPPING_ACTUAL.md)** - Actual feature mapping (PRIMARY)
- **[FEATURE_MAPPING.md](FEATURE_MAPPING.md)** - Original feature mapping
- **[FEATURES_FIXED.md](FEATURES_FIXED.md)** - Feature fixes applied

---

## 🐛 Fixes & Changes

### Summary Documents
- **[FINAL_SUMMARY.md](FINAL_SUMMARY.md)** - Complete project summary
- **[FIXES_SUMMARY.md](FIXES_SUMMARY.md)** - All fixes summary
- **[NO_FALLBACK_CHANGES.md](NO_FALLBACK_CHANGES.md)** - Fallback removal details

### Specific Fixes
- **[DATA_LOADING_FIXES.md](DATA_LOADING_FIXES.md)** - Data loading issues resolved
- **[MODEL_INTEGRATION.md](MODEL_INTEGRATION.md)** - Model integration guide

---

## 📊 Models Overview

| Model | Purpose | Key Metrics | Status |
|-------|---------|-------------|--------|
| **Ranking** | Rank repositories by quality | R² = 0.9929 (99.29%) | ✅ Ready |
| **Skills** | Predict skill proficiency | Multi-output regression | ✅ Ready |
| **Behavior** | Classify developer patterns | Multi-label classification | ✅ Ready |

---

## 🎯 Key Features

### Ranking Model (7 metrics)
- ✅ Repository stars, forks, watchers
- ✅ **Language code size** (languages_total_size) - NEW!
- ✅ **Language diversity** (languages_total_count) - NEW!
- ✅ User commits and recency

### Skills Model (Proficiency-based)
- ✅ Frequency (40%): Repository count
- ✅ Activity (30%): releases_count
- ✅ Popularity (20%): stargazer_count
- ✅ Recency (10%): Days since update

### Behavior Model (4 patterns)
- Maintainer
- Team Player
- Innovator
- Learner

---

## 🏆 Best Practices

1. **Read first:** [ALL_FIXES_COMPLETE.md](ALL_FIXES_COMPLETE.md)
2. **Setup environment:** [LOCAL_TRAINING_SETUP.md](LOCAL_TRAINING_SETUP.md)
3. **Configure GPU:** [GPU_TRAINING_GUIDE.md](GPU_TRAINING_GUIDE.md)
4. **Train models:** [HOW_TO_RETRAIN_MODELS.md](HOW_TO_RETRAIN_MODELS.md)
5. **Check results:** [TRAINING_RESULTS_SUMMARY.md](TRAINING_RESULTS_SUMMARY.md)

---

## 📝 Notes

- All models use **100% real data** (zero fallbacks)
- Training achieves **99.29% accuracy** on ranking
- GPU acceleration enabled for XGBoost and TensorFlow
- No popup windows during training (matplotlib Agg backend)

---

*Last Updated: 2025-11-17*
*Total Documentation Files: 24*

