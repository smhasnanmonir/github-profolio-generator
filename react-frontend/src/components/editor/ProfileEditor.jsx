import { User, Mail, MapPin, Link as LinkIcon } from 'lucide-react';

export default function ProfileEditor({ portfolio, updateField }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
          <User className="w-6 h-6 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Profile Information</h2>
          <p className="text-sm text-slate-400">Basic details about you</p>
        </div>
      </div>

      {/* Avatar Preview */}
      {portfolio.avatarUrl && (
        <div className="flex justify-center">
          <img
            src={portfolio.avatarUrl}
            alt={portfolio.name}
            className="w-24 h-24 rounded-full border-4 border-zinc-800"
          />
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Full Name
        </label>
        <input
          type="text"
          value={portfolio.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
        />
      </div>

      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Professional Headline
        </label>
        <input
          type="text"
          value={portfolio.headline || ''}
          onChange={(e) => updateField('headline', e.target.value)}
          placeholder="Full Stack Developer | Open Source Enthusiast"
          className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Professional Summary
        </label>
        <textarea
          value={portfolio.summary || portfolio.bio || ''}
          onChange={(e) => updateField('summary', e.target.value)}
          placeholder="Write a brief summary about your professional background and expertise..."
          rows={4}
          className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all resize-none"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Location
        </label>
        <input
          type="text"
          value={portfolio.location || ''}
          onChange={(e) => updateField('location', e.target.value)}
          placeholder="San Francisco, CA"
          className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
        />
      </div>

      {/* Website/Blog */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <LinkIcon className="w-4 h-4 inline mr-1" />
          Website / Blog
        </label>
        <input
          type="url"
          value={portfolio.website || portfolio.blog || ''}
          onChange={(e) => updateField('website', e.target.value)}
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Mail className="w-4 h-4 inline mr-1" />
          Email
        </label>
        <input
          type="email"
          value={portfolio.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="your.email@example.com"
          className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
        />
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Keep your headline concise and highlight your key strengths. A good summary should be 2-3 sentences.
        </p>
      </div>
    </div>
  );
}
