# GitHub Portfolio Generator - Complete Workflow Guide

## 📋 Overview

This system generates professional portfolios from GitHub profiles using machine learning models. The complete workflow is:

1. **Fetch** GitHub data via API
2. **Process** data through ML models
3. **Generate** portfolio JSON with predictions
4. **Render** HTML and PDF outputs

## 🏗️ Architecture

```
┌─────────────────┐
│  GitHub API     │
│  (fetcher.py)   │
└────────┬────────┘
         │ Raw JSON Data
         ▼
┌─────────────────────────────────┐
│  Feature Extraction             │
│  (parse_and_extract.py)         │
│  - Extract repo features        │
│  - Extract user features        │
│  - Prepare ML feature vectors   │
└────────┬────────────────────────┘
         │ Feature DataFrames
         ▼
┌─────────────────────────────────┐
│  ML Models                      │
│  (generate_portfolio_improved)  │
│  ┌──────────────────────────┐  │
│  │ behavior_classifier.pkl  │  │
│  │ skills_classifier.pkl    │  │
│  │ ranking_xgboost.pkl      │  │
│  └──────────────────────────┘  │
│  - Predict behavior profile     │
│  - Extract skills               │
│  - Rank projects                │
└────────┬────────────────────────┘
         │ Portfolio JSON
         ▼
┌─────────────────────────────────┐
│  Rendering                      │
│  (render_pdf.py)                │
│  - Generate HTML (Jinja2)       │
│  - Generate PDF (ReportLab)     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Output Files                   │
│  - portfolio.html               │
│  - portfolio.pdf                │
└─────────────────────────────────┘
```

## 📁 Project Structure

```
Github_Mine/
├── backend.py                          # FastAPI server
├── fetcher.py                          # GitHub API client
├── requirements.txt                    # Dependencies
├── frontend/                           # Web UI
│   ├── index.html
│   ├── script.js
│   └── styles.css
└── organized_structure/
    ├── generation/                     # Portfolio generation pipeline
    │   ├── __init__.py
    │   ├── parse_and_extract.py       # Feature extraction
    │   ├── generate_portfolio_improved.py  # ML-powered generation
    │   └── render_pdf.py              # HTML/PDF rendering
    ├── models/                         # Trained ML models
    │   ├── behavior_classifier.pkl    # Behavior prediction
    │   ├── skills_classifier.pkl      # Skills extraction
    │   └── ranking_xgboost.pkl        # Project ranking
    └── outputs/                        # Generated portfolios
        ├── generated/                  # JSON files
        ├── generated_htmls/           # HTML files
        └── generated_pdfs/            # PDF files
```

## 🔄 Detailed Workflow

### Step 1: Data Fetching (`fetcher.py`)

```python
# Fetches GitHub profile data via GraphQL
data = fetch_and_shape(token, username)
# Returns: List[Dict] with user_data and repositories
```

**Output:**

```json
[{
  "user_data": {
    "login": "username",
    "name": "Full Name",
    "repositories": { "nodes": [...] },
    "contributionsCollection": { ... }
  }
}]
```

### Step 2: Feature Extraction (`parse_and_extract.py`)

```python
# Extract repository features
repos_df = extract_repo_features(repos)

# Extract user-level features
user_features = extract_user_features(contributions, repos_df, user_data)

# Prepare for ML models
model_features = prepare_features_for_models(user_features, repos_df)
```

**Key Features Extracted:**

- **Repository**: stars, forks, activity, language distribution
- **User**: commit frequency, PR activity, collaboration metrics
- **Composite**: popularity scores, engagement scores

### Step 3: ML Model Processing (`generate_portfolio_improved.py`)

#### 3.1 Load Models

```python
models = load_models()
# Loads:
# - behavior_classifier.pkl
# - skills_classifier.pkl
# - ranking_xgboost.pkl
```

#### 3.2 Behavior Classification

