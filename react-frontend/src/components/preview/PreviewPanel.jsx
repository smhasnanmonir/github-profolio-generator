import { User, Star, GitFork, Users } from 'lucide-react';

export default function PreviewPanel({ portfolio }) {
  if (!portfolio) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <p className="text-slate-400 text-center">Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Live Preview</h3>
        
        {/* Avatar */}
        {portfolio.avatarUrl ? (
          <img
            src={portfolio.avatarUrl}
            alt={portfolio.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/10"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
        )}

        <h2 className="text-xl font-bold text-white mb-1">{portfolio.name}</h2>
        <p className="text-sm text-slate-400 mb-2">{portfolio.headline}</p>
        
        {portfolio.location && (
          <p className="text-xs text-slate-500">📍 {portfolio.location}</p>
        )}
      </div>

      {/* Behavior Type */}
      {portfolio.behavior_profile && (
        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
          <div className="text-xs text-purple-300 mb-1">Developer Type</div>
          <div className="text-sm font-semibold text-white">
            {portfolio.behavior_profile.type || 'Not Set'}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Followers"
          value={portfolio.total_stats?.followers || 0}
        />
        <StatCard
          icon={<Star className="w-4 h-4" />}
          label="Stars"
          value={portfolio.total_stats?.total_stars || 0}
        />
        <StatCard
          icon={<GitFork className="w-4 h-4" />}
          label="Forks"
          value={portfolio.total_stats?.total_forks || 0}
        />
        <StatCard
          icon={<User className="w-4 h-4" />}
          label="Commits"
          value={portfolio.total_stats?.total_commits || 0}
        />
      </div>

      {/* Skills Preview */}
      {portfolio.skills && portfolio.skills.length > 0 && (
        <div>
          <div className="text-xs text-slate-400 mb-2">Top Skills</div>
          <div className="flex flex-wrap gap-2">
            {portfolio.skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md"
              >
                {skill}
              </span>
            ))}
            {portfolio.skills.length > 6 && (
              <span className="px-2 py-1 bg-white/5 text-slate-400 text-xs rounded-md">
                +{portfolio.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Projects Count */}
      {portfolio.top_projects && (
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-xs text-slate-400">
            {portfolio.top_projects.length} Featured Project{portfolio.top_projects.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-slate-400">{icon}</div>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
      <p className="text-lg font-semibold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

