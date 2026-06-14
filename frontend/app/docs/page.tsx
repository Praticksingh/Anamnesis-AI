"use client";

import { Terminal, Shield, ArrowRight, Code } from "lucide-react";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 relative overflow-hidden select-none">
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] ambient-glow" />

      <div className="mx-auto max-w-4xl space-y-10 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-mono-label text-cyan-400">
            <Code className="h-3.5 w-3.5" />
            <span>Developer / API Reference</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            API Documentation
          </h1>
          <p className="text-sm font-light text-slate-400">
            Integrate the multi-agent alternate-history simulator into custom applications and pipelines.
          </p>
        </div>

        {/* API Routes */}
        <div className="space-y-6">
          {/* Endpoint 1 */}
          <div className="rounded-2xl glass-panel p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">POST</span>
              <code className="text-xs font-bold text-slate-200">/api/scenarios</code>
            </div>
            <p className="text-xs text-slate-400 leading-6 font-light">
              Submit a raw query string to initiate a new multi-agent simulation run background task.
            </p>
            <div className="rounded-xl border border-white/5 bg-slate-950/65 p-4 font-mono text-[10px] leading-5 text-slate-400 space-y-2">
              <div className="text-slate-500">// Request Body</div>
              <div>{"{"}</div>
              <div className="pl-4">"raw_input": "What if the Roman Empire never fell?"</div>
              <div>{"}"}</div>
              <div className="text-slate-500">// Response Body</div>
              <div>{"{"}</div>
              <div className="pl-4">"scenario_id": "a542fe56-0c14-4113-95dc-ace0dd0e4b4e"</div>
              <div>{"}"}</div>
            </div>
          </div>

          {/* Endpoint 2 */}
          <div className="rounded-2xl glass-panel p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400 font-mono">GET</span>
              <code className="text-xs font-bold text-slate-200">/api/scenarios/{"{id}"}/status</code>
            </div>
            <p className="text-xs text-slate-400 leading-6 font-light">
              Check the simulation processing status and active completed agent lists.
            </p>
            <div className="rounded-xl border border-white/5 bg-slate-950/65 p-4 font-mono text-[10px] leading-5 text-slate-400 space-y-2">
              <div className="text-slate-500">// Response Body</div>
              <div>{"{"}</div>
              <div className="pl-4">"status": "running",</div>
              <div className="pl-4">"completed_agents": ["historian", "climate"],</div>
              <div className="pl-4">"error_message": null</div>
              <div>{"}"}</div>
            </div>
          </div>

          {/* Endpoint 3 */}
          <div className="rounded-2xl glass-panel p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400 font-mono">GET</span>
              <code className="text-xs font-bold text-slate-200">/api/scenarios/{"{id}"}/report</code>
            </div>
            <p className="text-xs text-slate-400 leading-6 font-light">
              Retrieve the synthesized final alternate history report, indices, timeline, and critic logs. Returns HTTP 409 if not finished.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
