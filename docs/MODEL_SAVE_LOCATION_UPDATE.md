# Model Save Location Update

## ✅ Change Applied

All trained models now save to the **`training_outputs/`** folder instead of `organized_structure/models/`.

---

## 📁 New Save Location

### Before
```
organized_structure/
└── models/
    ├── ranking_xgboost.pkl
    ├── skills_classifier.pkl
    └── behavior_classifier.pkl
```

### After (NEW)
```
training_outputs/
├── ranking_xgboost.pkl           ← Model files now here
├── ranking_mlp.h5                ← Neural Network model
├── skills_classifier.pkl         ← Skills model
├── behavior_classifier.pkl       ← Behavior model
├── ranking_models_comparison_*.csv
├── skills_comparison_*.csv
├── behavior_comparison_*.csv
└── *.png                         ← All plots
```

---

## 🎯 Benefits

1. **Centralized Output**: All training artifacts in one folder
2. **Timestamped Files**: Models saved with timestamps for version tracking
3. **Easy Cleanup**: Delete entire `training_outputs/` folder to start fresh
4. **Better Organization**: Models + results + plots all together

---

## 📊 Files Saved to `training_outputs/`

### Model Files (.pkl, .h5)
- `ranking_xgboost.pkl` - XGBoost ranking model (~2.5 MB)
- `ranking_mlp.h5` - Neural Network ranking model (if TensorFlow installed)
- `skills_classifier.pkl` - Skills proficiency model (~27 KB)
- `behavior_classifier.pkl` - Behavior classification model (~11 KB)

### Training Artifacts
- `pipe_rank_xgb_*.pkl` - Timestamped XGBoost pipeline
- `rank_mlp_*.h5` - Timestamped Neural Network
- `rank_nn_preprocessor_*.pkl` - NN preprocessor

### Results & Comparisons
- `ranking_models_comparison_*.csv` - Model performance comparison
- `ranking_predictions_*.csv` - Test set predictions
- `skills_comparison_*.csv` - Skills model metrics
- `behavior_comparison_*.csv` - Behavior model metrics

### Feature Engineering
- `final_features_*.csv` - All engineered features
- `model_features_shortlist_*.csv` - Selected features for models
- `engineered_features_only_*.csv` - Only engineered features
- `feature_groups_*.json` - Feature metadata

### Visualizations (.png)
- `nn_training_history.png` - Neural Network training curves
- `rank_rank_comparison.png` - XGBoost vs NN scatter
- `model_predictions_comparison.png` - Prediction comparison
- `metrics_comparison_bar_chart.png` - Performance metrics
- `residual_analysis.png` - Residual plots
- `xgb_feature_importance.png` - Feature importance
- `skills_label_distribution.png` - Skill distribution
- `skills_models_comparison.png` - Skills model comparison

---

## 🔧 Code Changes

### In `ml_model.py` (Lines 2429-2449)

**Changed from:**
```python
joblib.dump(pipe_rank_xgb, f"{MODEL_DIR}/ranking_xgboost.pkl")
joblib.dump(best_skills_model, f"{MODEL_DIR}/skills_classifier.pkl")
joblib.dump(best_behavior_pipeline, f"{MODEL_DIR}/behavior_classifier.pkl")
```

**Changed to:**
```python
joblib.dump(pipe_rank_xgb, f"{SAVE_DIR}/ranking_xgboost.pkl")
joblib.dump(best_skills_model, f"{SAVE_DIR}/skills_classifier.pkl")
joblib.dump(best_behavior_pipeline, f"{SAVE_DIR}/behavior_classifier.pkl")
```

Where:
- `SAVE_DIR = "training_outputs"` (Line 30)
- `MODEL_DIR = "organized_structure/models"` (no longer used for saving)

---

## 🚀 Next Training Run

When you run `python ml_model.py` next time, all 3 models will be saved to:

```
training_outputs/
├── ranking_xgboost.pkl      ✅ Latest version
├── skills_classifier.pkl    ✅ Latest version
├── behavior_classifier.pkl  ✅ Latest version
└── ranking_mlp.h5           ✅ Latest version (if TensorFlow)
```

---

## 📝 Usage Notes

### To Use the Models

From your backend/generation code, load models from:
```python
import joblib

# Load from training_outputs
ranking_model = joblib.load("training_outputs/ranking_xgboost.pkl")
skills_model = joblib.load("training_outputs/skills_classifier.pkl")
behavior_model = joblib.load("training_outputs/behavior_classifier.pkl")
```

### To Archive Models

To keep a specific trained version:
```bash
# Copy to organized_structure/models for deployment
cp training_outputs/ranking_xgboost.pkl organized_structure/models/
cp training_outputs/skills_classifier.pkl organized_structure/models/
cp training_outputs/behavior_classifier.pkl organized_structure/models/
```

### To Clean Up

```bash
# Remove all training outputs
rm -rf training_outputs/*

# Or delete specific old versions
rm training_outputs/pipe_rank_xgb_*.pkl
```

---

## ✅ Verification

After the next training run, check:

```bash
ls -lh training_outputs/*.pkl
ls -lh training_outputs/*.h5
```

You should see:
- 3 `.pkl` files (ranking, skills, behavior)
- 1 `.h5` file (Neural Network, if TensorFlow installed)
- Multiple timestamped backup files
- CSV comparison results
- PNG visualization plots

---

*Last Updated: 2025-11-17*
*Status: Applied and ready for next training run ✅*

