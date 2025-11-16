import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function PreviewPage() {
  const { username } = useParams();
  const navigate = useNavigate();

  // Load portfolio from localStorage
  const portfolio = JSON.parse(localStorage.getItem(`portfolio_${username}`) || 'null');

  // Get latest outputs from backend
  const { data: outputs } = useQuery({
    queryKey: ['latest-outputs'],
    queryFn: api.getLatestOutputs,
    retry: false,
  });

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Portfolio not found</p>
          <button
            onClick={() => navigate('/generate')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all"
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
        <div className="flex items-center justify-between mb-6">
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
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>

            {outputs?.html_path && (
              <>
                <a
                  href={api.getViewUrl(outputs.html_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View HTML
                </a>
                
                <a
                  href={api.getDownloadUrl(outputs.html_path)}
                  download
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download HTML
                </a>
              </>
            )}

            {outputs?.pdf_path && (
              <a
                href={api.getDownloadUrl(outputs.pdf_path)}
                download
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white rounded-lg flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          {outputs?.html_path ? (
            <iframe
              src={api.getViewUrl(outputs.html_path)}
              className="w-full"
              style={{ height: 'calc(100vh - 180px)' }}
              title="Portfolio Preview"
            />
          ) : (
            <div className="p-12 text-center">
              <p className="text-slate-400 mb-4">
                HTML preview not available. Generate portfolio first.
              </p>
              <button
                onClick={() => navigate('/generate')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all"
              >
                Generate Portfolio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

