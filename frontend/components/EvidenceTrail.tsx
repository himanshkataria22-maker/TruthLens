import React from 'react';
import { ExternalLink, Layers, Search, Filter, Cpu, CheckCircle } from 'lucide-react';

interface EvidenceItem {
  title: string;
  url: string;
  snippet: string;
  source_type: string;
  credibility_score: number;
}

interface EvidenceTrailProps {
  evidence?: EvidenceItem[];
}

export default function EvidenceTrail({
  evidence = [
    {
      title: "Authoritative Fact-Check Archive & Global Registry",
      url: "https://example.com/fact-check-archive",
      snippet: "Comprehensive examination corroborating primary source records and context across independent news wire repositories.",
      source_type: "Fact Check Bureau",
      credibility_score: 96
    },
    {
      title: "Official Government & Institutional Registry Portal",
      url: "https://example.com/official-bulletin",
      snippet: "Public record statement confirming official release timing and parameters referenced in claim.",
      source_type: "Official Government Domain",
      credibility_score: 99
    }
  ]
}: EvidenceTrailProps) {
  const steps = [
    { name: "Claim Extractor", icon: Layers, status: "completed", desc: "Atomic claims isolated" },
    { name: "Research Agent", icon: Search, status: "completed", desc: "Multi-source evidence collected" },
    { name: "Credibility Filter", icon: Filter, status: "completed", desc: "High-authority sources ranked" },
    { name: "Verification Agent", icon: Cpu, status: "completed", desc: "Semantic cross-matching verified" },
    { name: "Explanation Agent", icon: CheckCircle, status: "completed", desc: "Transparent reasoning generated" },
  ];

  return (
    <div className="space-y-6">
      {/* 5-Agent Step Visualizer */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          5-Agent Execution Trail
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-slate-950/70 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">0{idx + 1}</span>
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">{step.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence Sources List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Authoritative Evidence Sources ({evidence.length})
        </h3>

        <div className="space-y-3">
          {evidence.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {item.source_type}
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  Credibility: {item.credibility_score}%
                </span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-colors flex items-center gap-1.5 group"
              >
                <span>{item.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </a>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
