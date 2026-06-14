"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, Activity, Compass, BookOpen, Layers, Terminal, Milestone, Users, ArrowRight } from "lucide-react";

const ITEMS = [
  { label: "Home Page", path: "/", icon: Home, category: "Navigation" },
  { label: "Run Simulation Workspace", path: "/simulation", icon: Activity, category: "Navigation" },
  { label: "Scenario Library Archive", path: "/library", icon: Compass, category: "Navigation" },
  { label: "Research Methodology", path: "/methodology", icon: BookOpen, category: "Navigation" },
  { label: "Agent Pipeline Architecture", path: "/architecture", icon: Layers, category: "Navigation" },
  { label: "Developer Documentation", path: "/docs", icon: Terminal, category: "Navigation" },
  { label: "Future Roadmap", path: "/roadmap", icon: Milestone, category: "Navigation" },
  { label: "Research Team & Contacts", path: "/contact", icon: Users, category: "Navigation" },
  
  { label: "What if the Roman Empire never fell?", path: "/report/mock-roman-empire", icon: Compass, category: "Templates" },
  { label: "What if Sahara became a forest?", path: "/report/mock-sahara-forest", icon: Compass, category: "Templates" },
  { label: "What if AI replaced 50% of office jobs?", path: "/report/mock-ai-office-jobs", icon: Compass, category: "Templates" },
  { label: "What if gold was never discovered?", path: "/report/mock-no-gold", icon: Compass, category: "Templates" }
];

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setSelectedIndex(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          router.push(filteredItems[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  const filteredItems = ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm">
      <div 
        ref={containerRef}
        className="w-full max-w-lg rounded-xl border border-white/10 bg-slate-950/90 shadow-2xl p-4 glass-panel animate-fade-in-up"
      >
        {/* Input area */}
        <div className="relative flex items-center gap-3 border-b border-white/5 pb-3">
          <Search className="h-4 w-4 text-cyan-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a page name or scenario template..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600"
          />
          <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[300px] overflow-y-auto pt-3 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    router.push(item.path);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-all ${
                    isSelected
                      ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/15"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                  <div className="flex-grow">
                    <span>{item.label}</span>
                    <span className="ml-2 text-[9px] text-slate-600 font-mono">({item.category})</span>
                  </div>
                  {isSelected && <ArrowRight className="h-3 w-3 text-cyan-400" />}
                </button>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-slate-600 font-mono">
              No matching pages or templates found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
