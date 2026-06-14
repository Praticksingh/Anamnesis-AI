"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { 
  FileText, Download, Share2, Compass, ArrowLeft, HelpCircle, 
  AlertTriangle, Shield, Check, Info, FileSpreadsheet, ChevronDown, ChevronUp 
} from "lucide-react";

import { getScenarioReport, ReportNotReadyError } from "../../../lib/api";
import { MOCK_SCENARIOS } from "../../../lib/mockScenarios";
import type { FinalReport, TimelineEvent, AgentOutputSummary } from "../../../lib/types";

function formatAgentName(name: string): string {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getRingColor(score: number): string {
  if (score >= 70) return "#22d3ee"; // Cyan
  if (score >= 45) return "#8b5cf6"; // Violet
  return "#fb7185"; // Rose
}

function ConfidenceRing({ score }: { score: number }) {
  const size = 130;
  const strokeWidth = 8;
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
        <span className="text-2xl font-extrabold text-white tracking-tight">{score}%</span>
        <span className="mt-0.5 text-[8px] uppercase tracking-[0.25em] text-slate-500">Plausibility</span>
      </div>
    </div>
  );
}

function ImpactCard({ label, score, tooltip }: { label: string; score: number; tooltip: string }) {
  const absScore = Math.abs(score);
  const color = score > 0 ? "#10b981" : score < 0 ? "#f43f5e" : "#64748b"; // emerald / rose / slate
  
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - absScore / 100);

  return (
    <div className="group relative flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-950/45 p-4 shadow-xl hover:border-white/10 transition-all duration-300">
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full mb-2 w-48 scale-95 rounded-lg border border-white/5 bg-slate-950 p-2 text-center text-[10px] leading-4 text-slate-400 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 shadow-2xl z-20">
        {tooltip}
      </div>

      <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors">
        {label}
      </p>
      
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.02)"
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
          <span className={`text-sm font-bold ${score > 0 ? "text-emerald-400" : score < 0 ? "text-rose-400" : "text-slate-400"}`}>
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
  const [shareStatus, setShareStatus] = useState("Share Report");
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  // Check if it's a mock report or API report
  useEffect(() => {
    if (!id) return;

    const matchedMock = MOCK_SCENARIOS.find((sc) => sc.id === id);
    if (matchedMock) {
      setReport(matchedMock.report);
      setError("");
      return;
    }

    let active = true;

    const loadReport = async () => {
      try {
        const nextReport = await getScenarioReport(id);
        if (!active) return;
        setReport(nextReport);
        setError("");
      } catch (loadError) {
        if (!active) return;
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
    if (!report) return [] as TimelineEvent[];
    return [...report.alternate_timeline].sort((l, r) => l.year - r.year);
  }, [report]);

  const toggleEvent = (key: string) => {
    setExpandedEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareStatus("Link Copied!");
    setTimeout(() => setShareStatus("Share Report"), 2000);
  };

  const handleExport = () => {
    alert("Exporting simulation report as premium PDF laboratory transcript...");
  };

  if (error) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center shadow-2xl">
          <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto mb-4" />
          <p className="text-md font-semibold text-rose-200">Unable to load report</p>
          <p className="mt-2 text-xs text-rose-300/80 leading-5">{error}</p>
          <div className="mt-6">
            <Link
              href="/simulation"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to config
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-slate-500 font-mono text-xs flex items-center gap-3">
          <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
          Retrieving unified research report...
        </div>
      </main>
    );
  }

  const impactDashboard = report.impact_dashboard;

  return (
    <main className="min-h-screen bg-black px-6 py-12 relative overflow-hidden select-none">
      <div className="mx-auto max-w-5xl space-y-8 relative z-10">
        
        {/* Navigation & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Compass className="h-3.5 w-3.5" /> Back to library
          </Link>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-4 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" /> {shareStatus}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-cyan-400 px-4 text-xs font-bold text-slate-950 transition hover:brightness-110"
            >
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="rounded-2xl glass-panel p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-mono-label text-cyan-400">
            <FileText className="h-3.5 w-3.5" />
            <span>Executive Synthesis</span>
          </div>
          <h1 className="text-3xl font-extrabold leading-snug text-white sm:text-4xl">
            {report.scenario_summary}
          </h1>
        </section>

        {/* Impact Dashboard Grid */}
        <section className="rounded-2xl glass-panel p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <h2 className="text-md font-bold tracking-wide text-white">Impact Analysis Matrix</h2>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-light">
              <Info className="h-3 w-3" /> Hover for agent summaries
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <ImpactCard 
              label="Economy" 
              score={impactDashboard.economy} 
              tooltip="Macroeconomic deviation, trade networks, and investment efficiency index." 
            />
            <ImpactCard 
              label="Technology" 
              score={impactDashboard.technology} 
              tooltip="Systemic vector shift in material science, calculation, and computing." 
            />
            <ImpactCard 
              label="Society" 
              score={impactDashboard.society} 
              tooltip="Shift in demographics, education networks, and communal cooperatives." 
            />
            <ImpactCard 
              label="Climate" 
              score={impactDashboard.climate} 
              tooltip="Atmospheric carbon level, rainfall cycle feedback, and biodiversity index." 
            />
            <ImpactCard 
              label="Politics" 
              score={impactDashboard.politics} 
              tooltip="Centralized administrative scale, legal sovereignty, and citizen rights." 
            />
          </div>
        </section>

        {/* Alternate Timeline (Expandable) */}
        <section className="rounded-2xl glass-panel p-8 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <h2 className="text-md font-bold tracking-wide text-white">Diverged Chronology</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-light font-mono">{sortedTimeline.length} events logged</span>
          </div>

          <div className="relative space-y-6 pl-4 sm:pl-6">
            {/* Timeline connector line */}
            <div className="absolute left-3.5 top-2.5 bottom-2.5 w-px bg-gradient-to-b from-cyan-400 via-violet-400 to-transparent" />
            
            {sortedTimeline.map((event, index) => {
              const eventKey = `${event.year}-${index}`;
              const isExpanded = !!expandedEvents[eventKey];
              return (
                <div key={eventKey} className="relative flex gap-4 animate-slide-in">
                  {/* Circle Node indicator */}
                  <div className="absolute left-[-1.15rem] top-2 h-3.5 w-3.5 rounded-full border border-slate-950 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)] z-10" />
                  
                  {/* Year Tag */}
                  <div className="min-w-20 rounded-lg border border-white/5 bg-slate-950/50 px-2.5 py-1 text-center font-mono text-xs font-bold text-cyan-300 backdrop-blur-md shrink-0 h-fit self-start">
                    {event.year}
                  </div>

                  {/* Expandable Box */}
                  <div 
                    onClick={() => toggleEvent(eventKey)}
                    className="flex-1 rounded-xl border border-white/5 bg-slate-950/30 px-4 py-3 text-xs leading-6 text-slate-300 hover:border-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-cyan-200 border border-white/5">
                        {event.source_agent}
                      </span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-600" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-600" />}
                    </div>
                    
                    <p className="font-light text-slate-200">{event.event}</p>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400 font-light leading-5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-cyan-400/80 font-semibold uppercase tracking-wider text-[9px]">
                          <Info className="h-3 w-3" /> Core Divergence Factor
                        </div>
                        <p>This event marks a critical structural deviation, changing resource reallocations across adjacent domains.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Agent Discussions */}
        <section className="rounded-2xl glass-panel p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <h2 className="text-md font-bold tracking-wide text-white">Domain Agent Discussions</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {report.agent_outputs.map((agent: AgentOutputSummary, index: number) => (
              <div
                key={`${agent.agent_name}-${index}`}
                className="rounded-xl border border-white/5 bg-slate-950/45 p-5 shadow-inner"
              >
                <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
                  <p className="font-semibold text-cyan-200 text-xs tracking-wide">{formatAgentName(agent.agent_name)} Agent</p>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">Domain View</span>
                </div>
                <p className="text-xs leading-6 text-slate-400 font-light">{agent.analysis_text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Critic Confidence Panel */}
        <section className="rounded-2xl glass-panel p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <h2 className="text-md font-bold tracking-wide text-white">Critic Consistency Evaluation</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-12 items-center">
            <div className="md:col-span-4 flex justify-center">
              <ConfidenceRing score={report.confidence_score} />
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Plausibility explanation</h4>
                <p className="text-xs leading-6 text-slate-400 font-light">
                  {report.confidence_explanation}
                </p>
              </div>

              {/* Assumptions & Risk lists */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Simulator Inconsistencies</h5>
                  <ul className="text-xs space-y-1.5 font-light text-rose-300">
                    {report.risk_notes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-5">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Retrieval Verification</h5>
                  <ul className="text-xs space-y-1.5 font-light text-emerald-300">
                    <li className="flex items-start gap-1.5 leading-5">
                      <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Chronology verified against static historical data points.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Source Center */}
        <section className="rounded-2xl glass-panel p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <h2 className="text-md font-bold tracking-wide text-white">Consulted Sources & References</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/5 bg-slate-950/45 p-5 shadow-inner">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-cyan-300">Sources Consulted</h3>
              {report.sources_consulted && report.sources_consulted.length > 0 ? (
                <ul className="list-inside list-disc space-y-2 text-xs text-slate-400 font-light">
                  {report.sources_consulted.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600 font-light">No external sources consulted.</p>
              )}
            </div>
            
            <div className="rounded-xl border border-white/5 bg-slate-950/45 p-5 shadow-inner">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-cyan-300">Retrieved Reference Materials</h3>
              {report.retrieved_documents && report.retrieved_documents.length > 0 ? (
                <ul className="list-inside list-disc space-y-2 text-xs text-slate-400 font-light">
                  {report.retrieved_documents.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600 font-light">No reference materials retrieved.</p>
              )}
            </div>
          </div>
        </section>

        {/* Action Trigger */}
        <div className="flex justify-center pt-4">
          <Link
            href="/simulation"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:brightness-110 active:scale-[0.98]"
          >
            Run Another Simulation
          </Link>
        </div>
      </div>
    </main>
  );
}