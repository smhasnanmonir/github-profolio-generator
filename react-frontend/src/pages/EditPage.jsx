import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Download, Loader2 } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import ProfileEditor from '../components/editor/ProfileEditor';
import BehaviorEditor from '../components/editor/BehaviorEditor';
import SkillsEditor from '../components/editor/SkillsEditor';
import ProjectsEditor from '../components/editor/ProjectsEditor';
import PreviewPanel from '../components/preview/PreviewPanel';

export default function EditPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load portfolio from localStorage
  const savedData = localStorage.getItem(`portfolio_${username}`);
  const initialData = savedData ? JSON.parse(savedData) : null;

  const {
    portfolio,
    hasChanges,
    updateField,
    updateNestedField,
    updateProject,
    addProject,
    removeProject,
    updateSkills,
    reset,
    saveToLocalStorage,
  } = usePortfolio(initialData);

  useEffect(() => {
    if (!portfolio) {
      // Redirect if no portfolio data
      navigate('/generate');
    }
  }, [portfolio, navigate]);

  const handleSave = () => {
    setIsSaving(true);
    saveToLocalStorage(username);
    
    // Simulate save delay for UX
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handlePreview = () => {
    if (hasChanges) {
      saveToLocalStorage(username);
    }
    navigate(`/preview/${username}`);
  };

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'behavior', label: 'Behavior', icon: '🧠' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Unsaved changes
              </span>
            )}
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:text-slate-500 border border-white/10 text-white rounded-lg flex items-center gap-2 transition-all disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>

            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/10 text-white border-b-2 border-blue-500'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>{tab.icon}</span>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <ProfileEditor
                    portfolio={portfolio}
                    updateField={updateField}
                  />
                )}
                
                {activeTab === 'behavior' && (
                  <BehaviorEditor
                    portfolio={portfolio}
                    updateNestedField={updateNestedField}
                  />
                )}
                
                {activeTab === 'skills' && (
                  <SkillsEditor
                    portfolio={portfolio}
                    updateSkills={updateSkills}
                  />
                )}
                
                {activeTab === 'projects' && (
                  <ProjectsEditor
                    portfolio={portfolio}
                    updateProject={updateProject}
                    addProject={addProject}
                    removeProject={removeProject}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PreviewPanel portfolio={portfolio} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

