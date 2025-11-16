# 🎨 Frontend User Guide

## Overview

The AI Portfolio Generator frontend provides a modern, intuitive interface for transforming GitHub profiles into professional portfolios using machine learning.

---

## 🚀 Features

### 1. **ML-Powered Analysis**
- Advanced machine learning models analyze your GitHub activity
- Extracts meaningful insights from commits, PRs, issues, and code
- No hardcoded logic - all insights are model-driven

### 2. **Behavioral Profiling**
- **Maintainer**: Actively maintains and improves existing projects
- **Innovator**: Focuses on creating new projects and novel solutions
- **Team Player**: Collaborates effectively with others
- **Learner**: Continuously acquires new skills and technologies

### 3. **Smart Project Ranking**
- XGBoost model ranks your top projects by impact and complexity
- Considers stars, forks, commits, recency, and technical metrics
- Highlights your most impressive work

### 4. **Skills Extraction**
- Multi-output regression model predicts skill proficiency
- Ranks skills by frequency, usage, and recency
- Top 10 most relevant skills displayed

---

## 🎯 How to Use

### Step 1: Get a GitHub Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `read:user`
   - `repo` (for repository data)
   - `read:org` (optional, for organization data)
4. Copy the token (starts with `ghp_`)

### Step 2: Start the Backend

```bash
# Make sure you're in the project root
cd C:\Users\monir\Downloads\Github_Mine

# Start the FastAPI backend
python -m uvicorn backend:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### Step 3: Open the Frontend

1. Navigate to the `frontend` folder
2. Open `index.html` in your browser
3. Or use a live server (recommended for best experience)

```bash
# Using Python's built-in server
cd frontend
python -m http.server 8080
```

Then open: `http://localhost:8080`

### Step 4: Generate Your Portfolio

1. **Enter your GitHub token** in the password field
2. **Enter your GitHub username** or profile URL
   - Username: `torvalds`
   - URL: `https://github.com/torvalds`
3. Click **"Generate Portfolio (HTML & PDF)"**

---

## 📊 What Happens Behind the Scenes

### Data Flow

```
Frontend Input
    ↓
Backend API (/api/portfolio)
    ↓
Fetcher (GitHub GraphQL API)
    ↓
Feature Extraction (parse_and_extract.py)
    ↓
ML Models (generate_portfolio_improved.py)
    ├── Behavior Classifier (SVC) → Behavioral Profile
    ├── Skills Regressor (XGBoost) → Top Skills
    └── Ranking Model (XGBoost) → Top Projects
    ↓
Portfolio JSON
    ↓
Renderers (render_pdf.py)
    ├── HTML (Jinja2)
    └── PDF (ReportLab)
    ↓
Downloads Ready!
```

### ML Model Details

#### 1. Behavior Classifier
- **Type**: Multi-label SVC (Support Vector Classifier)
- **Input**: 39 engineered features
- **Output**: Binary predictions for 4 behavior types
- **Location**: `organized_structure/models/behavior_classifier.pkl`

#### 2. Skills Regressor
- **Type**: Multi-output XGBoost Regressor
- **Input**: 43 features (languages + user metrics)
- **Output**: Proficiency scores for 30 skills
- **Location**: `organized_structure/models/skills_classifier.pkl`

#### 3. Ranking Model
- **Type**: XGBoost Regressor
- **Input**: Repository + user features
- **Output**: Ranking scores for projects
- **Location**: `organized_structure/models/ranking_xgboost.pkl`

---

## 🎨 Frontend Features

### Modern UI/UX

- **Dark Theme**: Easy on the eyes with gradient accents
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Fade-ins, hover effects, and transitions
- **Toast Notifications**: Real-time feedback for actions
- **Loading States**: Spinners and status messages
- **Preview Window**: See your portfolio before downloading

### Status Messages

- **Loading** (Blue): Operation in progress
- **Success** (Green): Operation completed successfully
- **Error** (Red): Something went wrong

### Download Options

Once generated, you'll see:
- **Download HTML**: Interactive web portfolio
- **Download PDF**: Printable/shareable PDF version

### Preview Controls

- **Refresh**: Reload the preview
- **Fullscreen**: Open preview in new tab

---

## 🐛 Troubleshooting

### ⚠️ "Cannot connect to backend"

**Cause**: Backend server is not running

**Solution**:
```bash
python -m uvicorn backend:app --reload --port 8000
```

### ❌ "Behavior model is required"

**Cause**: ML models not found in `organized_structure/models/`

**Solution**:
1. Check if models exist:
   ```bash
   ls organized_structure\models\*.pkl
   ```
2. If missing, train the models:
   ```bash
   python ml_model.py
   ```
