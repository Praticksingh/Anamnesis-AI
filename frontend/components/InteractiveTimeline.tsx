"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, Calendar, ZoomIn, Info, ShieldAlert, ShieldCheck, 
  MapPin, Eye, BookOpen, Clock, Activity, GitBranch
} from "lucide-react";
import type { UnifiedTimelineEvent, GroundingValidation } from "../lib/types";

interface InteractiveTimelineProps {
  events: UnifiedTimelineEvent[];
  validations?: GroundingValidation[];
  onBranch?: (event: UnifiedTimelineEvent) => void;
}

export default function InteractiveTimeline({
  events = [],
  validations = [],
  onBranch,
}: InteractiveTimelineProps) {
  const [zoomLevel, setZoomLevel] = useState<"full" | "decades" | "years">("full");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Agent colors mapping
  const agentColors: Record<string, { bg: string; text: string; border: string; glow: string; label: string; color: string }> = {
    historian: { bg: "bg-cyan-950/40", text: "text-cyan-400", border: "border-cyan-500/30", glow: "shadow-cyan-400/20", label: "Historian", color: "#22d3ee" },
    economist: { bg: "bg-emerald-950/40", text: "text-emerald-400", border: "border-emerald-500/30", glow: "shadow-emerald-400/20", label: "Economist", color: "#10b981" },
    technology: { bg: "bg-violet-950/40", text: "text-violet-400", border: "border-violet-500/30", glow: "shadow-violet-400/20", label: "Tech Specialist", color: "#8b5cf6" },
    society: { bg: "bg-fuchsia-950/40", text: "text-fuchsia-400", border: "border-fuchsia-500/30", glow: "shadow-fuchsia-400/20", label: "Sociologist", color: "#d946ef" },
    climate: { bg: "bg-teal-950/40", text: "text-teal-400", border: "border-teal-500/30", glow: "shadow-teal-400/20", label: "Climatologist", color: "#14b8a6" },
    political: { bg: "bg-blue-950/40", text: "text-blue-400", border: "border-blue-500/30", glow: "shadow-blue-400/20", label: "Political Agent", color: "#3b82f6" },
    energy: { bg: "bg-amber-950/40", text: "text-amber-400", border: "border-amber-500/30", glow: "shadow-amber-400/20", label: "Energy Analyst", color: "#f59e0b" },
    healthcare: { bg: "bg-rose-950/40", text: "text-rose-400", border: "border-rose-500/30", glow: "shadow-rose-400/20", label: "Healthcare Analyst", color: "#f43f5e" },
    demographics: { bg: "bg-indigo-950/40", text: "text-indigo-400", border: "border-indigo-500/30", glow: "shadow-indigo-400/20", label: "Demographics Agent", color: "#6366f1" },
    critic: { bg: "bg-orange-950/40", text: "text-orange-400", border: "border-orange-500/30", glow: "shadow-orange-400/20", label: "Critic", color: "#f97316" },
  };

  // Get distinct agents present in events
  const agents = useMemo(() => {
    const list = new Set(events.map((e) => e.source_agent));
    return Array.from(list);
  }, [events]);

  // Filter events based on agent choice
  const filteredEvents = useMemo(() => {
    let list = [...events].sort((a, b) => a.year - b.year);
    if (selectedAgent !== "all") {
      list = list.filter((e) => e.source_agent === selectedAgent);
    }
    return list;
  }, [events, selectedAgent]);

  // Decades Grouping
  const decadeGroups = useMemo(() => {
    const groups: Record<number, UnifiedTimelineEvent[]> = {};
    filteredEvents.forEach((event) => {
      const decade = Math.floor(event.year / 10) * 10;
      if (!groups[decade]) {
        groups[decade] = [];
      }
      groups[decade].push(event);
    });
    return Object.entries(groups)
      .map(([decade, evs]) => ({ decade: parseInt(decade), events: evs }))
      .sort((a, b) => a.decade - b.decade);
  }, [filteredEvents]);

  // Specific selected event
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return events.find((e, idx) => {
      const uniqueKey = e.id || `${e.year}-${idx}`;
      return uniqueKey === selectedEventId;
    }) || null;
  }, [events, selectedEventId]);

  // Matching Validation for Selected Event's Agent
  const selectedEventValidation = useMemo(() => {
    if (!selectedEvent) return null;
    return validations.find((v) => v.agent_name.toLowerCase() === selectedEvent.source_agent.toLowerCase()) || null;
  }, [selectedEvent, validations]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      
      {/* Controls & Timeline Columns (col-span-8) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 rounded-xl border border-white/5 bg-slate-950/30 backdrop-blur-md">
          {/* Zoom Switches */}
          <div className="flex items-center gap-1.5 bg-black/45 p-1 rounded-lg border border-white/5">
            {(["full", "decades", "years"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setZoomLevel(mode)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-300 ${
                  zoomLevel === mode
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {mode === "full" ? "Full View" : mode === "decades" ? "Decades" : "Years"}
              </button>
            ))}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedAgent("all")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 ${
                selectedAgent === "all"
                  ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                  : "border-white/5 bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              All Domains
            </button>
            {agents.map((agent) => {
              const style = agentColors[agent.toLowerCase()] || { border: "border-white/5", bg: "bg-white/5", text: "text-slate-400" };
              const isSelected = selectedAgent === agent;
              return (
                <button
                  key={agent}
                  onClick={() => setSelectedAgent(agent)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 ${
                    isSelected
                      ? `${style.border} ${style.bg} ${style.text} shadow-sm`
                      : "border-white/5 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {agentColors[agent.toLowerCase()]?.label || agent}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Event list */}
        <div className="relative p-6 rounded-2xl border border-white/5 bg-slate-950/20 shadow-xl overflow-hidden min-h-[400px]">
          <div className="absolute inset-y-6 left-10 w-0.5 bg-gradient-to-b from-cyan-400 via-violet-400 to-transparent opacity-60" />

          {/* If no events */}
          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500 font-mono text-xs">
              <Clock className="h-8 w-8 text-slate-700 mb-2 animate-pulse" />
              No events found for this filter combination.
            </div>
          )}

          {/* Zoom Level: Full (Sequential Chronological) */}
          {zoomLevel === "full" && (
            <div className="space-y-6 relative">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, idx) => {
                  const uniqueKey = event.id || `${event.year}-${idx}`;
                  const style = agentColors[event.source_agent.toLowerCase()] || { text: "text-slate-300", border: "border-white/5", bg: "bg-white/5", glow: "" };
                  const isSelected = selectedEventId === uniqueKey;

                  return (
                    <motion.div
                      key={uniqueKey}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setSelectedEventId(uniqueKey)}
                      className={`relative pl-12 cursor-pointer group ${isSelected ? "z-10" : ""}`}
                    >
                      {/* Node Circle */}
                      <div className={`absolute left-2.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-black bg-slate-950 transition-all duration-300 ${
                        isSelected 
                          ? "bg-cyan-400 scale-125 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" 
                          : "group-hover:bg-cyan-400 group-hover:scale-110"
                      }`} />

                      {/* Card Content */}
                      <div className={`p-4 rounded-xl border transition-all duration-300 ${
                        isSelected 
                          ? "border-cyan-400/30 bg-slate-900/60 shadow-xl" 
                          : "border-white/5 bg-slate-950/30 hover:border-white/10 hover:bg-slate-900/40"
                      }`}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/35 px-2 py-0.5 rounded border border-cyan-500/10">
                            CE {event.year}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                            {agentColors[event.source_agent.toLowerCase()]?.label || event.source_agent}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-light font-sans">{event.event}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Zoom Level: Decades (Grouped) */}
          {zoomLevel === "decades" && (
            <div className="space-y-8 relative">
              {decadeGroups.map(({ decade, events: groupEvents }) => (
                <div key={decade} className="relative pl-12 space-y-4">
                  {/* Decade Header Node */}
                  <div className="absolute left-1.5 top-1 h-5 w-5 rounded-full border border-violet-400 bg-slate-950 flex items-center justify-center shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  </div>
                  <h3 className="font-mono text-xs font-extrabold text-violet-400 uppercase tracking-widest pt-0.5">
                    {decade}s DECADE
                  </h3>

                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                    {groupEvents.map((event, idx) => {
                      const uniqueKey = event.id || `${event.year}-${idx}`;
                      const isSelected = selectedEventId === uniqueKey;
                      const style = agentColors[event.source_agent.toLowerCase()] || { text: "text-slate-300", border: "border-white/5", bg: "bg-white/5", glow: "" };

                      return (
                        <div
                          key={uniqueKey}
                          onClick={() => setSelectedEventId(uniqueKey)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                            isSelected 
                              ? "border-cyan-400/30 bg-slate-900/60 shadow-xl" 
                              : "border-white/5 bg-slate-950/30 hover:border-white/10 hover:bg-slate-900/40"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <span className="font-mono text-[10px] font-bold text-cyan-300">{event.year}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                              {agentColors[event.source_agent.toLowerCase()]?.label || event.source_agent}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-normal line-clamp-2 font-light">{event.event}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Zoom Level: Years (Linear Chronology Timeline Scrolling) */}
          {zoomLevel === "years" && (
            <div className="space-y-6 relative pl-12">
              {/* Year list */}
              {filteredEvents.map((event, idx) => {
                const uniqueKey = event.id || `${event.year}-${idx}`;
                const isSelected = selectedEventId === uniqueKey;
                const style = agentColors[event.source_agent.toLowerCase()] || { text: "text-slate-300", border: "border-white/5", bg: "bg-white/5", glow: "" };

                return (
                  <div 
                    key={uniqueKey}
                    onClick={() => setSelectedEventId(uniqueKey)}
                    className="relative flex gap-6 group cursor-pointer"
                  >
                    {/* Node on line */}
                    <div className={`absolute left-[-2.15rem] top-1.5 h-3 w-3 rounded-full border border-black bg-slate-950 transition-all duration-300 ${
                      isSelected 
                        ? "bg-cyan-400 scale-125 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" 
                        : "group-hover:bg-cyan-400"
                    }`} />

                    {/* Left side year indicator */}
                    <div className="w-16 shrink-0 text-right font-mono text-xs font-bold text-cyan-400 mt-0.5">
                      {event.year}
                    </div>

                    {/* Right side narrative card */}
                    <div className={`flex-1 p-3 rounded-xl border transition-all duration-300 ${
                      isSelected 
                        ? "border-cyan-400/30 bg-slate-900/60 shadow-xl" 
                        : "border-white/5 bg-slate-950/30 hover:border-white/10 hover:bg-slate-900/40"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                          {agentColors[event.source_agent.toLowerCase()]?.label || event.source_agent}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-light">{event.event}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel Column (col-span-4) */}
      <div className="lg:col-span-4 h-full">
        <div className="sticky top-6 p-6 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-md shadow-2xl space-y-6 h-fit min-h-[400px]">
          
          <AnimatePresence mode="wait">
            {!selectedEvent ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center h-[350px] text-slate-500 font-mono text-xs space-y-3"
              >
                <Activity className="h-8 w-8 text-slate-800 animate-pulse" />
                <p>Click any event in the timeline to inspect grounding validations and divergence causality.</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedEventId || "selected-event"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Meta header */}
                <div className="border-b border-white/5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-extrabold text-cyan-400">
                      TIMELINE NODE RECORD
                    </span>
                    <span className="text-[10px] text-slate-500 font-light flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> CE {selectedEvent.year}
                    </span>
                  </div>
                  <h3 className="text-md font-bold text-white leading-normal font-sans">
                    {selectedEvent.event}
                  </h3>
                </div>

                {/* Agent Card */}
                <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                    REPORTING DOMAIN AGENT
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full animate-pulse"
                      style={{ backgroundColor: agentColors[selectedEvent.source_agent.toLowerCase()]?.color || "#fff" }}
                    />
                    <span className="text-xs font-semibold text-white">
                      {agentColors[selectedEvent.source_agent.toLowerCase()]?.label || selectedEvent.source_agent}
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400 font-light leading-relaxed">
                    This agent is responsible for auditing the parameters of {selectedEvent.source_agent} development, simulating adjustments, and cross-verifying adjacent system feedbacks.
                  </p>
                </div>

                {/* Grounding Validation Info */}
                {selectedEventValidation ? (
                  <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        GROUNDING VERIFICATION
                      </span>
                      {selectedEventValidation.grounding_score >= 75 ? (
                        <span className="text-[9px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" /> SECURE
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase text-rose-400 flex items-center gap-1">
                          <ShieldAlert className="h-3.5 w-3.5 animate-bounce" /> SUSPECT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Grounding Score</span>
                      <span className={`text-sm font-extrabold ${
                        selectedEventValidation.grounding_score >= 75 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {selectedEventValidation.grounding_score}%
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                      {selectedEventValidation.explanation}
                    </p>

                    {selectedEventValidation.unsupported_claims && selectedEventValidation.unsupported_claims.length > 0 && (
                      <div className="mt-2 p-2 rounded bg-rose-950/20 border border-rose-500/10 space-y-1">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-rose-300 block">
                          WARNING: UNSUPPORTED CLAIMS
                        </span>
                        <ul className="text-[9px] text-rose-400/90 list-disc list-inside space-y-1 font-light">
                          {selectedEventValidation.unsupported_claims.map((claim, idx) => (
                            <li key={idx} className="line-clamp-2">{claim}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30 text-center py-5">
                    <ShieldCheck className="h-5 w-5 text-slate-600 mx-auto mb-1.5" />
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Grounding Verified
                    </span>
                    <span className="text-[9px] text-slate-600 font-light mt-0.5 block">
                      Calibrated against baseline historical record.
                    </span>
                  </div>
                )}

                {/* Causal links check */}
                {selectedEvent.parent_ids && selectedEvent.parent_ids.length > 0 && (
                  <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                      CAUSAL ANCESTRY
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEvent.parent_ids.map((parentId) => (
                        <div
                          key={parentId}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-cyan-300 hover:border-cyan-500/20 transition-colors"
                        >
                          {parentId}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {onBranch && (
                  <button
                    type="button"
                    onClick={() => onBranch(selectedEvent)}
                    className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 text-xs font-bold text-white uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-md hover:shadow-cyan-500/20"
                  >
                    <GitBranch className="h-3.5 w-3.5" /> Branch Timeline Here
                  </button>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
      
    </div>
  );
}
