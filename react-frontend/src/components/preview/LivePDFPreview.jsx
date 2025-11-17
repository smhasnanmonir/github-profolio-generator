import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Download, AlertCircle } from 'lucide-react';

export default function LivePDFPreview({ portfolio }) {
  const iframeRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Generate PDF from HTML using browser's print functionality
  const generatePDF = async () => {
    if (!portfolio) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Create HTML content
      const htmlContent = generateHTMLForPDF();
      
      // Create a blob URL
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Set the iframe src
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }

      // Clean up old URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      setPdfUrl(url);
    } catch (err) {
      setError('Failed to generate PDF preview');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate HTML optimized for PDF
  const generateHTMLForPDF = () => {
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
        size: A4;
        margin: 20mm;
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      background: white;
      color: #1a1a1a;
      padding: 40px;
      line-height: 1.6;
      max-width: 210mm;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid #e5e7eb;
    }
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 0 auto 20px;
      border: 3px solid #e5e7eb;
      display: block;
    }
    .name {
      font-size: 32px;
      font-weight: bold;
      color: #111827;
      margin-bottom: 8px;
    }
    .headline {
      font-size: 18px;
      color: #6b7280;
      margin-bottom: 12px;
    }
    .location {
      font-size: 14px;
      color: #9ca3af;
    }
    .section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 22px;
      font-weight: bold;
      color: #111827;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .behavior-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .behavior-type {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }
    .behavior-desc {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .traits {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .trait {
      background: white;
      border: 1px solid #e5e7eb;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      color: #6b7280;
    }
    .skills {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .skill {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      color: #374151;
      text-align: center;
    }
    .project {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 12px;
    }
    .project-name {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
    .project-rank {
      background: white;
      border: 1px solid #e5e7eb;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
    }
    .project-desc {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 12px;
    }
    .project-stats {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: #9ca3af;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 32px;
      padding-top: 32px;
      border-top: 2px solid #e5e7eb;
    }
    .stat-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .stat-label {
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
    }
  </style>
</head>
<body>
  <div class="header">
    ${portfolio.avatarUrl ? `<img src="${portfolio.avatarUrl}" alt="${portfolio.name}" class="avatar" />` : ''}
    <h1 class="name">${portfolio.name || 'Your Name'}</h1>
    <p class="headline">${portfolio.headline || 'Software Developer'}</p>
    ${portfolio.location ? `<p class="location">📍 ${portfolio.location}</p>` : ''}
  </div>

  ${portfolio.behavior_profile ? `
  <div class="section">
    <h2 class="section-title">Developer Profile</h2>
    <div class="behavior-card">
      <div class="behavior-type">${portfolio.behavior_profile.type || 'Not specified'}</div>
      ${portfolio.behavior_profile.description ? `<p class="behavior-desc">${portfolio.behavior_profile.description}</p>` : ''}
      ${portfolio.behavior_profile.traits && portfolio.behavior_profile.traits.length > 0 ? `
      <div class="traits">
        ${portfolio.behavior_profile.traits.map(trait => `<span class="trait">${trait}</span>`).join('')}
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${portfolio.skills && portfolio.skills.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Skills</h2>
    <div class="skills">
      ${portfolio.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  ${portfolio.top_projects && portfolio.top_projects.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Featured Projects</h2>
    ${portfolio.top_projects.map((project, index) => `
      <div class="project">
        <div class="project-header">
          <h3 class="project-name">${project.name || 'Untitled Project'}</h3>
          <span class="project-rank">#${index + 1}</span>
        </div>
        ${project.description ? `<p class="project-desc">${project.description}</p>` : ''}
        <div class="project-stats">
          ${project.stargazers_count !== undefined ? `<span>⭐ ${project.stargazers_count} stars</span>` : ''}
          ${project.forks_count !== undefined ? `<span>🔱 ${project.forks_count} forks</span>` : ''}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${portfolio.total_stats || portfolio.meta ? `
  <div class="stats-grid">
    ${portfolio.total_stats?.total_stars !== undefined ? `
    <div class="stat-card">
      <div class="stat-label">Total Stars</div>
      <div class="stat-value">⭐ ${portfolio.total_stats.total_stars.toLocaleString()}</div>
    </div>
    ` : ''}
    ${portfolio.total_stats?.total_forks !== undefined ? `
    <div class="stat-card">
      <div class="stat-label">Total Forks</div>
      <div class="stat-value">🔱 ${portfolio.total_stats.total_forks.toLocaleString()}</div>
    </div>
    ` : ''}
    ${portfolio.total_stats?.total_commits !== undefined ? `
    <div class="stat-card">
      <div class="stat-label">Commits</div>
      <div class="stat-value">💚 ${portfolio.total_stats.total_commits.toLocaleString()}</div>
    </div>
    ` : ''}
    ${portfolio.total_stats?.followers !== undefined ? `
    <div class="stat-card">
      <div class="stat-label">Followers</div>
      <div class="stat-value">👥 ${portfolio.total_stats.followers.toLocaleString()}</div>
    </div>
    ` : ''}
    ${portfolio.meta?.total_repositories !== undefined || portfolio.total_stats?.total_repos !== undefined ? `
    <div class="stat-card">
      <div class="stat-label">Repositories</div>
      <div class="stat-value">📦 ${(portfolio.meta?.total_repositories || portfolio.total_stats?.total_repos || 0).toLocaleString()}</div>
    </div>
    ` : ''}
    ${portfolio.total_stats?.total_prs !== undefined ? `
    <div class="stat-card">
      <div class="stat-label">Pull Requests</div>
      <div class="stat-value">🔀 ${portfolio.total_stats.total_prs.toLocaleString()}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}
</body>
</html>
    `;
  };

  // Generate PDF on portfolio change
  useEffect(() => {
    if (portfolio) {
      const timer = setTimeout(() => {
        generatePDF();
      }, 500); // Debounce updates
      return () => clearTimeout(timer);
    }
  }, [portfolio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print();
    }
  };

  if (!portfolio) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <p className="text-slate-400 text-center">Loading PDF preview...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border-l border-r border-b border-zinc-800 rounded-b-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      {/* Quick Actions Bar */}
      <div className="p-2 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          {isGenerating && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Updating...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
            title="Refresh preview"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handlePrint}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
            title="Print/Save as PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden bg-white">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-slate-600">{error}</p>
              <button
                onClick={generatePDF}
                className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            title="PDF Preview"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-modals allow-popups"
          />
        )}
      </div>

      {/* Quick Info */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
        <p className="text-xs text-slate-400 text-center">
          💡 Click the download icon to print or save as PDF using your browser's print dialog (Ctrl/Cmd+P)
        </p>
      </div>
    </div>
  );
}

