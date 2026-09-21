import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TruthLens - Multi-Agent Fact Verification",
  description: "AI-powered multi-agent fact-checking and truth verification system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <header className="border-b border-indigo-900/30 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/30">
                TL
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                TruthLens
              </span>
            </a>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                5-Agent Pipeline Active
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4">
            TruthLens &copy; {new Date().getFullYear()} &bull; Multi-Agent Evidence & Fact Verification System
          </div>
        </footer>
      </body>
    </html>
  );
}
