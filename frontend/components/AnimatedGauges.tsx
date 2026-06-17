"use client";

import { motion } from "framer-motion";
import { Info, HelpCircle } from "lucide-react";

interface AnimatedGaugesProps {
  plausibilityScore: number;
  uncertaintyScore: number;
  calibrationScore: number;
}

export default function AnimatedGauges({
  plausibilityScore = 0,
  uncertaintyScore = 0,
  calibrationScore = 100,
}: AnimatedGaugesProps) {
  // Normalize scores
  const plausibilityValue = Math.min(100, Math.max(0, plausibilityScore));
  const calibrationValue = Math.min(100, Math.max(0, calibrationScore));
  // Uncertainty is a standard deviation score (0-50 range is typical)
  const uncertaintyPercent = Math.min(100, Math.max(0, (uncertaintyScore / 50) * 100));

  const gauges = [
    {
      label: "Plausibility",
      value: plausibilityValue,
      displayVal: `${plausibilityValue}%`,
      color: "#22d3ee", // Cyan neon
      glowClass: "shadow-cyan-500/20",
      description: "Overall logical consistency and plausibility rating evaluated by the Critic Agent.",
      tooltip: "Computed from cross-agent logical alignment, historical friction points, and real-world fact verification scores.",
    },
    {
      label: "Uncertainty",
      value: uncertaintyPercent,
      displayVal: uncertaintyScore.toFixed(1),
      color: "#fb7185", // Rose neon
      glowClass: "shadow-rose-500/20",
      description: "Macroeconomic, technological, and societal divergence variance (standard deviation).",
      tooltip: "Higher values indicate highly divergent paths across different domains. Lower values represent standard consensus.",
    },
    {
      label: "Calibration",
      value: calibrationValue,
      displayVal: `${calibrationValue}%`,
      color: "#8b5cf6", // Violet neon
      glowClass: "shadow-violet-500/20",
      description: "Chronological consistency and timeline transition rate comparison vs historical baselines.",
      tooltip: "Measures whether timeline events follow a realistic progression rate or contain sudden ungrounded technological leaps.",
    },
  ];

  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
      {gauges.map((gauge, index) => {
        const strokeOffset = circumference * (1 - gauge.value / 100);

        return (
          <div
            key={gauge.label}
            className="group relative flex flex-col items-center justify-between p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-md hover:border-white/10 hover:bg-slate-950/60 transition-all duration-500 shadow-xl overflow-visible"
          >
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 scale-95 rounded-xl border border-white/10 bg-slate-950 p-3 text-left text-xs text-slate-400 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 shadow-2xl z-30 leading-relaxed">
              <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-cyan-400" /> {gauge.label} Analysis
              </p>
              <p className="text-[10px] text-slate-400">{gauge.tooltip}</p>
            </div>

            {/* Header */}
            <div className="flex items-center gap-1.5 mb-4">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: gauge.color }}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors duration-300">
                {gauge.label}
              </span>
              <HelpCircle className="h-3 w-3 text-slate-600 group-hover:text-slate-400 cursor-pointer transition-colors duration-300" />
            </div>

            {/* SVG Ring Gauge */}
            <div className="relative flex items-center justify-center h-[120px] w-[120px] mb-4">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform">
                {/* Background Ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.02)"
                  strokeWidth={strokeWidth}
                />
                {/* Active Ring */}
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={gauge.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeOffset }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
                />
              </svg>
              {/* Inner Label */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {gauge.displayVal}
                </span>
              </div>
            </div>

            {/* Description Text */}
            <p className="text-[10px] text-slate-500 text-center font-light leading-relaxed px-2">
              {gauge.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
