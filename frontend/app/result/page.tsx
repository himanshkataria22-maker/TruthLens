'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VerdictCard from '@/components/VerdictCard';
import EvidenceTrail from '@/components/EvidenceTrail';
import LoadingSteps from '@/components/LoadingSteps';
import { VerificationResult } from '@/components/ClaimInput';
import { ArrowLeft, AlertCircle } from 'lucide-react';
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

        if (!res.ok) {
          throw new Error(`Server returned error status ${res.status}`);
        }

        const data: VerificationResult = await res.json();
        setResult(data);
        setIsLoading(false);
      } catch (err: any) {
        let msg = "Could not connect to TruthLens verification server. Make sure the backend is running on port 8000.";
        if (err.name === "AbortError") {
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
      <div className="glass-panel rounded-3xl p-8 border border-rose-500/30 bg-rose-500/10 max-w-2xl mx-auto space-y-4 text-center my-8">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-heading text-lg font-bold text-white">Verification Failed</h3>
        <p className="text-sm text-rose-200">{error}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-navy-800/80 px-4 py-2 rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Verify Another Claim</span>
        </Link>
      </div>

      <VerdictCard
        claim={result.claim}
        verdict={result.verdict}
        confidence={result.confidence}
        explanation={result.explanation}
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
