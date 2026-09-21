'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Upload, FileText, ArrowRight } from 'lucide-react';

export default function ClaimInput() {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;

    setIsLoading(true);
    // For scaffolding demonstration, navigate to result screen
    const query = encodeURIComponent(text.trim() || file?.name || 'Sample Claim');
    router.push(`/result?query=${query}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-transparent pointer-events-none" />
        
        <label htmlFor="claim-text" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Enter Claim, Article Text, or Statement
        </label>
        
        <textarea
          id="claim-text"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste news headline, social media post, or claim here to verify across multi-agent consensus..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 resize-y"
        />

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="cursor-pointer inline-flex items-center gap-2 text-xs text-slate-400 hover:text-indigo-300 transition-colors bg-slate-950/60 px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-700">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>{file ? file.name : "Or upload screenshot / image"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading || (!text.trim() && !file)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Pipeline...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Verify with TruthLens</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