```python
behavior_profile = predict_behavior_profile(features, model)
# Returns: {
#   'focus': 'specialist' | 'generalist' | 'maintainer',
#   'collaboration_style': 'high' | 'moderate' | 'low',
#   'work_rhythm': 'consistent' | 'bursty' | 'sporadic',
#   'stability': 'high' | 'medium' | 'low',
#   'communication': 'high PR/issue engagement'
# }
```

#### 3.3 Skills Extraction

```python
skills = extract_skills(skills_features, model)
# Returns: ['Python', 'JavaScript', 'TypeScript', ...]
```

#### 3.4 Project Ranking

```python
top_indices = rank_repositories(repos_df, features, model)
# Returns: [3, 0, 7, 2, ...] (indices of top projects)
```

#### 3.5 Generate Portfolio JSON

```python
portfolio = generate_portfolio_improved(user_data, repos_df, user_features, commits)
```

**Portfolio Structure:**

```json
{
  "name": "Developer Name",
  "avatarUrl": "https://...",
  "headline": "Developer specializing in Python, JavaScript",
  "summary": "Full summary text...",
  "skills": ["Python", "JavaScript", ...],
  "behavior_profile": { ... },
  "top_projects": [
    {
      "name": "project-name",
      "url": "https://github.com/...",
      "description": "...",
      "tech": ["Python", "Docker"],
      "stars": 150,
      "forks": 20,
      "commits": 45,
      "highlights": ["150 stars, updated 2.3 months ago"],
      "impact": "Popular repo with 150 stars"
    }
  ],
  "total_stats": {
    "followers": 500,
    "total_stars": 1200,
    "total_commits": 3000,
    ...
  },
  "meta": {
    "github_username": "username",
    "generated_at": "2025-10-03T19:08:39",
    "model_version": "improved"
  }
}
```

### Step 4: Rendering (`render_pdf.py`)

#### 4.1 HTML Generation

```python
html_path = render_html_portfolio(portfolio_json_path, theme='professional')
```

**Features:**

- Modern gradient design
- Responsive layout
- Professional typography
- Print-friendly styles
- Multiple themes (professional, minimal)

#### 4.2 PDF Generation

```python
pdf_path = render_pdf_portfolio(portfolio_json_path, theme='minimal')
```

**Features:**

- LaTeX-inspired layout
- Compact single-page design
- ReportLab rendering
- Professional formatting
- Embedded images (avatar)

## 🚀 Running the Application

### 1. Install Dependencies

```bash
# Activate virtual environment
myenv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

### 2. Start the Backend Server

```bash
uvicorn backend:app --reload
```

Server starts at: `http://127.0.0.1:8000`

### 3. API Endpoints

#### Health Check

```
GET /api/health
Response: {"ok": true}
```

#### Fetch GitHub Data

```
POST /api/fetch
Body: {
  "token": "ghp_xxx",
  "profile_url_or_username": "username"
}
Response: Raw GitHub data
```

#### Generate Portfolio (with ML)

```
POST /api/portfolio
Body: {
  "token": "ghp_xxx",
  "profile_url_or_username": "username",
  "output_dir": "optional/path"
}
Response: {
  "success": true,
  "json_path": "path/to/portfolio.json",
  "html_path": "path/to/portfolio.html",
  "pdf_path": "path/to/portfolio.pdf",
  "portfolio": { ... }
}
```

#### Generate from Existing Data

```
POST /api/portfolio-from-data
Body: {
  "data": [{user_data: {...}}],
  "output_dir": "optional/path"
}
```

#### Download/View Files

```
GET /download?path=<file_path>
GET /view?path=<file_path>
```

### 4. Access the Frontend

Open `frontend/index.html` in your browser or serve it:

```bash
cd frontend
python -m http.server 8080
```

Then navigate to `http://localhost:8080`

## 🤖 ML Models Explained

### 1. Behavior Classifier (`behavior_classifier.pkl`)

**Purpose**: Classify developer behavior patterns

**Input Features:**

- Commits per day
- PRs per day
- Issues per day
- PR review ratio
- Collaboration score
- Activity score
- Language diversity
- Active repo ratio

**Output**: Behavior profile with focus, collaboration style, work rhythm

### 2. Skills Classifier (`skills_classifier.pkl`)

