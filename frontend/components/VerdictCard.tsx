import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ShieldCheck } from 'lucide-react';

interface VerdictCardProps {
  verdict?: string;
  confidence?: number;
  statement?: string;
  explanation?: string;
}

export default function VerdictCard({
  verdict = "Verified True",
  confidence = 94,
  statement = "Sample evaluated statement",
  explanation = "Our multi-agent consensus system gathered multi-source authoritative reporting and fact checks confirming this claim."
}: VerdictCardProps) {
  const getBadgeStyle = () => {
    switch (verdict.toLowerCase()) {
      case 'verified':
      case 'true':
      case 'verified true':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        };
      case 'false':
      case 'debunked':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: <XCircle className="w-5 h-5 text-rose-400" />
        };
      case 'partially true':
      case 'misleading':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          icon: <HelpCircle className="w-5 h-5 text-slate-400" />
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Verification Result</span>
          <h2 className="text-xl font-bold text-white mt-1">{statement}</h2>
        </div>
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-semibold ${badge.bg}`}>
          {badge.icon}
          <span>{verdict}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-slate-400 font-medium mb-1.5">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Pipeline Confidence Score</span>
            <span className="text-indigo-300 font-bold">{confidence}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/70">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Synthesized Reasoning</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
