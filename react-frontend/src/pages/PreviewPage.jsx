import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Edit,
  ExternalLink,
  Loader2,
  FileText,
  FileType,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../services/api";
import LivePreview from "../components/preview/LivePreview";

export default function PreviewPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [isGeneratingHTML, setIsGeneratingHTML] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Load portfolio from localStorage - reactive to changes
  useEffect(() => {
    const loadPortfolio = () => {
      const saved = localStorage.getItem(`portfolio_${username}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPortfolio(parsed);
        } catch (e) {
          console.error("Failed to parse portfolio:", e);
        }
      }
    };

    loadPortfolio();
    
    // Listen for storage changes (when user edits in another tab/window)
    window.addEventListener("storage", loadPortfolio);
    
    // Listen for custom storage event (when user edits in same tab)
    const handleCustomStorage = () => {
      loadPortfolio();
    };
    window.addEventListener("portfolioUpdated", handleCustomStorage);
    
    // Refresh when page becomes visible (user returns from editor)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPortfolio();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Also refresh on focus (when user switches back to this tab)
    window.addEventListener("focus", loadPortfolio);
    
    return () => {
      window.removeEventListener("storage", loadPortfolio);
      window.removeEventListener("portfolioUpdated", handleCustomStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", loadPortfolio);
    };
  }, [username]);

  // Get latest outputs from backend (for viewing server-generated files)
  const {
    data: outputs,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["latest-outputs"],
    queryFn: api.getLatestOutputs,
    retry: false,
  });

  // Regenerate portfolio mutation - now uses edited portfolio data
  const regenerateMutation = useMutation({
    mutationFn: () => {
      // Reload portfolio from localStorage to ensure we have latest edits
      const latestPortfolio = JSON.parse(
        localStorage.getItem(`portfolio_${username}`) || "null"
      );
      if (!latestPortfolio) {
        throw new Error("No portfolio data found");
      }
      // Use current edited portfolio instead of regenerating from GitHub
      return api.generateFromEdited(latestPortfolio);
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Handle download - regenerate on backend with current edited data, then download
  const handleDownload = useCallback(
    async (type) => {
      // Reload portfolio from localStorage to ensure we have latest edits
      const latestPortfolio = JSON.parse(
        localStorage.getItem(`portfolio_${username}`) || "null"
      );

      if (!latestPortfolio) {
        alert("No portfolio data found. Please generate a portfolio first.");
        return;
      }

      console.log("Regenerating portfolio with latest edits:", {
        portfolioName: latestPortfolio.name,
        skillsCount: latestPortfolio.skills?.length,
        projectsCount: latestPortfolio.top_projects?.length,
      });

      // Set loading state
      if (type === "html") {
        setIsGeneratingHTML(true);
      } else {
        setIsGeneratingPDF(true);
      }

      try {
        // Regenerate on backend with edited portfolio data
        const response = await api.generateFromEdited(latestPortfolio);
        
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
        await refetch();
        
        // Use response paths if available, otherwise use refetched outputs
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
    [portfolio, username, refetch]
  );

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Portfolio not found</p>
          <button
            onClick={() => navigate("/generate")}
            className="px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg transition-all"
          >
            Generate Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/edit/${username}`)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/edit/${username}`)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg flex items-center gap-2 transition-all"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>

              <button
                onClick={() => regenerateMutation.mutate()}
                disabled={regenerateMutation.isPending}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 border border-zinc-700 disabled:border-zinc-800 text-white disabled:text-slate-500 rounded-lg flex items-center gap-2 transition-all disabled:cursor-not-allowed"
              >
                {regenerateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Regenerate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Download Buttons Row */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">
                  Export Portfolio
                </h3>
                <p className="text-xs text-slate-400">
                  Download your portfolio in different formats (regenerates with latest edits)
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* HTML Download */}
                {outputs?.html_path && !isGeneratingHTML && (
                  <a
                    href={api.getViewUrl(outputs.html_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View HTML
                  </a>
                )}

                <button
                  onClick={() => handleDownload("html")}
                  disabled={isGeneratingHTML || isGeneratingPDF}
                  className="px-4 py-2 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-slate-500 text-zinc-900 disabled:text-slate-500 rounded-lg flex items-center gap-2 transition-all text-sm font-medium disabled:cursor-not-allowed"
                >
                  {isGeneratingHTML ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download HTML
                    </>
                  )}
                </button>

                {/* PDF Download */}
                {outputs?.pdf_path && !isGeneratingPDF && (
                  <a
                    href={api.getViewUrl(outputs.pdf_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View PDF
                  </a>
                )}

                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={isGeneratingHTML || isGeneratingPDF}
                  className="px-4 py-2 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-slate-500 text-zinc-900 disabled:text-slate-500 rounded-lg flex items-center gap-2 transition-all text-sm font-medium disabled:cursor-not-allowed"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview - Use LivePreview to show current edited data */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          {!portfolio ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-zinc-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading preview...</p>
            </div>
          ) : (
            <div style={{ height: "calc(100vh - 180px)", overflow: "auto" }}>
              <LivePreview portfolio={portfolio} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
