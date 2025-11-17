import { Plus, X } from 'lucide-react';

export default function SkillsEditor({ portfolio, updateSkills, addSkill, allData, onShowAddModal }) {
  const skills = portfolio.skills || [];

  const handleRemoveSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    updateSkills(newSkills);
  };

  const handleAddSkill = (skill) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      updateSkills([...skills, skill.trim()]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Skills</h2>
          <p className="text-sm text-slate-400">Manage your technical skills</p>
        </div>
        <button
          onClick={onShowAddModal}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add from GitHub
        </button>
      </div>

      {/* Current Skills */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Current Skills ({skills.length})
        </label>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="group px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center gap-2 hover:border-zinc-600 transition-colors"
            >
              <span className="text-sm text-white">{skill}</span>
              <button
                onClick={() => handleRemoveSkill(index)}
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-slate-400 text-sm">No skills added yet</p>
          )}
        </div>
      </div>

      {/* Add Custom Skill */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Add Custom Skill
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.target.elements.skill;
            handleAddSkill(input.value);
            input.value = '';
          }}
          className="flex gap-2"
        >
          <input
            name="skill"
            type="text"
            placeholder="e.g., TypeScript, React, Node.js"
            className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg transition-all"
          >
            Add
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Start with your top 5 skills. You can add more from your GitHub data or manually.
        </p>
      </div>
    </div>
  );
}
