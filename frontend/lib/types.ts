export interface TimelineEvent {
  year: number;
  event: string;
}

export interface ImpactDashboard {
  economy: number;
  technology: number;
  society: number;
  politics: number;
}

export interface AgentOutputSummary {
  agent_name: string;
  analysis_text: string | null;
  timeline_events: TimelineEvent[] | null;
  impact_score: number | null;
}

export interface FinalReport {
  scenario_summary: string;
  alternate_timeline: TimelineEvent[];
  agent_outputs: AgentOutputSummary[];
  impact_dashboard: ImpactDashboard;
  confidence_score: number;
  risk_notes: string[];
}

export type ScenarioStatus = "pending" | "running" | "done" | "error";

export interface ScenarioStatusResponse {
  status: ScenarioStatus;
  completed_agents: string[];
  error_message: string | null;
}