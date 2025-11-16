# GitHub Portfolio Generator with ML Models

> 🤖 **AI-Powered Portfolio Generation**: Automatically generates professional portfolios from GitHub profiles using Machine Learning models.

## 🎯 Features

- **ML-Driven Content**: Uses trained models for behavior analysis, skills extraction, and project ranking
- **No Hardcoded Logic**: Pure model predictions - what the models learned is what you get
- **Beautiful Output**: Professional HTML and PDF portfolios with modern design
- **FastAPI Backend**: RESTful API for easy integration
- **Web Frontend**: Simple UI to generate portfolios

## 🏗️ Architecture

```
GitHub API → Feature Extraction → ML Models → Portfolio JSON → HTML/PDF
```

### ML Models

1. **Behavior Classifier** (`behavior_classifier.pkl`)
   - Predicts developer behavior patterns
   - Output: focus, collaboration_style, work_rhythm, stability, communication

2. **Skills Classifier** (`skills_classifier.pkl`)
   - Extracts and ranks technical skills
   - Output: Ranked list of programming languages/technologies

3. **Ranking XGBoost** (`ranking_xgboost.pkl`)
   - Ranks repositories by importance/quality
   - Output: Scores for project selection

## 📋 Prerequisites

- Python 3.8+
- GitHub Personal Access Token
- Trained ML models (`.pkl` files)

## 🚀 Installation

### 1. Clone/Download Repository

```bash
cd C:\Users\monir\Downloads\Github_Mine
```

### 2. Create Virtual Environment

```bash
python -m venv myenv
myenv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Add Your ML Models

Place your trained models in the models directory:

```
organized_structure/
└── models/
    ├── behavior_classifier.pkl
    ├── skills_classifier.pkl
    └── ranking_xgboost.pkl
```

## ✅ Test Your Models

Before running the server, validate your models work correctly:

```bash
python test_models.py
```

Expected output:
```
✅ Behavior model loaded successfully
✅ Skills model loaded successfully
✅ Ranking model loaded successfully
✅ All predictions working correctly
```

If tests fail, see [`MODEL_INTEGRATION.md`](MODEL_INTEGRATION.md) for model requirements.

## 🎮 Usage

### Option 1: FastAPI Backend + Frontend

#### Start the Backend Server

```bash
uvicorn backend:app --reload
```

Server starts at: `http://127.0.0.1:8000`

#### Open Frontend

Open `frontend/index.html` in your browser or serve it:

```bash
cd frontend
python -m http.server 8080
```

Navigate to: `http://localhost:8080`

#### Use the API

**Generate Portfolio:**
```bash
curl -X POST http://127.0.0.1:8000/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ghp_your_github_token",
    "profile_url_or_username": "username"
  }'
```

**Response:**
```json
{
  "success": true,
  "json_path": "path/to/portfolio.json",
  "html_path": "path/to/portfolio.html",
  "pdf_path": "path/to/portfolio.pdf",
  "portfolio": {
    "name": "Developer Name",
    "skills": ["Python", "JavaScript", ...],
    "behavior_profile": {...},
    "top_projects": [...]
  }
}
```

### Option 2: Python Script

```python
from fetcher import fetch_and_shape
from organized_structure.generation.parse_and_extract import extract_repo_features, extract_user_features
from organized_structure.generation.generate_portfolio_improved import generate_portfolio_improved
from organized_structure.generation.render_pdf import render_html_portfolio, render_pdf_portfolio
import json

# 1. Fetch data
token = "ghp_your_token"
shaped = fetch_and_shape(token, "username")

# 2. Extract features
user_data = shaped[0]['user_data']
repos = user_data['repositories']['nodes']
contributions = user_data['contributionsCollection']
commit_by_repo = contributions['commitContributionsByRepository']

repos_df = extract_repo_features(repos)
user_features = extract_user_features(contributions, repos_df, user_data)

# 3. Generate portfolio with ML models
portfolio = generate_portfolio_improved(user_data, repos_df, user_features, commit_by_repo)

# 4. Save JSON
with open('portfolio.json', 'w') as f:
    json.dump(portfolio, f, indent=2)

# 5. Render HTML & PDF
render_html_portfolio('portfolio.json', theme='professional')
render_pdf_portfolio('portfolio.json', theme='minimal')
```

## 📊 API Endpoints

### Health Check
```
GET /api/health
```

### Fetch GitHub Data
```
POST /api/fetch
Body: {
  "token": "ghp_xxx",
  "profile_url_or_username": "username"
}
```

### Generate Portfolio
```
POST /api/portfolio
Body: {
  "token": "ghp_xxx",
  "profile_url_or_username": "username",
  "output_dir": "optional/custom/path"
}
```

### Generate from Existing Data
```
POST /api/portfolio-from-data
Body: {
  "data": [{user_data: {...}}],
  "output_dir": "optional/path"
}
```

### Download/View Files
```
GET /download?path=<file_path>
GET /view?path=<file_path>
```

### Get Latest Outputs
```
GET /api/latest
```

