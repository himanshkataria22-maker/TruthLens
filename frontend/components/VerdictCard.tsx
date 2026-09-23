'use client';

import React, { useState, useEffect } from 'react';
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
  explanations?: Record<string, string>;
  evidence?: EvidenceItem[];
  language?: string;
  onReset?: () => void;
}

function CircularConfidenceRing({ confidence, colorHex }: { confidence: number; colorHex: string }) {
  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeConfidence = Math.min(100, Math.max(0, confidence));
  const strokeDashoffset = circumference - (safeConfidence / 100) * circumference;

  return (
    <div className="flex items-center gap-3 bg-white/90 px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-xs shrink-0">
      <div className="relative inline-flex items-center justify-center shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorHex}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <span className="font-mono text-xs font-black text-[#0A1128]">
            {safeConfidence}%
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-[#0A1128] uppercase tracking-wider font-mono">
          Confidence
        </span>
        <span className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
          Score Ring
        </span>
      </div>
    </div>
  );
}

export default function VerdictCard({
  claim,
  verdict,
  confidence,
  explanation,
  explanations = {},
  evidence = [],
  language = "en",
  onReset,
}: VerdictCardProps) {
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => (language || 'en').toLowerCase()
  );
  const [storedExplanations, setStoredExplanations] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const [code, text] of Object.entries(explanations || {})) {
      if (text?.trim()) {
        map[code.toLowerCase()] = text.trim();
      }
    }
    // Only use top-level `explanation` when the map is completely empty
    if (!Object.keys(map).length && explanation?.trim()) {
      const primaryLang = (language || 'en').toLowerCase();
      map[primaryLang] = explanation.trim();
    }
    console.log('[TruthLens] explanations loaded from API:', {
      apiLanguage: language,
      apiKeys: Object.keys(explanations || {}),
      processedKeys: Object.keys(map),
      enPreview: map.en?.slice(0, 40),
      hiPreview: map.hi?.slice(0, 40),
      mrPreview: map.mr?.slice(0, 40),
    });
    setStoredExplanations(map);
  }, [explanations, explanation, language, claim, verdict]);

  useEffect(() => {
    const primaryLang = (language || 'en').toLowerCase();
    console.log('[TruthLens] Setting initial language to:', primaryLang);
    setSelectedLanguage(primaryLang);
  }, [language, claim, verdict]);

  const availableLanguages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mr", label: "मराठी" },
    { code: "ta", label: "தமிழ்" },
    { code: "bn", label: "বাংলা" },
  ];

  const handleLanguageChange = (newLang: string) => {
    const code = newLang.toLowerCase();
    if (code === selectedLanguage) return;
    
    // Verify the language exists in our stored explanations
    if (!storedExplanations[code]) {
      console.warn(`[TruthLens] Language ${code} not available. Available:`, Object.keys(storedExplanations));
      // Fall back to English if requested language is missing
      if (code !== 'en' && storedExplanations['en']) {
        console.log('[TruthLens] Falling back to English');
        setSelectedLanguage('en');
        return;
      }
    }
    
    console.log('[TruthLens] language tab changed to:', code);
    console.log('[TruthLens] available languages:', Object.keys(storedExplanations));
    console.log('[TruthLens] text preview:', storedExplanations[code]?.slice(0, 60));
    setSelectedLanguage(code);
  };

  const displayedExplanation = storedExplanations[selectedLanguage] || storedExplanations['en'] || '';

  const normalizedVerdict = (verdict || "UNVERIFIABLE").toUpperCase();

  const getVerdictDetails = () => {
    switch (normalizedVerdict) {
      case "SUPPORTED":
        return {
          title: "SUPPORTED",
          colorHex: "#2ECC71",
          badgeBg: "bg-[#2ECC71] text-white",
          icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
          label: "Verified Factual",
        };
      case "FALSE":
        return {
          title: "FALSE",
          colorHex: "#E85C4A",
          badgeBg: "bg-[#E85C4A] text-white",
          icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
          label: "Debunked / False Claim",
        };
      case "MISLEADING":
        return {
          title: "MISLEADING",
          colorHex: "#FFB800",
          badgeBg: "bg-[#FFB800] text-white",
          icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
          label: "Partly True / Missing Context",
        };
      default:
        return {
          title: "UNVERIFIABLE",
          colorHex: "#9AA5B1",
          badgeBg: "bg-[#9AA5B1] text-white",
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
    const reason = displayedExplanation.length > 150 ? displayedExplanation.substring(0, 150) + "..." : displayedExplanation;
    
    const textToCopy = `${emoji} TruthLens Fact-Check\nVerdict: ${normalizedVerdict}\n\nClaim: "${shortClaim}"\n\nReason: ${reason}${topSource}\n\nVerified with TruthLens`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const emoji = getVerdictEmoji();
    const topSource = evidence?.[0]?.url ? `\n${evidence[0].url}` : '';
    const shortClaim = claim.length > 80 ? claim.substring(0, 80) + "..." : claim;
    const reason = displayedExplanation.split('.')[0] + '.';
    
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
    <div
      className="p-4 sm:p-7 animate-slide-up space-y-5 shadow-xl rounded-2xl border border-slate-200"
      style={{
        background: '#FFFFFF',
      }}
    >
      {/* 1. Verdict Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 font-mono">
              Verification Result
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              <Globe className="w-3 h-3 text-slate-500" />
              {getLanguageLabel(language)}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-heading text-lg sm:text-2xl font-black shadow-sm ${vInfo.badgeBg}`}>
              {vInfo.icon}
              <span>{vInfo.title}</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              {vInfo.label}
            </span>
          </div>
        </div>

        {/* Circular Confidence Ring */}
        <CircularConfidenceRing confidence={confidence} colorHex={vInfo.colorHex} />
      </div>

      {/* 2. Quoted Claim Block */}
      <div
        className="p-3.5 sm:p-4 rounded-xl relative border border-slate-200"
        style={{
          background: '#F5F7FB',
        }}
      >
        <Quote className="w-5 h-5 text-slate-300 absolute top-3 right-3 pointer-events-none" />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 font-mono">
          Evaluated Claim Statement
        </span>
        <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed italic pr-5">
          "{claim}"
        </p>
      </div>

      {/* 3. Explanation in User's Language */}
      <div
        className="p-4 sm:p-5 rounded-xl border border-slate-200"
        style={{
          background: '#FFFFFF',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
            Explanation ({getLanguageLabel(selectedLanguage)})
          </h3>
          <div className="flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] text-slate-600 font-semibold uppercase">Language:</span>
          </div>
        </div>
        
        {/* Language Selector Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                selectedLanguage === lang.code
                  ? 'bg-[#22B8CF] text-white shadow-md shadow-[#22B8CF]/30 scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
          {displayedExplanation}
        </p>
      </div>

      {/* 4. Actions Row */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-200">
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-300"
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
