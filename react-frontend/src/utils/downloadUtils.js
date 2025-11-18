/**
 * Client-side HTML and PDF generation utilities
 * Uses the same portfolio data as the preview components
 */

/**
 * Generate HTML content from portfolio data (same as LivePreview)
 */
export const generateHTMLForDownload = (portfolio) => {
  if (!portfolio) return '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolio.name || 'Portfolio'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #09090b;
      color: #e4e4e7;
      padding: 2rem;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 3rem;
    }
    .header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #27272a;
    }
    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      border: 4px solid #27272a;
      display: block;
    }
    .name {
      font-size: 2rem;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }
    .headline {
      font-size: 1.125rem;
      color: #a1a1aa;
      margin-bottom: 1rem;
    }
    .location {
      font-size: 0.875rem;
      color: #71717a;
    }
    .section {
      margin-bottom: 2.5rem;
    }
    .section-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .behavior-card {
      background: #27272a;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .behavior-type {
      font-size: 1.125rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }
    .behavior-desc {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .traits {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .trait {
      background: #18181b;
      border: 1px solid #3f3f46;
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #a1a1aa;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .skill {
      background: #27272a;
      border: 1px solid #3f3f46;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #e4e4e7;
    }
    .project {
      background: #27272a;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 0.75rem;
    }
    .project-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #ffffff;
    }
    .project-rank {
      background: #18181b;
      border: 1px solid #3f3f46;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #71717a;
    }
    .project-desc {
      color: #a1a1aa;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .project-stats {
      display: flex;
      gap: 1.5rem;
      font-size: 0.75rem;
      color: #71717a;
    }
    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${portfolio.avatarUrl ? `<img src="${portfolio.avatarUrl}" alt="${portfolio.name}" class="avatar" />` : ''}
      <h1 class="name">${portfolio.name || 'Your Name'}</h1>
      <p class="headline">${portfolio.headline || 'Software Developer'}</p>
      ${portfolio.location ? `<p class="location">📍 ${portfolio.location}</p>` : ''}
    </div>

    ${portfolio.behavior_profile ? `
    <div class="section">
      <h2 class="section-title">🧠 Developer Profile</h2>
      <div class="behavior-card">
        <div class="behavior-type">${portfolio.behavior_profile.type || 'Not specified'}</div>
        ${portfolio.behavior_profile.description ? `<p class="behavior-desc">${portfolio.behavior_profile.description}</p>` : ''}
        ${portfolio.behavior_profile.traits && portfolio.behavior_profile.traits.length > 0 ? `
        <div class="traits">
          ${portfolio.behavior_profile.traits.map(trait => `<span class="trait">${escapeHtml(trait)}</span>`).join('')}
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    ${portfolio.skills && portfolio.skills.length > 0 ? `
    <div class="section">
      <h2 class="section-title">⚡ Skills</h2>
      <div class="skills">
        ${portfolio.skills.map(skill => `<span class="skill">${escapeHtml(skill)}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    ${portfolio.top_projects && portfolio.top_projects.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🚀 Featured Projects</h2>
      ${portfolio.top_projects.map((project, index) => `
        <div class="project">
          <div class="project-header">
            <h3 class="project-name">${escapeHtml(project.name || 'Untitled Project')}</h3>
            <span class="project-rank">#${index + 1}</span>
          </div>
          ${project.description ? `<p class="project-desc">${escapeHtml(project.description)}</p>` : ''}
          <div class="project-stats">
            ${project.stargazers_count !== undefined ? `<span class="stat">⭐ ${project.stargazers_count} stars</span>` : ''}
            ${project.forks_count !== undefined ? `<span class="stat">🔱 ${project.forks_count} forks</span>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${portfolio.total_stats || portfolio.meta ? `
    <div class="section" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #27272a;">
      <h2 class="section-title">📊 GitHub Statistics</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
        ${portfolio.total_stats?.total_stars !== undefined ? `
        <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 6px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.75rem; color: #71717a; margin-bottom: 0.5rem;">Total Stars</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #fbbf24;">⭐ ${portfolio.total_stats.total_stars.toLocaleString()}</div>
        </div>
        ` : ''}
        ${portfolio.total_stats?.total_forks !== undefined ? `
        <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 6px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.75rem; color: #71717a; margin-bottom: 0.5rem;">Total Forks</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #60a5fa;">🔱 ${portfolio.total_stats.total_forks.toLocaleString()}</div>
        </div>
        ` : ''}
        ${portfolio.total_stats?.total_commits !== undefined ? `
        <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 6px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.75rem; color: #71717a; margin-bottom: 0.5rem;">Commits</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #34d399;">💚 ${portfolio.total_stats.total_commits.toLocaleString()}</div>
        </div>
        ` : ''}
        ${portfolio.total_stats?.followers !== undefined ? `
        <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 6px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.75rem; color: #71717a; margin-bottom: 0.5rem;">Followers</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #a78bfa;">👥 ${portfolio.total_stats.followers.toLocaleString()}</div>
        </div>
        ` : ''}
        ${portfolio.meta?.total_repositories !== undefined || portfolio.total_stats?.total_repos !== undefined ? `
        <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 6px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.75rem; color: #71717a; margin-bottom: 0.5rem;">Repositories</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #f472b6;">📦 ${(portfolio.meta?.total_repositories || portfolio.total_stats?.total_repos || 0).toLocaleString()}</div>
        </div>
        ` : ''}
        ${portfolio.total_stats?.total_prs !== undefined ? `
        <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 6px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.75rem; color: #71717a; margin-bottom: 0.5rem;">Pull Requests</div>
          <div style="font-size: 1.5rem; font-weight: bold; color: #fb923c;">🔀 ${portfolio.total_stats.total_prs.toLocaleString()}</div>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
};

/**
 * Generate HTML optimized for PDF - matches ReportLab LaTeX-inspired design from render_pdf.py
 */
export const generateHTMLForPDF = (portfolio) => {
  if (!portfolio) return '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolio.name || 'Portfolio'} - PDF</title>
  <style>
    @media print {
      @page {
        size: letter;
        margin: 40pt 50pt;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Helvetica, Arial, sans-serif;
      background: white;
      color: #2c3e50;
      padding: 0;
      line-height: 1.25;
      max-width: 8.5in;
      margin: 0 auto;
      font-size: 8pt;
    }
    .header {
      display: flex;
      align-items: flex-start;
      gap: 0.7in;
      margin-bottom: 0.08in;
      padding-bottom: 0.1in;
      border-bottom: 0.5pt solid #bdc3c7;
    }
    .avatar-container {
      flex-shrink: 0;
    }
    .avatar {
      width: 0.6in;
      height: 0.6in;
      border-radius: 0;
      display: block;
      object-fit: cover;
    }
    .header-info {
      flex: 1;
    }
    .name {
      font-size: 12pt;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 2pt;
      line-height: 14pt;
    }
    .headline {
      font-size: 8pt;
      color: #34495e;
      margin-bottom: 3pt;
      line-height: 10pt;
    }
    .contact {
      font-size: 7pt;
      color: #34495e;
      line-height: 10pt;
    }
    .divider {
      height: 0.3pt;
      background: #bdc3c7;
      margin: 0.08in 0 0.1in 0;
    }
    .section {
      margin-bottom: 0.08in;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 10pt;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 0.05in;
      line-height: 12pt;
    }
    .section-divider {
      height: 0.2pt;
      background: #bdc3c7;
      margin-bottom: 0.05in;
    }
    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.1in;
      column-gap: 0.2in;
    }
    .skill-item {
      font-size: 7pt;
      color: #2c3e50;
      margin-bottom: 2pt;
      line-height: 9pt;
    }
    .behavior-item {
      font-size: 7pt;
      color: #2c3e50;
      margin-bottom: 2pt;
      line-height: 9pt;
    }
    .behavior-label {
      font-weight: bold;
    }
    .project {
      margin-bottom: 0.06in;
      page-break-inside: avoid;
    }
    .project-title {
      font-size: 9pt;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 2pt;
      line-height: 12pt;
    }
    .project-details {
      margin-top: 2pt;
    }
    .project-detail-row {
      display: grid;
      grid-template-columns: 1.2in 5.3in;
      gap: 0.125in;
      margin-bottom: 1pt;
      font-size: 7pt;
      line-height: 9pt;
    }
    .project-detail-label {
      font-weight: bold;
      color: #2c3e50;
    }
    .project-detail-value {
      color: #2c3e50;
    }
    .summary {
      font-size: 8pt;
      color: #2c3e50;
      margin-bottom: 0.06in;
      line-height: 10pt;
      text-align: justify;
    }
    .stats-two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.1in;
      column-gap: 0.2in;
    }
    .stat-item {
      font-size: 7pt;
      color: #2c3e50;
      margin-bottom: 2pt;
      line-height: 9pt;
    }
    .stat-label {
      font-weight: bold;
    }
    .footer {
      margin-top: 0.1in;
      font-size: 7pt;
      color: #95a5a6;
      line-height: 9pt;
    }
  </style>
</head>
<body>
  <!-- Header: Avatar | Name and Contact (left-aligned, LaTeX style) -->
  <div class="header">
    ${portfolio.avatarUrl ? `
    <div class="avatar-container">
      <img src="${portfolio.avatarUrl}" alt="${portfolio.name}" class="avatar" />
    </div>
    ` : ''}
    <div class="header-info">
      <div class="name">${escapeHtml(portfolio.name || 'Your Name')}</div>
      ${portfolio.headline ? `<div class="headline">${escapeHtml(portfolio.headline)}</div>` : ''}
      <div class="contact">
        ${[
          portfolio.location,
          portfolio.websiteUrl,
          portfolio.meta?.github_username ? `github.com/${portfolio.meta.github_username}` : null
        ].filter(Boolean).join(' • ')}
      </div>
    </div>
  </div>
  
  <div class="divider"></div>

  <!-- Summary -->
  ${portfolio.summary ? `
  <div class="summary">${escapeHtml(portfolio.summary.length > 200 ? portfolio.summary.substring(0, 200) + '...' : portfolio.summary)}</div>
  ` : ''}

  <!-- Skills Section: Two-column layout -->
  ${portfolio.skills && portfolio.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">TECHNICAL SKILLS</div>
    <div class="section-divider"></div>
    <div class="two-column">
      ${portfolio.skills.map(skill => `
        <div class="skill-item">• ${escapeHtml(skill)}</div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Behavior Profile Section: Two-column layout -->
  ${portfolio.behavior_profile ? `
  <div class="section">
    <div class="section-title">BEHAVIORAL PROFILE</div>
    <div class="section-divider"></div>
    <div class="two-column">
      ${Object.entries(portfolio.behavior_profile).map(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const formattedValue = Array.isArray(value) ? value.join(', ') : String(value);
        return `<div class="behavior-item"><span class="behavior-label">${escapeHtml(formattedKey)}:</span> ${escapeHtml(formattedValue)}</div>`;
      }).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Projects Section: Structured with detail rows -->
  ${portfolio.top_projects && portfolio.top_projects.length > 0 ? `
  <div class="section">
    <div class="section-title">PROJECTS</div>
    <div class="section-divider"></div>
    ${portfolio.top_projects.map((project) => {
      const details = [];
      if (project.url) details.push(['URL:', project.url]);
      if (project.highlights && project.highlights.length > 0) {
        const highlight = Array.isArray(project.highlights) ? project.highlights[0] : project.highlights;
        details.push(['Highlights:', String(highlight)]);
      }
      if (project.forks) details.push(['Forks:', `${project.forks} forks`]);
      if (project.tech && project.tech.length > 0) details.push(['Technologies:', project.tech.join(', ')]);
      if (project.primaryLanguage) details.push(['Primary Language:', String(project.primaryLanguage)]);
      if (project.description && project.description.length > 10) {
        const desc = String(project.description);
        details.push(['Description:', desc.length > 150 ? desc.substring(0, 150) + '...' : desc]);
      }
      if (project.impact) details.push(['Impact:', String(project.impact)]);
      if (project.timeline) details.push(['Timeline:', String(project.timeline)]);
      
      return `
        <div class="project">
          <div class="project-title">${escapeHtml(project.name || 'Untitled Project')}</div>
          <div class="project-details">
            ${details.map(([label, value]) => `
              <div class="project-detail-row">
                <div class="project-detail-label">${escapeHtml(label)}</div>
                <div class="project-detail-value">${escapeHtml(value)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('')}
  </div>
  ` : ''}

  <!-- Statistics Section: Two-column layout -->
  ${portfolio.total_stats ? `
  <div class="section">
    <div class="section-title">STATISTICS</div>
    <div class="section-divider"></div>
    <div class="stats-two-column">
      ${[
        portfolio.total_stats.followers ? ['Followers', portfolio.total_stats.followers.toLocaleString()] : null,
        portfolio.total_stats.total_stars ? ['Stars', portfolio.total_stats.total_stars.toLocaleString()] : null,
        portfolio.total_stats.total_commits ? ['Commits', portfolio.total_stats.total_commits.toLocaleString()] : null,
        portfolio.total_stats.total_forks ? ['Forks', portfolio.total_stats.total_forks.toLocaleString()] : null,
        portfolio.total_stats.total_pr_reviews ? ['PR Reviews', portfolio.total_stats.total_pr_reviews.toLocaleString()] : null,
        portfolio.total_stats.total_issues_solved ? ['Issues', portfolio.total_stats.total_issues_solved.toLocaleString()] : null,
      ].filter(Boolean).map(([label, value]) => `
        <div class="stat-item"><span class="stat-label">${escapeHtml(label)}:</span> ${escapeHtml(value)}</div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Footer -->
  ${portfolio.meta?.github_username ? `
  <div class="footer">
    Generated from GitHub: ${escapeHtml(portfolio.meta.github_username)}${portfolio.meta.generated_at ? ` • ${portfolio.meta.generated_at.substring(0, 10)}` : ''}
  </div>
  ` : ''}
</body>
</html>
  `;
};

/**
 * Escape HTML to prevent XSS
 */
const escapeHtml = (text) => {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Download HTML file directly from portfolio data
 */
export const downloadHTML = (portfolio, filename = 'portfolio.html') => {
  const htmlContent = generateHTMLForDownload(portfolio);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download PDF file directly from portfolio data using browser print
 */
export const downloadPDF = (portfolio, filename = 'portfolio.pdf') => {
  const htmlContent = generateHTMLForPDF(portfolio);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    }, 500);
  };
};

