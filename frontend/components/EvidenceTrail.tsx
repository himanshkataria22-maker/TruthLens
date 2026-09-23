'use client';

import React, { useState } from 'react';
import { ChevronDown, ExternalLink, Layers, Check, X, MinusCircle, Cpu } from 'lucide-react';

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
          label: "Official Tier 1",
          classes: "bg-teal-50 text-teal-800 border-teal-200 font-semibold"
        };
      case 2:
        return {
          label: "Trusted Tier 2",
          classes: "bg-blue-50 text-blue-800 border-blue-200 font-semibold"
        };
      default:
        return {
          label: "General Tier 3",
          classes: "bg-slate-100 text-slate-700 border-slate-300 font-medium"
        };
    }
  };

  const getStanceBadge = (stance: string) => {
    const s = (stance || "").toLowerCase();
    if (s.includes("support")) {
      return {
        label: "supports claim",
        icon: <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />,
        iconBg: "bg-emerald-100 text-emerald-700",
        classes: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
      };
    } else if (s.includes("contradict") || s.includes("refute") || s.includes("false")) {
      return {
        label: "contradicts claim",
        icon: <X className="w-3 h-3 text-rose-700 stroke-[3]" />,
        iconBg: "bg-rose-100 text-rose-700",
        classes: "bg-rose-50 text-rose-800 border-rose-300 font-bold"
      };
    } else {
      return {
        label: "neutral context",
        icon: <MinusCircle className="w-3 h-3 text-slate-600" />,
        iconBg: "bg-slate-100 text-slate-600",
        classes: "bg-slate-100 text-slate-700 border-slate-300 font-medium"
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
    <div
      className="p-4 sm:p-7 animate-slide-up space-y-3 shadow-lg rounded-xl border border-slate-200"
      style={{
        background: '#FFFFFF',
      }}
    >
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#22B8CF]/25 flex items-center justify-center text-[#22B8CF] shrink-0 shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#22B8CF] transition-colors flex items-center gap-2">
              <span>Show Me Why</span>
              <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {evidence.length} {evidence.length === 1 ? 'Source' : 'Sources'}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600">
              Inspect verified sources, tier classification, and stance findings
            </p>
          </div>
        </div>

        {/* 180° Rotating Chevron */}
        <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#22B8CF] group-hover:text-white transition-all duration-300 shrink-0 ${isOpen ? 'bg-[#22B8CF] text-white' : ''}`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>
      </button>

      {/* Accordion Content with Smooth Height & Fade Transition */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100 pt-3' : 'grid-rows-[0fr] opacity-0 pt-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden space-y-4">
          <div className="border-t border-slate-200 pt-3 space-y-4">
            {/* Pipeline Timings */}
            {steps && steps.length > 0 && (
              <div
                className="p-3 sm:p-4 rounded-xl border border-slate-200"
                style={{
                  background: '#F5F7FB',
                }}
              >
                <span className="text-[11px] font-mono font-semibold text-slate-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#22B8CF]" />
                  Agent Pipeline Execution Times
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg p-1.5 sm:p-2 text-center border border-slate-200"
                      style={{
                        background: '#FFFFFF',
                      }}
                    >
                      <div className="text-[9px] sm:text-[10px] font-medium text-slate-600 truncate">{formatStepName(step.name)}</div>
                      <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">{step.duration_ms}ms</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources List */}
            {evidence.length === 0 ? (
              <div
                className="text-center py-5 text-slate-600 text-xs sm:text-sm rounded-xl border border-slate-200"
                style={{
                  background: '#F5F7FB',
                }}
              >
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
                      className="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-[#22B8CF] transition-all duration-200 space-y-2.5"
                      style={{
                        background: '#FFFFFF',
                      }}
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
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {item.domain}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${tier.classes}`}>
                            {tier.label}
                          </span>
                        </div>

                        {/* Stance Badge with Small Checkmark or Cross Icon */}
                        <span className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${stance.classes}`}>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center ${stance.iconBg}`}>
                            {stance.icon}
                          </span>
                          <span>{stance.label}</span>
                        </span>
                      </div>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#22B8CF] transition-colors flex items-start gap-1 group"
                      >
                        <span className="leading-snug">{item.title}</span>
                        <ExternalLink className="w-3 h-3 mt-1 shrink-0 text-slate-400 group-hover:text-[#22B8CF] transition-colors" />
                      </a>

                      {item.reason && (
                        <div className="text-[11px] sm:text-xs text-slate-700 rounded-lg p-2.5 border border-slate-200 leading-relaxed" style={{ background: '#FAFBFC' }}>
                          <span className="font-bold text-slate-800 mr-1">Finding:</span>
                          {item.reason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
