import { Brain, X, Plus } from 'lucide-react';

export default function BehaviorEditor({ portfolio, updateNestedField }) {
  const behaviorProfile = portfolio.behavior_profile || {};

  const handleAddTrait = () => {
    const newTraits = [...(behaviorProfile.traits || []), ''];
    updateNestedField('behavior_profile.traits', newTraits);
  };

  const handleUpdateTrait = (index, value) => {
    const newTraits = [...(behaviorProfile.traits || [])];
    newTraits[index] = value;
    updateNestedField('behavior_profile.traits', newTraits);
  };

  const handleRemoveTrait = (index) => {
    const newTraits = behaviorProfile.traits.filter((_, i) => i !== index);
    updateNestedField('behavior_profile.traits', newTraits);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Behavior Profile</h2>
          <p className="text-sm text-slate-400">AI-analyzed developer type</p>
        </div>
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Primary Type
        </label>
        <select
          value={behaviorProfile.type || ''}
          onChange={(e) => updateNestedField('behavior_profile.type', e.target.value)}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
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
          className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all resize-none"
        />
      </div>

      {/* Traits */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Key Traits
        </label>
        <div className="space-y-2">
          {(behaviorProfile.traits || []).map((trait, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={trait}
                onChange={(e) => handleUpdateTrait(index, e.target.value)}
                placeholder="e.g., Collaborative, Proactive..."
                className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
              />
              <button
                onClick={() => handleRemoveTrait(index)}
                className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button
            onClick={handleAddTrait}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 border-dashed text-slate-400 hover:text-white rounded-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Trait
          </button>
        </div>
      </div>

      {/* Behavior Type Info Cards */}
      <div className="pt-6 border-t border-zinc-800">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Behavior Type Guide</h3>
        <div className="grid gap-3">
          <TypeCard
            title="Team Player"
            description="Collaborates well, participates in code reviews, supports team goals"
          />
          <TypeCard
            title="Maintainer"
            description="Maintains long-term projects, ensures quality, problem-solver"
          />
          <TypeCard
            title="Innovator"
            description="Creates new projects, explores novel solutions, drives innovation"
          />
          <TypeCard
            title="Learner"
            description="Continuously acquires skills, adapts to new technologies"
          />
        </div>
      </div>
    </div>
  );
}

function TypeCard({ title, description }) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}
