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
  if (score >= 70) {
    return "#34d399";
  }

  if (score >= 40) {
    return "#facc15";
  }

  return "#f87171";
}

function ConfidenceRing({ score }: { score: number }) {
  const size = 160;
  const strokeWidth = 12;
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
          stroke="rgba(255,255,255,0.08)"
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
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-white">{score}%</span>
        <span className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">Confidence</span>
      </div>
    </div>
  );
}

function ImpactCard({ label, score }: { label: string; score: number }) {
  const normalizedWidth = `${Math.abs(score) * 0.5}%`;
  const isPositive = score >= 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-300">{label}</p>
        <p className={`text-lg font-semibold ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>
          {score >= 0 ? "+" : ""}
          {score}
        </p>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-slate-900/80 ring-1 ring-white/10">
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/25" />
        {isPositive ? (
          <div
            className="absolute left-1/2 top-0 h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
            style={{ width: normalizedWidth }}
          />
        ) : (
          <div
            className="absolute right-1/2 top-0 h-full rounded-full bg-gradient-to-l from-rose-400 to-red-500"
            style={{ width: normalizedWidth }}
          />
        )}
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
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
          <div className="w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center backdrop-blur-md">
            <p className="text-lg font-semibold text-rose-100">Unable to load report</p>
            <p className="mt-2 text-sm text-rose-100/90">{error}</p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
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
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16 text-slate-300">
          Loading report...
        </div>
      </main>
    );
  }

  const impactDashboard: ImpactDashboard = report.impact_dashboard;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="space-y-8">
          <section style={sectionStyle(0)} className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">Simulation Report</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {report.scenario_summary}
            </h1>
          </section>

          <section style={sectionStyle(80)} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <h2 className="text-2xl font-semibold text-white">Agent Discussion</h2>
            </div>
            <div className="space-y-4">
              {report.agent_outputs.map((agent: AgentOutputSummary, index: number) => (
                <div
                  key={`${agent.agent_name}-${index}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-lg"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="font-semibold text-cyan-200">{formatAgentName(agent.agent_name)}</p>
                    <span className="text-xs uppercase tracking-[0.26em] text-slate-500">Analysis</span>
                  </div>
                  <p className="text-sm leading-7 text-slate-200">{agent.analysis_text}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={sectionStyle(160)} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
              <h2 className="text-2xl font-semibold text-white">Alternate Timeline</h2>
            </div>

            <div className="relative space-y-6 pl-6">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-cyan-400/80 via-violet-400/70 to-transparent" />
              {sortedTimeline.map((event: TimelineEvent, index: number) => (
                <div key={`${event.year}-${index}`} className="relative flex gap-4">
                  <div className="absolute left-[-1.1rem] top-2 h-4 w-4 rounded-full border-2 border-slate-950 bg-cyan-400 shadow-[0_0_0_4px_rgba(34,211,238,0.12)]" />
                  <div className="min-w-20 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-center text-sm font-semibold text-cyan-200 backdrop-blur-md">
                    {event.year}
                  </div>
                  <div className="flex-1 rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm leading-7 text-slate-200">
                    {event.event}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={sectionStyle(240)} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-2xl font-semibold text-white">Impact Dashboard</h2>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <ImpactCard label="Economy" score={impactDashboard.economy} />
              <ImpactCard label="Technology" score={impactDashboard.technology} />
              <ImpactCard label="Society" score={impactDashboard.society} />
              <ImpactCard label="Politics" score={impactDashboard.politics} />
            </div>
          </section>

          <section style={sectionStyle(320)} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <h2 className="text-2xl font-semibold text-white">Confidence Score</h2>
            </div>

            <div className="flex flex-col items-center justify-center py-3 sm:flex-row sm:gap-8">
              <ConfidenceRing score={report.confidence_score} />
              <p className="mt-4 max-w-xl text-center text-sm leading-7 text-slate-300 sm:mt-0 sm:text-left">
                Higher scores indicate stronger internal consistency across the alternate timeline and agent outputs.
              </p>
            </div>
          </section>

          <section style={sectionStyle(400)} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <h2 className="text-2xl font-semibold text-white">Risk Notes</h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
              <ul className="space-y-3 text-sm leading-7 text-slate-200">
                {report.risk_notes.map((note, index) => (
                  <li key={`${note}-${index}`} className="flex gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
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

          <div style={sectionStyle(480)} className="flex justify-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-violet-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Run Another Simulation
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}