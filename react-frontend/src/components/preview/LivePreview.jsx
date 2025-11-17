import { useState, useEffect, useRef } from 'react';
import { User, Star, GitFork, Users, RefreshCw } from 'lucide-react';

export default function LivePreview({ portfolio }) {
  const iframeRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate HTML from portfolio data
  const generateHTML = () => {
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
          ${portfolio.behavior_profile.traits.map(trait => `<span class="trait">${trait}</span>`).join('')}
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    ${portfolio.skills && portfolio.skills.length > 0 ? `
    <div class="section">
      <h2 class="section-title">⚡ Skills</h2>
      <div class="skills">
        ${portfolio.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    ${portfolio.top_projects && portfolio.top_projects.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🚀 Featured Projects</h2>
      ${portfolio.top_projects.map((project, index) => `
        <div class="project">
          <div class="project-header">
            <h3 class="project-name">${project.name || 'Untitled Project'}</h3>
            <span class="project-rank">#${index + 1}</span>
          </div>
          ${project.description ? `<p class="project-desc">${project.description}</p>` : ''}
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

  // Update iframe content when portfolio changes
  useEffect(() => {
    if (iframeRef.current) {
      const html = generateHTML();
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
    }
  }, [portfolio]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const html = generateHTML();
    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!portfolio) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <p className="text-slate-400 text-center">Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border-l border-r border-b border-zinc-800 rounded-b-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      {/* Quick Actions Bar */}
      <div className="p-2 border-b border-zinc-800 flex items-center justify-end bg-zinc-900/50">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
          title="Refresh preview"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          title="Portfolio Preview"
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
        />
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-slate-400 mb-1">Skills</div>
            <div className="text-lg font-semibold text-white">
              {portfolio.skills?.length || 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Projects</div>
            <div className="text-lg font-semibold text-white">
              {portfolio.top_projects?.length || 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Type</div>
            <div className="text-xs font-medium text-white truncate">
              {portfolio.behavior_profile?.type || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

