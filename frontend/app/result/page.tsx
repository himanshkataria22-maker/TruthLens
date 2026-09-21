import Link from "next/link";
import VerdictCard from "@/components/VerdictCard";
import EvidenceTrail from "@/components/EvidenceTrail";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function ResultPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams?.query || "Sample statement under verification";

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Claim Input</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Verification</span>
        </Link>
      </div>

      {/* Verdict Card Component */}
      <VerdictCard statement={query} />

      {/* Evidence Trail Component */}
      <EvidenceTrail />
    </div>
  );
}
