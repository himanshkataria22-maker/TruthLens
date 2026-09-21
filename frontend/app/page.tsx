import ClaimInput from "@/components/ClaimInput";
import { ShieldCheck, Cpu, Search, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-indigo-300 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Autonomous Multi-Agent Fact Verification
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Uncover the truth behind any{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            claim or news
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          TruthLens orchestrates a 5-agent sequential intelligence pipeline to extract claims, research multi-source evidence, evaluate domain credibility, and provide transparent verification verdicts.
        </p>
      </div>

      {/* Main Input Component */}
      <ClaimInput />

      {/* Pipeline Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <Cpu className="w-5 h-5 text-indigo-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">5 Specialized Agents</h3>
          <p className="text-xs text-slate-400 mt-1">
            Extractor, Researcher, Credibility Filter, Verifier, and Explainer work in tandem.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <Search className="w-5 h-5 text-violet-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">Deep Evidence Sourcing</h3>
          <p className="text-xs text-slate-400 mt-1">
            Multi-source cross-referencing with domain authority scoring and bias detection.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">Transparent Reasoning</h3>
          <p className="text-xs text-slate-400 mt-1">
            Inspect the full evidence trail and step-by-step logic behind every verdict.
          </p>
        </div>
      </div>
    </div>
  );
}
