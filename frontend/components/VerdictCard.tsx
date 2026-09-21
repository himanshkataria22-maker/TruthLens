'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Copy, Check, Quote, Globe, ArrowLeft, Languages, Share2 } from 'lucide-react';

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
  onLanguageChange?: (newExplanation: string, newLang: string) => void;
}

export default function VerdictCard({
  claim,
  verdict,
  confidence,
  explanation,
  evidence = [],
  language = "en",
  onReset,
  onLanguageChange
}: VerdictCardProps) {
  const [copied, setCopied] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentExplanation, setCurrentExplanation] = useState(explanation);

  const availableLanguages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mr", label: "मराठी" },
    { code: "ta", label: "தமிழ்" },
    { code: "bn", label: "বাংলা" },
  ];

  const handleLanguageChange = async (newLang: string) => {
    if (newLang === currentLanguage || isChangingLanguage) return;

    setIsChangingLanguage(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${apiUrl}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim,
          verdict,
          confidence,
          evidence,
          target_language: newLang
        })
      });

      if (!res.ok) {
        throw new Error("Failed to regenerate explanation");
      }

      const data = await res.json();
      setCurrentExplanation(data.explanation);
      setCurrentLanguage(newLang);
      
      if (onLanguageChange) {
        onLanguageChange(data.explanation, newLang);
      }
    } catch (err) {
      console.error("Language change failed:", err);
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const normalizedVerdict = (verdict || "UNVERIFIABLE").toUpperCase();

  const getVerdictDetails = () => {
    switch (normalizedVerdict) {
      case "SUPPORTED":
        return {
          title: "SUPPORTED",
          borderClass: "border-l-[6px] sm:border-l-[8px] border-l-[#16A34A]",
          badgeBg: "bg-[#16A34A] text-white",
          progressBg: "bg-[#16A34A]",
          icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
          label: "Verified Factual",
        };
      case "FALSE":
        return {
          title: "FALSE",
          borderClass: "border-l-[6px] sm:border-l-[8px] border-l-[#DC2626]",
          badgeBg: "bg-[#DC2626] text-white",
          progressBg: "bg-[#DC2626]",
          icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
          label: "Debunked / False Claim",
        };
      case "MISLEADING":
        return {
          title: "MISLEADING",
          borderClass: "border-l-[6px] sm:border-l-[8px] border-l-[#F59E0B]",
          badgeBg: "bg-[#F59E0B] text-white",
          progressBg: "bg-[#F59E0B]",
          icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
          label: "Partly True / Missing Context",
        };
      default:
        return {
          title: "UNVERIFIABLE",
          borderClass: "border-l-[6px] sm:border-l-[8px] border-l-[#64748B]",
          badgeBg: "bg-[#64748B] text-white",
          progressBg: "bg-[#64748B]",
          icon: <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
          label: "Insufficient Credible Evidence",
        };
    }
  };

  const vInfo = getVerdictDetails();

  const getVerdictEmoji = () => {
    switch (normalizedVerdict) {
      case "SUPPORTED":
        return "✅";
      case "FALSE":
        return "❌";
      case "MISLEADING":
        return "⚠️";
      default:
        return "❓";
    }
  };

  const handleCopy = () => {
    const emoji = getVerdictEmoji();
    const topSource = evidence?.[0]?.url ? `\nTop Source: ${evidence[0].url}` : '';
    const shortClaim = claim.length > 100 ? claim.substring(0, 100) + "..." : claim;
    const reason = currentExplanation.length > 150 ? currentExplanation.substring(0, 150) + "..." : currentExplanation;
    
    const textToCopy = `${emoji} TruthLens Fact-Check\nVerdict: ${normalizedVerdict}\n\nClaim: "${shortClaim}"\n\nReason: ${reason}${topSource}\n\nVerified with TruthLens`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const emoji = getVerdictEmoji();
    const topSource = evidence?.[0]?.url ? `\n${evidence[0].url}` : '';
    const shortClaim = claim.length > 80 ? claim.substring(0, 80) + "..." : claim;
    const reason = currentExplanation.split('.')[0] + '.'; // First sentence
    
    const summary = `${emoji} ${normalizedVerdict}\n\n"${shortClaim}"\n\n${reason}${topSource}\n\n✓ Verified with TruthLens`;
    const encoded = encodeURIComponent(summary);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const getLanguageLabel = (code: string) => {
    const map: Record<string, string> = {
      hi: "Hindi (हिन्दी)",
      en: "English",
      mr: "Marathi (मराठी)",
      ta: "Tamil (தமிழ்)",
      te: "Telugu (తెలుగు)",
      bn: "Bengali (বাংলা)",
      gu: "Gujarati (ગુજરાતી)",
      kn: "Kannada (ಕನ್ನಡ)",
    };
    return map[code.toLowerCase()] || code.toUpperCase();
  };

  return (
    <div className={`theme-card ${vInfo.borderClass} p-4 sm:p-7 animate-slide-up space-y-5`}>
      {/* 1. Verdict Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1C2740]/70 font-mono">
              Verification Result
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              <Globe className="w-3 h-3 text-slate-500" />
              {getLanguageLabel(language)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-heading text-base sm:text-xl font-extrabold shadow-xs ${vInfo.badgeBg}`}>
              {vInfo.icon}
              <span>{vInfo.title}</span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#1C2740]/80">
              {vInfo.label}
            </span>
          </div>
        </div>

        {/* Confidence Progress */}
        <div className="w-full sm:w-52 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1C2740] mb-1">
            <span>Confidence Score</span>
            <span className="font-mono text-sm font-bold text-[#1C2740]">{confidence}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${vInfo.progressBg} transition-all duration-800 ease-out`}
              style={{ width: `${Math.max(5, confidence)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Quoted Claim Block */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 relative">
        <Quote className="w-5 h-5 text-slate-300 absolute top-3 right-3 pointer-events-none" />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 font-mono">
          Evaluated Claim Statement
        </span>
        <p className="text-sm sm:text-base font-medium text-[#1C2740] leading-relaxed italic pr-5">
          "{claim}"
        </p>
      </div>

      {/* 3. Explanation in User's Language */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1C2740]">
            Explanation ({getLanguageLabel(currentLanguage)})
          </h3>
          <div className="flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Language:</span>
          </div>
        </div>
        
        {/* Language Selector Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isChangingLanguage}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentLanguage === lang.code
                  ? 'bg-[#22B8CF] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              } ${isChangingLanguage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <p className="text-sm sm:text-base text-[#1C2740] leading-relaxed font-normal">
          {isChangingLanguage ? "Translating explanation..." : currentExplanation}
        </p>
      </div>

      {/* 4. Actions Row */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-100">
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1C2740] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Check Another Claim</span>
          </button>
        )}

        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE57] text-white text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#22B8CF] hover:bg-[#1A9DB3] text-white text-xs sm:text-sm font-bold shadow-btn-glow hover:shadow-btn-glow-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