3. Move models from `training_outputs/` to `organized_structure/models/`:
   ```bash
   move training_outputs\*.pkl organized_structure\models\
   ```

### ❌ "Invalid GitHub token"

**Cause**: Token is expired or has insufficient permissions

**Solution**:
1. Generate a new token with correct scopes
2. Make sure to copy the entire token (starts with `ghp_`)

### ❌ "User not found"

**Cause**: GitHub username is incorrect

**Solution**:
- Verify the username exists: `https://github.com/USERNAME`
- Try using the full URL instead of just the username

### ⚠️ "No skills predicted"

**Cause**: User has no repository language data

**Solution**:
- This is expected for users with no public repositories
- Ensure the GitHub account has public repos with code

### 🐌 "Generation is slow"

**Cause**: Large amount of GitHub data to process

**Expected Time**:
- Small profiles (<10 repos): 5-10 seconds
- Medium profiles (10-50 repos): 10-30 seconds  
- Large profiles (50+ repos): 30-60 seconds

---

## 💡 Tips for Best Results

### GitHub Profile Optimization

1. **Public Repositories**: Ensure your best work is public
2. **Repository Descriptions**: Add clear descriptions to repos
3. **Primary Languages**: Set correct languages for each repo
4. **Commit Activity**: Regular commits show consistency
5. **Collaboration**: PRs and code reviews boost team player score

### Token Security

- ⚠️ **Never share your GitHub token**
- 🔒 Token is stored in browser `localStorage` (local only)
- 🔄 Revoke tokens you're not using
- ⏰ Set expiration dates for tokens

### Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 not supported

---

## 📁 File Structure

```
frontend/
├── index.html       # Main HTML structure
├── styles.css       # Modern CSS styling
└── script.js        # Frontend logic & API calls

organized_structure/
├── models/          # ML models (*.pkl files)
│   ├── behavior_classifier.pkl
│   ├── skills_classifier.pkl
│   └── ranking_xgboost.pkl
└── generation/      # Backend processing
    ├── generate_portfolio_improved.py
    ├── parse_and_extract.py
    ├── render_pdf.py
    └── label_mappings.py

backend.py           # FastAPI server
fetcher.py           # GitHub data fetcher
```

---

## 🔧 Customization

### Changing API Endpoint

If your backend is running on a different port/host:

```javascript
// In browser console:
localStorage.setItem("api_base", "http://localhost:5000");
```

Or edit `script.js`:
```javascript
const API = "http://your-server:port";
```

### Styling

Edit `frontend/styles.css` to customize:
- Colors: `:root` CSS variables
- Fonts: Font family imports
- Spacing: Padding/margin values
- Animations: Keyframes and transitions

---

## 📊 Output Formats

### HTML Portfolio

- **Interactive**: Hover effects, smooth scrolling
- **Responsive**: Adapts to screen size
- **Modern Design**: Gradient backgrounds, clean layout
- **Print-Friendly**: Special print styles

### PDF Portfolio

- **Professional**: LaTeX-inspired typography
- **Compact**: Optimized for single-page layout
- **Shareable**: Perfect for applications and resumes
- **High-Quality**: ReportLab rendering

---

## 🎓 Learning Resources

### Understanding the ML Models

- **Feature Engineering**: See `parse_and_extract.py`
- **Model Training**: See `ml_model.py` and `docs/TRAINING_RESULTS_SUMMARY.md`
- **Label Mappings**: See `organized_structure/models/label_mappings.py`

### API Documentation

FastAPI auto-generates docs:
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

### GitHub API

- [GraphQL API Explorer](https://docs.github.com/en/graphql/overview/explorer)
- [Creating Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

## 🚀 Next Steps

1. ✅ **Generate your portfolio**
2. 📤 **Share your HTML portfolio** (host on GitHub Pages, Netlify, etc.)
3. 📄 **Use PDF for applications** (attach to job applications, LinkedIn)
4. 🎨 **Customize the design** (edit CSS to match your brand)
5. 🔄 **Regenerate periodically** (as you add more projects and skills)

---

## 💬 Support

If you encounter issues:

1. **Check the Console**: Browser DevTools (F12) → Console tab
2. **Check Backend Logs**: Terminal running `uvicorn`
3. **Verify Models**: Ensure all 3 `.pkl` files exist
4. **GitHub Status**: Check if GitHub API is operational
5. **Create an Issue**: Document the error with screenshots

---

## ✨ Credits

Built with:
- **FastAPI** - Modern web framework
- **XGBoost** - Gradient boosting library
- **Scikit-learn** - Machine learning toolkit
- **Jinja2** - Template engine
- **ReportLab** - PDF generation
- **Inter Font** - Typography
- **Fira Code** - Monospace font

---

*Last Updated: 2025-11-17*
*Version: 2.0 - ML-Powered Edition*

