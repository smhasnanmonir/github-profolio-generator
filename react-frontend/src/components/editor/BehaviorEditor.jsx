import { Brain, Sparkles } from 'lucide-react';

export default function BehaviorEditor({ portfolio, updateNestedField }) {
  const behaviorProfile = portfolio.behavior_profile || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Behavior Profile</h2>
          <p className="text-sm text-slate-400">AI-analyzed developer type</p>
        </div>
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Primary Type
        </label>
        <select
          value={behaviorProfile.type || ''}
          onChange={(e) => updateNestedField('behavior_profile.type', e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="Team Player">Team Player</option>
          <option value="Maintainer">Maintainer</option>
          <option value="Innovator">Innovator</option>
          <option value="Learner">Learner</option>
          <option value="Generalist">Generalist</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={behaviorProfile.description || ''}
          onChange={(e) => updateNestedField('behavior_profile.description', e.target.value)}
          placeholder="Describe your developer behavior and working style..."
          rows={4}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
        />
      </div>

      {/* Traits */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Key Traits
        </label>
        <div className="space-y-2">
          {(behaviorProfile.traits || []).map((trait, index) => (
            <TraitInput
              key={index}
              value={trait}
              onChange={(value) => {
                const newTraits = [...(behaviorProfile.traits || [])];
                newTraits[index] = value;
                updateNestedField('behavior_profile.traits', newTraits);
              }}
              onRemove={() => {
                const newTraits = behaviorProfile.traits.filter((_, i) => i !== index);
                updateNestedField('behavior_profile.traits', newTraits);
              }}
            />
          ))}
          
          <button
            onClick={() => {
              const newTraits = [...(behaviorProfile.traits || []), ''];
              updateNestedField('behavior_profile.traits', newTraits);
            }}
            className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed text-slate-400 hover:text-white rounded-lg transition-all text-sm"
          >
            + Add Trait
          </button>
        </div>
      </div>

      {/* Behavior Type Info Cards */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Behavior Type Guide</h3>
        <div className="grid gap-3">
          <TypeCard
            title="Team Player"
            description="Collaborates well, participates in code reviews, supports team goals"
            color="from-blue-500/20 to-cyan-500/20"
          />
          <TypeCard
            title="Maintainer"
            description="Maintains long-term projects, ensures quality, problem-solver"
            color="from-green-500/20 to-emerald-500/20"
          />
          <TypeCard
            title="Innovator"
            description="Creates new projects, explores novel solutions, drives innovation"
            color="from-purple-500/20 to-pink-500/20"
          />
          <TypeCard
            title="Learner"
            description="Continuously acquires skills, adapts to new technologies"
            color="from-orange-500/20 to-yellow-500/20"
          />
        </div>
      </div>
    </div>
  );
}

function TraitInput({ value, onChange, onRemove }) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Collaborative, Proactive..."
        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <button
        onClick={onRemove}
        className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
      >
        ×
      </button>
    </div>
  );
}

function TypeCard({ title, description, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} border border-white/10 rounded-lg p-3`}>
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

