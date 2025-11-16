from jinja2 import Template
import json
import os
import requests
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, gray, white
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER, TA_JUSTIFY

def render_html_portfolio(portfolio_json_path, theme='professional'):
    """Render portfolio to professional HTML with clean, corporate design."""
    with open(portfolio_json_path, 'r') as f:
        portfolio = json.load(f)

    # Create folders if they don't exist
    html_dir = 'generated_htmls'
    os.makedirs(html_dir, exist_ok=True)

    html_template = Template("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ portfolio.name }} - Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style type="text/css">
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-color: {% if theme == 'professional' %}#0f172a{% else %}#1e293b{% endif %};
            --secondary-color: {% if theme == 'professional' %}#1e40af{% else %}#475569{% endif %};
            --accent-color: {% if theme == 'professional' %}#3b82f6{% else %}#64748b{% endif %};
            --accent-gradient: {% if theme == 'professional' %}linear-gradient(135deg, #667eea 0%, #764ba2 100%){% else %}linear-gradient(135deg, #667eea 0%, #764ba2 100%){% endif %};
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-light: #64748b;
            --background-primary: #ffffff;
            --background-secondary: #f8fafc;
            --background-tertiary: #f1f5f9;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            color: var(--text-primary);
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            background-attachment: fixed;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: var(--background-primary);
            min-height: 100vh;
            box-shadow: var(--shadow-xl);
            border-radius: 0;
        }

        .header {
            background: var(--accent-gradient);
            color: white;
            padding: 3rem 2rem;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .header-content {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 2.5rem;
            align-items: center;
            max-width: 100%;
            position: relative;
            z-index: 1;
        }

        .profile-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 4px solid rgba(255, 255, 255, 0.3);
            object-fit: cover;
            box-shadow: var(--shadow-xl);
            transition: transform 0.3s ease;
        }

        .profile-avatar:hover {
            transform: scale(1.05);
        }

        .profile-avatar-placeholder {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 4px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            font-weight: 700;
            color: white;
            box-shadow: var(--shadow-xl);
        }

        .profile-info h1 {
            font-size: 2.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .profile-info .headline {
            font-size: 1.25rem;
            opacity: 0.95;
            margin-bottom: 1.25rem;
            font-weight: 400;
            letter-spacing: -0.01em;
        }

        .contact-info {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.95rem;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }

        .contact-item:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .contact-item a {
            color: white;
            text-decoration: none;
            font-weight: 500;
        }

        .contact-item a:hover {
            text-decoration: underline;
        }

        .main-content {
            padding: 3rem 2.5rem;
        }

        .section {
            margin-bottom: 3.5rem;
        }

        .section-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 3px solid var(--accent-color);
            letter-spacing: -0.02em;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 60px;
            height: 3px;
            background: var(--accent-gradient);
            border-radius: 2px;
        }

        .summary {
            font-size: 1.05rem;
            line-height: 1.8;
            color: var(--text-secondary);
            padding: 2rem;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-left: 5px solid var(--accent-color);
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            position: relative;
            z-index: 1;
        }

        .summary::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
            border-radius: 12px;
            pointer-events: none;
            z-index: 0;
        }

        .skills-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 1rem;
        }

        .skill-item {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid var(--border-color);
            padding: 1rem 1.25rem;
            text-align: center;
            font-weight: 600;
            color: var(--text-primary);
            border-radius: 12px;
            transition: all 0.3s ease;
            box-shadow: var(--shadow-sm);
            font-size: 0.95rem;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }

        .skill-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: var(--accent-gradient);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: -1;
        }

        .skill-item:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--accent-color);
            color: white;
        }

        .skill-item:hover::before {
            left: 0;
            opacity: 1;
        }

        .behavior-profile {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid var(--border-color);
            border-radius: 16px;
            box-shadow: var(--shadow-md);
            overflow: hidden;
        }

        .behavior-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 0;
        }

        .behavior-item {
            padding: 1.5rem;
            border-right: 1px solid var(--border-light);
            border-bottom: 1px solid var(--border-light);
            transition: all 0.3s ease;
            background: white;
        }

        .behavior-item:hover {
            background: var(--background-tertiary);
            transform: scale(1.02);
            z-index: 1;
            position: relative;
        }

        .behavior-item:last-child,
        .behavior-item:nth-child(even) {
            border-right: none;
        }

        .behavior-item:nth-last-child(-n+2) {
            border-bottom: none;
        }

        .behavior-label {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--accent-color);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }

        .behavior-value {
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .projects-container {
            display: grid;
            gap: 2rem;
        }

        .project-card {
            border: 2px solid var(--border-color);
            border-radius: 16px;
            overflow: hidden;
            background-color: var(--background-primary);
            box-shadow: var(--shadow-md);
            transition: all 0.3s ease;
            position: relative;
        }

        .project-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-xl);
            border-color: var(--accent-color);
        }

        .project-header {
            background: var(--accent-gradient);
            color: white;
            padding: 1.5rem 2rem;
            position: relative;
            overflow: hidden;
        }

        .project-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dots" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="60" height="60" fill="url(%23dots)"/></svg>');
            opacity: 0.3;
        }

        .project-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
            letter-spacing: -0.01em;
        }

        .project-subtitle {
            font-size: 0.85rem;
            opacity: 0.9;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }

        .project-highlight {
            font-size: 0.95rem;
            opacity: 0.95;
            margin-top: 0.75rem;
            position: relative;
            z-index: 1;
            font-weight: 500;
        }

        .project-content {
            padding: 2rem;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }

        .project-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .meta-item {
            display: flex;
            flex-direction: column;
        }

        .meta-label {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-light);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.25rem;
        }

        .meta-value {
            font-size: 0.9rem;
            color: var(--text-primary);
        }

        .meta-value a {
            color: var(--accent-color);
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            border-bottom: 2px solid transparent;
        }

        .meta-value a:hover {
            color: var(--secondary-color);
            border-bottom-color: var(--accent-color);
        }

        .tech-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .tech-item {
            background: linear-gradient(135deg, var(--accent-color) 0%, var(--secondary-color) 100%);
            color: white;
            border: none;
            padding: 0.4rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            box-shadow: var(--shadow-sm);
            transition: all 0.3s ease;
        }

        .tech-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .project-details {
            border-top: 2px solid var(--border-light);
            padding-top: 1.5rem;
            margin-top: 1.5rem;
        }

        .detail-row {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 1.25rem;
            margin-bottom: 1rem;
            align-items: start;
            padding: 0.75rem;
            border-radius: 8px;
            transition: background 0.3s ease;
        }

        .detail-row:hover {
            background: var(--background-tertiary);
        }

        .detail-label {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--accent-color);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .detail-value {
            font-size: 0.95rem;
            color: var(--text-primary);
            line-height: 1.6;
            font-weight: 500;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 1.25rem;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 2rem;
            border: 2px solid var(--border-color);
            border-radius: 16px;
            box-shadow: var(--shadow-md);
        }

        .stat-item {
            text-align: center;
            padding: 1.5rem;
            background: white;
            border: 2px solid var(--border-light);
            border-radius: 12px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--accent-gradient);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .stat-item:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--accent-color);
        }

        .stat-item:hover::before {
            transform: scaleX(1);
        }

        .stat-number {
            font-size: 2.25rem;
            font-weight: 700;
            background: var(--accent-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
            display: block;
            letter-spacing: -0.02em;
        }

        .stat-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .footer {
            background: var(--accent-gradient);
            color: white;
            text-align: center;
            padding: 2rem;
            font-size: 0.9rem;
            opacity: 0.95;
            font-weight: 500;
            position: relative;
            overflow: hidden;
        }

        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="footer-grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23footer-grid)"/></svg>');
            opacity: 0.3;
        }

        .footer {
            position: relative;
            z-index: 1;
        }

        @media (max-width: 768px) {
            .header-content {
                grid-template-columns: 1fr;
                text-align: center;
                gap: 1rem;
            }

            .contact-info {
                justify-content: center;
                gap: 1rem;
            }

            .main-content {
                padding: 1.5rem;
            }

            .project-meta {
                grid-template-columns: 1fr;
            }

            .detail-row {
                grid-template-columns: 1fr;
                gap: 0.25rem;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media print {
            body {
                background-color: white !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .container {
                box-shadow: none !important;
                background-color: white !important;
            }

            .header {
                background-color: var(--primary-color) !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            /* Ensure all elements are visible in print */
            * {
                visibility: visible !important;
                display: block !important;
                position: static !important;
            }

            /* Hide any stray CSS content that might appear */
            style {
                display: none !important;
            }

            /* Prevent CSS from being rendered as text */
            head, title, meta, link, script {
                display: none !important;
            }

            /* Better page breaks for PDF */
            .section {
                page-break-inside: avoid;
            }

            .project-card {
                page-break-inside: avoid;
                margin-bottom: 1rem;
            }

            .skills-container {
                display: flex !important;
                flex-wrap: wrap !important;
                justify-content: space-between !important;
            }

            .skill-item {
                flex: 0 0 30% !important;
                margin: 0.25rem !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <header class="header">
            <div class="header-content">
                <div class="profile-image">
                    {% if portfolio.avatarUrl %}
                    <img src="{{ portfolio.avatarUrl }}" alt="{{ portfolio.name }}" class="profile-avatar">
                    {% else %}
                    <div class="profile-avatar-placeholder">
                        {{ portfolio.name[0] if portfolio.name else 'N/A' }}
                    </div>
                    {% endif %}
                </div>

                <div class="profile-info">
                    <h1>{{ portfolio.name if portfolio.name else 'Portfolio' }}</h1>
                    <div class="headline">{{ portfolio.headline if portfolio.headline else '' }}</div>

                    <div class="contact-info">
                        {% if portfolio.location %}
                        <div class="contact-item">
                            <span></span>
                            <span>{{ portfolio.location }}</span>
                        </div>
                        {% endif %}

                        {% if portfolio.websiteUrl %}
                        <div class="contact-item">
                            <span></span>
                            <a href="{{ portfolio.websiteUrl }}" target="_blank">{{ portfolio.websiteUrl.replace('https://', '').replace('http://', '') }}</a>
                        </div>
                        {% endif %}

                        {% if portfolio.meta and portfolio.meta.github_username %}
                        <div class="contact-item">
                            <span></span>
                            <a href="https://github.com/{{ portfolio.meta.github_username }}" target="_blank">github.com/{{ portfolio.meta.github_username }}</a>
                        </div>
                        {% endif %}
                    </div>
                </div>
            </div>
        </header>

        <main class="main-content">
            <!-- Summary Section -->
            {% if portfolio.summary %}
            <section class="section">
                <h2 class="section-title">Professional Summary</h2>
                <div class="summary">{{ portfolio.summary }}</div>
            </section>
            {% endif %}

            <!-- Skills Section -->
            {% if portfolio.skills and portfolio.skills|length > 0 %}
            <section class="section">
                <h2 class="section-title">Technical Skills</h2>
                <div class="skills-container">
                    {% for skill in portfolio.skills %}
                    <div class="skill-item">{{ skill }}</div>
                    {% endfor %}
                </div>
            </section>
            {% endif %}

            <!-- Behavior Profile Section -->
            {% if portfolio.behavior_profile and portfolio.behavior_profile|length > 0 %}
            <section class="section">
                <h2 class="section-title">Behavioral Profile</h2>
                <div class="behavior-profile">
                    <div class="behavior-grid">
                        {% for key, value in portfolio.behavior_profile.items() %}
                        <div class="behavior-item">
                            <div class="behavior-label">{{ key.replace('_', ' ').title() }}</div>
                            <div class="behavior-value">
                                {% if value is iterable and value is not string %}
                                    {{ value|join(', ') }}
                                {% else %}
                                    {{ value }}
                                {% endif %}
                            </div>
                        </div>
                        {% endfor %}
                    </div>
                </div>
            </section>
            {% endif %}

            <!-- Projects Section -->
            {% if portfolio.top_projects and portfolio.top_projects|length > 0 %}
            <section class="section">
                <h2 class="section-title">Key Projects</h2>
                <div class="projects-container">
                    {% for project in portfolio.top_projects %}
                    <article class="project-card">
                        <div class="project-header">
                            <div class="project-subtitle">Project {{ loop.index }}</div>
                            <div class="project-title">{{ project.name if project.name else 'Untitled Project' }}</div>
                            {% if project.highlights and project.highlights|length > 0 %}
                            <div class="project-highlight">{{ project.highlights[0] }}</div>
                            {% endif %}
                        </div>

                        <div class="project-content">
                            <div class="project-meta">
                                {% if project.url %}
                                <div class="meta-item">
                                    <div class="meta-label">Repository</div>
                                    <div class="meta-value">
                                        <a href="{{ project.url }}" target="_blank">{{ project.url.split('/')[-1] if '/' in project.url else project.url }}</a>
                                    </div>
                                </div>
                                {% endif %}

                                {% if project.primaryLanguage %}
                                <div class="meta-item">
                                    <div class="meta-label">Primary Language</div>
                                    <div class="meta-value">{{ project.primaryLanguage }}</div>
                                </div>
                                {% endif %}

                                {% if project.commits and project.commits > 0 %}
                                <div class="meta-item">
                                    <div class="meta-label">Commits</div>
                                    <div class="meta-value">{{ "{:,}".format(project.commits) }}</div>
                                </div>
                                {% endif %}

                                {% if project.forks and project.forks > 0 %}
                                <div class="meta-item">
                                    <div class="meta-label">Forks</div>
                                    <div class="meta-value">{{ "{:,}".format(project.forks) }}</div>
                                </div>
                                {% endif %}
                            </div>

                            {% if project.tech and project.tech|length > 0 %}
                            <div class="meta-item">
                                <div class="meta-label">Technologies</div>
                                <div class="tech-list">
                                    {% for tech in project.tech %}
                                    <span class="tech-item">{{ tech }}</span>
                                    {% endfor %}
                                </div>
                            </div>
                            {% endif %}

                            <div class="project-details">
                                {% if project.description and project.description|length > 10 %}
                                <div class="detail-row">
                                    <div class="detail-label">Description</div>
                                    <div class="detail-value">{{ project.description }}</div>
                                </div>
                                {% endif %}

                                {% if project.impact %}
                                <div class="detail-row">
                                    <div class="detail-label">Impact</div>
                                    <div class="detail-value">{{ project.impact }}</div>
                                </div>
                                {% endif %}

                                {% if project.timeline %}
                                <div class="detail-row">
                                    <div class="detail-label">Timeline</div>
                                    <div class="detail-value">{{ project.timeline }}</div>
                                </div>
                                {% endif %}
                            </div>
                        </div>
                    </article>
                    {% endfor %}
                </div>
            </section>
            {% endif %}

            <!-- Statistics Section -->
            {% if portfolio.total_stats %}
            <section class="section">
                <h2 class="section-title">GitHub Metrics</h2>
                <div class="stats-grid">
                    {% if portfolio.total_stats.followers is defined %}
                    <div class="stat-item">
                        <span class="stat-number">{{ "{:,}".format(portfolio.total_stats.followers) }}</span>
                        <div class="stat-label">Followers</div>
                    </div>
                    {% endif %}

                    {% if portfolio.total_stats.total_stars is defined %}
                    <div class="stat-item">
                        <span class="stat-number">{{ "{:,}".format(portfolio.total_stats.total_stars) }}</span>
                        <div class="stat-label">Total Stars</div>
                    </div>
                    {% endif %}

                    {% if portfolio.total_stats.total_commits is defined %}
                    <div class="stat-item">
                        <span class="stat-number">{{ "{:,}".format(portfolio.total_stats.total_commits) }}</span>
                        <div class="stat-label">Total Commits</div>
                    </div>
                    {% endif %}

                    {% if portfolio.total_stats.total_pr_reviews is defined %}
                    <div class="stat-item">
                        <span class="stat-number">{{ "{:,}".format(portfolio.total_stats.total_pr_reviews) }}</span>
                        <div class="stat-label">PR Reviews</div>
                    </div>
                    {% endif %}

                    {% if portfolio.total_stats.total_issues_solved is defined %}
                    <div class="stat-item">
                        <span class="stat-number">{{ "{:,}".format(portfolio.total_stats.total_issues_solved) }}</span>
                        <div class="stat-label">Issues Solved</div>
                    </div>
                    {% endif %}

                    {% if portfolio.total_stats.total_forks is defined %}
                    <div class="stat-item">
                        <span class="stat-number">{{ "{:,}".format(portfolio.total_stats.total_forks) }}</span>
                        <div class="stat-label">Total Forks</div>
                    </div>
                    {% endif %}
                </div>
            </section>
            {% endif %}
        </main>

        <footer class="footer">
            {% if portfolio.meta and portfolio.meta.github_username and portfolio.meta.generated_at %}
            Generated from GitHub profile: {{ portfolio.meta.github_username }} | {{ portfolio.meta.generated_at[:19].replace('T', ' ') }}
            {% endif %}
        </footer>
    </div>
</body>
</html>
    """)

    # Render the template with portfolio data
    html_content = html_template.render(portfolio=portfolio, theme=theme)

    # Save HTML file to generated_htmls/
    base_name = os.path.splitext(os.path.basename(portfolio_json_path))[0]
    html_filename = os.path.join(html_dir, f"portfolio_{theme}_{base_name}.html")
    with open(html_filename, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"[SUCCESS] Generated professional HTML portfolio: {html_filename}")
    return html_filename

def render_pdf_portfolio(portfolio_json_path, theme='minimal'):
    """Render portfolio to PDF with LaTeX-inspired professional design using ReportLab."""
    with open(portfolio_json_path, 'r') as f:
        portfolio = json.load(f)

    # Create folders if they don't exist
    pdf_dir = 'generated_pdfs'
    os.makedirs(pdf_dir, exist_ok=True)

    # Create PDF document with compact margins for single page
    base_name = os.path.splitext(os.path.basename(portfolio_json_path))[0]
    pdf_filename = os.path.join(pdf_dir, f"portfolio_{theme}_{base_name}.pdf")
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=50,
        leftMargin=50,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()

    # LaTeX-inspired color scheme (minimal, professional)
    primary_color = HexColor('#2c3e50')  # Dark blue-gray
    accent_color = HexColor('#34495e')   # Slightly lighter
    text_color = HexColor('#2c3e50')
    light_gray = HexColor('#ecf0f1')
    divider_color = HexColor('#bdc3c7')

    # LaTeX-style typography (left-aligned, compact)
    title_style = ParagraphStyle(
        'LaTeXTitle',
        parent=styles['Title'],
        fontSize=12,
        spaceAfter=2,
        textColor=primary_color,
        alignment=TA_LEFT,
        fontName='Helvetica-Bold',
        leading=14
    )

    subtitle_style = ParagraphStyle(
        'LaTeXSubtitle',
        parent=styles['Normal'],
        fontSize=8,
        spaceAfter=3,
        textColor=accent_color,
        alignment=TA_LEFT,
        fontName='Helvetica',
        leading=10
    )

    section_heading_style = ParagraphStyle(
        'LaTeXSection',
        parent=styles['Heading1'],
        fontSize=10,
        spaceBefore=10,
        spaceAfter=4,
        textColor=primary_color,
        fontName='Helvetica-Bold',
        leading=12,
        borderWidth=0,
        borderPadding=0
    )

    subsection_heading_style = ParagraphStyle(
        'LaTeXSubsection',
        parent=styles['Heading2'],
        fontSize=10,
        spaceBefore=12,
        spaceAfter=6,
        textColor=text_color,
        fontName='Helvetica-Bold',
        leading=12
    )

    normal_style = ParagraphStyle(
        'LaTeXNormal',
        parent=styles['Normal'],
        fontSize=8,
        spaceAfter=4,
        leading=10,
        textColor=text_color,
        alignment=TA_JUSTIFY,
        fontName='Helvetica'
    )

    contact_style = ParagraphStyle(
        'LaTeXContact',
        parent=normal_style,
        fontSize=7,
        alignment=TA_LEFT,
        spaceAfter=8,
        textColor=accent_color
    )

    skill_item_style = ParagraphStyle(
        'LaTeXSkill',
        parent=normal_style,
        fontSize=7,
        spaceAfter=2,
        leading=9
    )

    project_title_style = ParagraphStyle(
        'LaTeXProjectTitle',
        parent=subsection_heading_style,
        fontSize=9,
        spaceBefore=6,
        spaceAfter=2,
        fontName='Helvetica-Bold'
    )

    project_detail_style = ParagraphStyle(
        'LaTeXProjectDetail',
        parent=normal_style,
        fontSize=7,
        spaceAfter=2,
        leading=9
    )

    # Build content with LaTeX-style layout
    content = []

    # Header with avatar and name (left-aligned, compact)
    content.append(Spacer(1, 0.05*inch))
    
    # Left column: Avatar image (smaller for compact layout)
    avatar_img = None
    if portfolio.get('avatarUrl'):
        try:
            # Download avatar image
            response = requests.get(portfolio['avatarUrl'], timeout=5)
            if response.status_code == 200:
                avatar_data = BytesIO(response.content)
                avatar_img = Image(avatar_data, width=0.6*inch, height=0.6*inch)
        except Exception as e:
            # Fallback: skip avatar if download fails
            pass
    
    # Right column: Name, headline, contact info (as a single paragraph)
    name_text = portfolio['name']
    if portfolio.get('headline'):
        name_text += '<br/>' + portfolio['headline']
    
    # Contact information
    contact_parts = []
    if portfolio.get('location'):
        contact_parts.append(portfolio['location'])
    if portfolio.get('websiteUrl'):
        contact_parts.append(portfolio['websiteUrl'])
    if portfolio.get('meta', {}).get('github_username'):
        contact_parts.append(f"github.com/{portfolio['meta']['github_username']}")
    
    if contact_parts:
        contact_text = ' • '.join(contact_parts)
        name_text += '<br/>' + contact_text
    
    # Create header table: Avatar | Name and Contact Info
    if avatar_img:
        # Create a table with avatar on left, text on right
        header_table = Table([[avatar_img, Paragraph(name_text, title_style)]], 
                           colWidths=[0.7*inch, 5.8*inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
            ('LEFTPADDING', (0, 0), (0, 0), 0),
            ('RIGHTPADDING', (0, 0), (0, 0), 0),
            ('LEFTPADDING', (1, 0), (1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        content.append(header_table)
    else:
        # No avatar, just add name and contact info as paragraphs
        content.append(Paragraph(portfolio['name'], title_style))
        if portfolio.get('headline'):
            content.append(Paragraph(portfolio['headline'], subtitle_style))
        if contact_parts:
            contact_text = ' • '.join(contact_parts)
            content.append(Paragraph(contact_text, contact_style))
    
    # Horizontal divider (LaTeX-style, compact)
    content.append(Spacer(1, 0.08*inch))
    divider = Table([['']], colWidths=[6.5*inch], rowHeights=[0.3])
    divider.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, divider_color),
    ]))
    content.append(divider)
    content.append(Spacer(1, 0.1*inch))

    # Summary section (LaTeX-style: justified text, compact)
    if portfolio.get('summary'):
        summary_style = ParagraphStyle(
            'LaTeXSummary',
            parent=normal_style,
            fontSize=8,
            spaceAfter=8,
            alignment=TA_JUSTIFY,
            leading=10
        )
        # Truncate summary if too long for single page
        summary_text = portfolio['summary']
        if len(summary_text) > 200:
            summary_text = summary_text[:200] + '...'
        content.append(Paragraph(summary_text, summary_style))
        content.append(Spacer(1, 0.06*inch))

    # Skills section (LaTeX-style: two-column layout, compact)
    content.append(Paragraph('TECHNICAL SKILLS', section_heading_style))
    
    # Create horizontal divider under section header
    skill_divider = Table([['']], colWidths=[6.5*inch], rowHeights=[0.2])
    skill_divider.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, divider_color),
    ]))
    content.append(skill_divider)
    content.append(Spacer(1, 0.05*inch))
    
    # Two-column layout for skills
    if portfolio.get('skills'):
        skills = portfolio['skills']
        mid_point = (len(skills) + 1) // 2
        
        skill_col1 = []
        skill_col2 = []
        
        for i, skill in enumerate(skills):
            skill_para = Paragraph(f"• {skill}", skill_item_style)
            if i < mid_point:
                skill_col1.append([skill_para])
            else:
                skill_col2.append([skill_para])
        
        # Pad columns to same length
        max_len = max(len(skill_col1), len(skill_col2))
        while len(skill_col1) < max_len:
            skill_col1.append([''])
        while len(skill_col2) < max_len:
            skill_col2.append([''])
        
        # Combine into two-column table
        skill_data = []
        for i in range(max_len):
            skill_data.append([skill_col1[i][0] if skill_col1[i] else '', 
                              skill_col2[i][0] if skill_col2[i] else ''])
        
        if skill_data:
            skill_table = Table(skill_data, colWidths=[3.1*inch, 3.1*inch])
            skill_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 1),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ]))
            content.append(skill_table)
    
    content.append(Spacer(1, 0.08*inch))

    # Behavior Profile section (LaTeX-style: compact, clean)
    if portfolio.get('behavior_profile'):
        content.append(Paragraph('BEHAVIORAL PROFILE', section_heading_style))
        
        # Horizontal divider
        behavior_divider = Table([['']], colWidths=[6.5*inch], rowHeights=[0.2])
        behavior_divider.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, divider_color),
        ]))
        content.append(behavior_divider)
        content.append(Spacer(1, 0.05*inch))
        
        # Two-column layout for behavior traits
        behavior_items = list(portfolio['behavior_profile'].items())
        mid_point = (len(behavior_items) + 1) // 2
        
        behavior_col1 = []
        behavior_col2 = []
        
        for i, (key, value) in enumerate(behavior_items):
            formatted_key = key.replace('_', ' ').title()
            # Format value: if it's a list, join with commas; otherwise use as-is
            if isinstance(value, (list, tuple)):
                formatted_value = ', '.join(str(v) for v in value)
            else:
                formatted_value = str(value)
            behavior_text = f"<b>{formatted_key}:</b> {formatted_value}"
            behavior_para = Paragraph(behavior_text, project_detail_style)
            
            if i < mid_point:
                behavior_col1.append([behavior_para])
            else:
                behavior_col2.append([behavior_para])
        
        # Pad columns
        max_len = max(len(behavior_col1), len(behavior_col2))
        while len(behavior_col1) < max_len:
            behavior_col1.append([''])
        while len(behavior_col2) < max_len:
            behavior_col2.append([''])
        
        # Combine into two-column table
        behavior_data = []
        for i in range(max_len):
            behavior_data.append([
                behavior_col1[i][0] if behavior_col1[i] else '',
                behavior_col2[i][0] if behavior_col2[i] else ''
            ])
        
        if behavior_data:
            behavior_table = Table(behavior_data, colWidths=[3.1*inch, 3.1*inch])
            behavior_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 1),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ]))
            content.append(behavior_table)
        
        content.append(Spacer(1, 0.08*inch))

    # Projects section (LaTeX-style: clean, structured, compact)
    if portfolio.get('top_projects'):
        content.append(Paragraph('PROJECTS', section_heading_style))
        
        # Horizontal divider
        project_divider = Table([['']], colWidths=[6.5*inch], rowHeights=[0.2])
        project_divider.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, divider_color),
        ]))
        content.append(project_divider)
        content.append(Spacer(1, 0.05*inch))

        for i, proj in enumerate(portfolio['top_projects']):
            # Project title
            project_name = proj.get('name', 'Untitled Project')
            content.append(Paragraph(f"<b>{project_name}</b>", project_title_style))
            
            # Create project details table with labels and values
            project_details = []
            
            # URL
            if proj.get('url'):
                url_text = proj['url']
                project_details.append([
                    Paragraph('URL:', project_detail_style),
                    Paragraph(url_text, project_detail_style)
                ])
            
            # Highlights
            if proj.get('highlights') and len(proj['highlights']) > 0:
                highlights_text = proj['highlights'][0] if isinstance(proj['highlights'], list) else str(proj['highlights'])
                project_details.append([
                    Paragraph('Highlights:', project_detail_style),
                    Paragraph(highlights_text, project_detail_style)
                ])
            
            # Forks
            if proj.get('forks', 0) > 0:
                project_details.append([
                    Paragraph('Forks:', project_detail_style),
                    Paragraph(f"{proj['forks']} forks", project_detail_style)
                ])
            
            # Technologies
            if proj.get('tech') and len(proj['tech']) > 0:
                tech_text = ', '.join(proj['tech'])
                project_details.append([
                    Paragraph('Technologies:', project_detail_style),
                    Paragraph(tech_text, project_detail_style)
                ])
            
            # Primary Language
            if proj.get('primaryLanguage'):
                project_details.append([
                    Paragraph('Primary Language:', project_detail_style),
                    Paragraph(str(proj['primaryLanguage']), project_detail_style)
                ])
            
            # Description
            if proj.get('description') and len(str(proj['description'])) > 10:
                desc_text = str(proj['description'])
                # Truncate if too long for single page
                if len(desc_text) > 150:
                    desc_text = desc_text[:150] + '...'
                project_details.append([
                    Paragraph('Description:', project_detail_style),
                    Paragraph(desc_text, project_detail_style)
                ])
            
            # Impact
            if proj.get('impact'):
                project_details.append([
                    Paragraph('Impact:', project_detail_style),
                    Paragraph(str(proj['impact']), project_detail_style)
                ])
            
            # Timeline
            if proj.get('timeline'):
                project_details.append([
                    Paragraph('Timeline:', project_detail_style),
                    Paragraph(str(proj['timeline']), project_detail_style)
                ])
            
            # Create table for project details
            if project_details:
                proj_table = Table(project_details, colWidths=[1.2*inch, 5.3*inch])
                proj_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 1),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
                ]))
                content.append(proj_table)
            
            # Spacing between projects (compact)
            if i < len(portfolio['top_projects']) - 1:
                content.append(Spacer(1, 0.06*inch))

    # Statistics section (LaTeX-style: compact, horizontal layout)
    if portfolio.get('total_stats'):
        content.append(Spacer(1, 0.06*inch))
        content.append(Paragraph('STATISTICS', section_heading_style))
        
        # Horizontal divider
        stats_divider = Table([['']], colWidths=[6.5*inch], rowHeights=[0.2])
        stats_divider.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, divider_color),
        ]))
        content.append(stats_divider)
        content.append(Spacer(1, 0.05*inch))
        
        stats = portfolio['total_stats']
        
        # Create stats in a compact format (two rows, three columns)
        stats_items = []
        if stats.get('followers', 0) > 0:
            stats_items.append(('Followers', f"{stats['followers']:,}"))
        if stats.get('total_stars', 0) > 0:
            stats_items.append(('Stars', f"{stats['total_stars']:,}"))
        if stats.get('total_commits', 0) > 0:
            stats_items.append(('Commits', f"{stats['total_commits']:,}"))
        if stats.get('total_forks', 0) > 0:
            stats_items.append(('Forks', f"{stats['total_forks']:,}"))
        if stats.get('total_pr_reviews', 0) > 0:
            stats_items.append(('PR Reviews', f"{stats['total_pr_reviews']:,}"))
        if stats.get('total_issues_solved', 0) > 0:
            stats_items.append(('Issues', f"{stats['total_issues_solved']:,}"))
        
        # Arrange in two columns
        if stats_items:
            stats_col1 = []
            stats_col2 = []
            mid_point = (len(stats_items) + 1) // 2
            
            for i, (label, value) in enumerate(stats_items):
                stat_text = f"<b>{label}:</b> {value}"
                stat_para = Paragraph(stat_text, project_detail_style)
                
                if i < mid_point:
                    stats_col1.append([stat_para])
                else:
                    stats_col2.append([stat_para])
            
            # Pad columns
            max_len = max(len(stats_col1), len(stats_col2))
            while len(stats_col1) < max_len:
                stats_col1.append([''])
            while len(stats_col2) < max_len:
                stats_col2.append([''])
            
            # Combine into two-column table
            stats_data = []
            for i in range(max_len):
                stats_data.append([
                    stats_col1[i][0] if stats_col1[i] else '',
                    stats_col2[i][0] if stats_col2[i] else ''
                ])
            
            if stats_data:
                stats_table = Table(stats_data, colWidths=[3.1*inch, 3.1*inch])
                stats_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 1),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
                ]))
                content.append(stats_table)

    # Footer with metadata (LaTeX-style: subtle, small, left-aligned, compact)
    content.append(Spacer(1, 0.1*inch))
    footer_style = ParagraphStyle(
        'LaTeXFooter',
        parent=normal_style,
        fontSize=7,
        textColor=HexColor('#95a5a6'),
        alignment=TA_LEFT,
        spaceBefore=0.2*inch
    )
    if portfolio.get('meta', {}).get('github_username'):
        meta_info = f"Generated from GitHub: {portfolio['meta']['github_username']}"
        if portfolio.get('meta', {}).get('generated_at'):
            meta_info += f" • {portfolio['meta']['generated_at'][:10]}"
        content.append(Paragraph(meta_info, footer_style))

    # Build PDF
    doc.build(content)
    print(f"[SUCCESS] Rendered beautiful PDF: {pdf_filename}")
    return pdf_filename

def create_portfolio_suite(portfolio_json_path):
    """Create professional portfolio in multiple themes with both HTML and PDF."""

    print("[INFO] Creating Professional Portfolio Suite...")

    # Generate professional theme versions
    professional_html = render_html_portfolio(portfolio_json_path, 'professional')
    professional_pdf = render_pdf_portfolio(portfolio_json_path, 'minimal')  # Use minimal for PDF as it's cleaner

    # Generate minimal theme versions
    minimal_html = render_html_portfolio(portfolio_json_path, 'minimal')
    minimal_pdf = render_pdf_portfolio(portfolio_json_path, 'modern')  # Use modern for PDF as it's more styled

    print(f"""
 Professional Portfolio Suite Generated Successfully!

    Professional Theme HTML: {professional_html} (in generated_htmls/)
    Professional Theme PDF: {professional_pdf} (in generated_pdfs/)
    Minimal Theme HTML: {minimal_html} (in generated_htmls/)
    Minimal Theme PDF: {minimal_pdf} (in generated_pdfs/)

    You now have both beautiful HTML versions for web viewing and clean PDF versions for sharing!
    """)

    return [professional_html, professional_pdf, minimal_html, minimal_pdf]

# Integration with existing workflow
if __name__ == "__main__":
    import sys
    
    # Accept command-line argument for portfolio JSON file path
    if len(sys.argv) > 1:
        portfolio_json_file = sys.argv[1]
    else:
        # Default to portfolio.json in current directory if no argument provided
        portfolio_json_file = "portfolio.json"
    
    # Check if file exists
    if os.path.exists(portfolio_json_file):
        # Generate professional PDF portfolio
        print(f"[INFO] Generating portfolio from: {portfolio_json_file}")
        create_portfolio_suite(portfolio_json_file)
    else:
        print(f"❌ Portfolio JSON file not found: {portfolio_json_file}")
        print("\nUsage:")
        print("  python render_pdf.py <path_to_portfolio.json>")
        print("\nExample:")
        print("  python render_pdf.py portfolio.json")
        print("  python render_pdf.py ../generated_portfolios/user_portfolio.json")
        print("\nNote: Run your portfolio generation script first to create the JSON data.")
