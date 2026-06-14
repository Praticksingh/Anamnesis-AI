"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Search, Filter, History, Globe, TrendingUp, Cpu, Terminal, ArrowRight } from "lucide-react";
import { MOCK_SCENARIOS, LibraryScenario } from "../../lib/mockScenarios";

const CATEGORY_ICONS: Record<string, any> = {
  History: History,
  Climate: Globe,
  Economics: TrendingUp,
  Technology: Cpu
};

export default function ScenarioLibraryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [userScenarios, setUserScenarios] = useState<Array<{ id: string; title: string; category: string; excerpt: string }>>([]);

  // Load any previously generated simulations from localStorage if available
  useEffect(() => {
    const list: string[] = [];
    try {
      // Find all scenario IDs in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("anamnesis_report_")) {
          const reportData = localStorage.getItem(key);
          if (reportData) {
            const parsed = JSON.parse(reportData);
            list.push({
              id: key.replace("anamnesis_report_", ""),
              title: parsed.scenario_summary || "Custom Alternate History",
              category: "History", // default category for custom
              excerpt: "Custom simulated scenario run on the local multi-agent research pipeline."
            } as any);
          }
        }
      }
      setUserScenarios(list as any);
    } catch (e) {
      // ignore localStorage blockages
    }
  }, []);

  const allScenarios = [...userScenarios, ...MOCK_SCENARIOS];

  const filteredScenarios = allScenarios.filter((sc) => {
    const matchesCategory = activeCategory === "All" || sc.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = sc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sc.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "History", "Climate", "Economics", "Technology"];

  return (
    <main className="min-h-screen bg-black px-6 py-12 relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] ambient-glow" />

      <div className="mx-auto max-w-6xl space-y-10 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-mono-label text-cyan-400">
            <Compass className="h-3.5 w-3.5" />
            <span>Workspace / Alternate Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Scenario Library
          </h1>
          <p className="text-sm font-light text-slate-400">
            Explore archived alternate history logs, simulation results, and custom scenarios compiled by the platform.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-950/45 p-4 rounded-xl border border-white/5 backdrop-blur-md">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search simulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-slate-950/80 pl-10 pr-4 py-2 text-xs text-slate-300 placeholder:text-slate-600 outline-none focus:border-cyan-500/30 focus:ring-2 focus:ring-cyan-500/5 transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto md:ml-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios Grid */}
        {filteredScenarios.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredScenarios.map((sc) => {
              const IconComponent = CATEGORY_ICONS[sc.category] || Terminal;
              return (
                <div
                  key={sc.id}
                  className="group rounded-xl border border-white/5 bg-slate-950/35 p-6 flex flex-col justify-between hover:scale-[1.01] hover:border-white/10 hover-glow transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <IconComponent className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{sc.category}</span>
                      </div>
                      {sc.id.startsWith("mock-") ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded">
                          Seed Run
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded">
                          User Run
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-white leading-5 transition-colors">
                      {sc.title}
                    </h3>
                    
                    <p className="text-xs text-slate-400 leading-6 font-light">
                      {sc.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <Link
                      href={`/report/${sc.id}`}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400 group-hover:text-cyan-300 transition-colors"
                    >
                      View Executive Report <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-white/5 bg-slate-950/20">
            <Compass className="h-8 w-8 text-slate-600 mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-300">No matching simulations found</p>
            <p className="text-xs text-slate-500 font-light mt-1">Try broadening your search query or choosing another category.</p>
          </div>
        )}
      </div>
    </main>
  );
}
