'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Share2, Copy, Check, Quote, ShieldCheck, ExternalLink } from 'lucide-react';

interface EvidenceItem {
  title: string;
  url: string;
  domain: string;
  tier: number;
  stance: string;
  reason: string;
}

interface VerdictCardProps {
  claim: string;
  verdict: string;
  confidence: number;
  explanation: string;
  evidence?: EvidenceItem[];
  language?: string;
  onReset?: () => void;
}

export default function VerdictCard({
  claim,
  verdict,
  confidence,
  explanation,
  evidence = [],
  language = "en",
  onReset
}: VerdictCardProps) {
  const [copied, setCopied] = useState(false);

  const normalizedVerdict = (verdict || "UNVERIFIABLE").toUpperCase();

  const getVerdictTheme = () => {
    switch (normalizedVerdict) {
      case "SUPPORTED":
        return {
          title: "SUPPORTED",
          badgeBg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
          barGradient: "from-emerald-500 to-teal-400",
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
          glow: "shadow-[0_0_30px_rgba(16,185,129,0.25)]",
          label: "Verified Factual"
        };
      case "FALSE":
        return {
          title: "FALSE",
          badgeBg: "bg-rose-500/15 border-rose-500/40 text-rose-400",
          barGradient: "from-rose-500 to-red-400",
          icon: <XCircle className="w-6 h-6 text-rose-400" />,
          glow: "shadow-[0_0_30px_rgba(239,68,68,0.25)]",
          label: "Debunked / Fake"
        };
      case "MISLEADING":
        return {
          title: "MISLEADING",
          badgeBg: "bg-amber-500/15 border-amber-500/40 text-amber-400",
          barGradient: "from-amber-500 to-yellow-400",
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          glow: "shadow-[0_0_30px_rgba(255,184,0,0.25)]",
          label: "Partly True / Missing Context"
        };
      default:
        return {
          title: "UNVERIFIABLE",
          badgeBg: "bg-slate-500/15 border-slate-500/40 text-slate-300",
          barGradient: "from-slate-500 to-slate-400",
          icon: <HelpCircle className="w-6 h-6 text-slate-300" />,
          glow: "shadow-[0_0_30px_rgba(107,114,128,0.2)]",
          label: "Insufficient Evidence"
        };
    }
  };

  const theme = getVerdictTheme();

  const handleCopy = () => {
    const topLink = evidence?.[0]?.url ? `\nEvidence: ${evidence[0].url}` : '';
    const textToCopy = `🔍 TruthLens Fact-Check:\nVerdict: ${normalizedVerdict} (${confidence}% confidence)\nClaim: "${claim}"\n\nExplanation: ${explanation}${topLink}\n\nChecked with TruthLens AI`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`glass-panel rounded-3xl p-6 sm:p-8 ${theme.glow} transition-all duration-500 relative overflow-hidden border border-white/10`}>
      {/* Top Banner & Verdict Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            TruthLens Verification Verdict
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">Language: <span className="text-slate-200 uppercase font-mono">{language}</span></span>
          </div>
        </div>

        {/* Big Verdict Pill */}
        <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border ${theme.badgeBg} backdrop-blur-md shadow-lg`}>
          {theme.icon}
          <div className="flex flex-col">
            <span className="font-heading text-lg font-extrabold tracking-wider leading-none">
              {theme.title}
            </span>
            <span className="text-[10px] font-medium opacity-90 leading-tight mt-0.5">
              {theme.label}
            </span>
          </div>
        </div>
      </div>

      {/* Quoted Claim */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-navy-900/90 border border-white/10 relative">
        <Quote className="w-6 h-6 text-cyan-400/30 absolute top-3 right-4 pointer-events-none" />
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Extracted Core Claim</span>
        <p className="text-base sm:text-lg font-medium text-slate-100 italic leading-relaxed pr-6">
          "{claim}"
        </p>
      </div>

      {/* Confidence Score Bar */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <span>Confidence Level</span>
          </span>
          <span className="font-mono text-cyan-400 text-sm font-bold">{confidence}%</span>
        </div>
        <div className="w-full h-3 bg-navy-900 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.max(5, confidence)}%` }}
          />
        </div>
      </div>

      {/* Explanation Box */}
      <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-navy-800/60 border border-cyan-500/20 backdrop-blur-sm">
        <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-2">
          <span>Detailed Explanation ({language.toUpperCase()})</span>
        </h4>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
          {explanation}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium border border-white/10 transition-colors"
          >
            &larr; Check Another Claim
          </button>
        )}

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-navy-900 text-xs sm:text-sm font-bold shadow-cyan-glow transition-all duration-200 ml-auto"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-navy-900" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-navy-900" />
              <span>Copy Shareable Result</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
