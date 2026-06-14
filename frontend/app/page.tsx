"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createScenario } from "../lib/api";

const EXAMPLES = [
  "What if the Internet never existed?",
  "What if AI replaces 50% of office jobs?",
  "What if EVs became mainstream in 1990?"
];

export default function Home() {
  const router = useRouter();
  const [scenario, setScenario] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRunSimulation = async () => {
    if (!scenario.trim() || isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await createScenario(scenario.trim());
      router.push(`/simulation/${result.scenario_id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Failed to start simulation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md sm:p-10">
          <div className="space-y-6 text-center">
            <div className="space-y-3">
              <h1 className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl">
                Anamnesis-AI
              </h1>
              <p className="text-lg text-slate-300 sm:text-xl">
                Explore alternate realities through collaborative AI reasoning
              </p>
            </div>

            <div className="space-y-4 text-left">
              <label htmlFor="scenario" className="text-sm font-medium text-slate-300">
                What if scenario
              </label>
              <textarea
                id="scenario"
                value={scenario}
                onChange={(event) => setScenario(event.target.value)}
                placeholder="What if the Internet never existed?"
                className="min-h-40 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setScenario(example)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={!scenario.trim() || isSubmitting}
                className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                )}
                <span>{isSubmitting ? "Launching..." : "Run Simulation"}</span>
              </button>

              {error && <p className="text-sm text-rose-300">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
