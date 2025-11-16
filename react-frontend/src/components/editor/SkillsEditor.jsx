import { useState } from 'react';
import { Zap, Plus, X } from 'lucide-react';

export default function SkillsEditor({ portfolio, updateSkills }) {
  const [newSkill, setNewSkill] = useState('');
  const skills = portfolio.skills || [];

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      updateSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    updateSkills(skills.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Technical Skills</h2>
          <p className="text-sm text-slate-400">AI-detected programming languages and frameworks</p>
        </div>
      </div>

      {/* Add New Skill */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new skill (e.g., Python, React...)"
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          onClick={handleAddSkill}
          disabled={!newSkill.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg flex items-center gap-2 transition-all disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Skills Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-300">
            Current Skills ({skills.length})
          </label>
          <button
            onClick={() => updateSkills([])}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Clear All
          </button>
        </div>
        
        {skills.length === 0 ? (
          <div className="py-12 text-center">
            <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No skills added yet</p>
            <p className="text-slate-500 text-xs mt-1">Add your first skill above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {skills.map((skill, index) => (
              <SkillBadge
                key={index}
                skill={skill}
                onRemove={() => handleRemoveSkill(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Popular Skills</h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SKILLS.filter(s => !skills.includes(s)).slice(0, 12).map(skill => (
            <button
              key={skill}
              onClick={() => {
                if (!skills.includes(skill)) {
                  updateSkills([...skills, skill]);
                }
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs rounded-md transition-all"
            >
              + {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillBadge({ skill, onRemove }) {
  return (
    <div className="group relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg px-3 py-2 flex items-center justify-between hover:scale-105 transition-transform">
      <span className="text-sm font-medium text-white">{skill}</span>
      <button
        onClick={onRemove}
        className="ml-2 w-5 h-5 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-red-400" />
      </button>
    </div>
  );
}

const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'Rust',
  'React', 'Node.js', 'Vue.js', 'Angular', 'Next.js', 'Express',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'PostgreSQL',
  'MongoDB', 'Redis', 'GraphQL', 'REST API', 'Git', 'CI/CD',
  'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning',
  'Swift', 'Kotlin', 'Flutter', 'React Native', 'iOS', 'Android'
];

