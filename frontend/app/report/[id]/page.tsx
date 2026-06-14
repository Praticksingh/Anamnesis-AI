"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getScenarioReport, ReportNotReadyError } from "../../../lib/api";
import type { AgentOutputSummary, FinalReport, ImpactDashboard, TimelineEvent } from "../../../lib/types";

function formatAgentName(name: string): string {
  if (!name) {
    return name;
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function sectionStyle(delay: number) {
  return {
    animation: "fadeInUp 0.6s ease-out both",
    animationDelay: `${delay}ms`
  };
}

function getRingColor(score: number): string {
  if (score >= 70) return "#22d3ee"; // Cyan
  if (score >= 45) return "#a78bfa"; // Violet
  return "#fb7185"; // Rose
}

function ConfidenceRing({ score }: { score: number }) {
  const size = 150;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = getRingColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-white tracking-tight">{score}%</span>
        <span className="mt-0.5 text-[9px] uppercase tracking-[0.25em] text-slate-400">Score</span>
      </div>
    </div>
  );
}

function ImpactCard({ label, score }: { label: string; score: number }) {
  const isPositive = score >= 0;
  const absScore = Math.abs(score);
  const color = score > 0 ? "#10b981" : score < 0 ? "#f43f5e" : "#64748b"; // emerald / rose / slate
  
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - absScore / 100);

  return (
    <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-950/45 p-5 shadow-xl transition-all duration-300 hover:scale-[1.03] hover:border-white/10 hover:bg-slate-900/40">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 group-hover:text-cyan-300 transition-colors">
        {label}
      </p>
      
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-lg font-bold tracking-tight ${score > 0 ? "text-emerald-400" : score < 0 ? "text-rose-400" : "text-slate-400"}`}>
            {score > 0 ? "+" : ""}{score}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<FinalReport | null>(null);
  const [error, setError] = useState("");

  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

    const loadReport = async () => {
      try {
        const nextReport = await getScenarioReport(id);
        if (!active) {
          return;
        }

        setReport(nextReport);
        setError("");
      } catch (loadError) {
        if (!active) {
          return;
        }

        if (loadError instanceof ReportNotReadyError) {
          router.push(`/simulation/${id}`);
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load report.");
      }
    };

    void loadReport();

    return () => {
      active = false;
    };
  }, [id, router]);

  const sortedTimeline = useMemo(() => {
    if (!report) {
      return [] as TimelineEvent[];
    }
    return [...report.alternate_timeline].sort((left, right) => left.year - right.year);
  }, [report]);

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/80 text-white selection:bg-cyan-500/30">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
          <div className="w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center backdrop-blur-md animate-fade-in-up">
            <p className="text-lg font-semibold text-rose-100">Unable to load report</p>
            <p className="mt-2 text-sm text-rose-100/90">{error}</p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15 active:scale-[0.98]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/80 text-white flex items-center justify-center">
        <div className="text-slate-400 font-light flex items-center gap-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500/30 border-t-slate-400" />
          Loading unified timeline report...
        </div>
      </main>
    );
  }

  const impactDashboard: ImpactDashboard = report.impact_dashboard;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/80 text-white selection:bg-cyan-500/30">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="space-y-8">
          {/* Header */}
          <section style={sectionStyle(0)} className="rounded-2xl glass-panel p-8 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Narrator Synthesis</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {report.scenario_summary}
            </h1>
          </section>

          {/* Impact Dashboard */}
          <section style={sectionStyle(80)} className="rounded-2xl glass-panel p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <h2 className="text-xl font-bold tracking-wide text-white">Impact Dashboard</h2>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              <ImpactCard label="Economy" score={impactDashboard.economy} />
              <ImpactCard label="Technology" score={impactDashboard.technology} />
              <ImpactCard label="Society" score={impactDashboard.society} />
              <ImpactCard label="Climate" score={impactDashboard.climate} />
              <ImpactCard label="Politics" score={impactDashboard.politics} />
            </div>
          </section>

          {/* Alternate Timeline */}
          <section style={sectionStyle(160)} className="rounded-2xl glass-panel p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
              <h2 className="text-xl font-bold tracking-wide text-white">Unified Alternate Timeline</h2>
            </div>

            <div className="relative space-y-6 pl-4 sm:pl-6">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-cyan-400/80 via-violet-400/70 to-transparent" />
              {sortedTimeline.map((event: TimelineEvent, index: number) => (
                <div key={`${event.year}-${index}`} className="relative flex gap-4 animate-slide-in">
                  <div className="absolute left-[-1.1rem] top-2.5 h-3 w-3 rounded-full border border-slate-950 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  <div className="min-w-20 rounded-full border border-white/5 bg-slate-950/50 px-3 py-1 text-center text-xs font-bold text-cyan-300 backdrop-blur-md shrink-0 h-fit self-start">
                    {event.year}
                  </div>
                  <div className="flex-1 rounded-xl border border-white/5 bg-slate-950/35 px-4 py-3 text-sm leading-7 text-slate-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 px-2 py-0.5 rounded text-cyan-200">
                        {event.source_agent}
                      </span>
                    </div>
                    {event.event}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Agent Discussion */}
          <section style={sectionStyle(240)} className="rounded-2xl glass-panel p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              <h2 className="text-xl font-bold tracking-wide text-white">Agent Discussions</h2>
            </div>
            <div className="space-y-4">
              {report.agent_outputs.map((agent: AgentOutputSummary, index: number) => (
                <div
                  key={`${agent.agent_name}-${index}`}
                  className="rounded-xl border border-white/5 bg-slate-950/40 p-5 shadow-inner"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="font-semibold text-cyan-200 text-sm tracking-wide">{formatAgentName(agent.agent_name)} Agent</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Domain View</span>
                  </div>
                  <p className="text-xs leading-6 text-slate-300 font-light">{agent.analysis_text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Confidence Evaluation */}
          <section style={sectionStyle(320)} className="rounded-2xl glass-panel p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
              <h2 className="text-xl font-bold tracking-wide text-white">Critic Confidence Analysis</h2>
            </div>

            <div className="flex flex-col items-center justify-center py-4 sm:flex-row sm:gap-10">
              <ConfidenceRing score={report.confidence_score} />
              <div className="mt-4 max-w-xl text-center sm:mt-0 sm:text-left space-y-2">
                <h4 className="text-sm font-semibold text-slate-200">Confidence Explanation</h4>
                <p className="text-xs leading-6 text-slate-300 font-light">
                  {report.confidence_explanation || "Higher scores indicate stronger internal consistency across the alternate timeline and agent outputs."}
                </p>
              </div>
            </div>
          </section>

          {/* Sources and Retrieved Documents */}
          <section style={sectionStyle(360)} className="rounded-2xl glass-panel p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
              <h2 className="text-xl font-bold tracking-wide text-white">Consulted Sources & References</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5 shadow-inner">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-300">Sources Consulted</h3>
                {report.sources_consulted && report.sources_consulted.length > 0 ? (
                  <ul className="list-inside list-disc space-y-2 text-xs text-slate-300 font-light">
                    {report.sources_consulted.map((source, index) => (
                      <li key={index}>{source}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 font-light">No external sources consulted.</p>
                )}
              </div>
              
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5 shadow-inner">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-300">Retrieved Reference Materials</h3>
                {report.retrieved_documents && report.retrieved_documents.length > 0 ? (
                  <ul className="list-inside list-disc space-y-2 text-xs text-slate-300 font-light">
                    {report.retrieved_documents.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 font-light">No reference materials retrieved.</p>
                )}
              </div>
            </div>
          </section>

          {/* Risk Notes */}
          <section style={sectionStyle(400)} className="rounded-2xl glass-panel p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]" />
              <h2 className="text-xl font-bold tracking-wide text-white">Simulator Risk & Inconsistency Notes</h2>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5 shadow-inner">
              <ul className="space-y-3 text-xs leading-6 text-slate-300 font-light">
                {report.risk_notes.map((note, index) => (
                  <li key={`${note}-${index}`} className="flex gap-3">
                    <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.763-1.36 2.723-1.36 3.486 0l6.516 11.61c.75 1.337-.215 2.99-1.742 2.99H3.483c-1.527 0-2.492-1.653-1.742-2.99l6.516-11.61zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-7a1 1 0 00-.993.883L9 8v3a1 1 0 001.993.117L11 11V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Action Trigger */}
          <div style={sectionStyle(440)} className="flex justify-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 px-8 py-3.5 text-base font-bold text-slate-950 transition duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/20"
            >
              Run Another Simulation
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}