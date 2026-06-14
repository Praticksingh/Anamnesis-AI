"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getScenarioStatus } from "../../../lib/api";
import type { ScenarioStatusResponse } from "../../../lib/types";

const AGENTS = [
  { key: "historian", label: "Historian Agent", description: "Analyzing historical timeline..." },
  { key: "climate", label: "Climate Agent", description: "Analyzing carbon, rainfall, temperature, and biodiversity..." },
  { key: "economist", label: "Economist Agent", description: "Calculating macroeconomic impact..." },
  { key: "technology", label: "Technology Agent", description: "Simulating alternate innovation path..." },
  { key: "society", label: "Society Agent", description: "Modeling social and cultural shifts..." },
  { key: "critic", label: "Critic Agent", description: "Reviewing consistency and confidence..." }
];

const INITIAL_STATUS: ScenarioStatusResponse = {
  status: "pending",
  completed_agents: [],
  error_message: null
};

export default function SimulationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<ScenarioStatusResponse>(INITIAL_STATUS);
  const [loadError, setLoadError] = useState("");

  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const fetchStatus = async () => {
      try {
        const nextStatus = await getScenarioStatus(id);
        if (!active) {
          return;
        }

        setStatus(nextStatus);
        setLoadError("");

        if (nextStatus.status === "done") {
          if (intervalId) {
            clearInterval(intervalId);
          }
          router.push(`/report/${id}`);
        }

        if (nextStatus.status === "error" && intervalId) {
          clearInterval(intervalId);
        }
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : "Failed to load simulation status.");
      }
    };

    void fetchStatus();
    intervalId = setInterval(() => {
      void fetchStatus();
    }, 2000);

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id, router]);

  const completedAgents = status.completed_agents;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/80 text-white selection:bg-cyan-500/30">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <div className="rounded-2xl glass-panel p-8 sm:p-10 shadow-2xl animate-fade-in-up">
          <div className="mb-8 space-y-3 text-center">
            <h1 className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl drop-shadow-sm">
              Anamnesis-AI
            </h1>
            <p className="text-slate-300 font-light tracking-wide">Live simulation status for scenario {id}</p>
          </div>

          {status.status === "error" ? (
            <div className="space-y-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center animate-fade-in-up">
              <p className="text-lg font-semibold text-rose-200">Simulation failed</p>
              <p className="text-sm text-rose-100/90">{status.error_message || loadError || "An unexpected error occurred."}</p>
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15 active:scale-[0.98]"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : null}

          {loadError && status.status !== "error" ? (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {loadError}
            </div>
          ) : null}

          <div className="space-y-4">
            {AGENTS.map((agent, index) => {
              const isCompleted = completedAgents.includes(agent.key);
              const isCurrent =
                status.status === "running" && !isCompleted && AGENTS.slice(0, index).every((item) => completedAgents.includes(item.key));
              const isErroredButReached = status.status === "error" && isCompleted;
              const isErroredNotReached = status.status === "error" && !isCompleted;

              let indicator = (
                <div className="h-3.5 w-3.5 rounded-full bg-slate-500/60" />
              );
              let statusLabel = "Waiting";
              let rowTone = "border-white/5 bg-slate-900/20 text-slate-400";
              let pulseClass = "";

              if (isCompleted || isErroredButReached) {
                indicator = (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.296a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                );
                statusLabel = "Completed";
                rowTone = "border-emerald-500/25 bg-emerald-500/10 text-emerald-100";
              } else if (isCurrent) {
                indicator = (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  </div>
                );
                statusLabel = "Processing...";
                rowTone = "border-cyan-400/40 bg-cyan-500/10 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.1)]";
                pulseClass = "glow-pulse";
              } else if (isErroredNotReached) {
                indicator = (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M18 10A8 8 0 11.001 10 8 8 0 0118 10zm-8.707-3.707a1 1 0 10-1.414 1.414L8.586 10l-.707.707a1 1 0 101.414 1.414L10 11.414l.707.707a1 1 0 001.414-1.414L11.414 10l.707-.707a1 1 0 00-1.414-1.414L10 8.586l-.707-.707z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                );
                statusLabel = "Aborted";
                rowTone = "border-rose-500/20 bg-rose-500/5 text-rose-200/70";
              }

              return (
                <div key={agent.key} className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition duration-300 ${rowTone} ${pulseClass}`}>
                  <div className="shrink-0">{indicator}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-white tracking-wide">{agent.label}</p>
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em]">{statusLabel}</span>
                    </div>
                    <p className="mt-1 text-sm font-light text-slate-300">{agent.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}