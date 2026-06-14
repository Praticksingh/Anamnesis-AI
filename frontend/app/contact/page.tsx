"use client";

import { Users, Mail, Compass, ExternalLink, Globe } from "lucide-react";

const TEAM = [
  {
    name: "Dr. Pratick Singh",
    role: "Lead Systems Architect & Research Director",
    bio: "Focuses on graph-orchestration models and RAG data verification schemas."
  },
  {
    name: "Elena Rostova",
    role: "Senior Climate Modeling Specialist",
    bio: "Maintains the ClimateAgent ecological simulation scripts and monsoon feedback algorithms."
  }
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] ambient-glow" />

      <div className="mx-auto max-w-4xl space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-mono-label text-cyan-400">
            <Users className="h-3.5 w-3.5" />
            <span>Organization / Contact</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Meet the Lab Team
          </h1>
          <p className="text-sm font-light text-slate-400">
            Get in touch with researchers, review organization structures, or request customized corporate simulation setups.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {TEAM.map((member, index) => (
            <div key={index} className="rounded-xl border border-white/5 bg-slate-950/35 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-200">{member.name}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">{member.role}</span>
              <p className="text-xs text-slate-400 leading-6 font-light">{member.bio}</p>
            </div>
          ))}
        </div>

        {/* Inquiry Card */}
        <div className="rounded-2xl glass-panel p-8 shadow-2xl relative overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-2">Simulation & Integration Requests</h2>
          <p className="text-xs text-slate-400 leading-6 font-light mb-6">
            Do you require customized agent installations (e.g. Political/Sovereign analysis nodes) or corporate dataset vectorization setups? Reach out via our channels below.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <a href="mailto:research@anamnesis.ai" className="flex items-center gap-3 rounded-lg border border-white/5 bg-slate-950/45 p-4 hover:border-cyan-500/25 transition-colors">
              <Mail className="h-5 w-5 text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Email Inquiry</h4>
                <span className="text-[9px] text-slate-500 font-mono">research@anamnesis.ai</span>
              </div>
            </a>
            
            <a href="https://github.com/Praticksingh/Anamnesis-AI" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-white/5 bg-slate-950/45 p-4 hover:border-cyan-500/25 transition-colors">
              <Globe className="h-5 w-5 text-violet-400" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">GitHub Portal</h4>
                <span className="text-[9px] text-slate-500 font-mono">Review source & codebases</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
