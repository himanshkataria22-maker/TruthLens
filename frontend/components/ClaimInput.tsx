'use client';

import React, { useState } from 'react';
import { ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

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
    tag: "🇮🇳 Hindi Forward",
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
      const timeoutId = setTimeout(() => controller.abort(), 35000);

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
    <div className="w-full space-y-5">
      {/* Hero Section */}
      <div className="text-center space-y-2.5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 border border-white/30 text-white shadow-xs backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#22B8CF]" />
          <span>Real-time Multi-Agent Fact Verification</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Verify before you <span className="text-[#22B8CF] underline decoration-[#22B8CF]/50 underline-offset-8">share</span>
        </h1>

        <p className="text-[#EAF0FA] text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-xl mx-auto">
          AI-powered truth verification for WhatsApp forwards, news, and viral claims in Indian languages & English.
        </p>
      </div>

      {/* Input Card */}
      <form onSubmit={handleSubmit} className="theme-card p-4 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="claim-textarea" className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C2740]">
            Paste WhatsApp Forward or Claim
          </label>
          <span className={`text-[11px] sm:text-xs font-mono font-semibold ${charCount > 1000 ? 'text-amber-600' : 'text-slate-500'}`}>
            {charCount} characters
          </span>
        </div>

        <textarea
          id="claim-textarea"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="Paste a WhatsApp forward or any claim (Hindi, English, or any Indian language)..."
          className="w-full bg-white border border-slate-300 rounded-xl p-3.5 sm:p-4 text-[#1C2740] placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:border-[#22B8CF] focus:ring-2 focus:ring-[#22B8CF]/25 transition-all duration-200 resize-y leading-relaxed font-sans"
        />

        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#22B8CF] hover:bg-[#1A9DB3] text-white font-heading font-bold text-sm sm:text-base shadow-btn-glow hover:shadow-btn-glow-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Pipeline...</span>
              </>
            ) : (
              <>
                <span>Verify Claim</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example Chips */}
      <div className="space-y-2 max-w-3xl mx-auto">
        <span className="text-[11px] sm:text-xs font-mono font-bold text-white uppercase tracking-wider block text-center sm:text-left">
          Click to try pre-verified examples:
        </span>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {SAMPLE_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip.text)}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-[#324367]/90 hover:bg-[#283756] border border-white/25 text-xs text-white transition-all duration-200 text-left flex items-center gap-1.5 shadow-xs hover:-translate-y-0.5 cursor-pointer max-w-full"
            >
              <span className="font-bold text-[#22B8CF] shrink-0 text-[11px]">{chip.tag}:</span>
              <span className="truncate max-w-[170px] sm:max-w-[240px] text-white/95 text-[11px] sm:text-xs">{chip.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
