// AI Portfolio Generator - Enhanced Frontend
const fetchBtn = document.getElementById("fetchBtn");
const form = document.getElementById("fetchForm");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const downloadsEl = document.getElementById("downloads");
const previewEl = document.getElementById("preview");
const previewSection = document.getElementById("previewSection");
const portfolioBtn = document.getElementById("portfolioBtn");
const refreshPreviewBtn = document.getElementById("refreshPreview");
const fullscreenPreviewBtn = document.getElementById("fullscreenPreview");

// Get API base URL
const API = localStorage.getItem("api_base") || "http://127.0.0.1:8000";

// Restore saved credentials
document.addEventListener("DOMContentLoaded", () => {
  const savedToken = localStorage.getItem("gh_token");
  const savedProfile = localStorage.getItem("gh_profile");
  
  if (savedToken) {
    document.getElementById("token").value = savedToken;
  }
  if (savedProfile) {
    document.getElementById("profile").value = savedProfile;
  }

  // Check for latest outputs on load
  fetchLatestOutputs();
});

// Status management
function showStatus(message, type = "loading") {
  statusEl.className = `show ${type}`;
  
  if (type === "loading") {
    statusEl.innerHTML = `
      <div class="spinner"></div>
      <span>${message}</span>
    `;
  } else if (type === "success") {
    statusEl.innerHTML = `
      <svg class="icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>${message}</span>
    `;
  } else if (type === "error") {
    statusEl.innerHTML = `
      <svg class="icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>${message}</span>
    `;
  }
}

function hideStatus() {
  statusEl.className = "";
  statusEl.innerHTML = "";
}

// Toast notifications
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" 
    ? `<svg class="icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    : `<svg class="icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  
  toast.innerHTML = `${icon}<span>${message}</span>`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Fetch latest outputs
async function fetchLatestOutputs() {
  try {
    const res = await fetch(`${API}/api/latest`);
    const data = await res.json();
    if (data && (data.html_path || data.pdf_path)) {
      displayDownloadLinks(data);
    }
  } catch (err) {
    console.log("No previous outputs found");
  }
}

// Display download links
function displayDownloadLinks(data) {
  if (!data.html_path && !data.pdf_path) {
    downloadsEl.style.display = "none";
    return;
  }

  const items = [];
  
  if (data.html_path) {
    const viewUrl = `${API}/view?path=${encodeURIComponent(data.html_path)}`;
    const dlUrl = `${API}/download?path=${encodeURIComponent(data.html_path)}`;
    items.push(`
      <a class="btn" href="${dlUrl}" target="_blank" download>
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        Download HTML
      </a>
    `);
    
    // Show preview
    if (previewEl && previewSection) {
      previewSection.style.display = "block";
      previewEl.src = viewUrl;
    }
  }
  
  if (data.pdf_path) {
    const dlUrl = `${API}/download?path=${encodeURIComponent(data.pdf_path)}`;
    items.push(`
      <a class="btn" href="${dlUrl}" target="_blank" download>
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
        Download PDF
      </a>
    `);
  }
  
  if (items.length > 0) {
    downloadsEl.className = "show";
    downloadsEl.innerHTML = `
      <div class="downloads-title">✅ Generated Files Ready</div>
      ${items.join("")}
    `;
  }
}

// Format JSON output
function formatJson(text) {
  try {
    const obj = JSON.parse(text);
    return JSON.stringify(obj, null, 2);
  } catch (_) {
    return text;
  }
}

// Save credentials
function saveCredentials() {
  const token = document.getElementById("token").value.trim();
  const profile = document.getElementById("profile").value.trim();
  localStorage.setItem("gh_token", token);
  localStorage.setItem("gh_profile", profile);
}

