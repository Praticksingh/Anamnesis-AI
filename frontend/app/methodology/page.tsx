"use client";

import { BookOpen, Search, ArrowRight, ShieldCheck, FileSpreadsheet, BrainCircuit } from "lucide-react";

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 relative overflow-hidden select-none">
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] ambient-glow" />

      <div className="mx-auto max-w-4xl space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-mono-label text-cyan-400">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Research / Methodology</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Simulation Methodology
          </h1>
          <p className="text-sm font-light text-slate-400">
            Scientific guidelines, retrieval algorithms, and checking matrices governing the alternate timeline generation.
          </p>
        </div>

        {/* Section 1: Retrieval Augmented Generation */}
        <section className="rounded-2xl glass-panel p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">1. Knowledge Retrieval Layer (RAG)</h2>
          </div>
          <p className="text-xs text-slate-300 font-light leading-7">
            Every simulation begins with dynamic context loading. Before any agent generates a single word, our retrieval system executes asynchronous searches across:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/5 bg-slate-950/40 p-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-200">Wikipedia Encyclopedia Loader</h4>
              <p className="text-[11px] text-slate-400 leading-5 font-light">
                Fetches comprehensive summaries of key historical events, names, dates, and baseline policy records matching the query divergence point.
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-slate-950/40 p-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-200">arXiv Academic Abstract Loader</h4>
              <p className="text-[11px] text-slate-400 leading-5 font-light">
                Retrieves technical papers regarding carbon capture, monetary models, battery chemistries, and computing architectures to anchor calculations in real science.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Parallel Multi-Agent Mappings */}
        <section className="rounded-2xl glass-panel p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/5 text-violet-400">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">2. Parallel Domain Collaboration</h2>
          </div>
          <p className="text-xs text-slate-300 font-light leading-7">
            Agents process in parallel, but their prompts contain dependencies. The Historian establishes the core pivot year and milestones. In the next step, the Economist, Technology, Society, and Climate agents evaluate the secondary consequences of those milestones.
          </p>
          
          {/* Horizontal workflow representation */}
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-5 space-y-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Agent Flow Sequence</span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="font-semibold text-slate-200">Historian Pivot</div>
              <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-slate-700" />
              <div className="font-semibold text-slate-200">Parallel Domain Analyses (Climate, Econ, Tech, Society)</div>
              <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-slate-700" />
              <div className="font-semibold text-slate-200">Critic Checking Cycle</div>
            </div>
          </div>
        </section>

        {/* Section 3: Critic Scoring */}
        <section className="rounded-2xl glass-panel p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">3. Critic Validation & Plausibility Scoring</h2>
          </div>
          <p className="text-xs text-slate-300 font-light leading-7">
            The Critic Agent evaluates internal consistency. It checks whether the climate outcomes are consistent with the technological changes, and whether the economic projections are realistic given the social developments. The confidence score is computed based on these comparisons:
          </p>
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-5 space-y-3 text-xs font-mono leading-6 text-slate-400">
            <div>• Extreme Projection Check: If an agent outputs an impact score &gt; 75, Plausibility drops by 20%.</div>
            <div>• Domain Divergence Check: If there is a massive delta between two indices, Plausibility drops by 35% and warning flags are raised.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
