import { User, Briefcase, MapPin, Link as LinkIcon } from 'lucide-react';

export default function ProfileEditor({ portfolio, updateField }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Basic Information
        </h2>
        
        <div className="space-y-4">
          <InputField
            label="Full Name"
            value={portfolio.name || ''}
            onChange={(value) => updateField('name', value)}
            icon={<User className="w-4 h-4" />}
          />

          <TextareaField
            label="Headline"
            value={portfolio.headline || ''}
            onChange={(value) => updateField('headline', value)}
            placeholder="Software Engineer | ML Enthusiast | Open Source Contributor"
            rows={2}
            icon={<Briefcase className="w-4 h-4" />}
          />

          <TextareaField
            label="Summary"
            value={portfolio.summary || ''}
            onChange={(value) => updateField('summary', value)}
            placeholder="Write a compelling summary about yourself..."
            rows={4}
          />

          <InputField
            label="Location"
            value={portfolio.location || ''}
            onChange={(value) => updateField('location', value)}
            placeholder="San Francisco, CA"
            icon={<MapPin className="w-4 h-4" />}
          />

          <InputField
            label="Website URL"
            value={portfolio.websiteUrl || ''}
            onChange={(value) => updateField('websiteUrl', value)}
            placeholder="https://yourwebsite.com"
            type="url"
            icon={<LinkIcon className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Stats Preview */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Followers"
            value={portfolio.total_stats?.followers || 0}
          />
          <StatCard
            label="Total Stars"
            value={portfolio.total_stats?.total_stars || 0}
          />
          <StatCard
            label="Total Forks"
            value={portfolio.total_stats?.total_forks || 0}
          />
          <StatCard
            label="Commits"
            value={portfolio.total_stats?.total_commits || 0}
          />
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
        />
      </div>
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 3, icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-slate-500">
            {icon}
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none`}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

