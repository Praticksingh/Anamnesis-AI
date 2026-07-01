"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, ArrowRight, Sparkles, Route } from "lucide-react";
import type { CausalLink, UnifiedTimelineEvent } from "../lib/types";

type TreeNode = {
  id: string;
  event: UnifiedTimelineEvent;
  depth: number;
  parents: string[];
  children: string[];
  x: number;
  y: number;
};

interface DecisionTreeProps {
  scenarioId: string;
  events: UnifiedTimelineEvent[];
  links?: CausalLink[];
  onBranch?: (event: UnifiedTimelineEvent) => void;
}

function getEventId(event: UnifiedTimelineEvent, index: number) {
  return event.id || `${event.year}-${index}`;
}

export default function DecisionTree({
  scenarioId,
  events = [],
  links = [],
  onBranch,
}: DecisionTreeProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const tree = useMemo(() => {
    const ordered = [...events]
      .map((event, index) => ({
        id: getEventId(event, index),
        event,
        index,
        parents: event.parent_ids ? [...event.parent_ids] : [],
      }))
      .sort((left, right) => left.event.year - right.event.year);

    const nodeMap = new Map<string, TreeNode>();
    ordered.forEach((entry) => {
      nodeMap.set(entry.id, {
        id: entry.id,
        event: entry.event,
        depth: 0,
        parents: entry.parents,
        children: [],
        x: 0,
        y: 0,
      });
    });

    const linkPairs = new Set<string>();
    links.forEach((link) => {
      linkPairs.add(`${link.source}::${link.target}`);
      const parent = nodeMap.get(link.source);
      const child = nodeMap.get(link.target);
      if (parent && child) {
        parent.children.push(child.id);
        child.parents.push(parent.id);
      }
    });

    ordered.forEach((entry, index) => {
      const node = nodeMap.get(entry.id);
      if (!node) return;

      if (node.parents.length === 0) {
        node.depth = 0;
        return;
      }

      const parentDepths = node.parents
        .map((parentId) => nodeMap.get(parentId)?.depth ?? 0);
      node.depth = Math.max(...parentDepths) + 1;
      if (node.depth === 1 && index > 0 && linkPairs.size === 0) {
        node.depth = index;
      }
    });

    // Stabilize depths by chronology when no explicit links exist.
    if (linkPairs.size === 0) {
      ordered.forEach((entry, index) => {
        const node = nodeMap.get(entry.id);
        if (node) node.depth = index;
      });
    }

    const levels = new Map<number, TreeNode[]>();
    Array.from(nodeMap.values()).forEach((node) => {
      const bucket = levels.get(node.depth) || [];
      bucket.push(node);
      levels.set(node.depth, bucket);
    });

    const levelNumbers = Array.from(levels.keys()).sort((left, right) => left - right);
    const columnSpacing = 190;
    const rowSpacing = 112;

    levelNumbers.forEach((depth, depthIndex) => {
      const levelNodes = levels.get(depth) || [];
      const totalHeight = (levelNodes.length - 1) * rowSpacing;
      levelNodes.forEach((node, nodeIndex) => {
        node.x = 100 + depthIndex * columnSpacing;
        node.y = 90 + nodeIndex * rowSpacing - totalHeight / 2;
      });
    });

    return {
      nodes: Array.from(nodeMap.values()).sort((left, right) => left.depth - right.depth || left.event.year - right.event.year),
      levelCount: levelNumbers.length,
    };
  }, [events, links]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return tree.nodes.find((node) => node.id === selectedNodeId) || null;
  }, [selectedNodeId, tree.nodes]);

  const visibleLinks = useMemo(() => {
    const nodeMap = new Map(tree.nodes.map((node) => [node.id, node]));
    const computedLinks: { source: TreeNode; target: TreeNode }[] = [];

    links.forEach((link) => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (source && target) {
        computedLinks.push({ source, target });
      }
    });

    if (computedLinks.length === 0) {
      const ordered = [...tree.nodes].sort((left, right) => left.event.year - right.event.year);
      ordered.slice(0, -1).forEach((node, index) => {
        const target = ordered[index + 1];
        if (target) computedLinks.push({ source: node, target });
      });
    }

    return computedLinks;
  }, [links, tree.nodes]);

  const branchFromNode = (node: TreeNode) => {
    const path = tree.nodes
      .filter((candidate) => candidate.depth <= node.depth)
      .sort((left, right) => left.depth - right.depth || left.event.year - right.event.year)
      .map((candidate) => candidate.event.year);

    localStorage.setItem(
      "anamnesis_branch_path",
      JSON.stringify({
        scenario_id: scenarioId,
        branch_node_id: node.id,
        branch_year: node.event.year,
        branch_path: path,
      })
    );

    onBranch?.(node.event);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-white/5 bg-slate-950/35 p-5 shadow-2xl overflow-hidden">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
            <GitBranch className="h-3.5 w-3.5" />
            Divergence Tree
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            Click a node to branch
          </div>
        </div>

        <div className="relative overflow-x-auto overflow-y-hidden rounded-xl border border-white/5 bg-slate-950/40">
          <div className="min-w-[1100px] p-6">
            <svg
              viewBox="0 0 1100 520"
              className="h-[520px] w-full select-none"
            >
              <defs>
                <linearGradient id="treeLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(34,211,238,0.55)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0.55)" />
                </linearGradient>
              </defs>

              <line x1="60" y1="260" x2="1040" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

              {visibleLinks.map((link, index) => {
                const sourceSelected = selectedNodeId === link.source.id || hoveredNodeId === link.source.id;
                const targetSelected = selectedNodeId === link.target.id || hoveredNodeId === link.target.id;
                const highlighted = sourceSelected || targetSelected;
                const midX = (link.source.x + link.target.x) / 2;
                const curve = `M ${link.source.x} ${link.source.y} C ${midX} ${link.source.y}, ${midX} ${link.target.y}, ${link.target.x} ${link.target.y}`;

                return (
                  <g key={`${link.source.id}-${link.target.id}-${index}`}>
                    <path
                      d={curve}
                      fill="none"
                      stroke={highlighted ? "url(#treeLine)" : "rgba(255,255,255,0.06)"}
                      strokeWidth={highlighted ? 2.5 : 1.2}
                      strokeLinecap="round"
                      strokeDasharray={highlighted ? "none" : "6 8"}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}

              {tree.nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isActive = isSelected || isHovered;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer"
                  >
                    <motion.circle
                      r={isActive ? 18 : 13}
                      fill={isSelected ? "rgba(34,211,238,0.16)" : "rgba(8, 15, 28, 0.92)"}
                      stroke={isSelected ? "#22d3ee" : "rgba(148,163,184,0.55)"}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      initial={false}
                      animate={{ scale: isActive ? 1.08 : 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <circle r="5" fill={isSelected ? "#22d3ee" : "#cbd5e1"} />
                    <text
                      y={-28}
                      textAnchor="middle"
                      className="font-mono text-[9px] font-bold fill-cyan-300"
                    >
                      {node.event.year}
                    </text>
                    <text
                      y={36}
                      textAnchor="middle"
                      className="font-mono text-[8px] font-bold fill-slate-500 uppercase tracking-[0.22em]"
                    >
                      {node.event.source_agent}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 shadow-2xl h-fit sticky top-6">
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
            Branch Details
          </div>
          <h3 className="text-xl font-bold text-white">
            {selectedNode ? selectedNode.event.event : "Select a node"}
          </h3>
          <p className="text-xs text-slate-500 leading-6">
            Choose a point in the chronology to inspect the divergence path and launch a branch from that event.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {selectedNode ? (
            <>
              <div className="rounded-xl border border-white/5 bg-black/30 p-4">
                <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Timeline position
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {selectedNode.event.year}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {selectedNode.event.source_agent} domain
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-4">
                <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Event summary
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-300">
                  {selectedNode.event.event}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-4">
                <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                  Branch path
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-300">
                  {tree.nodes
                    .filter((candidate) => candidate.depth <= selectedNode.depth)
                    .sort((left, right) => left.depth - right.depth || left.event.year - right.event.year)
                    .map((candidate) => candidate.event.year)
                    .join(" → ")}
                </p>
              </div>

              {onBranch && (
                <button
                  type="button"
                  onClick={() => branchFromNode(selectedNode)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-slate-950 transition hover:brightness-110 active:scale-[0.98]"
                >
                  <Route className="h-3.5 w-3.5" />
                  Branch from this event
                </button>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-5 text-xs leading-6 text-slate-500">
              The tree is interactive. Hover or click any node to see the divergence path.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
