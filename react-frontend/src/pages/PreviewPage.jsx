import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, ExternalLink, Loader2, FileText, FileType } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';

export default function PreviewPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingHTML, setIsGeneratingHTML] = useState(false);

  // Load portfolio from localStorage
  const portfolio = JSON.parse(localStorage.getItem(`portfolio_${username}`) || 'null');

  // Get latest outputs from backend
  const { data: outputs, isLoading, refetch } = useQuery({
    queryKey: ['latest-outputs'],
    queryFn: api.getLatestOutputs,
    retry: false,
    refetchInterval: isGeneratingPDF || isGeneratingHTML ? 2000 : false,
  });

  // Regenerate portfolio mutation
  const regenerateMutation = useMutation({
    mutationFn: () => {
      const token = localStorage.getItem('gh_token');
      return api.generatePortfolio(token, username);
    },
    onMutate: () => {
      setIsGeneratingHTML(true);
      setIsGeneratingPDF(true);
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

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Portfolio not found</p>
          <button
            onClick={() => navigate('/generate')}
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
                <h3 className="text-sm font-medium text-white mb-1">Export Portfolio</h3>
                <p className="text-xs text-slate-400">Download your portfolio in different formats</p>
              </div>
              <div className="flex items-center gap-3">
                {/* HTML Download */}
                {outputs?.html_path ? (
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
                    
                    <a
                      href={api.getDownloadUrl(outputs.html_path)}
                      download
                      className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg flex items-center gap-2 transition-all text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download HTML
                    </a>
                  </>
                ) : isGeneratingHTML ? (
                  <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-slate-400 rounded-lg flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating HTML...
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-slate-500 rounded-lg text-sm">
                    HTML not ready
                  </div>
                )}

                {/* PDF Download */}
                {outputs?.pdf_path ? (
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
                    
                    <a
                      href={api.getDownloadUrl(outputs.pdf_path)}
                      download
                      className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg flex items-center gap-2 transition-all text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                  </>
                ) : isGeneratingPDF ? (
                  <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-slate-400 rounded-lg flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-slate-500 rounded-lg text-sm">
                    PDF not ready
                  </div>
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
              style={{ height: 'calc(100vh - 180px)' }}
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
                  'Generate Portfolio'
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
