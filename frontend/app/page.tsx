'use client';

import React, { useState } from 'react';
import ClaimInput, { VerificationResult } from '@/components/ClaimInput';
import VerdictCard from '@/components/VerdictCard';
import EvidenceTrail from '@/components/EvidenceTrail';
import LoadingSteps from '@/components/LoadingSteps';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartVerification = () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
  };

  const handleVerificationComplete = (data: VerificationResult) => {
    setResult(data);
    setIsLoading(false);
    setError(null);
  };

  const handleError = (errMsg: string) => {
    setError(errMsg);
    setIsLoading(false);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 py-4">
      {/* 1. Input Form */}
      {!isLoading && !result && (
        <ClaimInput
          onStartVerification={handleStartVerification}
          onVerificationComplete={handleVerificationComplete}
          onError={handleError}
          isLoading={isLoading}
        />
      )}

      {/* 2. Animated Loading Progress Display */}
      {isLoading && (
        <div className="py-6">
          <LoadingSteps />
        </div>
      )}

      {/* 3. Error Card with Retry */}
      {error && !isLoading && (
        <div className="theme-card border-l-[8px] border-l-[#DC2626] p-6 sm:p-8 max-w-2xl mx-auto space-y-4 text-center animate-slide-up">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-[#DC2626] mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-[#1C2740]">
              Verification Failed
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22B8CF] hover:bg-[#1A9DB3] text-white text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 4. Complete Verdict & Evidence Trail Result Screen */}
      {result && !isLoading && (
        <div className="space-y-8 max-w-4xl mx-auto animate-slide-up">
          <VerdictCard
            claim={result.claim}
            verdict={result.verdict}
            confidence={result.confidence}
            explanation={result.explanation}
            evidence={result.evidence}
            language={result.language}
            onReset={handleReset}
          />

          <EvidenceTrail
            evidence={result.evidence}
            steps={result.steps}
          />
        </div>
      )}
    </div>
  );
}
