# 📦 Requirements Guide

## Available Requirements Files

### 1. `requirements.txt` (Backend Only)
**Use for:** Running the FastAPI backend server and portfolio generation

```bash
pip install -r requirements.txt
```

**Includes:**
- FastAPI + Uvicorn (API server)
- Requests (HTTP client)
- Pandas, NumPy (data processing)
- Scikit-learn, XGBoost, Joblib (ML inference)
- Jinja2, ReportLab (PDF generation)

**When to use:**
- ✅ Running `python backend.py`
- ✅ Generating portfolios from existing models
- ✅ Production deployment

---

### 2. `requirements-training.txt` (Training Only)
**Use for:** Training ML models (running `ml_model.py`)

```bash
pip install -r requirements-training.txt
```

**Includes:**
- NumPy, Pandas (data processing)
- Scikit-learn==1.5.2 (ML framework)
- XGBoost==2.1.1 (gradient boosting)
- Scipy (statistical functions)
- Matplotlib, Seaborn (plotting)
- Tqdm (progress bars)
- Openpyxl (Excel support)

**When to use:**
- ✅ Running `python ml_model.py`
- ✅ Retraining models with new data
- ✅ Experimenting with model parameters

**Just Installed:** ✅ All training requirements are now installed!

---

### 3. `requirements-full.txt` (Both Backend + Training)
**Use for:** Full development environment

```bash
pip install -r requirements-full.txt
```

**Includes:** Everything from both requirements.txt and requirements-training.txt

**When to use:**
- ✅ Setting up a complete dev environment
- ✅ Need both API and training capabilities
- ✅ Working on entire pipeline

---

## 🚀 Quick Start

### For Backend Development (Portfolio Generation)
```bash
# Install backend requirements
pip install -r requirements.txt

# Run the API
python backend.py
```

### For ML Model Training
```bash
# Install training requirements (DONE! ✅)
pip install -r requirements-training.txt

# Train models
python ml_model.py
```

### For Full Setup
```bash
# Install everything
pip install -r requirements-full.txt
```

---

## 📋 Package Versions Summary

| Package | Backend | Training | Purpose |
|---------|---------|----------|---------|
| **FastAPI** | ✅ | ❌ | API framework |
| **Uvicorn** | ✅ | ❌ | ASGI server |
| **Scikit-learn** | 1.5.2 | 1.5.2 | ML framework (same version!) |
| **XGBoost** | ≥1.7.0 | 2.1.1 | Gradient boosting |
| **Pandas** | ≥1.5.0 | ≥1.5.0 | Data manipulation |
| **NumPy** | ≥1.24.0 | ≥1.24.0 | Numerical computing |
| **Matplotlib** | ❌ | ✅ | Plotting |
| **Seaborn** | ❌ | ✅ | Statistical visualization |
| **ReportLab** | ✅ | ❌ | PDF generation |

---

## ⚠️ Important Notes

### Scikit-learn Version
**Both environments use 1.5.2** to ensure model compatibility!
- Models trained with 1.5.2 can be loaded with 1.5.2
- Prevents `InconsistentVersionWarning`
- Ensures `ColumnTransformer` compatibility

### XGBoost Version
- **Training**: 2.1.1 (latest stable for training)
- **Backend**: ≥1.7.0 (flexible for inference)
- Models are forward-compatible

### Virtual Environment Recommended
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install requirements
pip install -r requirements-training.txt  # or requirements-full.txt
```

---

## 🐛 Troubleshooting

### Issue: `!pip` command in ml_model.py fails
**Fixed!** ✅ Changed line 852 from:
```python
!pip -q install xgboost==2.1.1 scikit-learn==1.5.2
```

To:
```python
# pip install xgboost==2.1.1 scikit-learn==1.5.2 (install via requirements-training.txt)
```

**Solution:** Use `pip install -r requirements-training.txt` instead

---

### Issue: Import errors when running ml_model.py
**Check:**
1. Virtual environment activated?
2. Installed training requirements?
```bash
pip install -r requirements-training.txt
```

---

### Issue: Model loading fails with version mismatch
**Solution:** Ensure same scikit-learn version for training and inference:
```bash
# Check version
python -c "import sklearn; print(sklearn.__version__)"

# Should output: 1.5.2
```

---

## 🎯 Current Status

✅ **requirements.txt** - Backend requirements (already existed)  
✅ **requirements-training.txt** - Training requirements (created & installed)  
✅ **requirements-full.txt** - Combined requirements (created)  
✅ **All packages installed** - Ready to train models!

---

## 📝 Next Steps

Now that all packages are installed, you can:

1. **Train Models:**
```bash
python ml_model.py
```

2. **Or run individual training scripts:**
```bash
python collect_training_data.py  # Collect data
python retrain_ranking_model.py  # Train ranking
python retrain_skills_model.py   # Train skills
```

3. **Then run backend:**
```bash
python backend.py
```

---

## 🔄 Updating Requirements

When adding new dependencies:

**For backend:**
```bash
echo "new-package>=1.0.0" >> requirements.txt
pip install -r requirements.txt
```

**For training:**
```bash
echo "new-package>=1.0.0" >> requirements-training.txt
pip install -r requirements-training.txt
```

**Update full requirements:**
```bash
# Manually merge both files into requirements-full.txt
```

---

## 💡 Pro Tips

1. **Use virtual environments** to avoid conflicts
2. **Pin versions** for reproducible builds
3. **Keep requirements files in sync** with actual usage
4. **Test in clean environment** before production
5. **Document version constraints** for troubleshooting

---

**Ready to train! 🚀**

