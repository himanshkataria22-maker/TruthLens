'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Layers, CheckCircle, XCircle, MinusCircle, Cpu } from 'lucide-react';

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
          classes: "bg-teal-50 text-teal-800 border-teal-200 font-semibold"
        };
      case 2:
        return {
          label: "Trusted",
          classes: "bg-blue-50 text-blue-800 border-blue-200 font-semibold"
        };
      default:
        return {
          label: "Low confidence",
          classes: "bg-slate-100 text-slate-700 border-slate-300 font-medium"
        };
    }
  };

  const getStanceBadge = (stance: string) => {
    const s = (stance || "").toLowerCase();
    if (s.includes("support")) {
      return {
        label: "supports",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        classes: "bg-emerald-50 text-emerald-800 border-emerald-300"
      };
    } else if (s.includes("contradict") || s.includes("refute") || s.includes("false")) {
      return {
        label: "contradicts",
        icon: <XCircle className="w-3.5 h-3.5" />,
        classes: "bg-rose-50 text-rose-800 border-rose-300"
      };
    } else {
      return {
        label: "neutral",
        icon: <MinusCircle className="w-3.5 h-3.5" />,
        classes: "bg-slate-100 text-slate-700 border-slate-300"
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
    <div className="theme-card p-4 sm:p-7 animate-slide-up space-y-4">
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#22B8CF]/15 flex items-center justify-center text-[#158091] shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading text-base sm:text-lg font-bold text-[#1C2740] group-hover:text-[#22B8CF] transition-colors flex items-center gap-1.5">
              <span>Show Me Why</span>
              <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {evidence.length} {evidence.length === 1 ? 'Source' : 'Sources'}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Inspect verified sources, tier classification, and stance findings
            </p>
          </div>
        </div>

        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#22B8CF] group-hover:text-white transition-all shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="space-y-4 pt-3 border-t border-slate-200 animate-fadeIn">
          {/* Pipeline Timings */}
          {steps && steps.length > 0 && (
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-mono font-semibold text-slate-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#22B8CF]" />
                Agent Pipeline Execution Times
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-1.5 sm:p-2 border border-slate-200 text-center shadow-xs">
                    <div className="text-[9px] sm:text-[10px] font-medium text-slate-500 truncate">{formatStepName(step.name)}</div>
                    <div className="font-mono text-xs font-bold text-[#1C2740] mt-0.5">{step.duration_ms}ms</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources List */}
          {evidence.length === 0 ? (
            <div className="text-center py-5 text-slate-500 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200">
              No specific external sources met the high-credibility threshold for this query.
            </div>
          ) : (
            <div className="space-y-3">
              {evidence.map((item, idx) => {
                const tier = getTierBadge(item.tier);
                const stance = getStanceBadge(item.stance);
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`;

                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 hover:border-[#22B8CF] transition-all duration-200 shadow-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={faviconUrl}
                          alt=""
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="font-mono text-xs font-bold text-[#1C2740]">
                          {item.domain}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${tier.classes}`}>
                          {tier.label}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[11px] sm:text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${stance.classes}`}>
                        {stance.icon}
                        <span>{stance.label}</span>
                      </span>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs sm:text-sm font-semibold text-[#1C2740] hover:text-[#22B8CF] transition-colors flex items-start gap-1 group"
                    >
                      <span className="leading-snug">{item.title}</span>
                      <ExternalLink className="w-3 h-3 mt-1 shrink-0 text-slate-400 group-hover:text-[#22B8CF] transition-colors" />
                    </a>

                    {item.reason && (
                      <div className="text-[11px] sm:text-xs text-[#1C2740] bg-slate-50 rounded-lg p-2.5 border border-slate-100 leading-relaxed">
                        <span className="font-bold text-slate-600 mr-1">Finding:</span>
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
