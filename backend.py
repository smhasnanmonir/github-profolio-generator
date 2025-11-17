from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fetcher import fetch_and_shape
from organized_structure.generation.render_pdf import (
    render_html_portfolio,
    render_pdf_portfolio,
)
from pathlib import Path
import json
from datetime import datetime
from xhtml2pdf import pisa
from fastapi.responses import FileResponse, Response
from urllib.parse import unquote
import os
import sys
import shutil
import base64
import requests

ROOT = Path(__file__).parent
# Ensure we can import improved generator and extraction utilities
GEN_DIR = ROOT / "organized_structure" / "generation"
CORE_DIR = ROOT / "organized_structure" / "core_files"
for p in (GEN_DIR, CORE_DIR):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

# Import the improved ML pipeline (MANDATORY)
from generate_portfolio_improved import generate_portfolio_improved  # noqa: E402
from parse_and_extract import extract_repo_features, extract_user_features  # noqa: E402

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/latest")
def latest_outputs():
    try:
        root = Path("organized_structure/outputs")
        html_dir = root / "generated_htmls"
        pdf_dir = root / "generated_pdfs"

        def newest_file(p: Path) -> str | None:
            if not p.exists():
                return None
            files = [f for f in p.iterdir() if f.is_file()]
            if not files:
                return None
            files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
            return str(files[0])

        latest_html = newest_file(html_dir)
        latest_pdf = newest_file(pdf_dir)
        return {"html_path": latest_html, "pdf_path": latest_pdf}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class FetchRequest(BaseModel):
    token: str
    profile_url_or_username: str


@app.post("/api/fetch")
def fetch(req: FetchRequest):
    try:
        data = fetch_and_shape(req.token, req.profile_url_or_username)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class PortfolioRequest(BaseModel):
    token: str
    profile_url_or_username: str
    output_dir: str | None = None


def _download_file(url: str, target_dir: Path, filename: str | None = None) -> Path | None:
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200 and r.content:
            suffix = ""
            ct = r.headers.get("Content-Type", "application/octet-stream")
            if "/" in ct:
                ext = ct.split("/")[-1].split(";")[0]
                if ext and len(ext) < 10:
                    suffix = "." + ext
            target_dir.mkdir(parents=True, exist_ok=True)
            name = filename or ("asset_" + datetime.now().strftime("%H%M%S"))
            out = target_dir / f"{name}{suffix}"
            with open(out, "wb") as f:
                f.write(r.content)
            return out
    except Exception:
        return None
    return None


def build_pdf_safe_html(portfolio: dict, assets_dir: Path) -> str:
    """Create a minimal, xhtml2pdf-friendly HTML string from portfolio data."""
    name = portfolio.get("name", "")
    headline = portfolio.get("headline", "")
    summary = portfolio.get("summary", "")
    avatar_url = portfolio.get("avatarUrl")
    avatar_path = None
    if avatar_url and avatar_url.startswith("http"):
        local = _download_file(avatar_url, assets_dir, filename="avatar")
        if local and local.exists():
            avatar_path = local.as_posix()

    def esc(s: str | None) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    skills_li = "".join(f"<li>{esc(s)}</li>" for s in portfolio.get("skills", [])[:10])
    projects_rows = ""
    for p in portfolio.get("top_projects", [])[:6]:
        tech = ", ".join(p.get("tech", []) or [])
        projects_rows += (
            f"<tr><td><b>{esc(p.get('name',''))}</b></td>"
            f"<td>{esc(p.get('description',''))}</td>"
            f"<td>{esc(tech)}</td>"
            f"<td>{int(p.get('stars') or 0)}</td></tr>"
        )
    stats = portfolio.get("total_stats", {})

    html = (
        "<!DOCTYPE html><html><head><meta charset='utf-8'>"
        "<title>Portfolio</title>"
        "<style>body{font-family:Helvetica,Arial,sans-serif;font-size:12px}"
        ".wrap{width:100%;max-width:720px;margin:0 auto}"
        ".sec{margin:12px 0} table{width:100%;border-collapse:collapse}"
        "td,th{border:1px solid #999;padding:6px;text-align:left} img{border:1px solid #999}"
        "ul{margin:6px 0 0 18px;padding:0}</style></head><body><div class='wrap'>"
        f"{f'<img src=\'{avatar_path}\' alt=\'avatar\' width=\'96\' height=\'96\'/>' if avatar_path else ''}"
        f"<h2>{esc(name)}</h2><div>{esc(headline)}</div>"
        f"<div class='sec'><b>Summary</b><div>{esc(summary)}</div></div>"
        f"<div class='sec'><b>Skills</b><ul>{skills_li}</ul></div>"
        f"<div class='sec'><b>Top Projects</b><table><tr><th>Name</th><th>Description</th><th>Tech</th><th>Stars</th></tr>{projects_rows}</table></div>"
        f"<div class='sec'><b>Stats</b><div>Followers: {int(stats.get('followers',0))} • Stars: {int(stats.get('total_stars',0))} • Commits: {int(stats.get('total_commits',0))}</div></div>"
        "</div></body></html>"
    )
    return html


