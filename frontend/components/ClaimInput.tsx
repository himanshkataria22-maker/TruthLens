'use client';

import React, { useState, useRef } from 'react';
import { ArrowRight, RefreshCw, Sparkles, Image as ImageIcon, X, Upload, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

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
  onStartVerification?: (claimText: string) => void;
  onVerificationComplete?: (data: VerificationResult) => void;
  onError?: (errMessage: string) => void;
  onStepComplete?: (step: string, duration: number) => void;
  isLoading?: boolean;
}

const SAMPLE_CHIPS = [
  {
    tag: "Hindi Forward",
    verdict: "MISLEADING",
    text: "सावधान! 500 रुपये के नए नोट में अगर हरी पट्टी गांधी जी के पास नहीं है तो वह नोट नकली है।",
    badgeBg: "bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/50",
    hoverBorder: "hover:border-[#FFB800]",
    icon: <AlertTriangle className="w-3 h-3 text-[#FFB800] shrink-0" />
  },
  {
    tag: "Viral Hoax",
    verdict: "FALSE",
    text: "UNESCO has officially declared the Indian National Anthem Jana Gana Mana as the best national anthem in the world.",
    badgeBg: "bg-[#E85C4A]/20 text-[#E85C4A] border-[#E85C4A]/50",
    hoverBorder: "hover:border-[#E85C4A]",
    icon: <XCircle className="w-3 h-3 text-[#E85C4A] shrink-0" />
  },
  {
    tag: "Verified Fact",
    verdict: "SUPPORTED",
    text: "India won the ICC Men's T20 World Cup in June 2024 by defeating South Africa in Barbados.",
    badgeBg: "bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/50",
    hoverBorder: "hover:border-[#2ECC71]",
    icon: <CheckCircle2 className="w-3 h-3 text-[#2ECC71] shrink-0" />
  }
];

