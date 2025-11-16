# 🚀 Quick Start Guide

## ✅ System Verified: 100% ML-Driven (No Hardcoding)

All portfolio generation is powered by your trained ML models with **ZERO hardcoded fallbacks**.

---

## 📋 Prerequisites

1. ✅ **Models trained and in place**:
   ```
   organized_structure/models/
   ├── behavior_classifier.pkl     (11 KB)
   ├── skills_classifier.pkl       (27 KB)
   └── ranking_xgboost.pkl         (2.5 MB)
   ```

2. ✅ **Dependencies installed**:
   ```bash
   pip install -r requirements.txt
   ```

3. ✅ **GitHub Personal Access Token** ready

---

## 🎯 Step-by-Step Usage

### 1️⃣ Start the Backend

```bash
# From project root
python -m uvicorn backend:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 2️⃣ Open the Frontend

**Option A: Direct File**
```bash
# Open in browser
start frontend/index.html  # Windows
open frontend/index.html   # Mac
xdg-open frontend/index.html  # Linux
```

**Option B: Local Server (Recommended)**
```bash
cd frontend
python -m http.server 8080
# Then open: http://localhost:8080
```

### 3️⃣ Generate Portfolio

1. **Enter GitHub Token**: `ghp_xxxxxxxxxxxxxxxxxxxx`
2. **Enter Username**: `torvalds` or `https://github.com/torvalds`
3. **Click**: "Generate Portfolio (HTML & PDF)"
4. **Wait**: 10-30 seconds (depending on profile size)
5. **Download**: HTML and PDF files

---

## 🤖 What the Models Do

### Behavior Model (SVC)
- **Predicts**: 4 behavior types (binary)
  - Maintainer
  - Team Player
  - Innovator
  - Learner
- **Output**: "Maintainer specializing in Python, JavaScript, Go"

### Skills Model (XGBoost Regressor)
- **Predicts**: Proficiency scores for 30 skills
- **Ranks**: Top 10 skills by usage, recency, and impact
- **Output**: `["Python", "JavaScript", "TypeScript", ...]`

### Ranking Model (XGBoost)
- **Ranks**: All repositories by learned priorities
- **Priorities**: Stars (35%) > Forks (25%) > Watchers (15%) > Commits (15%) > Recency (10%)
- **Output**: Top 6 most impactful projects

---

## 📊 Example Output

```json
{
  "name": "Linus Torvalds",
  "behavior_profile": {
    "type": "Maintainer",
    "primary": "maintainer",
    "secondary": ["team_player"],
    "traits": ["Consistent contributor", "Long-term commitment"]
  },
  "skills": ["C", "Shell", "Python", "Perl", "Makefile"],
  "top_projects": [
    {
      "name": "linux",
      "stars": 165000,
      "forks": 51000,
      "description": "Linux kernel source tree"
    }
  ]
}
```

---

## 🛠️ Troubleshooting

### ❌ "Behavior model is required"
**Cause**: Models not found

**Fix**:
```bash
# Check if models exist
dir organized_structure\models\*.pkl

# If missing, train models
python ml_model.py

# Move models to correct location
move training_outputs\*.pkl organized_structure\models\
```

### ❌ "Cannot connect to backend"
**Cause**: Backend not running

**Fix**:
```bash
python -m uvicorn backend:app --reload --port 8000
```

### ❌ "Invalid GitHub token"
**Cause**: Token expired or has wrong permissions

**Fix**:
1. Go to: https://github.com/settings/tokens
2. Generate new token with `read:user` and `repo` scopes
3. Use the new token

---

## 📁 File Locations

### Generated Portfolios
```
organized_structure/outputs/
├── generated_htmls/
│   └── portfolio_professional_USERNAME_TIMESTAMP.html
└── generated_pdfs/
    └── portfolio_minimal_USERNAME_TIMESTAMP.pdf
```

### Training Outputs (if you retrain)
```
training_outputs/
├── behavior_classifier.pkl
├── skills_classifier.pkl
├── ranking_xgboost.pkl
├── ranking_mlp.h5 (Neural Network, if TensorFlow installed)
└── *.png (visualization plots)
```

---

## 🔄 Retraining Models

If you want to retrain with new data:

```bash
# 1. Update your training data CSV files
# 2. Run training script
python ml_model.py

# 3. New models saved to training_outputs/
# 4. Replace old models
move training_outputs\*.pkl organized_structure\models\
```

---

## 🎨 Customizing Output

### Change Number of Skills
In `backend.py` or `generate_portfolio_improved.py`:
```python
skills = extract_skills(
    model_features['skills_features'],
    models.get('skills'),
    top_n=15  # Change from 10 to 15
)
```

### Change Number of Projects
```python
top_repo_indices = rank_repositories(
    repos_df_with_commits,
    model_features['ranking_features'],
    models.get('ranking'),
    top_n=10  # Change from 6 to 10
)
```

---

## 📚 Additional Documentation

- **Frontend Guide**: `docs/FRONTEND_GUIDE.md`
- **No Hardcoding Verification**: `docs/NO_HARDCODING_VERIFICATION.md`
- **Model Save Location**: `docs/MODEL_SAVE_LOCATION_UPDATE.md`
- **All Fixes**: `docs/INDEX.md`

---

## ✅ Verification

Run this checklist before generating portfolios:

- [ ] Backend running on port 8000
- [ ] Frontend accessible (open `index.html`)
- [ ] 3 model files in `organized_structure/models/`
- [ ] GitHub token ready
- [ ] Dependencies installed

---

## 🚀 You're Ready!

Your AI Portfolio Generator is **100% model-driven** with **zero hardcoded logic**.

Every insight comes from your trained ML models:
- ✅ Behavior types predicted by SVC
- ✅ Skills extracted by XGBoost
- ✅ Projects ranked by XGBoost

**No fallbacks. No hardcoding. Pure ML.**

---

*Last Updated: 2025-11-17*
*Status: ✅ Production Ready*

