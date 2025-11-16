import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import { extractGitHubUsername, isValidGitHubUsername } from '../utils/github';

export default function GeneratePage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('idle'); // idle, fetching, analyzing, complete
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      token: localStorage.getItem('gh_token') || '',
      profile: localStorage.getItem('gh_profile') || '',
    },
  });

  // Watch profile field for real-time username extraction
  const profileValue = watch('profile');
  const extractedUsername = profileValue ? extractGitHubUsername(profileValue) : '';

  const generateMutation = useMutation({
    mutationFn: ({ token, profile }) => api.generatePortfolio(token, profile),
    onMutate: () => {
      setStage('fetching');
    },
    onSuccess: (data) => {
      setStage('complete');
      // Save credentials
      const formData = watch();
      localStorage.setItem('gh_token', formData.token);
      localStorage.setItem('gh_profile', formData.profile);
      
      // Store portfolio data
      localStorage.setItem(`portfolio_${data.portfolio?.meta?.github_username}`, JSON.stringify(data.portfolio));
      
      // Navigate to editor after 2 seconds
      setTimeout(() => {
        navigate(`/edit/${data.portfolio?.meta?.github_username}`);
      }, 2000);
    },
    onError: () => {
      setStage('idle');
    },
  });

  useEffect(() => {
    if (stage === 'fetching') {
      // Simulate analysis stage after 2 seconds
      const timer = setTimeout(() => setStage('analyzing'), 2000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const onSubmit = (data) => {
    // Extract username from URL or use as-is
    const username = extractGitHubUsername(data.profile);
    
    // Validate username format
    if (!isValidGitHubUsername(username)) {
      generateMutation.mutate({
        ...data,
        profile: data.profile, // Keep original for error context
      });
      return;
    }
    
    // Send validated username to API
    generateMutation.mutate({
      token: data.token,
      profile: username, // Use extracted username
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Generate Your Portfolio
            </h1>
            <p className="text-slate-400">
              Enter your GitHub credentials to get started
            </p>
          </div>

          {/* Form */}
          {stage === 'idle' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🔑 GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  {...register('token', { required: 'Token is required' })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  autoComplete="off"
                />
                {errors.token && (
                  <p className="mt-2 text-sm text-red-400">{errors.token.message}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  Required for accessing GitHub API
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  👤 GitHub Username or Profile URL
                </label>
                <input
                  type="text"
                  {...register('profile', { required: 'Profile is required' })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="torvalds or https://github.com/torvalds"
                />
                {errors.profile && (
                  <p className="mt-2 text-sm text-red-400">{errors.profile.message}</p>
                )}
                {extractedUsername && extractedUsername !== profileValue && (
                  <p className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Will use username: <span className="font-semibold">{extractedUsername}</span>
                  </p>
                )}
                {extractedUsername && !isValidGitHubUsername(extractedUsername) && (
                  <p className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Username format may be invalid
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed"
              >
                Generate with AI
              </button>
            </form>
          )}

          {/* Loading States */}
          {(stage === 'fetching' || stage === 'analyzing') && (
            <LoadingState stage={stage} />
          )}

          {/* Success State */}
          {stage === 'complete' && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Portfolio Generated!
              </h2>
              <p className="text-slate-400 mb-4">
                Redirecting to editor...
              </p>
              <div className="w-12 h-12 mx-auto">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              </div>
            </div>
          )}

          {/* Error State */}
          {generateMutation.isError && stage === 'idle' && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-1">
                    Generation Failed
                  </h3>
                  <p className="text-sm text-red-300">
                    {generateMutation.error?.message || 'An unexpected error occurred'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Don't have a token?{' '}
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Generate one here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingState({ stage }) {
  const stages = [
    { key: 'fetching', label: 'Fetching GitHub data...', icon: '🔍' },
    { key: 'analyzing', label: 'AI models analyzing...', icon: '🧠' },
  ];

  return (
    <div className="py-12">
      <div className="flex flex-col items-center gap-8">
        <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
        
        <div className="space-y-4 w-full max-w-md">
          {stages.map((s, index) => {
            const isActive = s.key === stage;
            const isComplete = stages.findIndex(st => st.key === stage) > index;
            
            return (
              <div
                key={s.key}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : isComplete
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <p className={`font-medium ${
                    isActive ? 'text-blue-300' : isComplete ? 'text-green-300' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </p>
                </div>
                {isComplete && <CheckCircle className="w-5 h-5 text-green-400" />}
                {isActive && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

