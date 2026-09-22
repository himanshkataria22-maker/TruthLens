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
  const [pendingResult, setPendingResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedBackendSteps, setCompletedBackendSteps] = useState<string[]>([]);
  const [currentClaim, setCurrentClaim] = useState<string>('');
  const [isBackendComplete, setIsBackendComplete] = useState<boolean>(false);

  const handleStartVerification = (claimText: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setPendingResult(null);
    setCompletedBackendSteps([]);
    setCurrentClaim(claimText);
    setIsBackendComplete(false);
  };

  const handleStepComplete = (step: string, duration: number) => {
    setCompletedBackendSteps(prev => [...prev, step]);
  };

  const handleVerificationComplete = (data: VerificationResult) => {
    setPendingResult(data);
    setIsBackendComplete(true);
  };

  const handleAnimationComplete = () => {
    if (pendingResult) {
      setResult(pendingResult);
    }
    setIsLoading(false);
  };

  const handleError = (errMsg: string) => {
    setError(errMsg);
    setIsLoading(false);
    setIsBackendComplete(false);
  };

  const handleReset = () => {
    setResult(null);
    setPendingResult(null);
    setError(null);
    setIsLoading(false);
    setCompletedBackendSteps([]);
    setCurrentClaim('');
    setIsBackendComplete(false);
  };

  return (
    <div className="space-y-8 py-4">
      {/* 1. Input Form */}
      {!isLoading && !result && (
        <ClaimInput
          onStartVerification={handleStartVerification}
          onVerificationComplete={handleVerificationComplete}
          onStepComplete={handleStepComplete}
          onError={handleError}
          isLoading={isLoading}
        />
      )}

      {/* 2. Step-by-Step Progress Animation */}
      {isLoading && (
        <div className="py-2">
          <LoadingSteps
            claimText={currentClaim}
            completedBackendSteps={completedBackendSteps}
            isBackendComplete={isBackendComplete}
            onComplete={handleAnimationComplete}
          />
        </div>
      )}

      {/* 3. Error Display */}
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

      {/* 4. Verdict & Evidence Results */}
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
