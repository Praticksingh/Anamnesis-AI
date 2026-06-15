"use client";

import { Users, Mail, Globe, Bot, Palette, Server, Brain, ShieldCheck } from "lucide-react";

const TEAM = [
  {
    name: "Pratik Singh",
    role: "Project Lead & Multi-Agent Systems Architect",
    bio: "Led project vision, system architecture, agent orchestration design, simulation workflow planning, integration strategy, and overall coordination of the platform.",
    icon: Bot,
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5 group-hover:border-cyan-400/40"
  },
  {
    name: "Yashika Singh",
    role: "Frontend & User Experience Engineer",
    bio: "Designed user flows, interface layouts, interactive components, visual hierarchy, responsive design, and user experience optimization across the platform.",
    icon: Palette,
    color: "text-pink-400 border-pink-500/20 bg-pink-500/5 group-hover:border-pink-400/40"
  },
  {
    name: "Prabhat Vishwakarma",
    role: "Backend & API Engineer",
    bio: "Developed backend services, API endpoints, database integration, request handling, data persistence, and system communication layers.",
    icon: Server,
    color: "text-amber-400 border-amber-500/20 bg-amber-500/5 group-hover:border-amber-400/40"
  },
  {
    name: "Aryama Srivastava",
    role: "AI Research & Knowledge Systems Engineer",
    bio: "Worked on retrieval pipelines, knowledge integration, simulation logic, data grounding, source management, and agent reasoning support.",
    icon: Brain,
    color: "text-violet-400 border-violet-500/20 bg-violet-500/5 group-hover:border-violet-400/40"
  },
  {
    name: "Ananya Singh",
    role: "Data Analytics & Quality Assurance Engineer",
    bio: "Managed testing, validation, simulation evaluation, report quality checks, impact analysis review, and overall system reliability assessment.",
    icon: ShieldCheck,
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 group-hover:border-emerald-400/40"
  }
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] ambient-glow" />

      <div className="mx-auto max-w-5xl space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-mono-label text-cyan-400">
            <Users className="h-3.5 w-3.5" />
            <span>Organization / Team</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Meet the Team Behind Anamnesis-AI
          </h1>
          <p className="text-sm font-light text-slate-400 leading-relaxed max-w-3xl">
            A multidisciplinary team combining AI, software engineering, research, and design to build intelligent alternate-reality simulations.
          </p>
        </div>

        {/* Team Grid */}
        <div className="flex flex-wrap justify-center gap-6">
          {TEAM.map((member, index) => {
            const Icon = member.icon;
            return (
              <div
                key={index}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] rounded-2xl border border-white/5 bg-slate-950/35 p-6 transition-all duration-300 hover:border-white/10 hover:bg-slate-950/65 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(34,211,238,0.05)] flex flex-col group justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${member.color} transition-all duration-300 group-hover:scale-105`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors duration-300">
                        {member.name}
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 font-mono block mt-0.5">
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {member.bio}
                  </p>
                </div>
              </div>
            );
          })}
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