**Purpose**: Extract and rank technical skills

**Input Features:**

- Programming languages used
- Language frequency
- Repository statistics
- Language diversity

**Output**: Ranked list of skills/technologies

### 3. Ranking Model (`ranking_xgboost.pkl`)

**Purpose**: Rank repositories by importance/quality

**Input Features:**

- Stars, forks, watchers
- Activity metrics
- Age and update frequency
- Engagement scores

**Output**: Ranking scores for project selection

## 🔧 Customization

### Adding New Models

1. Train your model and save as `.pkl`:

```python
import pickle
with open('organized_structure/models/my_model.pkl', 'wb') as f:
    pickle.dump(model, f)
```

2. Load in `generate_portfolio_improved.py`:

```python
def load_models():
    with open(MODEL_DIR / 'my_model.pkl', 'rb') as f:
        models['my_model'] = pickle.load(f)
```

3. Use in portfolio generation:

```python
predictions = models['my_model'].predict(features)
```

### Customizing Output

**Modify Portfolio Structure:**
Edit `generate_portfolio_improved.py` to add/remove fields in the portfolio dictionary.

**Customize HTML Template:**
Edit `render_pdf.py` - modify the Jinja2 template string (lines 22-925).

**Customize PDF Layout:**
Edit `render_pdf.py` - modify ReportLab styles and content (lines 939-1451).

## 📊 Output Examples

### Portfolio JSON

Location: `organized_structure/outputs/generated/portfolio_username_timestamp.json`

### HTML Portfolio

Location: `organized_structure/outputs/generated_htmls/portfolio_professional_username_timestamp.html`

Features:

- Modern gradient header
- Skill tags with hover effects
- Project cards with metadata
- GitHub metrics dashboard

### PDF Portfolio

Location: `organized_structure/outputs/generated_pdfs/portfolio_minimal_username_timestamp.pdf`

Features:

- Single-page layout
- LaTeX-inspired typography
- Professional formatting
- Embedded avatar image

## 🐛 Troubleshooting

### Models Not Loading

```
⚠ Behavior model not found at ...
```

**Solution**: Ensure `.pkl` files are in `organized_structure/models/`

### Import Errors

```
ModuleNotFoundError: No module named 'parse_and_extract'
```

**Solution**:

- Ensure `__init__.py` exists in `organized_structure/generation/`
- Check Python path includes generation directory
- Verify imports in `backend.py` lines 23-31

### Feature Extraction Errors

```
KeyError: 'primaryLanguage'
```

**Solution**: Check that fetched data has complete repository information

### Rendering Errors

```
xhtml2pdf error: ...
```

**Solution**: Use ReportLab PDF generation (preferred) or check HTML validity

## 📝 Best Practices

1. **Always fetch fresh data** before generating portfolios
2. **Use improved ML pipeline** for best results
3. **Check model loading** before processing large batches
4. **Monitor output quality** and retrain models if needed
5. **Keep models updated** with new training data

## 🔗 API Documentation

When server is running, visit:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## 📦 Dependencies

**Core:**

- FastAPI - Web framework
- Uvicorn - ASGI server
- Requests - HTTP client

**Data Processing:**

- Pandas - Data manipulation
- NumPy - Numerical computing
- scikit-learn - ML utilities
- XGBoost - Gradient boosting

**Rendering:**

- Jinja2 - HTML templating
- ReportLab - PDF generation
- xhtml2pdf - HTML to PDF fallback
- Pillow - Image processing

## 🎯 Next Steps

1. **Train better models** with more diverse GitHub data
2. **Add more features** like contribution graphs, commit history analysis
3. **Enhance visualizations** with charts and graphs
4. **Deploy to cloud** for public access
5. **Add authentication** for secure API access

## 📞 Support

For issues or questions:

1. Check this workflow guide
2. Review `backend.py` for API endpoints
3. Inspect model loading in `generate_portfolio_improved.py`
4. Verify feature extraction in `parse_and_extract.py`

---

**Made with ❤️ using Machine Learning and GitHub API**
