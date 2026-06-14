"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, Cpu, Users, Globe, ShieldCheck, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import CanvasParticles from "../components/CanvasParticles";

const AGENT_SHOWCASE = [
  {
    key: "historian",
    label: "Historian Agent",
    icon: BookOpen,
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    focus: "Alternative Divergence Milestones",
    description: "Determines the precise pivot points in historical timelines, tracing how geopolitical events cascade and branch out after key historical modifications.",
    insight: "Preserving the Library of Alexandria extends early Roman science, moving industrialization forward by 800 years."
  },
  {
    key: "climate",
    label: "Climate Agent",
    icon: Globe,
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    focus: "Ecological & Atmospheric Feedbacks",
    description: "Models carbon cycle adjustments, precipitation patterns, local temperature variance, and biodiversity modifications caused by alternate resource use.",
    insight: "Widespread electric logistics in 1990 lowers atmospheric carbon concentration by 45 ppm, avoiding extreme warming cycles."
  },
  {
    key: "economist",
    label: "Economist Agent",
    icon: TrendingUp,
    color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    focus: "Macro-Finance & Capital Reallocation",
    description: "Computes changes in trade corridors, wealth distributions, tax structure adjustments, and labor transitions resulting from technological changes.",
    insight: "Taxing automated computing capacity instead of corporate profits creates stable funding for localized universal basic dividends."
  },
  {
    key: "technology",
    label: "Technology Agent",
    icon: Cpu,
    color: "text-violet-400 border-violet-500/20 bg-violet-500/5",
    focus: "Systemic Innovation Vectors",
    description: "Simulates parallel tech structures—such as analog slide-rules, vacuum tubes, or solid-state grids—projecting custom resource demands.",
    insight: "Analog computing avoids the modern digital software vulnerabilities but limits the speed of decentralized communications."
  },
  {
    key: "society",
    label: "Society Agent",
    icon: Users,
    color: "text-pink-400 border-pink-500/20 bg-pink-500/5",
    focus: "Societal & Cultural Re-alignments",
    description: "Explores demographic shifts, vocational alterations, community media structures, and identity pivots in the face of macro change.",
    insight: "The absence of digital databases limits global migration speed but strengthens community civic cooperatives."
  },
  {
    key: "critic",
    label: "Critic Agent",
    icon: ShieldCheck,
    color: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    focus: "Simulation Coherency & Risk Check",
    description: "Audits agent responses for logical contradictions, unsupported projections, or speed anomalies, calculating a total confidence score.",
    insight: "Identifies timeline conflicts where industrial progress assumes mineral availability before trade routes open."
  },
  {
    key: "narrator",
    label: "Narrator Node",
    icon: FileText,
    color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    focus: "Synthesized Alternate Reality Reports",
    description: "Aggregates the multi-agent timelines, resolves conflicts, and outputs the final executive report and indicators.",
    insight: "Synthesizes economic, social, and climate indicators into a clean, uniform parallel historical record."
  }
];

const HOW_IT_WORKS = [
  { step: "01", name: "User Scenario", desc: "Submit an alternate history query or timeline modification request." },
  { step: "02", name: "Retrieval (RAG)", desc: "Relevant research papers and context are dynamically retrieved from Wikipedia and arXiv." },
  { step: "03", name: "Agent Collab", desc: "Historian, Climate, Economist, Tech, and Society agents analyze the query in parallel." },
  { step: "04", name: "Critic Validation", desc: "Critic checks outputs for contradictions and grades the timeline's consistency." },
  { step: "05", name: "Narrator Synthesis", desc: "A unified alternate timeline, risk log, and indicators are compiled." }
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("historian");
  const activeAgent = AGENT_SHOWCASE.find((a) => a.key === activeTab) || AGENT_SHOWCASE[0];
  const ActiveIcon = activeAgent.icon;

  return (
    <main className="relative min-h-screen bg-black overflow-hidden select-none">
      {/* Background canvas and glows */}
      <CanvasParticles />
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 ambient-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 ambient-glow" />

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 text-center">
        <div className="space-y-6">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/5 bg-slate-950/60 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Collaborative Alternate History Engine</span>
          </div>

          <h1 className="bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl drop-shadow-sm leading-tight max-w-4xl mx-auto">
            Explore Alternate Realities
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-400 font-light leading-8 sm:text-lg">
            Simulate how history, technology, economics, climate, and society could evolve under different decisions. Driven by a dedicated multi-agent reasoning cluster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/simulation"
              className="group inline-flex w-full sm:w-auto min-w-44 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:brightness-110 active:scale-[0.98] shadow-lg shadow-cyan-500/10"
            >
              Run Simulation <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/library"
              className="inline-flex w-full sm:w-auto min-w-44 items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              Explore Examples
            </Link>
          </div>
        </div>
      </section>

      {/* Agents Showcase Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24 border-t border-white/5">
        <div className="grid gap-12 lg:grid-cols-3 items-center">
          {/* List layout */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-2">
              <span className="text-mono-label text-cyan-400">Research Staff</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Multi-Agent Intelligence</h2>
            </div>
            <p className="text-sm text-slate-400 font-light leading-7">
              Each domain is analyzed by an expert AI agent before being synthesized and validated for internal logical consistency.
            </p>

            {/* Menu Buttons */}
            <div className="space-y-1.5 pt-4">
              {AGENT_SHOWCASE.map((agent) => {
                const isSelected = activeTab === agent.key;
                return (
                  <button
                    key={agent.key}
                    type="button"
                    onClick={() => setActiveTab(agent.key)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "border-cyan-500/25 bg-cyan-500/5 text-cyan-400"
                        : "border-transparent text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-cyan-400" : "bg-transparent"}`} />
                    {agent.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Detail Showcase Panel */}
          <div className="lg:col-span-2 rounded-2xl glass-panel p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-colors" />

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${activeAgent.color}`}>
                  <ActiveIcon className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{activeAgent.label}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{activeAgent.focus}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 font-light leading-8">
                {activeAgent.description}
              </p>

              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-5 space-y-2.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400">Sample Insight Output</span>
                <p className="text-xs italic leading-6 text-slate-400">
                  &ldquo;{activeAgent.insight}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24 border-t border-white/5">
        <div className="space-y-12 text-center">
          <div className="space-y-3">
            <span className="text-mono-label text-cyan-400">Methodology</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Simulation Pipeline</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-5 text-left">
            {HOW_IT_WORKS.map((step, idx) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-white/5 bg-slate-950/20 p-6 shadow-xl hover:border-white/10 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-3xl font-bold text-slate-800 group-hover:text-cyan-400/25 transition-colors">{step.step}</span>
                  <CheckCircle2 className="h-4 w-4 text-cyan-500/20 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h3 className="mb-2 text-sm font-bold text-slate-200 group-hover:text-white">{step.name}</h3>
                <p className="text-xs text-slate-400 leading-5 font-light">{step.desc}</p>
                {idx < 4 && (
                  <div className="hidden md:block absolute right-[-15px] top-1/2 -translate-y-1/2 z-20 text-slate-800">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
