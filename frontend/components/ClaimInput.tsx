'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle, RefreshCw, Layers } from 'lucide-react';

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

export interface VerificationResult {
  claim: string;
  language: string;
  verdict: string;
  confidence: number;
  explanation: string;
  evidence: EvidenceItem[];
  steps: StepLog[];
}

interface ClaimInputProps {
  onStartVerification?: () => void;
  onVerificationComplete?: (data: VerificationResult) => void;
  onError?: (errMessage: string) => void;
  isLoading?: boolean;
}

const SAMPLE_CHIPS = [
  {
    tag: "🇮🇳 Hindi Viral",
    text: "सावधान! 500 रुपये के नए नोट में अगर हरी पट्टी गांधी जी के पास नहीं है तो वह नोट नकली है।"
  },
  {
    tag: "🌐 Viral Hoax",
    text: "UNESCO has officially declared the Indian National Anthem Jana Gana Mana as the best national anthem in the world."
  },
  {
    tag: "🏏 Verified Fact",
    text: "India won the ICC Men's T20 World Cup in June 2024 by defeating South Africa in Barbados."
  }
];

export default function ClaimInput({
  onStartVerification,
  onVerificationComplete,
  onError,
  isLoading = false
}: ClaimInputProps) {
  const [text, setText] = useState('');

  const handleChipClick = (sampleText: string) => {
    setText(sampleText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    if (onStartVerification) onStartVerification();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

      const res = await fetch(`${apiUrl}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const data: VerificationResult = await res.json();
      if (onVerificationComplete) {
        onVerificationComplete(data);
      }
    } catch (err: any) {
      let msg = "Could not connect to TruthLens verification server. Make sure the backend is running on port 8000.";
      if (err.name === "AbortError") {
        msg = "Verification request timed out. The server took longer than 30 seconds to respond.";
      }
      if (onError) onError(msg);
    }
  };

  const charCount = text.length;

  return (
    <div className="w-full space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time Multi-Agent Truth Verification</span>
        </div>
        
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Verify before you <span className="text-cyan-400 underline decoration-cyan-500/40 underline-offset-8">share</span>
        </h1>
        
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          AI-powered truth verification for WhatsApp forwards, news, and viral claims across Indian languages & English.
        </p>
      </div>

      {/* Input Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 shadow-card-glass border border-white/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="claim-input" className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              Input Statement / Forward
            </label>
            <span className={`text-xs font-mono ${charCount > 1000 ? 'text-amber-400' : 'text-slate-400'}`}>
              {charCount} characters
            </span>
          </div>

          <textarea
            id="claim-input"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            placeholder="Paste a WhatsApp forward or any claim (Hindi, English, or any Indian language)..."
            className="w-full glass-input rounded-2xl p-4 sm:p-5 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none transition-all duration-200 resize-y leading-relaxed font-sans"
          />

          {/* Quick Example Chips */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Click to try pre-verified examples:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip.text)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl bg-navy-800/80 hover:bg-navy-700/90 border border-white/10 hover:border-cyan-400/40 text-xs text-slate-300 hover:text-white transition-all duration-200 text-left flex items-center gap-1.5"
                >
                  <span className="font-semibold text-cyan-400 text-[11px]">{chip.tag}:</span>
                  <span className="truncate max-w-[200px] sm:max-w-[280px]">{chip.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-navy-900 font-heading font-bold text-base shadow-cyan-glow hover:shadow-cyan-glow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verifying Multi-Agent Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Verify Claim</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
