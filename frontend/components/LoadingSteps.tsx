'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Loader2, FileText, Search, Filter, ShieldCheck, Sparkles, Cpu } from 'lucide-react';

export const PIPELINE_STEPS = [
  {
    key: "claim_extraction",
    stepNum: 1,
    title: "1. Extracting claim...",
    desc: "Isolating core factual statement & detecting language",
    icon: FileText
  },
  {
    key: "web_research",
    stepNum: 2,
    title: "2. Searching sources...",
    desc: "Querying multi-source news archives & factual registries",
    icon: Search
  },
  {
    key: "credibility_filtering",
    stepNum: 3,
    title: "3. Ranking credibility...",
    desc: "Evaluating domain authority & filtering low-reputation sources",
    icon: Filter
  },
  {
    key: "claim_verification",
    stepNum: 4,
    title: "4. Verifying evidence...",
    desc: "Cross-referencing claim semantics against verified reports",
    icon: ShieldCheck
  },
  {
    key: "explanation_generation",
    stepNum: 5,
    title: "5. Generating explanation...",
    desc: "Synthesizing transparent verdict & reasoning trail",
    icon: Sparkles
  },
];

interface LoadingStepsProps {
  claimText?: string;
  completedBackendSteps?: string[];
  isBackendComplete?: boolean;
  onComplete?: () => void;
  onError?: (errMessage: string) => void;
}

export default function LoadingSteps({
  claimText = "",
  completedBackendSteps = [],
  isBackendComplete = false,
  onComplete,
  onError
}: LoadingStepsProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const isFinishedRef = useRef(false);

  // 45-second hard timeout guard to prevent infinite loading spinner if connection drops
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isBackendComplete && !isFinishedRef.current) {
        if (onError) {
          onError("Verification pipeline request timed out after 45 seconds. Please try again.");
        }
      }
    }, 45000);
    return () => clearTimeout(timeoutId);
  }, [isBackendComplete, onError]);

  // 520ms per step = ~2.6s total minimum animation duration across 5 steps
  const STEP_DURATION_MS = 520;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prevActive) => {
        if (prevActive < PIPELINE_STEPS.length - 1) {
          const nextIndex = prevActive + 1;
          setCompletedSteps((prevCompleted) => {
            if (!prevCompleted.includes(prevActive)) {
              return [...prevCompleted, prevActive];
            }
            return prevCompleted;
          });
          return nextIndex;
        } else {
          // Reached last step (index 4)
          if (isBackendComplete && !isFinishedRef.current) {
            setCompletedSteps((prevCompleted) => {
              if (!prevCompleted.includes(4)) {
                return [...prevCompleted, 4];
              }
              return prevCompleted;
            });
            isFinishedRef.current = true;
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 400);
          }
          return prevActive;
        }
      });
    }, STEP_DURATION_MS);

    return () => clearInterval(timer);
  }, [isBackendComplete, onComplete]);

  // Handle case where backend completes while already on step 5
  useEffect(() => {
    if (isBackendComplete && activeStepIndex === PIPELINE_STEPS.length - 1 && !isFinishedRef.current) {
      setCompletedSteps((prev) => {
        if (!prev.includes(4)) return [...prev, 4];
        return prev;
      });
      isFinishedRef.current = true;
      const timeout = setTimeout(() => {
        if (onComplete) onComplete();
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [isBackendComplete, activeStepIndex, onComplete]);

  const progressPercentage = Math.min(
    100,
    Math.round(((completedSteps.length + (activeStepIndex >= 0 ? 0.5 : 0)) / PIPELINE_STEPS.length) * 100)
  );

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-6 animate-slide-up shadow-xl border border-white/80 bg-transparent">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>Multi-Agent Pipeline Active</span>
        </div>

        <h2 className="font-heading text-2xl font-extrabold text-yellow-300 tracking-tight">
          Verifying Claim...
        </h2>

        {claimText && (
          <div className="bg-gray-600/40 border border-gray-400/50 rounded-xl p-3 text-xs text-gray-200 italic font-medium max-w-lg mx-auto truncate shadow-inner">
            &ldquo;{claimText}&rdquo;
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#00D9FF] to-[#22B8CF] h-2 rounded-full transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 5-Step List */}
      <div className="space-y-3 pt-1">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = completedSteps.includes(idx);
          const isActive = idx === activeStepIndex && !isDone;

          return (
            <div
              key={step.key}
              className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                isDone
                  ? 'bg-emerald-50/90 border-emerald-300/80 text-[#0A1128] shadow-xs'
                  : isActive
                  ? 'bg-[#E3FAFC] border-[#00D9FF] text-[#0A1128] shadow-md ring-2 ring-[#00D9FF]/20 scale-[1.01]'
                  : 'bg-slate-50/60 border-slate-200/80 text-slate-400 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Step Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isActive
                      ? 'bg-[#00D9FF] text-[#0A1128] shadow-xs'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Step Text */}
                <div>
                  <h3
                    className={`font-heading text-sm font-bold transition-colors ${
                      isDone || isActive ? 'text-[#0A1128]' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDone
                        ? 'text-emerald-700 font-medium'
                        : isActive
                        ? 'text-[#0A1128]/80 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Status Badge: Spinner vs Checkmark vs Number */}
              <div className="shrink-0 flex items-center justify-center">
                {isDone ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs animate-scale-in">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : isActive ? (
                  <div className="w-7 h-7 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-[#00D9FF]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300/80 flex items-center justify-center text-[10px] font-mono text-slate-400">
                    {step.stepNum}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
