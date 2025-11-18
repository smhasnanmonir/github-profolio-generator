const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export const api = {
  // Health check
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error("Backend is not responding");
    return res.json();
  },

  // Fetch GitHub data
  fetchGitHubData: async (token, profileUrl) => {
    const res = await fetch(`${API_BASE}/api/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        profile_url_or_username: profileUrl,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return res.json();
  },

  // Generate portfolio with ML models
  generatePortfolio: async (token, profileUrl) => {
    const res = await fetch(`${API_BASE}/api/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        profile_url_or_username: profileUrl,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return res.json();
  },

  // Generate portfolio from edited data
  generateFromEdited: async (portfolioData) => {
    // Log what we're sending
    console.log("[api.generateFromEdited] Sending portfolio data:", {
      name: portfolioData?.name,
      skillsCount: portfolioData?.skills?.length,
      projectsCount: portfolioData?.top_projects?.length,
      skills: portfolioData?.skills?.slice(0, 5),
      projectNames: portfolioData?.top_projects?.map(p => p.name).slice(0, 3),
    });

    const res = await fetch(`${API_BASE}/api/generate-from-edited`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolio: portfolioData,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("[api.generateFromEdited] Error response:", error);
      throw new Error(error);
    }

    const result = await res.json();
    console.log("[api.generateFromEdited] Success response:", {
      success: result.success,
      html_path: result.html_path,
      pdf_path: result.pdf_path,
    });
    return result;
  },

  // Get latest generated files
  getLatestOutputs: async () => {
    const res = await fetch(`${API_BASE}/api/latest`);
    if (!res.ok) throw new Error("No outputs found");
    return res.json();
  },

  // Get download URL
  getDownloadUrl: (path) => {
    return `${API_BASE}/download?path=${encodeURIComponent(path)}`;
  },

  // Get view URL
  getViewUrl: (path) => {
    return `${API_BASE}/view?path=${encodeURIComponent(path)}`;
  },
};

export default api;
