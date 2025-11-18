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

export default function PreviewPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingHTML, setIsGeneratingHTML] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [needsRegeneration, setNeedsRegeneration] = useState(false);

  // Load portfolio from localStorage - reactive to changes
  useEffect(() => {
    const loadPortfolio = () => {
      const saved = localStorage.getItem(`portfolio_${username}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPortfolio(parsed);
          // Check if we need to regenerate (if outputs exist but portfolio was edited)
          setNeedsRegeneration(true);
        } catch (e) {
          console.error("Failed to parse portfolio:", e);
        }
      }
    };

    loadPortfolio();
    // Listen for storage changes (when user edits in another tab/window)
    window.addEventListener("storage", loadPortfolio);
    return () => window.removeEventListener("storage", loadPortfolio);
  }, [username]);

  // Get latest outputs from backend
  const {
    data: outputs,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["latest-outputs"],
    queryFn: api.getLatestOutputs,
    retry: false,
    refetchInterval: isGeneratingPDF || isGeneratingHTML ? 2000 : false,
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
    onMutate: () => {
      setIsGeneratingHTML(true);
      setIsGeneratingPDF(true);
      setNeedsRegeneration(false);
    },
    onSuccess: () => {
      refetch();
      setTimeout(() => {
        setIsGeneratingHTML(false);
        setIsGeneratingPDF(false);
      }, 3000);
    },
    onError: () => {
      setIsGeneratingHTML(false);
      setIsGeneratingPDF(false);
    },
  });

  // Handle download with auto-regeneration if needed
  const handleDownload = useCallback(
    async (type) => {
      // Reload portfolio to ensure we have latest edits
      const latestPortfolio = JSON.parse(
        localStorage.getItem(`portfolio_${username}`) || "null"
      );

      if (!latestPortfolio) {
        alert("No portfolio data found. Please generate a portfolio first.");
        return;
      }

      // Get current outputs state
      const currentOutputs = outputs;

      // If outputs don't exist or portfolio was edited, regenerate first
      if (!currentOutputs?.html_path || !currentOutputs?.pdf_path || needsRegeneration) {
        // Show loading state
        setIsGeneratingHTML(true);
        setIsGeneratingPDF(true);

        try {
          // Regenerate with latest portfolio data
          await api.generateFromEdited(latestPortfolio);
          // Wait a bit for files to be ready, then refetch
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const refetchedData = await refetch();
          setIsGeneratingHTML(false);
          setIsGeneratingPDF(false);
          setNeedsRegeneration(false);

          // Get updated outputs from refetch
          const updatedOutputs = refetchedData.data || currentOutputs;
          
          // Retry download after regeneration
          setTimeout(() => {
            if (type === "html" && updatedOutputs?.html_path) {
              window.open(api.getDownloadUrl(updatedOutputs.html_path), "_blank");
            } else if (type === "pdf" && updatedOutputs?.pdf_path) {
              window.open(api.getDownloadUrl(updatedOutputs.pdf_path), "_blank");
            }
          }, 1000);
        } catch (error) {
          console.error("Failed to regenerate:", error);
          alert("Failed to regenerate portfolio. Please try again.");
          setIsGeneratingHTML(false);
          setIsGeneratingPDF(false);
        }
      } else {
        // Download existing files
        if (type === "html" && currentOutputs.html_path) {
          window.open(api.getDownloadUrl(currentOutputs.html_path), "_blank");
        } else if (type === "pdf" && currentOutputs.pdf_path) {
          window.open(api.getDownloadUrl(currentOutputs.pdf_path), "_blank");
        }
      }
    },
    [outputs, needsRegeneration, username, refetch]
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
                  Download your portfolio in different formats
                  {needsRegeneration && (
                    <span className="block mt-1 text-yellow-400">
                      ⚠️ Portfolio was edited - click download to regenerate with latest changes
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* HTML Download */}
                {outputs?.html_path && !isGeneratingHTML ? (
                  <>
                    <a
                      href={api.getViewUrl(outputs.html_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View HTML
                    </a>

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
                  </>
                ) : isGeneratingHTML ? (
                  <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-slate-400 rounded-lg flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating HTML...
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownload("html")}
                    disabled={isGeneratingHTML || isGeneratingPDF}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingHTML ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Generate & Download HTML
                      </>
                    )}
                  </button>
                )}

                {/* PDF Download */}
                {outputs?.pdf_path && !isGeneratingPDF ? (
                  <>
                    <a
                      href={api.getViewUrl(outputs.pdf_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View PDF
                    </a>

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
                  </>
                ) : isGeneratingPDF ? (
                  <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-slate-400 rounded-lg flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownload("pdf")}
                    disabled={isGeneratingHTML || isGeneratingPDF}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg flex items-center gap-2 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Generate & Download PDF
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-zinc-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading preview...</p>
            </div>
          ) : outputs?.html_path ? (
            <iframe
              src={api.getViewUrl(outputs.html_path)}
              className="w-full"
              style={{ height: "calc(100vh - 180px)" }}
              title="Portfolio Preview"
            />
          ) : (
            <div className="p-12 text-center">
              <div className="mb-6">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">
                  HTML preview not available yet.
                </p>
                <p className="text-slate-500 text-sm">
                  Click "Regenerate" to create HTML and PDF outputs.
                </p>
              </div>
              <button
                onClick={() => regenerateMutation.mutate()}
                disabled={regenerateMutation.isPending}
                className="px-6 py-3 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-zinc-900 disabled:text-slate-500 rounded-lg transition-all disabled:cursor-not-allowed"
              >
                {regenerateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Portfolio"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Generation Status */}
        {(isGeneratingHTML || isGeneratingPDF) && (
          <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-4">
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
              <div className="flex-1">
                <div className="flex items-center gap-3 text-sm">
                  {isGeneratingHTML && (
                    <span className="text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Generating HTML
                    </span>
                  )}
                  {isGeneratingPDF && (
                    <span className="text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                      Generating PDF
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
