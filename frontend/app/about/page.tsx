"use client";

import { Terminal, Shield, Sparkles, BookOpen, Command, Settings } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] ambient-glow" />

      <div className="mx-auto max-w-4xl space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-mono-label text-cyan-400">
            <Terminal className="h-3.5 w-3.5" />
            <span>Platform / Overview</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            About Anamnesis-AI
          </h1>
          <p className="text-sm font-light text-slate-400">
            A specialized simulation environment designed to audit and map socio-economic, technological, and climate alterations under dived history.
          </p>
        </div>

        {/* Vision Card */}
        <div className="rounded-2xl glass-panel p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl" />
          <h2 className="text-xl font-bold text-white mb-4">The Alternate Reality Research Lab</h2>
          <p className="text-sm text-slate-300 font-light leading-8">
            Anamnesis-AI is created to move simulation modeling beyond simple text templates. By coordinating multiple dedicated agent systems in parallel, we establish structured dependency mappings. Every historical pivot is investigated for its technological constraints, macroeconomic transitions, societal cultural Realignment, and climate monsoons cycle feedback.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-slate-950/35 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Scientific Realism</h3>
            <p className="text-xs text-slate-400 leading-6 font-light">
              We focus on absolute physical, ecological, and economic laws. Our models refuse simple magical assumptions, forcing agents to trace transition costs, resource constraints, and metallurgy limits.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/35 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/5 text-violet-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Consistency Auditing</h3>
            <p className="text-xs text-slate-400 leading-6 font-light">
              Through the Critic agent, all generated timelines are audited. Divergences in growth predictions, logical timeline contradictions, or speed anomalies are flagged, resulting in a transparent confidence grading.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/35 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Retrieval Verification (RAG)</h3>
            <p className="text-xs text-slate-400 leading-6 font-light">
              Retrieval-Augmented Generation hooks directly into historical libraries and arXiv papers to seed agent memories before reasoning begins, preventing simple hallucinated deviations.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/35 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400">
              <Command className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Unified Narrative</h3>
            <p className="text-xs text-slate-400 leading-6 font-light">
              Our Narrator node merges timeline events, resolves domain discrepancies, and compiles a comprehensive dashboard transcript.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
