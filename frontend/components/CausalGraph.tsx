"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitBranch, Activity, Info, Link2, AlertCircle } from "lucide-react";
import type { UnifiedTimelineEvent, CausalLink } from "../lib/types";

interface CausalGraphProps {
  events: UnifiedTimelineEvent[];
  links?: CausalLink[];
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  event: UnifiedTimelineEvent;
}

export default function CausalGraph({
  events = [],
  links = [],
}: CausalGraphProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<{ source: string; target: string } | null>(null);

  // Agent styling configuration
  const agentStyles: Record<string, { color: string; label: string; text: string; bg: string; border: string }> = {
    historian: { color: "#22d3ee", label: "Historian", text: "text-cyan-400", bg: "bg-cyan-950/40", border: "border-cyan-500/20" },
    economist: { color: "#10b981", label: "Economist", text: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-500/20" },
    technology: { color: "#8b5cf6", label: "Tech Specialist", text: "text-violet-400", bg: "bg-violet-950/40", border: "border-violet-500/20" },
    society: { color: "#d946ef", label: "Sociologist", text: "text-fuchsia-400", bg: "bg-fuchsia-950/40", border: "border-fuchsia-500/20" },
    climate: { color: "#14b8a6", label: "Climatologist", text: "text-teal-400", bg: "bg-teal-950/40", border: "border-teal-500/20" },
    political: { color: "#3b82f6", label: "Political Agent", text: "text-blue-400", bg: "bg-blue-950/40", border: "border-blue-500/20" },
    energy: { color: "#f59e0b", label: "Energy Analyst", text: "text-amber-400", bg: "bg-amber-950/40", border: "border-amber-500/20" },
    healthcare: { color: "#f43f5e", label: "Healthcare Analyst", text: "text-rose-400", bg: "bg-rose-950/40", border: "border-rose-500/20" },
    demographics: { color: "#6366f1", label: "Demographics Agent", text: "text-indigo-400", bg: "bg-indigo-950/40", border: "border-indigo-500/20" },
  };

  // 1. Assign unique IDs to events if they don't have them
  const processedEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => a.year - b.year)
      .map((ev, idx) => ({
        ...ev,
        id: ev.id || `ev-${ev.year}-${idx}`,
        parent_ids: ev.parent_ids || [],
      }));
  }, [events]);

  // 2. Identify all active agents to structure Y-swimlanes
  const activeAgents = useMemo(() => {
    const list = new Set(processedEvents.map((e) => e.source_agent.toLowerCase()));
    return Array.from(list).sort();
  }, [processedEvents]);

  // 3. Compute SVG dimensions and node coordinates
  // Width: standard 850px. Height: dynamic based on lanes
  const width = 850;
  const laneHeight = 80;
  const paddingY = 60;
  const height = Math.max(300, activeAgents.length * laneHeight + paddingY * 2);

  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const count = processedEvents.length;

    processedEvents.forEach((event, index) => {
      // X-coord: space rank-ordered events evenly from left to right
      const x = count > 1 ? 80 + (index / (count - 1)) * (width - 180) : width / 2;

      // Y-coord: base on which lane the agent occupies
      const laneIndex = activeAgents.indexOf(event.source_agent.toLowerCase());
      const y = paddingY + laneIndex * laneHeight + laneHeight / 2;

      positions[event.id] = { id: event.id, x, y, event };
    });

    return positions;
  }, [processedEvents, activeAgents, height]);

  // 4. Resolve Links between nodes (either from report links or computed from parent_ids)
  const resolvedLinks = useMemo(() => {
    const linksList: { source: string; target: string; description: string }[] = [];

    // First use report's causal graph if present
    if (links && links.length > 0) {
      links.forEach((l) => {
        // Ensure source and target exist in nodePositions
        if (nodePositions[l.source] && nodePositions[l.target]) {
          linksList.push(l);
        }
      });
    }

    // Fallback: build links from parent_ids
    processedEvents.forEach((event) => {
      event.parent_ids.forEach((parentId) => {
        if (nodePositions[parentId] && nodePositions[event.id]) {
          // Find if link already exists
          const exists = linksList.some((l) => l.source === parentId && l.target === event.id);
          if (!exists) {
            linksList.push({
              source: parentId,
              target: event.id,
              description: `Causal progression from year ${nodePositions[parentId].event.year} event to year ${event.year} event.`,
            });
          }
        }
      });
    });

    return linksList;
  }, [links, processedEvents, nodePositions]);

  // 5. Recursive Graph Traversal to find all ancestral and descendant nodes for highlighting
  const highlightedNodeSet = useMemo(() => {
    const set = new Set<string>();
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return set;

    set.add(activeId);

    // Recursively find ancestors (parents, parents of parents, etc.)
    const addAncestors = (nodeId: string) => {
      resolvedLinks.forEach((link) => {
        if (link.target === nodeId && !set.has(link.source)) {
          set.add(link.source);
          addAncestors(link.source);
        }
      });
    };

    // Recursively find descendants (children, children's children, etc.)
    const addDescendants = (nodeId: string) => {
      resolvedLinks.forEach((link) => {
        if (link.source === nodeId && !set.has(link.target)) {
          set.add(link.target);
          addDescendants(link.target);
        }
      });
    };

    addAncestors(activeId);
    addDescendants(activeId);

    return set;
  }, [hoveredNodeId, selectedNodeId, resolvedLinks]);

  // Selected link description
  const activeLink = useMemo(() => {
    if (!selectedLinkId) return null;
    return resolvedLinks.find(
      (l) => l.source === selectedLinkId.source && l.target === selectedLinkId.target
    ) || null;
  }, [selectedLinkId, resolvedLinks]);

  // Selected node
  const activeNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodePositions[selectedNodeId]?.event || null;
  }, [selectedNodeId, nodePositions]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
      
      {/* SVG DAG Visualizer (col-span-8) */}
      <div className="xl:col-span-8 flex flex-col space-y-4">
        
        {/* Helper instruction */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-2">
          <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-cyan-400" /> Hover node to view causal chain; click node/link to inspect details</span>
          <span>Chronological flow Left ➔ Right</span>
        </div>

        <div className="relative border border-white/5 bg-slate-950/40 backdrop-blur-md rounded-2xl p-4 overflow-x-auto shadow-2xl">
          <svg 
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`}
            className="min-w-[800px] select-none"
          >
            {/* Draw Swimlane Grid Background */}
            {activeAgents.map((agent, index) => {
              const y = paddingY + index * laneHeight + laneHeight / 2;
              const style = agentStyles[agent] || { color: "rgba(255,255,255,0.05)" };
              return (
                <g key={agent} opacity={0.25}>
                  {/* Lane center dashed line */}
                  <line
                    x1={30}
                    y1={y}
                    x2={width - 30}
                    y2={y}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  {/* Lane labels */}
                  <text
                    x={20}
                    y={y + 3}
                    className="font-mono text-[9px] font-bold fill-slate-500 uppercase tracking-widest text-left"
                  >
                    {agentStyles[agent]?.label || agent}
                  </text>
                </g>
              );
            })}

            {/* Draw Causal Connective Curved Lines */}
            {resolvedLinks.map((link, idx) => {
              const sourceNode = nodePositions[link.source];
              const targetNode = nodePositions[link.target];

              if (!sourceNode || !targetNode) return null;

              // Cubic Bezier curve control points
              const x1 = sourceNode.x;
              const y1 = sourceNode.y;
              const x2 = targetNode.x;
              const y2 = targetNode.y;
              const cx1 = x1 + (x2 - x1) / 2;
              const cy1 = y1;
              const cx2 = x1 + (x2 - x1) / 2;
              const cy2 = y2;
              const pathD = `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;

              // Determine if link should be highlighted
              const isActiveId = hoveredNodeId || selectedNodeId;
              const isHighlighted = isActiveId && 
                highlightedNodeSet.has(link.source) && 
                highlightedNodeSet.has(link.target) &&
                (link.source === isActiveId || link.target === isActiveId);

              const isLinkSelected = selectedLinkId && selectedLinkId.source === link.source && selectedLinkId.target === link.target;

              return (
                <g key={`link-${idx}`}>
                  {/* Invisible thicker path for easier hovering/clicking */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="12"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedLinkId({ source: link.source, target: link.target });
                      setSelectedNodeId(null);
                    }}
                  />

                  {/* Visual Connection line */}
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={
                      isLinkSelected 
                        ? "#f59e0b" // Selected link gold
                        : isHighlighted 
                          ? "#22d3ee" // Highlighted path cyan
                          : "rgba(255, 255, 255, 0.08)"
                    }
                    strokeWidth={isLinkSelected ? 2.5 : isHighlighted ? 2 : 1}
                    className="transition-all duration-300"
                    strokeDasharray={isHighlighted ? "none" : "none"}
                  />

                  {/* Flow particle pulse animation on active links */}
                  {isHighlighted && (
                    <motion.circle
                      r="2.5"
                      fill="#22d3ee"
                      className="shadow-[0_0_8px_#22d3ee]"
                    >
                      <animateMotion
                        path={pathD}
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </motion.circle>
                  )}
                </g>
              );
            })}

            {/* Draw Interactive Nodes */}
            {Object.values(nodePositions).map((pos) => {
              const style = agentStyles[pos.event.source_agent.toLowerCase()] || { color: "#cbd5e1" };
              const isHovered = hoveredNodeId === pos.id;
              const isSelected = selectedNodeId === pos.id;
              
              const activeId = hoveredNodeId || selectedNodeId;
              const isHighlighted = activeId ? highlightedNodeSet.has(pos.id) : false;
              const isFaded = activeId && !isHighlighted;

              return (
                <g
                  key={pos.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredNodeId(pos.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => {
                    setSelectedNodeId(pos.id);
                    setSelectedLinkId(null);
                  }}
                  className="cursor-pointer"
                  style={{ opacity: isFaded ? 0.3 : 1, transition: "opacity 300ms ease" }}
                >
                  {/* Outer Pulsing Glow */}
                  {(isHovered || isSelected) && (
                    <circle
                      r="16"
                      fill="none"
                      stroke={style.color}
                      strokeWidth="1.5"
                      className="animate-ping"
                      style={{ animationDuration: "2s" }}
                    />
                  )}

                  {/* Base Circle Node */}
                  <circle
                    r="8"
                    fill="#020617"
                    stroke={isSelected ? "#22d3ee" : style.color}
                    strokeWidth={isSelected ? 3.5 : 2}
                    className="transition-all duration-300 shadow-xl"
                  />

                  {/* Inner center dot */}
                  <circle
                    r="3"
                    fill={style.color}
                  />

                  {/* Hover tooltip text preview / Year tag */}
                  <text
                    y="-15"
                    textAnchor="middle"
                    className="font-mono text-[9px] font-bold fill-slate-300 bg-slate-950 px-1 py-0.5 rounded"
                  >
                    CE {pos.event.year}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Causal Details Side Panel (col-span-4) */}
      <div className="xl:col-span-4 h-full">
        <div className="sticky top-6 p-6 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-md shadow-2xl space-y-6 h-fit min-h-[400px]">
          
          {/* Default Empty State */}
          {!activeNode && !activeLink && (
            <div className="flex flex-col items-center justify-center text-center h-[350px] text-slate-500 font-mono text-xs space-y-3">
              <GitBranch className="h-8 w-8 text-slate-800 animate-pulse" />
              <p>Select a node or click an SVG link path to view logical divergence details and causal dynamics.</p>
            </div>
          )}

          {/* Node Record View */}
          {activeNode && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-extrabold text-cyan-400">
                    CAUSAL NODE DETAILS
                  </span>
                  <span className="text-[10px] text-slate-500 font-light">
                    Year CE {activeNode.year}
                  </span>
                </div>
                <h3 className="text-md font-bold text-white leading-relaxed font-sans">
                  {activeNode.event}
                </h3>
              </div>

              {/* Lane Domain */}
              <div className={`p-4 rounded-xl border ${agentStyles[activeNode.source_agent.toLowerCase()]?.border || "border-white/5"} ${agentStyles[activeNode.source_agent.toLowerCase()]?.bg || "bg-slate-900/30"} space-y-2`}>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                  INFLUENCED DOMAIN
                </span>
                <span className={`text-xs font-semibold ${agentStyles[activeNode.source_agent.toLowerCase()]?.text || "text-white"}`}>
                  {agentStyles[activeNode.source_agent.toLowerCase()]?.label || activeNode.source_agent}
                </span>
                <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                  Events in this domain trigger cascading feedback parameters adjusting baseline indexes in adjacent systems.
                </p>
              </div>

              {/* Parents check */}
              {activeNode.parent_ids && activeNode.parent_ids.length > 0 && (
                <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30 space-y-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                    CAUSAL PREDECESSORS
                  </span>
                  <div className="space-y-2">
                    {activeNode.parent_ids.map((parentId) => {
                      const parentNode = nodePositions[parentId];
                      if (!parentNode) return null;
                      return (
                        <div
                          key={parentId}
                          onClick={() => setSelectedNodeId(parentId)}
                          className="p-2 rounded bg-black/45 hover:bg-slate-900 border border-white/5 hover:border-cyan-400/30 cursor-pointer transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-1 gap-1.5">
                            <span className="font-mono text-[9px] text-cyan-300">CE {parentNode.event.year}</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                              {parentNode.event.source_agent}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal line-clamp-1 font-light">
                            {parentNode.event.event}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Children Check (look up links where source is activeNode.id) */}
              <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30 space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                  DOWNSTREAM EFFECTS
                </span>
                {resolvedLinks.some((l) => l.source === activeNode.id) ? (
                  <div className="space-y-2">
                    {resolvedLinks
                      .filter((l) => l.source === activeNode.id)
                      .map((link) => {
                        const targetNode = nodePositions[link.target];
                        if (!targetNode) return null;
                        return (
                          <div
                            key={link.target}
                            onClick={() => setSelectedNodeId(link.target)}
                            className="p-2 rounded bg-black/45 hover:bg-slate-900 border border-white/5 hover:border-cyan-400/30 cursor-pointer transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-1 gap-1.5">
                              <span className="font-mono text-[9px] text-cyan-300">CE {targetNode.event.year}</span>
                              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                                {targetNode.event.source_agent}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal line-clamp-1 font-light">
                              {targetNode.event.event}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 font-light flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> No downstream events triggered by this node yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Link Record View */}
          {activeLink && (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <span className="font-mono text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> CAUSAL LINK REGISTER
                </span>
                <p className="mt-2 text-xs text-slate-400 font-light leading-relaxed">
                  Mapping divergence transmission path between two system milestones:
                </p>
              </div>

              {/* Source/Target Details */}
              <div className="space-y-3">
                <div 
                  onClick={() => {
                    setSelectedNodeId(activeLink.source);
                    setSelectedLinkId(null);
                  }}
                  className="p-3 rounded-xl border border-white/5 bg-slate-900/30 hover:border-cyan-400/30 cursor-pointer transition-all duration-300"
                >
                  <span className="text-[8px] font-mono font-bold text-cyan-300">SOURCE MILESTONE (CE {nodePositions[activeLink.source]?.event.year})</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-light mt-1 font-sans">{nodePositions[activeLink.source]?.event.event}</p>
                </div>

                <div className="flex justify-center text-slate-600">
                  <Activity className="h-5 w-5 animate-pulse rotate-90" />
                </div>

                <div 
                  onClick={() => {
                    setSelectedNodeId(activeLink.target);
                    setSelectedLinkId(null);
                  }}
                  className="p-3 rounded-xl border border-white/5 bg-slate-900/30 hover:border-cyan-400/30 cursor-pointer transition-all duration-300"
                >
                  <span className="text-[8px] font-mono font-bold text-violet-300">TARGET CONSEQUENCE (CE {nodePositions[activeLink.target]?.event.year})</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-light mt-1 font-sans">{nodePositions[activeLink.target]?.event.event}</p>
                </div>
              </div>

              {/* Causal Rationale */}
              <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400/80 block">
                  TRANSMISSION RATIONALE
                </span>
                <p className="text-[11px] text-amber-200 leading-relaxed font-light font-sans">
                  {activeLink.description}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