def html_to_pdf_simple(portfolio: dict, pdf_path: Path) -> bool:
    try:
        base_dir = pdf_path.parent
        html_content = build_pdf_safe_html(portfolio, base_dir)

        def link_callback(uri, rel):
            if uri.startswith("file://"):
                return uri[7:]
            if uri.startswith("/") or ":\\" in uri or ":/" in uri:
                return uri
            return str((base_dir / uri).resolve())

        with open(pdf_path, "wb") as pdf_file:
            result = pisa.CreatePDF(src=html_content, dest=pdf_file, encoding="utf-8", link_callback=link_callback)
        return not result.err
    except Exception:
        return False


def render_html_fallback(portfolio: dict, output_root: Path, username: str, timestamp: str) -> Path:
    html_dir = output_root / "html"
    html_dir.mkdir(parents=True, exist_ok=True)
    html_path = html_dir / f"portfolio_{username}_{timestamp}.html"
    # Minimal HTML without jinja2
    skills = "".join(f"<li>{s}</li>" for s in portfolio.get("skills", []))
    projects_html = ""
    for p in portfolio.get("top_projects", []):
        techs = ", ".join(p.get("tech", []) or [])
        projects_html += f"<div><h3>{p.get('name','')}</h3><p>{p.get('description','')}</p><p>Tech: {techs}</p><p>Stars: {p.get('stars',0)}</p></div>"
    stats = portfolio.get("total_stats", {})
    avatar = portfolio.get("avatarUrl") or ""
    html = f"""
<!DOCTYPE html><html><head><meta charset='utf-8'><title>{portfolio.get('name','Portfolio')}</title>
<style>body{{font-family:Arial,Helvetica,sans-serif;margin:24px}} h1{{margin-bottom:6px}} .sec{{margin-top:24px}} .avatar{{width:100px;height:100px;border-radius:50%;object-fit:cover;border:2px solid #ccc;display:block;margin-bottom:12px}}</style>
</head><body>
{f"<img class='avatar' src='{avatar}' alt='avatar' />" if avatar else ""}
<h1>{portfolio.get('name','')}</h1>
<div>{portfolio.get('headline','')}</div>
<div class='sec'><strong>Summary</strong><p>{portfolio.get('summary','')}</p></div>
<div class='sec'><strong>Skills</strong><ul>{skills}</ul></div>
<div class='sec'><strong>Top Projects</strong>{projects_html}</div>
<div class='sec'><strong>Stats</strong><p>Followers: {stats.get('followers',0)} • Stars: {stats.get('total_stars',0)} • Commits: {stats.get('total_commits',0)}</p></div>
</body></html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    return html_path


@app.post("/api/portfolio")
def create_portfolio(req: PortfolioRequest):
    try:
        shaped = fetch_and_shape(req.token, req.profile_url_or_username)

        # Prepare output directories
        root = Path(req.output_dir) if req.output_dir else Path("organized_structure/outputs")
        generated = root / "generated"
        generated.mkdir(parents=True, exist_ok=True)

        # Save shaped input and create portfolio JSON via model runner
        username = shaped[0].get("user_data", {}).get("login") or shaped[0].get("username") or "unknown"
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        input_json = generated / f"input_{username}_{timestamp}.json"
        with open(input_json, "w", encoding="utf-8") as f:
            json.dump(shaped, f, indent=2, ensure_ascii=False)

        # Build portfolio JSON using improved ML models (required)
        user_data = shaped[0].get("user_data") or {}
        repos = (user_data.get("repositories") or {}).get("nodes", [])
        contributions = user_data.get("contributionsCollection") or {}
        commit_by_repo = contributions.get("commitContributionsByRepository") or []
        repos_df = extract_repo_features(repos)
        user_features = extract_user_features(contributions, repos_df, user_data)
        portfolio = generate_portfolio_improved(user_data, repos_df, user_features, commit_by_repo)
        portfolio_json = generated / f"portfolio_{username}_{timestamp}.json"
        with open(portfolio_json, "w", encoding="utf-8") as f:
            json.dump(portfolio, f, indent=2, ensure_ascii=False)

        # Render HTML and PDF using render_pdf utilities
        html_rendered = render_html_portfolio(str(portfolio_json), theme='professional')
        pdf_rendered = render_pdf_portfolio(str(portfolio_json), theme='minimal')

        html_path = Path(html_rendered) if html_rendered else None
        pdf_path = None
        if not html_path or not html_path.exists():
            # Fallback: render simple HTML without jinja2
            html_path = render_html_fallback(portfolio, generated, username, timestamp)

        # Ensure final destinations
        html_final_dir = root / "generated_htmls"
        html_final_dir.mkdir(parents=True, exist_ok=True)
        html_final = html_final_dir / html_path.name if html_path else None
        if html_path and html_path.exists():
            try:
                shutil.copyfile(html_path, html_final)
            except Exception:
                html_final = html_path

        pdf_dir = root / "generated_pdfs"
        pdf_dir.mkdir(parents=True, exist_ok=True)
        # Prefer the ReportLab PDF produced by render_pdf_portfolio if available
        if pdf_rendered and Path(pdf_rendered).exists():
            pdf_src = Path(pdf_rendered)
            pdf_path = pdf_dir / pdf_src.name
            try:
                shutil.copyfile(pdf_src, pdf_path)
            except Exception:
                pdf_path = None
        else:
            # Fallback to simple HTML-to-PDF
            if html_final and html_final.exists():
                pdf_path = pdf_dir / (html_final.stem + ".pdf")
                ok = html_to_pdf_simple(portfolio, pdf_path)
                if not ok:
                    pdf_path = None

        # Extract repositories for frontend "Add from GitHub" feature
        repositories = []
        if repos:
            for repo in repos:
                repositories.append({
                    "name": repo.get("name", ""),
                    "description": repo.get("description") or "",
                    "url": repo.get("url", ""),
                    "stargazers": {"totalCount": repo.get("stargazers", {}).get("totalCount", 0)} if isinstance(repo.get("stargazers"), dict) else 0,
                    "stargazer_count": repo.get("stargazers", {}).get("totalCount", 0) if isinstance(repo.get("stargazers"), dict) else repo.get("stargazers", 0),
                    "forkCount": repo.get("forkCount", 0),
                    "forks_count": repo.get("forkCount", 0),
                    "watchers": {"totalCount": repo.get("watchers", {}).get("totalCount", 0)} if isinstance(repo.get("watchers"), dict) else 0,
                    "watchers_count": repo.get("watchers", {}).get("totalCount", 0) if isinstance(repo.get("watchers"), dict) else repo.get("watchers", 0),
                    "primaryLanguage": repo.get("primaryLanguage"),
                    "language": repo.get("primaryLanguage", {}).get("name") if isinstance(repo.get("primaryLanguage"), dict) else repo.get("primaryLanguage"),
                    "updatedAt": repo.get("updatedAt", ""),
                    "updated_at": repo.get("updatedAt", ""),
                })

        return {
            "success": True,
            "input_json": str(input_json),
            "json_path": str(portfolio_json),
            "html_path": str(html_final) if html_final else None,
            "summary_path": None,
            "pdf_path": str(pdf_path) if pdf_path else None,
            "portfolio": portfolio,
            "repositories": repositories,
            "user": user_data,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/download")
def download_file(path: str):
    try:
        decoded = Path(unquote(path))
        if not decoded.exists() or not decoded.is_file():
            raise HTTPException(status_code=404, detail="File not found")
        media_type = "application/pdf" if decoded.suffix.lower() == ".pdf" else "text/html"
        return FileResponse(path=str(decoded), filename=decoded.name, media_type=media_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class PortfolioFromDataRequest(BaseModel):
    data: list[dict]
    output_dir: str | None = None


@app.post("/api/portfolio-from-data")
def create_portfolio_from_data(req: PortfolioFromDataRequest):
    try:
        shaped = req.data
        if not isinstance(shaped, list) or not shaped:
            raise HTTPException(status_code=400, detail="data must be a non-empty array")

        # Prepare output directories
        root = Path(req.output_dir) if req.output_dir else Path("organized_structure/outputs")
        generated = root / "generated"
        generated.mkdir(parents=True, exist_ok=True)

        username = shaped[0].get("user_data", {}).get("login") or shaped[0].get("username") or "unknown"
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        input_json = generated / f"input_{username}_{timestamp}.json"
        with open(input_json, "w", encoding="utf-8") as f:
            json.dump(shaped, f, indent=2, ensure_ascii=False)

        # Build portfolio JSON using improved ML models (required)
        user_data = shaped[0].get("user_data") or {}
        repos = (user_data.get("repositories") or {}).get("nodes", [])
        contributions = user_data.get("contributionsCollection") or {}
        commit_by_repo = contributions.get("commitContributionsByRepository") or []
        repos_df = extract_repo_features(repos)
        user_features = extract_user_features(contributions, repos_df, user_data)
        portfolio = generate_portfolio_improved(user_data, repos_df, user_features, commit_by_repo)
        portfolio_json = generated / f"portfolio_{username}_{timestamp}.json"
        with open(portfolio_json, "w", encoding="utf-8") as f:
            json.dump(portfolio, f, indent=2, ensure_ascii=False)

        # Render with render_pdf
        html_rendered = render_html_portfolio(str(portfolio_json), theme='professional')
        pdf_rendered = render_pdf_portfolio(str(portfolio_json), theme='minimal')

        html_path = Path(html_rendered) if html_rendered else None
        pdf_path = None
        if not html_path or not html_path.exists():
            html_path = render_html_fallback(portfolio, generated, username, timestamp)

        html_final_dir = root / "generated_htmls"
        html_final_dir.mkdir(parents=True, exist_ok=True)
        html_final = html_final_dir / html_path.name if html_path else None
        if html_path and html_path.exists():
            try:
                shutil.copyfile(html_path, html_final)
            except Exception:
                html_final = html_path

        pdf_dir = root / "generated_pdfs"
        pdf_dir.mkdir(parents=True, exist_ok=True)
        if pdf_rendered and Path(pdf_rendered).exists():
            pdf_src = Path(pdf_rendered)
            pdf_path = pdf_dir / pdf_src.name
            try:
                shutil.copyfile(pdf_src, pdf_path)
            except Exception:
                pdf_path = None
        else:
            if html_final and html_final.exists():
                pdf_path = pdf_dir / (html_final.stem + ".pdf")
                ok = html_to_pdf_simple(portfolio, pdf_path)
                if not ok:
                    pdf_path = None

        return {
            "success": True,
            "input_json": str(input_json),
            "json_path": str(portfolio_json),
            "html_path": str(html_final) if html_final else None,
            "summary_path": None,
            "pdf_path": str(pdf_path) if pdf_path else None,
            "portfolio": portfolio,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/view")
def view_file(path: str):
    try:
        decoded = Path(unquote(path))
        if not decoded.exists() or not decoded.is_file():
            raise HTTPException(status_code=404, detail="File not found")
        media_type = "application/pdf" if decoded.suffix.lower() == ".pdf" else "text/html"
        with open(decoded, "rb") as f:
            content = f.read()
        return Response(content=content, media_type=media_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


