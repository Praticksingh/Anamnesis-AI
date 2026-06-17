export interface UnifiedTimelineEvent {
  id?: string;
  year: number;
  event: string;
  source_agent: string;
  parent_ids?: string[];
}

export interface ImpactDashboard {
  economy: number;
  technology: number;
  society: number;
  politics: number;
  climate: number;
}

export interface AgentOutputSummary {
  agent_name: string;
  analysis_text: string | null;
  timeline_events: UnifiedTimelineEvent[] | null;
  impact_score: number | null;
}

export interface CausalLink {
  source: string;
  target: string;
  description: string;
}

export interface Assumption {
  agent_name: string;
  assumption: string;
  impact_level: string;
}

export interface AgentConfidence {
  agent_name: string;
  confidence_score: number;
  explanation: string;
}

export interface GroundingValidation {
  agent_name: string;
  grounding_score: number;
  unsupported_claims: string[];
  explanation: string;
}

export interface FinalReport {
  scenario_summary: string;
  alternate_timeline: UnifiedTimelineEvent[];
  agent_outputs: AgentOutputSummary[];
  impact_dashboard: ImpactDashboard;
  confidence_score: number;
  confidence_explanation: string;
  risk_notes: string[];
  sources_consulted: string[];
  retrieved_documents: string[];
  causal_graph?: CausalLink[];
  assumptions?: Assumption[];
  agent_confidences?: AgentConfidence[];
  grounding_validations?: GroundingValidation[];
  uncertainty_score?: number;
  calibration_score?: number;
}

export type ScenarioStatus = "pending" | "running" | "done" | "error";

export interface ScenarioStatusResponse {
  status: ScenarioStatus;
  completed_agents: string[];
  error_message: string | null;
}