import { useState } from 'react';
import { Rocket, Plus, ChevronDown, ChevronUp, Trash2, Star, GitFork } from 'lucide-react';

export default function ProjectsEditor({ portfolio, updateProject, addProject, removeProject }) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const projects = portfolio.top_projects || [];

  const toggleProject = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  const handleAddProject = () => {
    addProject({
      name: 'New Project',
      url: '',
      description: '',
      primaryLanguage: '',
      tech: [],
      stars: 0,
      forks: 0,
      commits: 0,
      role: 'owner',
      highlights: [],
      impact: 'Active project',
    });
    setExpandedIndex(projects.length);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Top Projects</h2>
            <p className="text-sm text-slate-400">AI-ranked by impact and complexity</p>
          </div>
        </div>
        
        <button
          onClick={handleAddProject}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="py-12 text-center bg-white/5 border border-white/10 rounded-xl">
          <Rocket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No projects yet</p>
          <p className="text-slate-500 text-xs mt-1">Add your first project above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleProject(index)}
              onUpdate={(field, value) => updateProject(index, field, value)}
              onRemove={() => removeProject(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, index, isExpanded, onToggle, onUpdate, onRemove }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
      {/* Project Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {index + 1}
          </div>
          <div className="text-left">
            <h3 className="text-white font-medium">{project.name}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {project.stars || 0}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                {project.forks || 0}
              </span>
              <span>{project.primaryLanguage}</span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Project Details (Expanded) */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Primary Language
              </label>
              <input
                type="text"
                value={project.primaryLanguage}
                onChange={(e) => onUpdate('primaryLanguage', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Project URL
            </label>
            <input
              type="url"
              value={project.url}
              onChange={(e) => onUpdate('url', e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description
            </label>
            <textarea
              value={project.description || ''}
              onChange={(e) => onUpdate('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Stars
              </label>
              <input
                type="number"
                value={project.stars || 0}
                onChange={(e) => onUpdate('stars', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Forks
              </label>
              <input
                type="number"
                value={project.forks || 0}
                onChange={(e) => onUpdate('forks', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Commits
              </label>
              <input
                type="number"
                value={project.commits || 0}
                onChange={(e) => onUpdate('commits', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2 transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Remove Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