// Fetch GitHub Data
fetchBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  
  showStatus("🔍 Fetching GitHub data...", "loading");
  outputEl.textContent = "";
  downloadsEl.style.display = "none";
  if (previewSection) previewSection.style.display = "none";
  
  const token = document.getElementById("token").value.trim();
  const profile = document.getElementById("profile").value.trim();
  
  if (!token || !profile) {
    showStatus("❌ Please provide both token and profile", "error");
    return;
  }
  
  saveCredentials();
  
  // Disable button during fetch
  fetchBtn.disabled = true;
  portfolioBtn.disabled = true;
  
  try {
    const res = await fetch(`${API}/api/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, profile_url_or_username: profile }),
    });
    
    const text = await res.text();
    
    if (!res.ok) {
      throw new Error(text);
    }
    
    showStatus("✅ GitHub data fetched successfully!", "success");
    const pretty = formatJson(text);
    outputEl.textContent = pretty;
    
    showToast("Data fetched successfully! You can now generate your portfolio.", "success");
    
    // Try to load previous outputs
    await fetchLatestOutputs();
    
  } catch (err) {
    showStatus(`❌ Failed to fetch data: ${err.message}`, "error");
    outputEl.textContent = `Error: ${err.message}\n\nPlease check:\n- Your GitHub token is valid\n- The username/profile URL is correct\n- The backend server is running (${API})`;
    showToast("Failed to fetch data. Check your credentials.", "error");
  } finally {
    fetchBtn.disabled = false;
    portfolioBtn.disabled = false;
  }
});

// Generate Portfolio
portfolioBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  
  showStatus("🤖 Generating AI-powered portfolio...", "loading");
  outputEl.textContent = "";
  downloadsEl.style.display = "none";
  if (previewSection) previewSection.style.display = "none";
  
  const token = document.getElementById("token").value.trim();
  const profile = document.getElementById("profile").value.trim();
  
  if (!token || !profile) {
    showStatus("❌ Please provide both token and profile", "error");
    return;
  }
  
  saveCredentials();
  
  // Disable buttons during generation
  fetchBtn.disabled = true;
  portfolioBtn.disabled = true;
  
  try {
    showStatus("🔍 Fetching GitHub data...", "loading");
    
    const res = await fetch(`${API}/api/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, profile_url_or_username: profile }),
    });
    
    const text = await res.text();
    
    if (!res.ok) {
      throw new Error(text);
    }
    
    const data = JSON.parse(text);
    
    if (!data.success) {
      throw new Error("Portfolio generation failed");
    }
    
    showStatus("✅ Portfolio generated successfully!", "success");
    
    // Display results
    const resultSummary = {
      success: data.success,
      username: data.portfolio?.name || "Unknown",
      behavior_type: data.portfolio?.behavior_profile?.type || "N/A",
      skills_count: data.portfolio?.skills?.length || 0,
      top_projects_count: data.portfolio?.top_projects?.length || 0,
      files: {
        json: data.json_path,
        html: data.html_path,
        pdf: data.pdf_path
      }
    };
    
    outputEl.textContent = JSON.stringify(resultSummary, null, 2);
    
    // Show download links
    displayDownloadLinks(data);
    
    showToast("Portfolio generated! Downloads ready below.", "success");
    
  } catch (err) {
    const errorMsg = err.message.includes("{") ? JSON.parse(err.message).detail || err.message : err.message;
    showStatus(`❌ Portfolio generation failed`, "error");
    outputEl.textContent = `Error: ${errorMsg}\n\nPossible causes:\n- ML models not found in organized_structure/models/\n- Invalid GitHub data\n- Backend processing error\n\nCheck the backend console for detailed error messages.`;
    showToast("Portfolio generation failed. Check error details.", "error");
  } finally {
    fetchBtn.disabled = false;
    portfolioBtn.disabled = false;
  }
});

// Preview controls
if (refreshPreviewBtn) {
  refreshPreviewBtn.addEventListener("click", () => {
    if (previewEl && previewEl.src) {
      previewEl.src = previewEl.src; // Force reload
      showToast("Preview refreshed", "success");
    }
  });
}

if (fullscreenPreviewBtn) {
  fullscreenPreviewBtn.addEventListener("click", () => {
    if (previewEl && previewEl.src) {
      window.open(previewEl.src, "_blank");
    }
  });
}

// Prevent form submission on Enter (except for buttons)
form.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
    e.preventDefault();
  }
});

// Global error handlers
window.addEventListener("error", (e) => {
  console.error("Global error:", e);
  showToast(`Unexpected error: ${e.message}`, "error");
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e);
  showToast(`Network error: ${e.reason}`, "error");
});

// Health check on load
async function checkBackendHealth() {
  try {
    const res = await fetch(`${API}/api/health`, { method: "GET" });
    if (res.ok) {
      console.log("✅ Backend is healthy");
    } else {
      showToast("⚠️ Backend health check failed", "error");
    }
  } catch (err) {
    showToast(`⚠️ Cannot connect to backend at ${API}`, "error");
  }
}

checkBackendHealth();
