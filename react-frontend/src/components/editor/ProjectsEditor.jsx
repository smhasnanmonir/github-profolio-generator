import React, { useState } from "react";
import Draggable from "react-draggable";
import {
  Plus,
  X,
  GripVertical,
  ExternalLink,
  Star,
  GitFork,
} from "lucide-react";

export default function ProjectsEditor({
  portfolio,
  updateProject,
  removeProject,
  moveProject,
  onShowAddModal,
}) {
  const projects = portfolio.top_projects || [];
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [ghostIndex, setGhostIndex] = useState(null);

  // Create dynamic refs for each project
  const getProjectRef = (index) => {
    if (!getProjectRef.refs) {
      getProjectRef.refs = [];
    }
    if (!getProjectRef.refs[index]) {
      getProjectRef.refs[index] = React.createRef();
    }
    return getProjectRef.refs[index];
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
    setGhostIndex(index);
  };

  const handleDrag = (index, e, data) => {
    if (draggedIndex === null) return;

    // Get the center Y position of the dragged element
    const draggedY =
      data.node.getBoundingClientRect().top + data.node.offsetHeight / 2;

    // Find which item we're hovering over
    let newGhostIndex = draggedIndex;
    if (getProjectRef.refs) {
      getProjectRef.refs.forEach((ref, i) => {
        if (ref.current && i !== draggedIndex) {
          const rect = ref.current.getBoundingClientRect();
          const itemCenterY = rect.top + rect.height / 2;

          if (draggedY > itemCenterY && i > draggedIndex && i <= ghostIndex) {
            newGhostIndex = Math.min(i, projects.length - 1);
          } else if (
            draggedY < itemCenterY &&
            i < draggedIndex &&
            i >= ghostIndex
          ) {
            newGhostIndex = Math.max(i, 0);
          }
        }
      });
    }

    if (newGhostIndex !== ghostIndex) {
      setGhostIndex(newGhostIndex);
    }
  };

  const handleDragStop = () => {
    if (
      draggedIndex !== null &&
      ghostIndex !== null &&
      draggedIndex !== ghostIndex
    ) {
      moveProject(draggedIndex, ghostIndex);
    }
    setDraggedIndex(null);
    setGhostIndex(null);
  };

  // Calculate transform for smooth reordering animation
  const getItemStyle = (index) => {
    if (draggedIndex === null || draggedIndex === index) {
      return {};
    }

    if (ghostIndex === null) return {};

    // If dragging down and this item is between original and target
    if (
      draggedIndex < ghostIndex &&
      index > draggedIndex &&
      index <= ghostIndex
    ) {
      return {
        transform: "translateY(-120px)",
        transition: "transform 0.2s ease",
      };
    }

    // If dragging up and this item is between target and original
    if (
      draggedIndex > ghostIndex &&
      index < draggedIndex &&
      index >= ghostIndex
    ) {
      return {
        transform: "translateY(120px)",
        transition: "transform 0.2s ease",
      };
    }

    return {};
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Projects</h2>
          <p className="text-sm text-slate-400">
            Drag to reorder your projects
          </p>
        </div>
        <button
          onClick={onShowAddModal}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add from GitHub
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-3 relative">
        {projects.map((project, index) => {
          const projectRef = getProjectRef(index);
          return (
            <Draggable
              key={`project-${project.name}-${index}`}
              axis="y"
              handle=".drag-handle"
              position={{ x: 0, y: 0 }}
              nodeRef={projectRef}
              onStart={() => handleDragStart(index)}
              onDrag={(e, data) => handleDrag(index, e, data)}
              onStop={handleDragStop}
              bounds="parent"
            >
              <div
                ref={projectRef}
                style={getItemStyle(index)}
                className={`group bg-zinc-800 border rounded-lg p-4 transition-all ${
                  draggedIndex === index
                    ? "border-blue-500 shadow-xl shadow-blue-500/20 opacity-80 z-50 relative"
                    : "border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div
                    className="drag-handle text-slate-400 group-hover:text-white mt-1 cursor-grab active:cursor-grabbing select-none"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Project Content */}
                  <div className="flex-1 min-w-0">
                    {/* Project Name & Rank */}
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="text"
                        value={project.name || ""}
                        onChange={(e) =>
                          updateProject(index, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600"
                        placeholder="Project name"
                        disabled={draggedIndex === index}
                      />
                      <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded font-medium whitespace-nowrap">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Project Description */}
                    <textarea
                      value={project.description || ""}
                      onChange={(e) =>
                        updateProject(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
                      placeholder="Project description"
                      rows={2}
                      disabled={draggedIndex === index}
                    />

                    {/* Project Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      {project.stargazers_count !== undefined &&
                        project.stargazers_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {project.stargazers_count}
                          </div>
                        )}
                      {project.forks_count !== undefined &&
                        project.forks_count > 0 && (
                          <div className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            {project.forks_count}
                          </div>
                        )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on GitHub
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeProject(index)}
                    className="text-slate-400 hover:text-red-400 transition-colors mt-1"
                    title="Remove project"
                    disabled={draggedIndex !== null}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Draggable>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center py-8 bg-zinc-800 border border-zinc-700 rounded-lg">
            <p className="text-slate-400 text-sm">No projects added yet</p>
            <button
              onClick={onShowAddModal}
              className="mt-3 px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg text-sm transition-all"
            >
              Add Your First Project
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Grab the grip icon (⋮⋮) and drag projects to
          reorder them. Blue border shows the active project.
        </p>
      </div>
    </div>
  );
}
