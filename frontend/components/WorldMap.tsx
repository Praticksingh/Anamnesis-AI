"use client";

export default function WorldMap() {
  // Coordinates for major global hubs (London, Tokyo, NY, Rome, Cairo, etc.)
  const nodes = [
    { cx: "25%", cy: "38%", label: "North America" },
    { cx: "48%", cy: "35%", label: "Europe (Rome)" },
    { cx: "53%", cy: "45%", label: "Africa (Cairo)" },
    { cx: "78%", cy: "42%", label: "East Asia" },
    { cx: "62%", cy: "68%", label: "South America" },
    { cx: "82%", cy: "72%", label: "Australia" }
  ];

  return (
    <svg 
      viewBox="0 0 800 450" 
      className="absolute inset-0 w-full h-full object-cover opacity-[0.15] select-none pointer-events-none z-0"
    >
      {/* Soft connection arcs */}
      <path
        d="M 200,171 Q 300,100 384,157"
        fill="none"
        stroke="rgba(34, 211, 238, 0.3)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <path
        d="M 384,157 Q 480,120 624,189"
        fill="none"
        stroke="rgba(139, 92, 246, 0.3)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <path
        d="M 384,157 Q 390,260 424,202"
        fill="none"
        stroke="rgba(34, 211, 238, 0.2)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* Dotted grid lines representing global data feeds */}
      <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.5">
        {Array.from({ length: 15 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 60} y1={0} x2={i * 60} y2={450} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h-${i}`} x1={0} y1={i * 50} x2={800} y2={i * 50} />
        ))}
      </g>

      {/* Pulsing global nodes */}
      {nodes.map((node, i) => (
        <g key={i}>
          <circle
            cx={node.cx}
            cy={node.cy}
            r="3"
            fill="#22d3ee"
          />
          <circle
            cx={node.cx}
            cy={node.cy}
            r="12"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="0.5"
            className="animate-ping"
            style={{ animationDuration: `${2 + i * 0.5}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
