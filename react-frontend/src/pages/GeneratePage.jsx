import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import api from "../services/api";
import { extractGitHubUsername, isValidGitHubUsername } from "../utils/github";

export default function GeneratePage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("idle"); // idle, fetching, analyzing, generating_html, generating_pdf, complete
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      token: localStorage.getItem("gh_token") || "",
      profile: localStorage.getItem("gh_profile") || "",
    },
  });

  // Watch profile field for real-time username extraction
  const profileValue = watch("profile");
  const extractedUsername = profileValue
    ? extractGitHubUsername(profileValue)
    : "";

  const generateMutation = useMutation({
    mutationFn: ({ token, profile }) => api.generatePortfolio(token, profile),
    onMutate: () => {
      setStage("fetching");
    },
    onSuccess: (data) => {
      setStage("complete");
      // Save credentials
      const formData = watch();
      localStorage.setItem("gh_token", formData.token);
      localStorage.setItem("gh_profile", extractedUsername);

      // Filter to top 5 skills and top 3 projects
      const allSkills = Array.isArray(data.portfolio?.skills)
        ? data.portfolio.skills
        : [];
      const filteredPortfolio = {
        ...data.portfolio,
        skills: allSkills.slice(0, 5),
        top_projects: (data.portfolio?.top_projects || []).slice(0, 3),
      };

      // Store both filtered and full data (including raw repositories)
      localStorage.setItem(
        `portfolio_${data.portfolio?.meta?.github_username}`,
        JSON.stringify(filteredPortfolio)
      );

      // Store full data with raw repositories for "Add from GitHub" feature
      const fullData = {
        portfolio: data.portfolio,
        skills: allSkills,
        raw_data: {
          repositories: data.repositories || data.raw_data?.repositories || [],
          user: data.user || data.raw_data?.user || {},
        },
        meta: data.meta,
      };

      localStorage.setItem(
        `portfolio_full_${data.portfolio?.meta?.github_username}`,
        JSON.stringify(fullData)
      );

      // Navigate to editor after 1.5 seconds
      setTimeout(() => {
        navigate(`/edit/${data.portfolio?.meta?.github_username}`);
      }, 1500);
    },
    onError: () => {
      setStage("idle");
    },
  });

  useEffect(() => {
    if (stage === "fetching") {
      const timer = setTimeout(() => setStage("analyzing"), 2000);
      return () => clearTimeout(timer);
    } else if (stage === "analyzing") {
      const timer = setTimeout(() => setStage("generating_html"), 2500);
      return () => clearTimeout(timer);
    } else if (stage === "generating_html") {
      const timer = setTimeout(() => setStage("generating_pdf"), 2000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const onSubmit = (data) => {
    const username = extractGitHubUsername(data.profile);

    if (!isValidGitHubUsername(username)) {
      generateMutation.mutate({
        ...data,
        profile: data.profile,
      });
      return;
    }

    generateMutation.mutate({
      token: data.token,
      profile: username,
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Main Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Generate Your Portfolio
            </h1>
            <p className="text-slate-400">
              Enter your GitHub credentials to get started
            </p>
          </div>

          {/* Form */}
          {stage === "idle" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  {...register("token", { required: "Token is required" })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  autoComplete="off"
                />
                {errors.token && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.token.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  Required for accessing GitHub API
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GitHub Username or Profile URL
                </label>
                <input
                  type="text"
                  {...register("profile", { required: "Profile is required" })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
                  placeholder="torvalds or https://github.com/torvalds"
                />
                {errors.profile && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.profile.message}
                  </p>
                )}
                {extractedUsername && extractedUsername !== profileValue && (
                  <p className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Will use username:{" "}
                    <span className="font-semibold">{extractedUsername}</span>
                  </p>
                )}
                {extractedUsername &&
                  !isValidGitHubUsername(extractedUsername) && (
                    <p className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Username format may be invalid
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="w-full px-6 py-4 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-zinc-900 disabled:text-zinc-500 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
              >
                Generate with AI
              </button>
            </form>
          )}

          {/* Loading States */}
          {stage !== "idle" && stage !== "complete" && (
            <LoadingState stage={stage} />
          )}

          {/* Success State */}
          {stage === "complete" && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Portfolio Generated!
              </h2>
              <p className="text-slate-400 mb-4">Redirecting to editor...</p>
              <div className="w-12 h-12 mx-auto">
                <Loader2 className="w-12 h-12 text-zinc-400 animate-spin" />
              </div>
            </div>
          )}

          {/* Error State */}
          {generateMutation.isError && stage === "idle" && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-1">
                    Generation Failed
                  </h3>
                  <p className="text-sm text-red-300">
                    {generateMutation.error?.message ||
                      "An unexpected error occurred"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Don't have a token?{" "}
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
    { key: "fetching", label: "Fetching GitHub data...", icon: "📥" },
    { key: "analyzing", label: "AI models analyzing...", icon: "🧠" },
    {
      key: "generating_html",
      label: "Generating HTML portfolio...",
      icon: "📄",
    },
    { key: "generating_pdf", label: "Generating PDF portfolio...", icon: "📑" },
  ];

  return (
    <div className="py-12">
      <div className="flex flex-col items-center gap-8">
        <Loader2 className="w-16 h-16 text-zinc-400 animate-spin" />

        <div className="space-y-3 w-full max-w-md">
          {stages.map((s, index) => {
            const currentIndex = stages.findIndex((st) => st.key === stage);
            const isActive = s.key === stage;
            const isComplete = currentIndex > index;

            return (
              <div
                key={s.key}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  isActive
                    ? "bg-zinc-800 border border-zinc-700"
                    : isComplete
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-zinc-900 border border-zinc-800"
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <p
                    className={`font-medium text-sm ${
                      isActive
                        ? "text-white"
                        : isComplete
                        ? "text-green-400"
                        : "text-slate-500"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
                {isComplete && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {isActive && (
                  <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
