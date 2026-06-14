import type { FinalReport, ScenarioStatusResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ReportNotReadyError extends Error {}

export async function createScenario(rawInput: string): Promise<{ scenario_id: string }> {
  const response = await fetch(`${API_BASE}/api/scenarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw_input: rawInput })
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

export async function getScenarioStatus(id: string): Promise<ScenarioStatusResponse> {
  const response = await fetch(`${API_BASE}/api/scenarios/${id}/status`);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

export async function getScenarioReport(id: string): Promise<FinalReport> {
  const response = await fetch(`${API_BASE}/api/scenarios/${id}/report`);

  if (response.status === 409) {
    throw new ReportNotReadyError();
  }

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}