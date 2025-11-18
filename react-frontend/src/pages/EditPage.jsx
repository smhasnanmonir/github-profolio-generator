import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  Download,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { usePortfolio } from "../hooks/usePortfolio";
import api from "../services/api";
import ProfileEditor from "../components/editor/ProfileEditor";
import BehaviorEditor from "../components/editor/BehaviorEditor";
import SkillsEditor from "../components/editor/SkillsEditor";
import ProjectsEditor from "../components/editor/ProjectsEditor";
import LivePreview from "../components/preview/LivePreview";
import LivePDFPreview from "../components/preview/LivePDFPreview";

const parseLocalStorageJSON = (key) => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to parse ${key}`, error);
    window.localStorage.removeItem(key);
    return null;
  }
};

export default function EditPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [previewType, setPreviewType] = useState("html"); // 'html' or 'pdf'
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(null); // 'skills' or 'projects'

  // Load portfolio and full data from localStorage
  const initialData = useMemo(
    () => parseLocalStorageJSON(`portfolio_${username}`),
    [username]
  );
  const allData = useMemo(
    () => parseLocalStorageJSON(`portfolio_full_${username}`),
    [username]
  );

  const {
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
    saveToLocalStorage,
  } = usePortfolio(initialData);

  const [isGeneratingHTML, setIsGeneratingHTML] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Get latest outputs for download buttons
  const { data: outputs, refetch: refetchOutputs } = useQuery({
    queryKey: ["latest-outputs"],
    queryFn: api.getLatestOutputs,
    retry: false,
  });

  // Regenerate mutation for quick downloads
  const regenerateMutation = useMutation({
    mutationFn: () => {
      // Use current portfolio state directly (has latest edits)
      if (!portfolio) {
        throw new Error("No portfolio data found");
      }
      // Save current portfolio first
      if (hasChanges) {
        saveToLocalStorage(username, portfolio);
      }
      // Use the current portfolio state directly
      return api.generateFromEdited(portfolio);
    },
    onSuccess: () => {
      refetchOutputs();
    },
  });

  // Handle quick download - regenerate on backend with current edited data, then download
  const handleQuickDownload = useCallback(
    async (type) => {
      // Use the current portfolio state directly (has latest edits)
      if (!portfolio) {
        alert("No portfolio data found. Please generate a portfolio first.");
        return;
      }

      // Save current changes to localStorage first
      if (hasChanges) {
        saveToLocalStorage(username, portfolio);
        // Wait a tiny bit to ensure localStorage is updated
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Use the current portfolio state directly - this has the latest edits
      const portfolioToUse = portfolio;

      console.log("Regenerating portfolio with latest edits:", {
        portfolioName: portfolioToUse.name,
        skillsCount: portfolioToUse.skills?.length,
        projectsCount: portfolioToUse.top_projects?.length,
      });

      // Set loading state
      if (type === "html") {
        setIsGeneratingHTML(true);
      } else {
        setIsGeneratingPDF(true);
      }

      try {
        // Regenerate on backend with edited portfolio data
        const response = await api.generateFromEdited(portfolioToUse);
        
        if (!response.success) {
          throw new Error("Regeneration failed");
        }

        console.log("Regeneration successful, file paths:", {
          html: response.html_path,
          pdf: response.pdf_path,
        });

        // Wait a bit for files to be written to disk
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Refetch outputs to get the new file paths
        await refetchOutputs();
        
        // Use response paths
        const htmlPath = response.html_path;
        const pdfPath = response.pdf_path;
        
        // Download the file
        if (type === "html" && htmlPath) {
          console.log("Downloading HTML from:", htmlPath);
          window.open(api.getDownloadUrl(htmlPath), "_blank");
        } else if (type === "pdf" && pdfPath) {
          console.log("Downloading PDF from:", pdfPath);
          window.open(api.getDownloadUrl(pdfPath), "_blank");
        } else {
          alert(`${type.toUpperCase()} file not available yet. Please wait a moment and try again.`);
        }
      } catch (error) {
        console.error("Failed to regenerate:", error);
        alert(`Failed to regenerate portfolio: ${error.message || "Unknown error"}. Please try again.`);
      } finally {
        setIsGeneratingHTML(false);
        setIsGeneratingPDF(false);
      }
    },
    [portfolio, hasChanges, username, saveToLocalStorage, refetchOutputs]
  );

  useEffect(() => {
    if (!portfolio) {
      navigate("/generate");
    }
  }, [portfolio, navigate]);

  // Auto-save on changes
  useEffect(() => {
    if (hasChanges && portfolio) {
      const timer = setTimeout(() => {
        // Use the current portfolio state directly
        saveToLocalStorage(username, portfolio);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [portfolio, hasChanges, username, saveToLocalStorage]);

  const handleSave = () => {
    setIsSaving(true);
    // Use the current portfolio state directly
    saveToLocalStorage(username, portfolio);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handlePreview = () => {
    if (hasChanges && portfolio) {
      // Use the current portfolio state directly
      saveToLocalStorage(username, portfolio);
    }
    navigate(`/preview/${username}`);
  };

  if (!portfolio && !initialData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <h2 className="text-2xl font-semibold text-white">
          No portfolio data found
        </h2>
        <p className="text-slate-400 max-w-md">
          We couldn't find any saved data for{" "}
          <span className="text-white font-medium">{username}</span>. Please
          generate a portfolio first.
        </p>
        <button
          onClick={() => navigate("/generate")}
          className="px-6 py-3 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-100 transition-all"
        >
          Go to Generate Page
        </button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-zinc-400 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "behavior", label: "Behavior", icon: "🧠" },
    { id: "skills", label: "Skills", icon: "⚡" },
    { id: "projects", label: "Projects", icon: "🚀" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-xs text-yellow-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Auto-saving...
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 border border-zinc-700 disabled:border-zinc-800 text-white disabled:text-slate-500 rounded-lg flex items-center gap-2 transition-all disabled:cursor-not-allowed"
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
                className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg flex items-center gap-2 transition-all font-medium"
              >
                <Eye className="w-4 h-4" />
                Preview & Download
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          {outputs && (outputs.html_path || outputs.pdf_path) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-300">
                      Quick Download:
                    </span>
                    {hasChanges && (
                      <span className="text-xs text-yellow-400 mt-0.5">
                        ⚠️ Will regenerate with latest changes
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {outputs?.html_path && !isGeneratingHTML && (
                    <a
                      href={api.getViewUrl(outputs.html_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded text-xs flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      HTML
                    </a>
                  )}
                  <button
                    onClick={() => handleQuickDownload("html")}
                    disabled={isGeneratingHTML || isGeneratingPDF}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 border border-zinc-700 disabled:border-zinc-800 text-white disabled:text-slate-500 rounded text-xs flex items-center gap-1.5 transition-all disabled:cursor-not-allowed"
                  >
                    {isGeneratingHTML ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        HTML
                      </>
                    )}
                  </button>
                  {outputs?.pdf_path && !isGeneratingPDF && (
                    <a
                      href={api.getViewUrl(outputs.pdf_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded text-xs flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      PDF
                    </a>
                  )}
                  <button
                    onClick={() => handleQuickDownload("pdf")}
                    disabled={isGeneratingHTML || isGeneratingPDF}
                    className="px-3 py-1.5 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-zinc-900 disabled:text-slate-500 rounded text-xs flex items-center gap-1.5 transition-all font-medium disabled:cursor-not-allowed"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/preview/${username}`)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3 h-3" />
                    Full Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-zinc-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-zinc-800 text-white border-b-2 border-white"
                        : "text-slate-400 hover:text-white hover:bg-zinc-800/50"
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
                {activeTab === "profile" && (
                  <ProfileEditor
                    portfolio={portfolio}
                    updateField={updateField}
                  />
                )}

                {activeTab === "behavior" && (
                  <BehaviorEditor
                    portfolio={portfolio}
                    updateNestedField={updateNestedField}
                  />
                )}

                {activeTab === "skills" && (
                  <SkillsEditor
                    portfolio={portfolio}
                    updateSkills={updateSkills}
                    addSkill={addSkill}
                    allData={allData}
                    onShowAddModal={() => setShowAddModal("skills")}
                  />
                )}

                {activeTab === "projects" && (
                  <ProjectsEditor
                    portfolio={portfolio}
                    updateProject={updateProject}
                    addProject={addProject}
                    removeProject={removeProject}
                    moveProject={moveProject}
                    allData={allData}
                    onShowAddModal={() => setShowAddModal("projects")}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* Preview Type Toggle */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-t-lg p-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Live Preview</h3>
                <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewType("html")}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                      previewType === "html"
                        ? "bg-white text-zinc-900"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setPreviewType("pdf")}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                      previewType === "pdf"
                        ? "bg-white text-zinc-900"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    PDF
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="border-t-0">
                {previewType === "html" ? (
                  <LivePreview portfolio={portfolio} />
                ) : (
                  <LivePDFPreview portfolio={portfolio} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <AddModal
            type={showAddModal}
            allData={allData}
            portfolio={portfolio}
            onAdd={(items) => {
              if (!Array.isArray(items) || items.length === 0) return;
              if (showAddModal === "skills") {
                items.forEach((item) => addSkill(item));
              } else {
                items.forEach((item) => addProject(item));
              }
            }}
            onClose={() => setShowAddModal(null)}
          />
        )}
      </div>
    </div>
  );
}

