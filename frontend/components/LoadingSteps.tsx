'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Search, Filter, ShieldCheck, FileText, Cpu } from 'lucide-react';

const PIPELINE_STEPS = [
  { key: "claim_extraction", title: "Extracting claim...", desc: "Isolating core factual statement and detecting language", icon: FileText },
  { key: "web_research", title: "Searching sources...", desc: "Querying multi-source news archives and official portals", icon: Search },
  { key: "credibility_filtering", title: "Checking credibility...", desc: "Scoring domain authority and filtering low-reputation sources", icon: Filter },
  { key: "claim_verification", title: "Verifying evidence...", desc: "Cross-referencing claim semantics against verified reports", icon: ShieldCheck },
  { key: "explanation_generation", title: "Writing explanation...", desc: "Synthesizing transparent rationale in user's native language", icon: Sparkles },
];

interface LoadingStepsProps {
  completedSteps?: string[];
}

export default function LoadingSteps({ completedSteps = [] }: LoadingStepsProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Update currentStepIndex based on completed steps
    const completedCount = completedSteps.length;
    if (completedCount > currentStepIndex) {
      setCurrentStepIndex(completedCount);
    }
  }, [completedSteps, currentStepIndex]);

  // Fallback timer if no real events arrive
  useEffect(() => {
    if (completedSteps.length === 0) {
      const timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < PIPELINE_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1400);

      return () => clearInterval(timer);
    }
  }, [completedSteps.length]);

  return (
    <div className="theme-card p-6 sm:p-8 max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#22B8CF]/15 flex items-center justify-center text-[#158091] mx-auto">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#1C2740]">
          TruthLens Pipeline Active
        </h2>
        <p className="text-sm text-slate-500">
          5 specialized AI agents are evaluating the claim in sequence
        </p>
      </div>

      <div className="space-y-3">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = completedSteps.includes(step.key) || idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex && !completedSteps.includes(step.key);

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                isDone
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : isCurrent
                  ? 'bg-[#E3FAFC] border-[#22B8CF] shadow-xs text-[#1C2740]'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#22B8CF] text-white shadow-sm'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold">
                    {step.title}
                  </h4>
                  <p className="text-[11px] opacity-80 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>

              <div>
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <span className="w-3 h-3 rounded-full bg-[#22B8CF] block animate-pulse-dot" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 block mr-1" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
