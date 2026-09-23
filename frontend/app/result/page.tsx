'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VerdictCard from '@/components/VerdictCard';
import EvidenceTrail from '@/components/EvidenceTrail';
import LoadingSteps from '@/components/LoadingSteps';
import { VerificationResult } from '@/components/ClaimInput';
import { ArrowLeft, AlertCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryText = searchParams.get('text') || searchParams.get('query') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!queryText.trim()) {
      router.push('/');
      return;
    }

    const verify = async () => {
      setIsLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        const res = await fetch(`${apiUrl}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: queryText }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.status === 429) {
          setError("Please wait a few seconds before verifying another claim.");
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Server returned error status ${res.status}`);
        }

        const data: VerificationResult = await res.json();
        console.log('[TruthLens] /verify full response:', data);
        console.log('[TruthLens] cached:', data.cached);
        setResult(data);
        // If result is cached, skip loading animation by setting isLoading to false immediately
        setIsLoading(!data.cached);
      } catch (err: any) {
        let msg = "Could not connect to TruthLens verification server. Make sure the backend is running on port 8000.";
        if (err.status === 429 || err.message === "429") {
          msg = "Please wait a few seconds before verifying another claim.";
        } else if (err.name === "AbortError") {
          msg = "Verification request timed out. The server took longer than 30 seconds to respond.";
        }
        setError(msg);
        setIsLoading(false);
      }
    };

    verify();
  }, [queryText, router]);

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSteps />
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-card border-l-[8px] border-l-[#DC2626] p-6 sm:p-8 max-w-2xl mx-auto space-y-4 text-center my-8">
        <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-[#DC2626] mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-heading text-lg font-bold text-[#1C2740]">Verification Failed</h3>
        <p className="text-sm text-slate-600">{error}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22B8CF] hover:bg-[#1A9DB3] text-white text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Input</span>
        </Link>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 animate-slide-up">
      {result.cached && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-800">
          <span className="text-lg">⚡</span>
          <span className="font-medium">Instant result — previously verified</span>
        </div>
      )}
      
      <VerdictCard
        key={`${result.claim}-${result.verdict}`}
        claim={result.claim}
        verdict={result.verdict}
        confidence={result.confidence}
        explanation={result.explanation}
        explanations={result.explanations}
        evidence={result.evidence}
        language={result.language}
        onReset={() => router.push('/')}
      />

      <EvidenceTrail
        evidence={result.evidence}
        steps={result.steps}
      />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="py-8"><LoadingSteps /></div>}>
      <ResultContent />
    </Suspense>
  );
}
