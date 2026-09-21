'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ShieldCheck, CheckCircle, XCircle, MinusCircle, Layers, Check, Cpu } from 'lucide-react';

interface EvidenceItem {
  title: string;
  url: string;
  domain: string;
  tier: number;
  stance: string;
  reason: string;
}

interface StepLog {
  name: string;
  duration_ms: number;
}

interface EvidenceTrailProps {
  evidence: EvidenceItem[];
  steps?: StepLog[];
}

export default function EvidenceTrail({ evidence = [], steps = [] }: EvidenceTrailProps) {
  const [isOpen, setIsOpen] = useState(true);

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1:
        return {
          label: "Official",
          classes: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
        };
      case 2:
        return {
          label: "Trusted",
          classes: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
        };
      default:
        return {
          label: "Low confidence",
          classes: "bg-amber-500/15 text-amber-300 border-amber-500/30"
        };
    }
  };

  const getStanceBadge = (stance: string) => {
    const s = (stance || "").toLowerCase();
    if (s.includes("support")) {
      return {
        label: "supports",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      };
    } else if (s.includes("contradict") || s.includes("refute") || s.includes("false")) {
      return {
        label: "contradicts",
        icon: <XCircle className="w-3.5 h-3.5" />,
        classes: "bg-rose-500/15 text-rose-400 border-rose-500/30"
      };
    } else {
      return {
        label: "neutral",
        icon: <MinusCircle className="w-3.5 h-3.5" />,
        classes: "bg-slate-500/15 text-slate-400 border-slate-500/30"
      };
    }
  };

  const formatStepName = (name: string) => {
    switch (name) {
      case "claim_extraction":
        return "1. Claim Extractor";
      case "web_research":
        return "2. Research Agent";
      case "credibility_filtering":
        return "3. Credibility Filter";
      case "claim_verification":
        return "4. Verification Agent";
      case "explanation_generation":
        return "5. Explanation Agent";
      default:
        return name.replace(/_/g, " ");
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 transition-all duration-300">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
              <span>Show Me Why</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-navy-800 text-slate-300 border border-white/10">
                {evidence.length} {evidence.length === 1 ? 'Source' : 'Sources'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Inspect verified sources, tier classification, and multi-agent reasoning
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 border border-white/10 transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="mt-6 space-y-6 pt-5 border-t border-white/10 animate-fadeIn">
          {/* Agent Pipeline Steps Timings if available */}
          {steps && steps.length > 0 && (
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-white/5">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Pipeline Execution Timings
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="bg-navy-800/60 rounded-xl p-2.5 border border-white/5 text-center">
                    <div className="text-[10px] text-slate-400 truncate">{formatStepName(step.name)}</div>
                    <div className="font-mono text-xs font-semibold text-slate-200 mt-0.5">{step.duration_ms}ms</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources List */}
          {evidence.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              No specific external sources met the credibility threshold for this query.
            </div>
          ) : (
            <div className="space-y-4">
              {evidence.map((item, idx) => {
                const tier = getTierBadge(item.tier);
                const stance = getStanceBadge(item.stance);

                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-navy-900/70 border border-white/10 hover:border-cyan-500/30 transition-all duration-200 space-y-3"
                  >
                    {/* Header with Domain & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-300">
                          {item.domain || "Web Source"}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tier.classes}`}>
                          {tier.label}
                        </span>
                      </div>

                      {/* Stance Chip */}
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${stance.classes}`}>
                        {stance.icon}
                        <span>{stance.label}</span>
                      </span>
                    </div>

                    {/* Title with link */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm sm:text-base font-semibold text-slate-100 hover:text-cyan-400 transition-colors group flex items-start gap-1.5"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 mt-1 shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </a>

                    {/* Reason */}
                    {item.reason && (
                      <div className="text-xs text-slate-300 bg-navy-800/80 rounded-xl p-3 border border-white/5">
                        <span className="font-semibold text-slate-400 mr-1">Agent Finding:</span>
                        {item.reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