export default function ClaimInput({
  onStartVerification,
  onVerificationComplete,
  onError,
  onStepComplete,
  isLoading = false
}: ClaimInputProps) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isExtractingImage, setIsExtractingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChipClick = (sampleText: string) => {
    setText(sampleText);
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      if (onError) onError('Please upload a valid image file (PNG or JPG).');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      if (onError) onError('Image is too large. Maximum size is 5MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Extract text from image
    setIsExtractingImage(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });

      const res = await fetch(`${apiUrl}/verify/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_data: base64 })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to extract text from image');
      }

      const data = await res.json();
      setText(data.extracted_text);
      setIsExtractingImage(false);
    } catch (err: any) {
      setIsExtractingImage(false);
      if (onError) onError(err.message || 'Could not extract text from image. Please try again.');
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    if (onStartVerification) onStartVerification(text.trim());

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Try streaming first, fallback to regular /verify on failure
    try {
      const streamRes = await fetch(`${apiUrl}/verify/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!streamRes.ok || !streamRes.body) {
        throw new Error("Streaming not available");
      }

      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr.trim()) {
              const event = JSON.parse(jsonStr);
              
              if (event.step === 'result') {
                if (onVerificationComplete) {
                  onVerificationComplete(event.data);
                }
              } else if (event.status === 'done' && onStepComplete) {
                onStepComplete(event.step, event.duration_ms);
              }
            }
          }
        }
      }
    } catch (streamErr) {
      // Fallback to regular /verify endpoint
      console.warn("Streaming failed, falling back to /verify:", streamErr);
      
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
    }
  };

  const charCount = text.length;

  return (
    <div className="w-full space-y-5">
      {/* Hero Section */}
      <div className="relative text-center space-y-2.5 max-w-2xl mx-auto py-2">
        {/* Network / Node Decorative Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden z-0" aria-hidden="true">
          {/* Top-Right Cluster */}
          <svg className="absolute -top-4 -right-8 w-64 h-64 text-[#00D9FF]" viewBox="0 0 200 200" fill="none">
            <line x1="140" y1="30" x2="180" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <line x1="180" y1="70" x2="130" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="130" y1="110" x2="170" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="140" y1="30" x2="90" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="90" y1="60" x2="130" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.5" />

            <circle cx="140" cy="30" r="4.5" fill="currentColor" />
            <circle cx="140" cy="30" r="9" fill="currentColor" fillOpacity="0.25" />

            <circle cx="180" cy="70" r="3.5" fill="currentColor" />

            <circle cx="130" cy="110" r="5" fill="currentColor" />
            <circle cx="130" cy="110" r="10" fill="currentColor" fillOpacity="0.25" />

            <circle cx="170" cy="150" r="3" fill="currentColor" />

            <circle cx="90" cy="60" r="4" fill="currentColor" />
            <circle cx="90" cy="60" r="7" fill="currentColor" fillOpacity="0.2" />
          </svg>

          {/* Bottom-Left Cluster */}
          <svg className="absolute -bottom-4 -left-8 w-64 h-64 text-[#00D9FF]" viewBox="0 0 200 200" fill="none">
            <line x1="30" y1="140" x2="70" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.7" />
            <line x1="70" y1="100" x2="110" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <line x1="110" y1="150" x2="50" y2="180" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="70" y1="100" x2="40" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            <line x1="40" y1="60" x2="110" y2="150" stroke="currentColor" strokeWidth="1" opacity="0.3" />

            <circle cx="30" cy="140" r="4.5" fill="currentColor" />
            <circle cx="30" cy="140" r="9" fill="currentColor" fillOpacity="0.25" />

            <circle cx="70" cy="100" r="3.5" fill="currentColor" />

            <circle cx="110" cy="150" r="4" fill="currentColor" />
            <circle cx="110" cy="150" r="8" fill="currentColor" fillOpacity="0.25" />

            <circle cx="50" cy="180" r="3" fill="currentColor" />

            <circle cx="40" cy="60" r="4" fill="currentColor" />
            <circle cx="40" cy="60" r="7" fill="currentColor" fillOpacity="0.2" />
          </svg>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-2.5">
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

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative">
            <img src={imagePreview} alt="Uploaded" className="w-full max-h-48 object-contain rounded-lg border-2 border-[#22B8CF]" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isExtractingImage && (
          <div className="p-3 bg-[#E3FAFC] border border-[#22B8CF] rounded-lg text-sm text-[#1C2740] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Extracting text from image...</span>
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative ${isDragging ? 'ring-2 ring-[#22B8CF] rounded-xl' : ''}`}
        >
          <textarea
            id="claim-textarea"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading || isExtractingImage}
            placeholder="Paste a WhatsApp forward or any claim (Hindi, English, or any Indian language)... Or drag & drop an image here."
            className="w-full bg-white border border-slate-300 rounded-xl p-3.5 sm:p-4 text-[#1C2740] placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:border-[#22B8CF] focus:ring-2 focus:ring-[#22B8CF]/25 transition-all duration-200 resize-y leading-relaxed font-sans"
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileInputChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer border border-slate-300"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Screenshot</span>
              <span className="sm:hidden">Image</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isLoading || isExtractingImage}
            className={`inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-heading font-bold text-sm sm:text-base transition-all duration-200 ${
              !text.trim() || isLoading || isExtractingImage
                ? 'bg-slate-200 text-slate-400 border border-slate-300/80 cursor-not-allowed opacity-60 shadow-none pointer-events-none'
                : 'bg-[#00D9FF] hover:bg-[#00C2E8] text-[#0A1128] font-extrabold shadow-lg shadow-[#00D9FF]/30 hover:shadow-xl hover:shadow-[#00D9FF]/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Pipeline...</span>
              </>
            ) : (
              <>
                <span>Verify Claim</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
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
              className={`px-3 py-2 rounded-xl bg-[#324367]/90 hover:bg-[#283756] border border-white/25 ${chip.hoverBorder} text-xs text-white transition-all duration-200 text-left flex items-center gap-2 shadow-xs hover:-translate-y-0.5 cursor-pointer max-w-full group`}
            >
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${chip.badgeBg}`}>
                {chip.icon}
                <span>{chip.tag}</span>
              </span>
              <span className="truncate max-w-[150px] sm:max-w-[220px] text-white/95 text-[11px] sm:text-xs font-medium">{chip.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
