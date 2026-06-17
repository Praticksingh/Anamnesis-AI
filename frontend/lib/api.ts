import type { FinalReport, ScenarioStatusResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ReportNotReadyError extends Error {}

async function buildApiError(response: Response): Promise<Error> {
  let detail = response.statusText;

  try {
    const payload = await response.json();
    if (typeof payload?.detail === "string" && payload.detail.trim()) {
      detail = payload.detail;
    }
  } catch {
    // Keep fallback status text when response has no JSON body.
  }

  return new Error(detail || "Request failed.");
}

export async function createScenario(rawInput: string): Promise<{ scenario_id: string }> {
  const response = await fetch(`${API_BASE}/api/scenarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw_input: rawInput })
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response.json();
}

export async function getScenarioStatus(id: string): Promise<ScenarioStatusResponse> {
  const response = await fetch(`${API_BASE}/api/scenarios/${id}/status`);

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response.json();
}

export async function getScenarioReport(id: string): Promise<FinalReport> {
  const response = await fetch(`${API_BASE}/api/scenarios/${id}/report`);

  if (response.status === 409) {
    throw new ReportNotReadyError();
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response.json();
}

export async function branchScenario(
  parentScenarioId: string,
  divergentEventId: string,
  alternativeEvent: string
): Promise<{ scenario_id: string }> {
  const response = await fetch(`${API_BASE}/api/scenarios/${parentScenarioId}/branch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      divergent_event_id: divergentEventId,
      alternative_event: alternativeEvent
    })
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response.json();
}