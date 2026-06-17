"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe, Info, Activity, AlertCircle, Sparkles } from "lucide-react";
import type { AgentOutputSummary } from "../lib/types";

interface ImpactMapProps {
  scenarioTitle: string;
  scenarioSummary: string;
  agentOutputs?: AgentOutputSummary[];
}

interface RegionData {
  id: string;
  name: string;
  cx: string;
  cy: string;
  keywords: string[];
  baseInfo: string;
  // Stylized polygonal path representing the continent on an 800x450 canvas
  svgPath: string;
}

export default function ImpactMap({
  scenarioTitle = "",
  scenarioSummary = "",
  agentOutputs = [],
}: ImpactMapProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  // 6 Major global regions with keywords and stylized visual paths
  const regions: RegionData[] = [
    {
      id: "na",
      name: "North America",
      cx: "25%",
      cy: "38%",
      keywords: ["america", "california", "washington", "york", "canada", "mexico", "zev", "gm", "ev1"],
      baseInfo: "Primary testing ground for early electric mandates and digital infrastructure optimizations.",
      svgPath: "M 80,100 L 220,100 L 260,180 L 190,220 L 150,260 L 120,230 L 90,160 Z",
    },
    {
      id: "sa",
      name: "South America",
      cx: "38%",
      cy: "68%",
      keywords: ["amazon", "peru", "brazil", "chile", "andes", "incas", "silver", "platinum"],
      baseInfo: "Epicenter of precious metal mineral resource extraction and localized bio-reserve balancing.",
      svgPath: "M 200,260 L 240,290 L 290,320 L 260,400 L 220,420 L 180,310 Z",
    },
    {
      id: "europe",
      name: "Europe",
      cx: "48%",
      cy: "33%",
      keywords: ["rome", "roman", "britannia", "london", "amsterdam", "spain", "spanish", "greece", "greek", "alexandria", "senate", "europe", "germany", "france"],
      baseInfo: "Central hub of administrative authority, early steam networks, and decimal trade treaties.",
      svgPath: "M 380,110 L 460,90 L 490,140 L 440,210 L 370,180 L 350,140 Z",
    },
    {
      id: "africa",
      name: "Africa",
      cx: "51%",
      cy: "56%",
      keywords: ["africa", "sahara", "cairo", "nile", "chad", "egypt", "kingdoms", "monsoon", "chad"],
      baseInfo: "Key regulatory sink for global climate stability; transition zone for solar and advanced hydrology.",
      svgPath: "M 370,190 L 440,210 L 510,240 L 510,310 L 460,390 L 410,390 L 360,250 Z",
    },
    {
      id: "asia",
      name: "East & South Asia",
      cx: "75%",
      cy: "38%",
      keywords: ["china", "japan", "tokyo", "beijing", "song", "dynasty", "india", "eurasian", "silk", "paper", "fiat"],
      baseInfo: "Pioneers of paper credit networks, maritime commerce structures, and analog slide-rule micro-mechanics.",
      svgPath: "M 500,100 L 680,100 L 740,190 L 710,270 L 580,290 L 520,230 L 470,140 Z",
    },
    {
      id: "australia",
      name: "Australia & Oceania",
      cx: "82%",
      cy: "72%",
      keywords: ["australia", "oceania", "sydney", "melbourne", "pacific"],
      baseInfo: "Isolated testing buffer for deep ocean monitoring grids and resource extraction feedback loops.",
      svgPath: "M 660,310 L 740,310 L 770,360 L 720,380 L 650,340 Z",
    },
  ];

  // Scans the scenario parameters to find which regions are active
  const scannedRegions = useMemo(() => {
    const textToScan = `${scenarioTitle} ${scenarioSummary} ${agentOutputs.map((o) => o.analysis_text || "").join(" ")}`.toLowerCase();
    
    return regions.map((region) => {
      const isRelevant = region.keywords.some((kw) => textToScan.includes(kw));
      return {
        ...region,
        isRelevant,
      };
    });
  }, [scenarioTitle, scenarioSummary, agentOutputs]);

  // Extract agent texts matching the selected region keywords
  const regionNarratives = useMemo(() => {
    if (!selectedRegionId) return [];
    const region = regions.find((r) => r.id === selectedRegionId);
    if (!region) return [];

    return agentOutputs
      .filter((output) => {
        const text = (output.analysis_text || "").toLowerCase();
        return region.keywords.some((kw) => text.includes(kw));
      })
      .map((output) => ({
        agent: output.agent_name,
        text: output.analysis_text,
      }));
  }, [selectedRegionId, agentOutputs]);

  const activeRegion = useMemo(() => {
    return scannedRegions.find((r) => r.id === selectedRegionId) || null;
  }, [selectedRegionId, scannedRegions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      
      {/* SVG Interactive Map (col-span-8) */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        
        {/* Legend bar */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-2">
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            Click highlighted zones to view localized simulation logs
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" /> Focus Zone
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-800" /> Standard Zone
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative border border-white/5 bg-slate-950/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl p-4 min-h-[300px]">
          {/* Subtle background tech grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          <svg
            viewBox="0 0 800 450"
            className="w-full h-full object-contain relative z-10"
          >
            {/* Draw Continent Paths */}
            {scannedRegions.map((region) => {
              const isRelevant = region.isRelevant;
              const isHovered = hoveredRegionId === region.id;
              const isSelected = selectedRegionId === region.id;

              return (
                <g key={region.id}>
                  {/* Fill Polygon */}
                  <path
                    d={region.svgPath}
                    fill={
                      isSelected
                        ? "rgba(34, 211, 238, 0.15)"
                        : isHovered
                          ? "rgba(34, 211, 238, 0.08)"
                          : isRelevant
                            ? "rgba(139, 92, 246, 0.05)"
                            : "rgba(255, 255, 255, 0.01)"
                    }
                    stroke={
                      isSelected
                        ? "#22d3ee"
                        : isHovered
                          ? "rgba(34, 211, 238, 0.5)"
                          : isRelevant
                            ? "rgba(139, 92, 246, 0.3)"
                            : "rgba(255, 255, 255, 0.06)"
                    }
                    strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 1}
                    className="transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedRegionId(isSelected ? null : region.id)}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                  />

                  {/* Pulsing Pin Indicator for Relevant Regions */}
                  {isRelevant && (
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedRegionId(isSelected ? null : region.id)}
                      onMouseEnter={() => setHoveredRegionId(region.id)}
                      onMouseLeave={() => setHoveredRegionId(null)}
                    >
                      <circle
                        cx={region.cx}
                        cy={region.cy}
                        r="4"
                        fill="#22d3ee"
                        className="shadow-[0_0_8px_#22d3ee]"
                      />
                      <circle
                        cx={region.cx}
                        cy={region.cy}
                        r="14"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="0.75"
                        className="animate-ping"
                        style={{ animationDuration: "3s" }}
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Regional Info Details Panel (col-span-4) */}
      <div className="lg:col-span-4 h-full">
        <div className="sticky top-6 p-6 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-md shadow-2xl space-y-6 h-fit min-h-[350px] flex flex-col justify-between">
          
          {/* Node Record View */}
          <div className="space-y-4">
            {!activeRegion ? (
              <div className="flex flex-col items-center justify-center text-center py-16 text-slate-500 font-mono text-xs space-y-3">
                <Globe className="h-8 w-8 text-slate-800 animate-spin-slow" />
                <p>Click any continent region on the map to query local geographical divergence narratives.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> LOCAL GEOGRAPHIC RECORD
                    </span>
                    {activeRegion.isRelevant && (
                      <span className="text-[9px] font-bold uppercase text-emerald-400 bg-emerald-950/30 border border-emerald-500/10 px-1.5 py-0.5 rounded">
                        SCENARIO FOCUS
                      </span>
                    )}
                  </div>
                  <h3 className="text-md font-bold text-white font-sans">
                    {activeRegion.name}
                  </h3>
                </div>

                <div className="p-3.5 rounded-xl border border-white/5 bg-slate-900/30">
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {activeRegion.baseInfo}
                  </p>
                </div>

                {/* Local Scanned narratives */}
                <div className="space-y-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                    LOCALIZED AGENT BRIEFINGS
                  </span>

                  {regionNarratives.length > 0 ? (
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                      {regionNarratives.map((narrative, idx) => (
                        <div key={idx} className="p-2.5 rounded bg-black/45 border border-white/5 space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-300">
                            {narrative.agent} Agent
                          </span>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                            {narrative.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-600 font-light flex items-center gap-1.5 py-4 justify-center bg-black/20 rounded-lg border border-dashed border-white/5">
                      <AlertCircle className="h-3.5 w-3.5" /> No specific local narratives extracted.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {activeRegion && activeRegion.isRelevant && (
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="text-[9px] text-cyan-300 leading-normal font-light">
                Scenario divergence is heavily grounded in geographic variables of this region.
              </span>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
