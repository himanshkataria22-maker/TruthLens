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
    <div className="space-y-10 py-4">
      {/* State 1: Input Form */}
      {!isLoading && !result && (
        <div className="animate-fadeIn">
          <ClaimInput
            onStartVerification={handleStartVerification}
            onVerificationComplete={handleVerificationComplete}
            onError={handleError}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* State 2: Step-by-Step Loading Display */}
      {isLoading && (
        <div className="animate-fadeIn py-6">
          <LoadingSteps />
        </div>
      )}

      {/* State 3: Error Message Card with Retry */}
      {error && !isLoading && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/30 bg-rose-500/10 max-w-2xl mx-auto space-y-4 text-center animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">
              Verification Failed
            </h3>
            <p className="text-sm text-rose-200 mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs sm:text-sm font-semibold border border-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* State 4: Verdict & Evidence Trail Result Screen */}
      {result && !isLoading && (
        <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
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
