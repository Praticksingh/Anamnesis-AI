"use client";

import { useMemo } from "react";
import { ArrowLeftRight, HelpCircle, Activity, Info, GitFork, Sparkles, Scale } from "lucide-react";
import type { FinalReport } from "../lib/types";

interface ComparisonViewProps {
  reportA: FinalReport;
  reportB: FinalReport;
  titleA?: string;
  titleB?: string;
}

export default function ComparisonView({
  reportA,
  reportB,
  titleA = "Scenario A",
  titleB = "Scenario B",
}: ComparisonViewProps) {
  
  // 1. Calculate delta metrics
  const deltas = useMemo(() => {
    const plausibilityDelta = (reportA.confidence_score || 0) - (reportB.confidence_score || 0);
    const uncertaintyDelta = (reportA.uncertainty_score || 0) - (reportB.uncertainty_score || 0);
    const calibrationDelta = (reportA.calibration_score || 100) - (reportB.calibration_score || 100);

    const formatDelta = (val: number, isPercent = false) => {
      const sign = val > 0 ? "+" : "";
      const displayVal = isPercent ? `${val.toFixed(0)}%` : val.toFixed(1);
      return `${sign}${displayVal}`;
    };

    return {
      plausibility: {
        valA: reportA.confidence_score || 0,
        valB: reportB.confidence_score || 0,
        delta: formatDelta(plausibilityDelta, true),
        color: plausibilityDelta >= 0 ? "text-emerald-400" : "text-rose-400",
      },
      uncertainty: {
        valA: reportA.uncertainty_score || 0,
        valB: reportB.uncertainty_score || 0,
        delta: formatDelta(uncertaintyDelta),
        color: uncertaintyDelta <= 0 ? "text-emerald-400" : "text-rose-400", // Lower uncertainty is typically preferred
      },
      calibration: {
        valA: reportA.calibration_score || 100,
        valB: reportB.calibration_score || 100,
        delta: formatDelta(calibrationDelta, true),
        color: calibrationDelta >= 0 ? "text-emerald-400" : "text-rose-400",
      },
    };
  }, [reportA, reportB]);

  // 2. Align timelines chronologically
  const unifiedTimeline = useMemo(() => {
    const yearsSet = new Set<number>();
    reportA.alternate_timeline.forEach((e) => yearsSet.add(e.year));
    reportB.alternate_timeline.forEach((e) => yearsSet.add(e.year));

    const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

    return sortedYears.map((year) => {
      const eventA = reportA.alternate_timeline.find((e) => e.year === year) || null;
      const eventB = reportB.alternate_timeline.find((e) => e.year === year) || null;

      // Classify divergence:
      // - "shared": both have events in this year
      // - "branch-a": only A has event
      // - "branch-b": only B has event
      let type: "shared" | "branch-a" | "branch-b" = "shared";
      if (eventA && !eventB) type = "branch-a";
      if (!eventA && eventB) type = "branch-b";

      return {
        year,
        eventA,
        eventB,
        type,
      };
    });
  }, [reportA, reportB]);

  // Impact Dashboard comparison
  const impactDimensions = [
    { key: "economy" as const, label: "Economy" },
    { key: "technology" as const, label: "Technology" },
    { key: "society" as const, label: "Society" },
    { key: "politics" as const, label: "Politics" },
    { key: "climate" as const, label: "Climate" },
  ];

  return (
    <div className="space-y-10 w-full">
      
      {/* Comparison Header Cards (Dual View metadata) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Scenario A Meta Card */}
        <div className="p-6 rounded-2xl border border-cyan-500/15 bg-cyan-950/5 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            SIMULATION PATHWAY A
          </div>
          <h2 className="text-xl font-bold text-white font-sans">{titleA}</h2>
          <p className="text-xs text-slate-400 font-light leading-relaxed">{reportA.scenario_summary}</p>
        </div>

        {/* Scenario B Meta Card */}
        <div className="p-6 rounded-2xl border border-violet-500/15 bg-violet-950/5 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-[10px] text-violet-400 font-bold uppercase tracking-wider font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            SIMULATION PATHWAY B
          </div>
          <h2 className="text-xl font-bold text-white font-sans">{titleB}</h2>
          <p className="text-xs text-slate-400 font-light leading-relaxed">{reportB.scenario_summary}</p>
        </div>

      </div>

      {/* Metric Differences Dashboard */}
      <div className="p-6 rounded-2xl border border-white/5 bg-slate-950/45 backdrop-blur-sm space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
          <Scale className="h-4 w-4 text-cyan-400" /> Variance Delta Metrics
        </h3>

        {/* Scores Delta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Plausibility comparison */}
          <div className="p-4 rounded-xl bg-black/45 border border-white/5 flex flex-col justify-between space-y-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Plausibility</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-white">
                {deltas.plausibility.valA}% <span className="text-[10px] font-light text-slate-500">vs</span> {deltas.plausibility.valB}%
              </span>
              <span className={`text-xs font-bold font-mono ${deltas.plausibility.color}`}>
                {deltas.plausibility.delta}
              </span>
            </div>
          </div>

          {/* Uncertainty Comparison */}
          <div className="p-4 rounded-xl bg-black/45 border border-white/5 flex flex-col justify-between space-y-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Uncertainty (StDev)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-white">
                {deltas.uncertainty.valA.toFixed(1)} <span className="text-[10px] font-light text-slate-500">vs</span> {deltas.uncertainty.valB.toFixed(1)}
              </span>
              <span className={`text-xs font-bold font-mono ${deltas.uncertainty.color}`}>
                {deltas.uncertainty.delta}
              </span>
            </div>
          </div>

          {/* Calibration Comparison */}
          <div className="p-4 rounded-xl bg-black/45 border border-white/5 flex flex-col justify-between space-y-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Chronology Pacing</span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-white">
                {deltas.calibration.valA}% <span className="text-[10px] font-light text-slate-500">vs</span> {deltas.calibration.valB}%
              </span>
              <span className={`text-xs font-bold font-mono ${deltas.calibration.color}`}>
                {deltas.calibration.delta}
              </span>
            </div>
          </div>

        </div>

        {/* Dimension impact scores slider delta */}
        <div className="space-y-4 pt-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">Domain Impact Comparisons</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {impactDimensions.map((dim) => {
              const valA = reportA.impact_dashboard[dim.key] || 0;
              const valB = reportB.impact_dashboard[dim.key] || 0;
              const diff = valA - valB;

              return (
                <div key={dim.key} className="p-3 bg-black/20 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{dim.label}</span>
                    <span className="font-mono font-bold text-[10px]">
                      <span className="text-cyan-400">{valA > 0 ? "+" : ""}{valA}</span>
                      <span className="text-slate-600 px-1">/</span>
                      <span className="text-violet-400">{valB > 0 ? "+" : ""}{valB}</span>
                    </span>
                  </div>
                  
                  {/* Delta Bar */}
                  <div className="relative h-2 bg-slate-900 rounded overflow-hidden flex">
                    <div 
                      className="bg-cyan-400 h-full transition-all duration-1000"
                      style={{ width: `${Math.max(0, Math.min(100, (valA + 100) / 2))}%` }}
                    />
                    <div 
                      className="bg-violet-500 h-full transition-all duration-1000"
                      style={{ width: `${Math.max(0, Math.min(100, (valB + 100) / 2))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Side-by-Side Chronology Tree View */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono px-2">
          <ArrowLeftRight className="h-4 w-4 text-cyan-400" /> Chronology Alignment & Divergence Tree
        </h3>

        <div className="relative p-6 border border-white/5 bg-slate-950/20 rounded-2xl shadow-xl min-h-[400px]">
          {/* Vertical timeline trunk line */}
          <div className="absolute left-1/2 top-6 bottom-6 w-px bg-slate-800 -translate-x-1/2 hidden md:block" />

          {/* Sequential aligned events */}
          <div className="space-y-8 relative">
            {unifiedTimeline.map((item, idx) => {
              return (
                <div key={item.year} className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 relative">
                  
                  {/* Left Column: Event A */}
                  <div className="md:col-span-5 text-right flex flex-col items-end">
                    {item.eventA ? (
                      <div className="p-4 rounded-xl border border-cyan-500/10 bg-cyan-950/10 hover:border-cyan-500/20 transition-all duration-300 text-left w-full md:w-fit max-w-sm">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[8px] font-bold uppercase text-cyan-400 bg-cyan-950/40 border border-cyan-500/10 px-1.5 py-0.5 rounded">
                            {item.eventA.source_agent}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                          {item.eventA.event}
                        </p>
                      </div>
                    ) : (
                      <div className="hidden md:block w-48 border border-dashed border-white/5 rounded-xl p-3 text-center text-[9px] text-slate-700 italic">
                        No recorded pathway milestone
                      </div>
                    )}
                  </div>

                  {/* Center Column: Year Circle */}
                  <div className="md:col-span-2 flex justify-center z-10 my-2 md:my-0">
                    <div className={`h-10 w-16 rounded-lg border font-mono text-[10px] font-extrabold flex flex-col items-center justify-center backdrop-blur-md transition-all duration-300 ${
                      item.type === "shared"
                        ? "border-amber-400 bg-slate-950 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                        : item.type === "branch-a"
                          ? "border-cyan-500/40 bg-slate-950 text-cyan-300"
                          : "border-violet-500/40 bg-slate-950 text-violet-300"
                    }`}>
                      <span>CE {item.year}</span>
                      {item.type === "shared" && (
                        <span className="text-[7px] text-amber-500 font-bold uppercase tracking-tighter mt-0.5 flex items-center gap-0.5">
                          <GitFork className="h-2 w-2" /> Diverge
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Event B */}
                  <div className="md:col-span-5 text-left flex flex-col items-start">
                    {item.eventB ? (
                      <div className="p-4 rounded-xl border border-violet-500/10 bg-violet-950/10 hover:border-violet-500/20 transition-all duration-300 text-left w-full md:w-fit max-w-sm">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[8px] font-bold uppercase text-violet-400 bg-violet-950/40 border border-violet-500/10 px-1.5 py-0.5 rounded">
                            {item.eventB.source_agent}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                          {item.eventB.event}
                        </p>
                      </div>
                    ) : (
                      <div className="hidden md:block w-48 border border-dashed border-white/5 rounded-xl p-3 text-center text-[9px] text-slate-700 italic">
                        No recorded pathway milestone
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}
