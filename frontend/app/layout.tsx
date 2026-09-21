import type { Metadata } from "next";
import "./globals.css";
import { Shield, Sparkles } from "lucide-react";

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
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-cyan-400 selection:text-navy-900 bg-nodes">
        {/* Background ambient glow circles */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-[30%] right-[-100px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-100px] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[130px]" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-cyan-glow group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-navy-900 rounded-[11px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-2xl font-bold tracking-tight text-white">
                  Truth<span className="text-cyan-400">Lens</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mt-2" />
              </div>
            </a>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-800/90 border border-cyan-400/20 text-xs font-medium text-cyan-400 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>5-Agent Verification Engine</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-navy-900/90 py-6 text-center text-xs text-slate-400">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300 font-heading">TruthLens</span>
              <span>&bull;</span>
              <span>Verify before you share</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-navy-800/80 border border-white/10 text-cyan-400/90 font-mono text-[11px]">
              Team Winss | Horizon Hackathon
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