## 📁 Project Structure

```
Github_Mine/
├── backend.py                    # FastAPI server
├── fetcher.py                    # GitHub API client
├── test_models.py                # Model validation script
├── requirements.txt              # Python dependencies
├── WORKFLOW_GUIDE.md            # Detailed workflow documentation
├── MODEL_INTEGRATION.md         # Model requirements & specs
├── README.md                    # This file
│
├── frontend/                    # Web UI
│   ├── index.html
│   ├── script.js
│   └── styles.css
│
└── organized_structure/
    ├── generation/              # Portfolio generation pipeline
    │   ├── __init__.py
    │   ├── parse_and_extract.py           # Feature extraction
    │   ├── generate_portfolio_improved.py  # ML-powered generation
    │   └── render_pdf.py                   # HTML/PDF rendering
    │
    ├── models/                  # Trained ML models
    │   ├── behavior_classifier.pkl
    │   ├── skills_classifier.pkl
    │   └── ranking_xgboost.pkl
    │
    └── outputs/                 # Generated portfolios
        ├── generated/           # JSON files
        ├── generated_htmls/     # HTML portfolios
        └── generated_pdfs/      # PDF portfolios
```

## 🔧 Configuration

### Environment Variables (Optional)

```bash
# Set custom output directory
export PORTFOLIO_OUTPUT_DIR="custom/output/path"

# Set GitHub token (if not passing in request)
export GITHUB_TOKEN="ghp_your_token"
```

### Model Configuration

To use different models, replace the `.pkl` files in `organized_structure/models/` and restart the server.

## 📖 Documentation

- **[WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)**: Complete workflow from data fetching to rendering
- **[MODEL_INTEGRATION.md](MODEL_INTEGRATION.md)**: Model requirements, input/output formats, training guide

## 🎨 Output Examples

### Portfolio JSON
```json
{
  "name": "Miguel Ángel Durán",
  "headline": "midudev - Developer specializing in HTML, JavaScript, TypeScript",
  "summary": "Miguel Ángel Durán is a generalist developer with 2,598 commits and 34,622 followers.",
  "skills": ["HTML", "JavaScript", "TypeScript"],
  "behavior_profile": {
    "focus": "generalist",
    "collaboration_style": "low",
    "work_rhythm": "bursty",
    "stability": "high",
    "communication": "low"
  },
  "top_projects": [...],
  "total_stats": {...}
}
```

### HTML Portfolio
- Modern gradient design
- Responsive layout
- Professional typography
- Print-friendly
- Interactive hover effects

### PDF Portfolio
- LaTeX-inspired layout
- Single-page compact design
- Professional formatting
- Embedded avatar image

## 🔍 Troubleshooting

### Models Not Loading

**Error:** `⚠ Behavior model not found at ...`

**Solution:**
1. Ensure `.pkl` files exist in `organized_structure/models/`
2. Check file names match exactly:
   - `behavior_classifier.pkl`
   - `skills_classifier.pkl`
   - `ranking_xgboost.pkl`
3. Verify files are valid pickle files

### Model Prediction Errors

**Error:** `❌ Error in behavior prediction: ...`

**Solution:**
1. Run `python test_models.py` to diagnose
2. Check model input format matches expected features
3. Review `MODEL_INTEGRATION.md` for model requirements
4. Retrain models if necessary

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'parse_and_extract'`

**Solution:**
1. Ensure `__init__.py` exists in `organized_structure/generation/`
2. Check Python path includes generation directory
3. Reinstall dependencies: `pip install -r requirements.txt`

### Feature Extraction Errors

**Error:** `KeyError: 'primaryLanguage'`

**Solution:**
1. Verify GitHub token has correct permissions
2. Check fetched data is complete
3. User profile may have incomplete data - this is normal

## 🚧 Model Training

To train your own models, you need labeled GitHub user data with:

1. **Behavior Labels**: Developer behavior patterns
2. **Skills Labels**: Relevant skills for each user
3. **Repository Scores**: Importance/quality ratings

See `organized_structure/training/` for training scripts (if available).

## 📈 Performance

- **Model Loading**: ~1-2 seconds on first request
- **Feature Extraction**: ~0.5 seconds per user
- **ML Predictions**: ~0.1-0.5 seconds total
- **HTML Rendering**: ~0.2 seconds
- **PDF Rendering**: ~1-2 seconds (with avatar download)

**Total**: ~3-5 seconds per portfolio generation

## 🤝 Contributing

To improve the system:

1. **Better Models**: Train with more diverse data
2. **More Features**: Add contribution graphs, commit history analysis
3. **Enhanced Visuals**: Improve HTML/PDF templates
4. **API Extensions**: Add more endpoints for customization

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- GitHub GraphQL API
- FastAPI framework
- scikit-learn & XGBoost
- ReportLab & Jinja2

---

**Questions?** See `WORKFLOW_GUIDE.md` or `MODEL_INTEGRATION.md` for detailed documentation.

**Ready to start?** Run `python test_models.py` then `uvicorn backend:app --reload`!