function AddModal({ type, allData, portfolio, onAdd, onClose }) {
  const [selected, setSelected] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Get all available items from the fetched GitHub data
  const getAllItems = () => {
    if (type === "skills") {
      return (
        allData?.skills || allData?.portfolio?.skills || portfolio.skills || []
      );
    } else {
      // Get all repositories from the raw data
      const rawRepos = allData?.raw_data?.repositories || [];
      const portfolioProjects = allData?.portfolio?.top_projects || [];

      // Combine both sources and deduplicate by name
      const allProjects = [...portfolioProjects];
      rawRepos.forEach((repo) => {
        if (!allProjects.some((p) => p.name === repo.name)) {
          allProjects.push({
            name: repo.name,
            description: repo.description,
            url: repo.url,
            stargazers_count:
              repo.stargazers?.totalCount || repo.stargazer_count || 0,
            forks_count: repo.forkCount || repo.forks_count || 0,
            watchers_count:
              repo.watchers?.totalCount || repo.watchers_count || 0,
            language: repo.primaryLanguage?.name || repo.language,
            updated_at: repo.updatedAt || repo.updated_at,
          });
        }
      });
      return allProjects;
    }
  };

  const allItems = getAllItems();

  // Filter out items already in portfolio
  const availableItems =
    type === "skills"
      ? allItems.filter((skill) => !portfolio.skills?.includes(skill))
      : allItems.filter(
          (proj) => !portfolio.top_projects?.some((p) => p.name === proj.name)
        );

  // Apply search filter
  const filteredItems = searchTerm
    ? availableItems.filter((item) => {
        if (type === "skills") {
          return item.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return (
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        }
      })
    : availableItems;

  const handleAdd = () => {
    if (selected.size === 0) return;
    onAdd(Array.from(selected));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">
            Add {type === "skills" ? "Skills" : "Projects"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Select from your GitHub data ({availableItems.length} available)
          </p>

          {/* Search Box */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${
              type === "skills" ? "skills" : "repositories"
            }...`}
            className="mt-4 w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              {searchTerm
                ? `No ${type} found matching "${searchTerm}"`
                : `No more ${type} available to add`}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(item)}
                    onChange={(e) => {
                      const newSelected = new Set(selected);
                      if (e.target.checked) {
                        newSelected.add(item);
                      } else {
                        newSelected.delete(item);
                      }
                      setSelected(newSelected);
                    }}
                    className="w-4 h-4 rounded border-zinc-600 text-white focus:ring-2 focus:ring-zinc-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">
                        {type === "skills" ? item : item.name}
                      </span>
                      {type === "projects" && item.language && (
                        <span className="text-xs text-slate-500">
                          {item.language}
                        </span>
                      )}
                    </div>
                    {type === "projects" && (
                      <div className="mt-1">
                        {item.description && (
                          <p className="text-slate-400 text-xs mb-1 truncate">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {item.stargazers_count > 0 && (
                            <span>⭐ {item.stargazers_count}</span>
                          )}
                          {item.forks_count > 0 && (
                            <span>🔱 {item.forks_count}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selected.size === 0}
            className="flex-1 px-4 py-2 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-zinc-900 disabled:text-slate-500 rounded-lg transition-all disabled:cursor-not-allowed"
          >
            Add {selected.size > 0 && `(${selected.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
