import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Pencil, Download, Github } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Portfolio Generation</span>
          </div>

          <h1 className="text-6xl font-bold mb-6 text-white">
            Transform Your GitHub
            <br />
            Into a Masterpiece
          </h1>

          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Let our advanced machine learning models analyze your contributions
            and create a stunning, professional portfolio in seconds.
          </p>

          <button
            onClick={() => navigate("/generate")}
            className="px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg font-semibold text-lg transition-all"
          >
            <span className="flex items-center gap-2">
              Generate Portfolio
              <Github className="w-5 h-5" />
            </span>
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="ML-Powered Analysis"
            description="Advanced models analyze your coding patterns, skills, and project impact automatically."
          />

          <FeatureCard
            icon={<Pencil className="w-8 h-8" />}
            title="Live Editing"
            description="Fine-tune every detail with our intuitive editor. Real-time preview as you edit."
          />

          <FeatureCard
            icon={<Download className="w-8 h-8" />}
            title="Export Ready"
            description="Download as beautiful HTML or PDF. Ready to share with employers and clients."
          />
        </div>

        {/* Process Steps */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <ProcessStep
              number="1"
              title="Connect"
              description="Enter your GitHub username and access token"
            />
            <ProcessStep
              number="2"
              title="Analyze"
              description="AI models process your repositories and contributions"
            />
            <ProcessStep
              number="3"
              title="Edit"
              description="Customize your portfolio with our live editor"
            />
            <ProcessStep
              number="4"
              title="Export"
              description="Download HTML & PDF, ready to impress"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
      <div className="text-zinc-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

function ProcessStep({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
        {number}
      </div>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
