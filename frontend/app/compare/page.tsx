"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { Compass, Scale, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";

import { getScenarioReport } from "../../lib/api";
import { MOCK_SCENARIOS } from "../../lib/mockScenarios";
import type { FinalReport } from "../../lib/types";

import ComparisonView from "../../components/ComparisonView";

interface SelectionOption {
  id: string;
  title: string;
  source: "mock" | "user";
  report?: FinalReport;
}

function CompareWorkspace() {
  const searchParams = useSearchParams();
  const initialIdA = searchParams?.get("idA") || "";
  const initialIdB = searchParams?.get("idB") || "";

  const [idA, setIdA] = useState(initialIdA);
  const [idB, setIdB] = useState(initialIdB);

  const [reportA, setReportA] = useState<FinalReport | null>(null);
  const [reportB, setReportB] = useState<FinalReport | null>(null);

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const [errorA, setErrorA] = useState("");
  const [errorB, setErrorB] = useState("");

  const [userOptions, setUserOptions] = useState<SelectionOption[]>([]);

  // 1. Gather all available options (mock templates + custom runs in localStorage)
  useEffect(() => {
    const list: SelectionOption[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("anamnesis_report_")) {
          const reportData = localStorage.getItem(key);
          if (reportData) {
            const parsed = JSON.parse(reportData);
            list.push({
              id: key.replace("anamnesis_report_", ""),
              title: parsed.scenario_summary || "Custom Simulated Pathway",
              source: "user",
              report: parsed,
            });
          }
        }
      }
      setUserOptions(list);
    } catch {
      // LocalStorage access issues
    }
  }, []);

  const allOptions = useMemo(() => {
    const mocks: SelectionOption[] = MOCK_SCENARIOS.map((sc) => ({
      id: sc.id,
      title: sc.title,
      source: "mock",
      report: sc.report,
    }));
    return [...userOptions, ...mocks];
  }, [userOptions]);

  // 2. Fetch/Load report for A
  useEffect(() => {
    if (!idA) {
      setReportA(null);
      setErrorA("");
      return;
    }

    const option = allOptions.find((o) => o.id === idA);
    if (option && option.report) {
      setReportA(option.report);
      setErrorA("");
      return;
    }

    // Otherwise fetch live from API
    let active = true;
    const loadA = async () => {
      setLoadingA(true);
      setErrorA("");
      try {
        const report = await getScenarioReport(idA);
        if (active) setReportA(report);
      } catch (err) {
        if (active) setErrorA(err instanceof Error ? err.message : "Failed to load report A.");
      } finally {
        if (active) setLoadingA(false);
      }
    };
    void loadA();
    return () => {
      active = false;
    };
  }, [idA, allOptions]);

  // 3. Fetch/Load report for B
  useEffect(() => {
    if (!idB) {
      setReportB(null);
      setErrorB("");
      return;
    }

    const option = allOptions.find((o) => o.id === idB);
    if (option && option.report) {
      setReportB(option.report);
      setErrorB("");
      return;
    }

    // Otherwise fetch live from API
    let active = true;
    const loadB = async () => {
      setLoadingB(true);
      setErrorB("");
      try {
        const report = await getScenarioReport(idB);
        if (active) setReportB(report);
      } catch (err) {
        if (active) setErrorB(err instanceof Error ? err.message : "Failed to load report B.");
      } finally {
        if (active) setLoadingB(false);
      }
    };
    void loadB();
    return () => {
      active = false;
    };
  }, [idB, allOptions]);

  const activeTitleA = useMemo(() => {
    return allOptions.find((o) => o.id === idA)?.title || "Pathway A";
  }, [idA, allOptions]);

  const activeTitleB = useMemo(() => {
    return allOptions.find((o) => o.id === idB)?.title || "Pathway B";
  }, [idB, allOptions]);

  return (
    <main className="min-h-screen bg-black px-6 py-12 relative overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] ambient-glow pointer-events-none opacity-40" />

      <div className="mx-auto max-w-5xl space-y-8 relative z-10">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Compass className="h-3.5 w-3.5" /> Back to scenario library
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <Scale className="h-4.5 w-4.5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Scenario Comparison Lab</h1>
              <p className="text-xs text-slate-500 font-light mt-0.5">Compare alternate reality timelines, logical risk factors, and domain impact footprints side-by-side.</p>
            </div>
          </div>
        </div>

        {/* Selection Board */}
        <section className="p-6 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl">
          
          {/* Selector A */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
              SELECT TIMELINE A
            </label>
            <select
              value={idA}
              onChange={(e) => setIdA(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-slate-950 p-3 text-xs text-slate-300 outline-none focus:border-cyan-400/30 transition-all font-sans cursor-pointer"
            >
              <option value="">-- Choose first scenario --</option>
              {allOptions.map((opt) => (
                <option key={`a-${opt.id}`} value={opt.id}>
                  [{opt.source === "user" ? "User Run" : "Seed Template"}] {opt.title.substring(0, 75)}
                </option>
              ))}
            </select>
            {loadingA && (
              <span className="text-[10px] text-slate-600 flex items-center gap-1.5 pt-1 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" /> Querying report database...
              </span>
            )}
            {errorA && (
              <span className="text-[10px] text-rose-400 flex items-center gap-1 pt-1 font-mono">
                <AlertTriangle className="h-3 w-3" /> {errorA}
              </span>
            )}
          </div>

          {/* Selector B */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
              SELECT TIMELINE B
            </label>
            <select
              value={idB}
              onChange={(e) => setIdB(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-slate-950 p-3 text-xs text-slate-300 outline-none focus:border-cyan-400/30 transition-all font-sans cursor-pointer"
            >
              <option value="">-- Choose second scenario --</option>
              {allOptions.map((opt) => (
                <option key={`b-${opt.id}`} value={opt.id}>
                  [{opt.source === "user" ? "User Run" : "Seed Template"}] {opt.title.substring(0, 75)}
                </option>
              ))}
            </select>
            {loadingB && (
              <span className="text-[10px] text-slate-600 flex items-center gap-1.5 pt-1 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" /> Querying report database...
              </span>
            )}
            {errorB && (
              <span className="text-[10px] text-rose-400 flex items-center gap-1 pt-1 font-mono">
                <AlertTriangle className="h-3 w-3" /> {errorB}
              </span>
            )}
          </div>

        </section>

        {/* Comparison Dashboard Display */}
        <div className="min-h-[300px]">
          {reportA && reportB ? (
            <div className="animate-fade-in pt-4">
              <ComparisonView
                reportA={reportA}
                reportB={reportB}
                titleA={activeTitleA}
                titleB={activeTitleB}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-20 border border-dashed border-white/5 rounded-2xl bg-slate-950/10 text-slate-500 font-mono text-xs space-y-3">
              <Scale className="h-8 w-8 text-slate-800 animate-pulse" />
              <p className="max-w-md leading-relaxed">
                Choose two alternate timeline scenarios from the selectors above to initiate a dual-matrix divergence comparison.
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-slate-500 font-mono text-xs flex items-center gap-3">
          <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
          Initializing comparison laboratory...
        </div>
      </main>
    }>
      <CompareWorkspace />
    </Suspense>
  );
}
