import { useState, useEffect } from 'react';

export const usePortfolio = (initialData = null) => {
  const [portfolio, setPortfolio] = useState(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPortfolio(initialData);
    }
  }, [initialData]);

  const updateField = (field, value) => {
    setPortfolio(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const updateNestedField = (path, value) => {
    setPortfolio(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    setHasChanges(true);
  };

  const updateProject = (index, field, value) => {
    setPortfolio(prev => ({
      ...prev,
      top_projects: prev.top_projects.map((project, i) =>
        i === index ? { ...project, [field]: value } : project
      ),
    }));
    setHasChanges(true);
  };

  const addProject = (project) => {
    setPortfolio(prev => ({
      ...prev,
      top_projects: [...(prev.top_projects || []), project],
    }));
    setHasChanges(true);
  };

  const removeProject = (index) => {
    setPortfolio(prev => ({
      ...prev,
      top_projects: prev.top_projects.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const moveProject = (fromIndex, toIndex) => {
    setPortfolio(prev => {
      const projects = [...prev.top_projects];
      const [removed] = projects.splice(fromIndex, 1);
      projects.splice(toIndex, 0, removed);
      return {
        ...prev,
        top_projects: projects,
      };
    });
    setHasChanges(true);
  };

  const updateSkills = (skills) => {
    setPortfolio(prev => ({
      ...prev,
      skills,
    }));
    setHasChanges(true);
  };

  const addSkill = (skill) => {
    setPortfolio(prev => ({
      ...prev,
      skills: [...(prev.skills || []), skill],
    }));
    setHasChanges(true);
  };

  const removeSkill = (index) => {
    setPortfolio(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const reset = () => {
    setPortfolio(initialData);
    setHasChanges(false);
  };

  const saveToLocalStorage = (username) => {
    localStorage.setItem(`portfolio_${username}`, JSON.stringify(portfolio));
    setHasChanges(false);
  };

  const loadFromLocalStorage = (username) => {
    const saved = localStorage.getItem(`portfolio_${username}`);
    if (saved) {
      setPortfolio(JSON.parse(saved));
      return true;
    }
    return false;
  };

  return {
    portfolio,
    hasChanges,
    updateField,
    updateNestedField,
    updateProject,
    addProject,
    removeProject,
    moveProject,
    updateSkills,
    addSkill,
    removeSkill,
    reset,
    saveToLocalStorage,
    loadFromLocalStorage,
  };
};
