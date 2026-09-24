import type { Metadata } from "next";
import "./globals.css";
import { ShieldCheck } from "lucide-react";
import PageParticleBackground from "@/components/PageParticleBackground";

export const metadata: Metadata = {
  title: "TruthLens - Verify Before You Share",
  description: "AI-powered multi-agent fact verification for WhatsApp forwards, news, and claims in Indian languages & English.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <PageParticleBackground />
        <div className="relative z-[1] flex flex-col min-h-screen flex-1 w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#3F5079]/85 backdrop-blur-md border-b border-white/15">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3.5 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#22B8CF] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1A9DB3] transition-colors">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
                Truth<span className="text-[#22B8CF]">Lens</span>
              </span>
            </a>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/15 text-white border border-white/20">
                <span className="w-2 h-2 rounded-full bg-[#22B8CF] animate-pulse" />
                <span>Multi-Agent</span>
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/15 bg-[#344468]/90 py-5 text-center text-xs text-slate-200">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 space-y-2">
            <div className="font-heading font-semibold text-white tracking-wide text-xs sm:text-sm">
              TruthLens &bull; Verify Before You Share
            </div>
            <p className="text-[11px] text-slate-300">
              AI-assisted verification. Always check the sources.
            </p>
          </div>
        </footer>
        </div>
      </body>
    </html>
  );
}
