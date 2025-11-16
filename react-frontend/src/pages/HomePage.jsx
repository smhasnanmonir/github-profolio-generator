import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Pencil, Download, Github } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Portfolio Generation</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Transform Your GitHub
            <br />
            Into a Masterpiece
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Let our advanced machine learning models analyze your contributions and create a stunning, professional portfolio in seconds.
          </p>
          
          <button
            onClick={() => navigate('/generate')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/50 hover:scale-105"
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
            gradient="from-blue-500/10 to-cyan-500/10"
            borderColor="border-blue-500/20"
          />
          
          <FeatureCard
            icon={<Pencil className="w-8 h-8" />}
            title="Live Editing"
            description="Fine-tune every detail with our intuitive editor. Real-time preview as you edit."
            gradient="from-purple-500/10 to-pink-500/10"
            borderColor="border-purple-500/20"
          />
          
          <FeatureCard
            icon={<Download className="w-8 h-8" />}
            title="Export Ready"
            description="Download as beautiful HTML or PDF. Ready to share with employers and clients."
            gradient="from-pink-500/10 to-orange-500/10"
            borderColor="border-pink-500/20"
          />
        </div>

        {/* Process Steps */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
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

function FeatureCard({ icon, title, description, gradient, borderColor }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} backdrop-blur-sm border ${borderColor} rounded-xl p-6 hover:scale-105 transition-transform`}>
      <div className="text-blue-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

function ProcessStep({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
        {number}
      </div>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}

