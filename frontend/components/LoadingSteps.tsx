'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Sparkles, Search, Filter, ShieldCheck, FileText, Cpu } from 'lucide-react';

const PIPELINE_STEPS = [
  { title: "Extracting claim...", desc: "Isolating core factual statement and detecting language", icon: FileText },
  { title: "Searching sources...", desc: "Querying multi-source news archives and official portals", icon: Search },
  { title: "Checking credibility...", desc: "Scoring domain authority and filtering low-reputation sources", icon: Filter },
  { title: "Verifying evidence...", desc: "Cross-referencing claim semantics against verified reports", icon: ShieldCheck },
  { title: "Writing explanation...", desc: "Synthesizing transparent rationale in user's native language", icon: Sparkles },
];

export default function LoadingSteps() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1400); // Progress every 1.4s

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-card-glass border border-cyan-500/20 animate-fadeIn">
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-cyan-glow">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-white">
          TruthLens Pipeline Active
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          5 specialized AI agents are evaluating the claim in real-time
        </p>
      </div>

      <div className="space-y-4">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_20px_rgba(0,217,255,0.15)] text-white'
                  : 'bg-navy-900/40 border-white/5 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-cyan-400/20 text-cyan-400 shadow-cyan-glow'
                      : 'bg-navy-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold tracking-wide">
                    {step.title}
                  </h4>
                  <p className="text-[11px] opacity-80 leading-tight mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>

              <div>
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-scaleIn" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600 block mr-1.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
