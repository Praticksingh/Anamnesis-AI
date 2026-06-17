import re
import json
import logging
from app.telemetry import current_scenario_id

logger = logging.getLogger(__name__)

# Track iterations per scenario in mock mode
_mock_iterations = {}

def get_creative_mock_response(label: str, system_prompt: str, user_content: str) -> dict:
    """Dynamically generate rich, context-aware alternative history responses."""
    sid = current_scenario_id.get() or "default"
    
    # 1. Parse or guess query text
    scenario_text = ""
    divergence_year = 1990
    time_horizon = 2025
    
    # Try parsing JSON context from user_content if it's sent by agent nodes
    try:
        # User content often ends with the context JSON dump
        # Look for the last curly brace block
        brace_idx = user_content.rfind("{")
        if brace_idx != -1:
            json_str = user_content[brace_idx:]
            context_data = json.loads(json_str)
            scenario_text = context_data.get("scenario", "")
            divergence_year = context_data.get("divergence_year", 1990)
            time_horizon = context_data.get("time_horizon", 2025)
    except Exception:
        pass
        
    if not scenario_text:
        # Fallback to scanning user_content for query keywords
        scenario_text = user_content
        
    # Extract any year number from raw input (e.g. 1990, 1950, 1980)
    year_match = re.search(r"\b(1\d{3}|20\d{2})\b", scenario_text)
    if year_match:
        divergence_year = int(year_match.group(1))
        time_horizon = divergence_year + 35
    elif "15th century" in scenario_text.lower():
        divergence_year = 1450
        time_horizon = 1500
    elif "roman" in scenario_text.lower():
        divergence_year = 476
        time_horizon = 550

    q = scenario_text.lower()
    
    # 2. Select Template based on keyword matching
    if "roman" in q or "rome" in q:
        category = "roman"
    elif "alexandria" in q:
        category = "alexandria"
    elif "sahara" in q:
        category = "sahara"
    elif "carbon" in q or "sequestration" in q:
        category = "carbon"
    elif "ai" in q or "office" in q or "automation" in q or "replace" in q or "jobs" in q:
        category = "ai_jobs"
    elif "gold" in q or "fiat" in q:
        category = "gold"
    elif "analog" in q or "gear" in q:
        category = "analog_comp"
    elif "ev" in q or "electric" in q or "zev" in q:
        category = "electric_car"
    elif "internet" in q or "cooperative" in q or "media" in q:
        category = "internet"
    elif "united nations" in q or "un " in q:
        category = "un_gov"
    elif "mars" in q or "space" in q or "apollo" in q:
        category = "space"
    else:
        category = "generic"

    # 3. Handle ORCHESTRATOR / PARSER / DECOMPOSER
    if label == "orchestrator":
        return {
            "scenario": scenario_text,
            "divergence_year": divergence_year,
            "focus_domains": ["economy", "technology", "society", "climate"],
            "time_horizon": time_horizon
        }

    if label == "decomposer":
        return {
            "wikipedia": f"{scenario_text} history divergence {divergence_year}",
            "worldbank": f"{scenario_text} GDP trade economic indicator",
            "un_data": f"{scenario_text} social development sustainability",
            "nasa": f"{scenario_text} earth science climate anomalies",
            "noaa": f"{scenario_text} temperature precipitation records",
            "arxiv": f"{scenario_text} simulation counterfactual research paper"
        }

    if label == "qa":
        question = "user question"
        question_match = re.search(r"USER QUESTION: (.*)", user_content)
        if question_match:
            question = question_match.group(1).strip()
            
        return {
            "answer": f"In this simulated alternate reality where '{scenario_text[:50]}...', the historical progression was altered. In response to your question ('{question}'), the primary domain metrics indicate that the transition was governed by structural shifts in adjacent domains. Specifically, R&D allocation and resource balancing played a central role, stabilizing the timeline and avoiding localized system failures.",
            "citations": [
                "Historian Agent counterfactual timeline coordinates",
                "Critic Agent plausibility consistency review"
            ]
        }

    if label == "debate":
        agent_a = "Agent A"
        agent_b = "Agent B"
        agents_match = re.search(r"Anamnesis-ai domain agents: (\w+) and (\w+)", system_prompt, re.IGNORECASE)
        if agents_match:
            agent_a = agents_match.group(1).capitalize()
            agent_b = agents_match.group(2).capitalize()
            
        topic = "the divergence pacing"
        topic_match = re.search(r'topic of the debate is: "(.*)"', system_prompt, re.IGNORECASE)
        if topic_match:
            topic = topic_match.group(1).strip()

        return {
            "rounds": [
                {
                    "round_num": 1,
                    "agent_name": agent_a.lower(),
                    "argument": f"From my perspective, the primary driver in this counterfactual trajectory is the systemic shift in {agent_a} development. The historical record indicates that changes in resource pacing directly structured downstream outcomes on the topic of '{topic}'."
                },
                {
                    "round_num": 1,
                    "agent_name": agent_b.lower(),
                    "argument": f"While I acknowledge the role of {agent_a}, the {agent_b} metrics suggest that technological/climate adaptations were the dominant pacing factor. Without these systemic adjustments, the alternate timeline would have experienced severe structural friction on '{topic}'."
                },
                {
                    "round_num": 2,
                    "agent_name": agent_a.lower(),
                    "argument": f"But the transition cost calculations show that the {agent_a} indicators stabilized first. Therefore, it acted as the primary cause, while your domain was a secondary consequence."
                },
                {
                    "round_num": 2,
                    "agent_name": agent_b.lower(),
                    "argument": f"Ultimately, both domains are highly coupled. The key consensus is that the overall pacing of the divergence successfully avoided catastrophic disruption on '{topic}' due to this coupling."
                }
            ],
            "consensus": f"The Critic agent synthesizes a consensus: both {agent_a} and {agent_b} analyses are directionally correct. The alternate timeline's trajectory on '{topic}' is logically sound, with {agent_a} structural variables acting as the catalyst and {agent_b} metrics absorbing downstream feedback."
        }

    if label == "causal":
        causal_links = []
        try:
            events = json.loads(user_content)
            if isinstance(events, list) and len(events) >= 2:
                for i in range(len(events) - 1):
                    causal_links.append({
                        "source": events[i]["id"],
                        "target": events[i+1]["id"],
                        "description": f"The event '{events[i]['event'][:30]}...' in {events[i]['year']} contributed directly to the subsequent event in {events[i+1]['year']}."
                    })
        except Exception:
            pass
        if not causal_links:
            causal_links = [
                {"source": "ev-0", "target": "ev-1", "description": "Initial divergence acts as the primary catalyst for subsequent policy shifts."},
                {"source": "ev-1", "target": "ev-2", "description": "Policy realignment directly drives economic and technological adaptations."}
            ]
        return {"causal_links": causal_links}

    if label == "assumption":
        assumptions = []
        try:
            agent_payload = json.loads(user_content)
            if isinstance(agent_payload, dict):
                for agent_name in agent_payload.keys():
                    if agent_name == "historian":
                        assumptions.append({
                            "agent_name": "historian",
                            "assumption": "Assumes swift political consensus and institutional agility during the initial divergence window.",
                            "impact_level": "high"
                        })
                    elif agent_name == "economist":
                        assumptions.append({
                            "agent_name": "economist",
                            "assumption": "Assumes stable global trade relations despite regional currency shifts.",
                            "impact_level": "medium"
                        })
                    elif agent_name == "technology":
                        assumptions.append({
                            "agent_name": "technology",
                            "assumption": "Assumes open-source software collaboration matches commercial innovation velocity.",
                            "impact_level": "high"
                        })
                    elif agent_name == "climate":
                        assumptions.append({
                            "agent_name": "climate",
                            "assumption": "Assumes carbon sequestration techniques achieve immediate ecological feedback loops.",
                            "impact_level": "high"
                        })
        except Exception:
            pass
        if not assumptions:
            assumptions = [
                {
                    "agent_name": "historian",
                    "assumption": "Assumes smooth administrative transition and low geopolitical resistance.",
                    "impact_level": "high"
                },
                {
                    "agent_name": "economist",
                    "assumption": "Assumes capital markets adapt to the structural divergence without prolonged recession.",
                    "impact_level": "medium"
                }
            ]
        return {"assumptions": assumptions}

    if label == "validator":
        return {
            "grounding_score": 92,
            "unsupported_claims": [],
            "explanation": "The analysis is highly consistent and grounded in the retrieved RAG source document snippets."
        }

    # 4. Handle CRITIC Node
    if label == "critic":
        iteration = _mock_iterations.get(sid, 0)
        
        # Determine feedback loop behavior
        if iteration == 0:
            # First run: Return low confidence to trigger loopback debate
            _mock_iterations[sid] = 1
            return {
                "confidence_score": 68,
                "confidence_explanation": (
                    f"Simulation shows initial structural mismatches for '{scenario_text[:40]}...'. "
                    f"Transition costs are underestimated, and chronological sequence conflicts with standard R&D timelines."
                ),
                "risk_notes": [
                    "The historian projects infrastructural changes occurring too quickly after the divergence point.",
                    "The economist projects rapid income growth without accounting for structural inflation.",
                    "The sustainability projections require further validation against localized climate feedback loops."
                ],
                "agent_confidences": [
                    {"agent_name": "historian", "confidence_score": 60, "explanation": "Historian sequence pacing is unrealistically fast."},
                    {"agent_name": "economist", "confidence_score": 65, "explanation": "Economist misses transition inflation constraints."},
                    {"agent_name": "technology", "confidence_score": 85, "explanation": "Technology transition aligns with default R&D cycles."}
                ]
            }
        else:
            # Second run: Resolve with high confidence
            return {
                "confidence_score": 88,
                "confidence_explanation": (
                    f"Simulation successfully converged. Adjustments to transition costs and "
                    f"energy feedback models have resolved the timeline mismatches. Highly plausible alternate timeline."
                ),
                "risk_notes": [
                    "Transition costs remain a minor risk factor, but within reasonable parameters.",
                    "The simulation assumes sustained global cooperation for administrative structures."
                ],
                "agent_confidences": [
                    {"agent_name": "historian", "confidence_score": 90, "explanation": "Adjusted timeline matches baseline transition constraints."},
                    {"agent_name": "economist", "confidence_score": 88, "explanation": "Economic growth projections calibrated with inflation constraints."},
                    {"agent_name": "technology", "confidence_score": 92, "explanation": "Technology adoption curve validated."}
                ]
            }

    # 5. Handle DOMAIN AGENTS
    # Extract RAG titles from user content to ground mock responses
    rag_titles = []
    for line in user_content.splitlines():
        if line.startswith("[") and "—" in line:
            # e.g., [1] Historical Datasets — "The Industrial Revolution"
            title_part = line.split("—")[-1].strip().strip('"')
            rag_titles.append(title_part)
    if not rag_titles:
        rag_titles = ["Historical archives", "Scientific databases"]
        
    rag_ref = f"Grounded in {rag_titles[0]}."

    # Templates Database
    templates = {
        "roman": {
            "historian": {
                "analysis_text": f"Pax Romana endures past the 5th century. A unified European administrative standard preserves trade, concrete architecture, and centralized legal codes. {rag_ref}",
                "timeline_events": [
                    {"year": divergence_year + 4, "event": "Emperor stabilizes Western borders, reorganizing military legions."},
                    {"year": divergence_year + 15, "event": "Imperial shipping lanes expand, linking the Mediterranean to the Baltic sea."},
                    {"year": divergence_year + 30, "event": "Sovereign charters establish the Great Road networks across Gaul."}
                ]
            },
            "economist": {
                "analysis_text": "Centralized denarius coinage prevents local inflation. However, state-owned guilds limit the development of decentralized mercantile capitalism.",
                "timeline_events": [
                    {"year": divergence_year + 8, "event": "Mint standardizes currency purity, creating a stable silver standard."},
                    {"year": divergence_year + 22, "event": "State guilds take control of iron and copper mines, raising continental yields."}
                ],
                "impact_score": 15
            },
            "technology": {
                "analysis_text": "Advanced concrete formulation and hydraulic cement construction are preserved. Complex mechanical automation emerges earlier via water mills and slide gears.",
                "timeline_events": [
                    {"year": divergence_year + 10, "event": "Engineers deploy automated water-mills across Germany to process agricultural surplus."},
                    {"year": divergence_year + 25, "event": "Domes and complex aqueduct pumps utilize high-pressure piping grids."}
                ],
                "impact_score": 25
            },
            "society": {
                "analysis_text": "Latin remains the universal lingua franca of education, science, and governance. High urbanization centers around civic arenas, baths, and municipal assemblies.",
                "timeline_events": [
                    {"year": divergence_year + 12, "event": "Universal literacy mandates are decreed for municipal administrative staff."},
                    {"year": divergence_year + 28, "event": "Urban migration exceeds 30%, creating huge metropolitan hubs across southern Europe."}
                ],
                "impact_score": 10
            },
            "climate": {
                "analysis_text": "Intense deforestation for roman metallurgy and brick-kilns shifts Mediterranean microclimates, partially offset by imperial forest conservation codes.",
                "timeline_events": [
                    {"year": divergence_year + 6, "event": "Imperial decrees restrict tree cutting in Alpine regions to preserve ship timbers."},
                    {"year": divergence_year + 20, "event": "Soil erosion indicators rise in Hispania due to intensive grain cultivation."}
                ],
                "impact_score": -15
            },
            "political": {
                "analysis_text": "Pax Romana preserves central administrative scale. Roman legal codes remain the supreme constitutional framework, preventing territorial fragmentation.",
                "timeline_events": [
                    {"year": divergence_year + 3, "event": "Imperial decrees standardize legal rights for all municipal assemblies."},
                    {"year": divergence_year + 18, "event": "Administrative borders reorganize, creating stable regional prefectures."}
                ],
                "impact_score": 20
            },
            "energy": {
                "analysis_text": "Wood and charcoal remain the primary fuel vectors, but optimized hydraulic mills and aqueduct pressure channels increase energy capture efficiency.",
                "timeline_events": [
                    {"year": divergence_year + 11, "event": "Engineers deploy automated water-wheel arrays to power forge bellows."},
                    {"year": divergence_year + 24, "event": "State charters standardize timber allocations, protecting fuel supply chains."}
                ],
                "impact_score": 10
            },
            "healthcare": {
                "analysis_text": "Preservation of complex roman baths, aqueduct networks, and public sanitation codes keeps urban plague risks lower than in real medieval history.",
                "timeline_events": [
                    {"year": divergence_year + 5, "event": "Aedes-control sanitarians are deployed across the Mediterranean ports."},
                    {"year": divergence_year + 21, "event": "Municipal public doctors are appointed to all cities with over 20,000 citizens."}
                ],
                "impact_score": 30
            },
            "demographics": {
                "analysis_text": "Continental population grows steadily, supported by grain imports. Urbanization concentrates around key municipal administrative capitals.",
                "timeline_events": [
                    {"year": divergence_year + 8, "event": "Census registers continental population surpassing 65 million."},
                    {"year": divergence_year + 26, "event": "Urban migration trends stabilize, keeping city populations within sustainable bounds."}
                ],
                "impact_score": 15
            }
        },
        "alexandria": {
            "historian": {
                "analysis_text": f"The Library of Alexandria survives, serving as a continuous global repository of scientific papers and engineering blueprints. {rag_ref}",
                "timeline_events": [
                    {"year": divergence_year + 2, "event": "Scribes translate Eastern scientific manuscripts, indexing them in centralized archives."},
                    {"year": divergence_year + 12, "event": "Scholars establish permanent research academies in Athens, Rome, and Alexandria."}
                ]
            },
            "economist": {
                "analysis_text": "Technological patents and geometric calculations allow earlier optimization of agricultural yields and trade calculations.",
                "timeline_events": [
                    {"year": divergence_year + 5, "event": "Standardized bookkeeping and mathematical trading models are adopted globally."},
                    {"year": divergence_year + 20, "event": "Agricultural productivity surges by 40% using advanced crop-rotation mathematical patterns."}
                ],
                "impact_score": 30
            },
            "technology": {
                "analysis_text": "Early mechanics utilize Hero's steam designs (aeolipiles) for actual industrial water pumping, bypassing gear-mechanic limitations.",
                "timeline_events": [
                    {"year": divergence_year + 8, "event": "Engineers build steam-powered mine pumps, accelerating coal and copper extraction."},
                    {"year": divergence_year + 25, "event": "Optics breakthroughs enable the creation of telescopes and astronomical catalogs."}
                ],
                "impact_score": 45
            },
            "society": {
                "analysis_text": "Scientific rationalism becomes highly integrated into philosophical academies, leading to earlier secular legal structures.",
                "timeline_events": [
                    {"year": divergence_year + 10, "event": "Scholastic networks expand, establishing standard curricula for mathematics and astronomy."},
                    {"year": divergence_year + 30, "event": "Secular legal frameworks replace divine-right governance theories in major city-states."}
                ],
                "impact_score": 20
            },
            "climate": {
                "analysis_text": "Early industrialization increases regional smoke levels, prompting Alexandria councils to implement fuel and air quality codes.",
                "timeline_events": [
                    {"year": divergence_year + 15, "event": "Coal emissions accumulate in Nile valley, triggering local respiratory laws."},
                    {"year": divergence_year + 28, "event": "Water conservation frameworks protect local delta systems from industrial waste."}
                ],
                "impact_score": -10
            }
        },
        "sahara": {
            "historian": {
                "analysis_text": f"Increased monsoon precipitation turns the Sahara into a fertile savanna. Centralized pastoral empires rise along lush trade routes. {rag_ref}",
                "timeline_events": [
                    {"year": divergence_year + 5, "event": "Trans-Saharan kingdoms establish permanent agricultural settlements near new river networks."},
                    {"year": divergence_year + 18, "event": "Geopolitical maps shift as Northern Africa becomes a major global food exporter."}
                ]
            },
            "economist": {
                "analysis_text": "Food security and agricultural surplus create massive wealth, shifting trade patterns away from European centers to African kingdoms.",
                "timeline_events": [
                    {"year": divergence_year + 10, "event": "The African Savanna trade corridor establishes a unified currency backed by grain."},
                    {"year": divergence_year + 25, "event": "Trans-Saharan rail and trade networks connect Western Africa directly to the Mediterranean."}
                ],
                "impact_score": 35
            },
            "technology": {
                "analysis_text": "Innovation focuses heavily on hydraulic engineering, irrigation networks, and solar-reflective architectures.",
                "timeline_events": [
                    {"year": divergence_year + 12, "event": "Engineers deploy automated aqueduct networks to regulate savanna lake levels."},
                    {"year": divergence_year + 22, "event": "Soil retention materials prevent siltation of major irrigation channels."}
                ],
                "impact_score": 18
            },
            "society": {
                "analysis_text": "Nomadic tribes settle into cooperative agricultural alliances, creating decentralized governance trees rather than empires.",
                "timeline_events": [
                    {"year": divergence_year + 8, "event": "The Council of Savannas codifies agricultural water distribution rights."},
                    {"year": divergence_year + 28, "event": "Cultural movements celebrate ecological harmony, limiting urban sprawl."}
                ],
                "impact_score": 25
            },
            "climate": {
                "analysis_text": "Greening the Sahara absorbs huge carbon quantities, cooling global averages by 0.3°C and modifying global trade winds.",
                "timeline_events": [
                    {"year": divergence_year + 6, "event": "Global carbon levels drop as savanna grasses sequester carbon at record rates."},
                    {"year": divergence_year + 20, "event": "Atlantic hurricane frequencies decrease due to cooled Saharan air currents."}
                ],
                "impact_score": 65
            }
        },
        "carbon": {
            "historian": {
                "analysis_text": f"Full industrial carbon capture is mandated globally in 1950, reshaping geopolitical energy dependencies earlier. {rag_ref}",
                "timeline_events": [
                    {"year": divergence_year + 5, "event": "Global treaties mandate carbon scrubbing for all coal and heavy factories."},
                    {"year": divergence_year + 15, "event": "Sovereign carbon quotas alter industrial development limits in eastern nations."}
                ]
            },
            "economist": {
                "analysis_text": "Carbon taxation and capture costs lower GDP growth speeds but create stable long-term energy markets.",
                "timeline_events": [
                    {"year": divergence_year + 8, "event": "The carbon credit exchange market is created, trading energy limits."},
                    {"year": divergence_year + 20, "event": "Green bonds fund planetary-scale sequestration projects, creating 12M jobs."}
                ],
                "impact_score": 12
            },
            "technology": {
                "analysis_text": "Heavy investment in chemical filtration, air capture scrubbers, and geothermal storage platforms.",
                "timeline_events": [
                    {"year": divergence_year + 10, "event": "First industrial carbon-scrubbing station begins injecting CO2 into basalt layers."},
                    {"year": divergence_year + 22, "event": "Nanotech air-capture membranes double filtering efficiency."}
                ],
                "impact_score": 38
            },
            "society": {
                "analysis_text": "Environmental awareness becomes central to education, driving cultural values toward eco-efficiency and conservation.",
                "timeline_events": [
                    {"year": divergence_year + 12, "event": "Primary schools adopt ecological stewardship standards in 40 nations."},
                    {"year": divergence_year + 28, "event": "Consumer culture shifts away from single-use items, prioritizing circular designs."}
                ],
                "impact_score": 22
            },
            "climate": {
                "analysis_text": "Global carbon levels stabilize at 320 ppm, avoiding extreme warming, sea level rises, and severe droughts.",
                "timeline_events": [
                    {"year": divergence_year + 6, "event": "Global atmospheric CO2 levels decline for the first time since industrialization."},
                    {"year": divergence_year + 20, "event": "Arctic sea ice thickness stabilizes, reversing ice-melt feedback loops."}
                ],
                "impact_score": 80
            }
        },
        "ai_jobs": {
            "historian": {
                "analysis_text": f"AI displaces 50% of office labor, forcing a rapid transition in state support models and global trade vectors. {rag_ref}",
                "timeline_events": [
                    {"year": divergence_year + 2, "event": "Office tasks are automated, leading to widespread white-collar labor friction."},
                    {"year": divergence_year + 10, "event": "National legislative acts establish the basic digital dividend system."}
                ]
            },
            "economist": {
                "analysis_text": "Corporate efficiency and profits rise dramatically, but consumer spending collapses initially due to high unemployment, prompting fiscal change.",
                "timeline_events": [
                    {"year": divergence_year + 4, "event": "Universal Basic Income (UBI) is funded via a 10% tax on automated compute capacity."},
                    {"year": divergence_year + 15, "event": "Consumer markets stabilize as UBI returns buying power to displaced workers."}
                ],
                "impact_score": -25
            },
            "technology": {
                "analysis_text": "R&D focuses on human-in-the-loop workflows, collaborative logic frameworks, and localized energy-efficient servers.",
                "timeline_events": [
                    {"year": divergence_year + 5, "event": "Decentralized personal AI models reach widespread adoption, reducing cloud dependencies."},
                    {"year": divergence_year + 18, "event": "Optoelectronic computing arrays reduce data center power requirements."}
                ],
                "impact_score": 60
            },
            "society": {
                "analysis_text": "Work identity splits: people focus on community cooperatives, local craft, and artistic endeavors, rather than desk work.",
                "timeline_events": [
                    {"year": divergence_year + 8, "event": "Civic guilds expand, focusing on craft, manual arts, and local community care."},
                    {"year": divergence_year + 20, "event": "Weekly work hours drop to 15, changing urban transit and leisure patterns."}
                ],
                "impact_score": 45
            },
            "climate": {
                "analysis_text": "Automation limits long commutes, but massive data center energy demands require intensive solar and nuclear expansion.",
                "timeline_events": [
                    {"year": divergence_year + 6, "event": "Automated transport routing reduces vehicle emissions by 20%."},
                    {"year": divergence_year + 15, "event": "Green energy grid expansion struggles to match data center load increases."}
                ],
                "impact_score": 10
            }
        },
        "generic": {
            "historian": {
                "analysis_text": f"The divergence scenario for '{scenario_text[:45]}...' creates a pivot in historical timelines, branching away from baseline realities. {rag_ref}",
                "timeline_events": [
                    {"year": divergence_year + 2, "event": f"Initial policy changes and public debates regarding '{scenario_text[:30]}...' emerge."},
                    {"year": divergence_year + 15, "event": f"First large-scale deployment of infrastructures related to the {category} vector."},
                    {"year": divergence_year + 30, "event": "Geopolitical maps and international alliances adjust to the new structural reality."}
                ]
            },
            "economist": {
                "analysis_text": f"Macroeconomic variables adjust to the '{scenario_text[:35]}...' divergence. Trade networks alter corridors to capitalize on new resource efficiencies.",
                "timeline_events": [
                    {"year": divergence_year + 5, "event": "Regional trade networks standardize economic credits for new industry segments."},
                    {"year": divergence_year + 20, "event": "Sovereign investment funds redirect capital, stabilizing alternate job markets."}
                ],
                "impact_score": 18
            },
            "technology": {
                "analysis_text": f"R&D priorities shift to support '{scenario_text[:35]}...'. Focus is placed on alternative engineering systems, materials, and infrastructure.",
                "timeline_events": [
                    {"year": divergence_year + 8, "event": "Patent filings surge for mechanical and chemical systems optimizing the divergence."},
                    {"year": divergence_year + 25, "event": "Decentralized infrastructures reach critical mass, replacing legacy grids."}
                ],
                "impact_score": 25
            },
            "society": {
                "analysis_text": f"Communal and civic interactions adjust. Daily work routines, educational formats, and local connectivity adapt to the alternate framework.",
                "timeline_events": [
                    {"year": divergence_year + 10, "event": "Local school systems integrate vocational training for the new infrastructure models."},
                    {"year": divergence_year + 28, "event": "Urban migration patterns adjust as digital/mechanical options alter geography."}
                ],
                "impact_score": 15
            },
            "climate": {
                "analysis_text": f"Environmental feedback loops register changes. Sequestration and resource use models diverge from the standard historical curve.",
                "timeline_events": [
                    {"year": divergence_year + 6, "event": "Regional microclimate metrics stabilize due to adjusted resource consumption."},
                    {"year": divergence_year + 22, "event": "Biodiversity protection programs achieve positive population growth indices."}
                ],
                "impact_score": 20
            },
            "political": {
                "analysis_text": f"Governance structures adapt to address '{scenario_text[:35]}...'. Administrative divisions reorganize to maintain sovereignty under the altered regional rules.",
                "timeline_events": [
                    {"year": divergence_year + 4, "event": "Sovereign charters decree new governance protocols for the domain."},
                    {"year": divergence_year + 18, "event": "Administrative jurisdictions expand, standardizing legal codes continent-wide."}
                ],
                "impact_score": 15
            },
            "energy": {
                "analysis_text": f"Energy resource systems shift priorities to fuel the new '{scenario_text[:35]}...' infrastructure. Power distribution grids transition to localized configurations.",
                "timeline_events": [
                    {"year": divergence_year + 7, "event": "First regional generation hubs go online, supporting the shifted consumption demands."},
                    {"year": divergence_year + 22, "event": "Universal grid standardization is completed, minimizing resource loss."}
                ],
                "impact_score": 20
            },
            "healthcare": {
                "analysis_text": f"Public health and medical systems optimize resources to sustain the population under the '{scenario_text[:35]}...' model. Epidemic resilience scores register positive shifts.",
                "timeline_events": [
                    {"year": divergence_year + 9, "event": "Sanitation and disease-prevention mandates are standardizing in major urban zones."},
                    {"year": divergence_year + 24, "event": "Medical research academies register breakthroughs in localized drug production."}
                ],
                "impact_score": 25
            },
            "demographics": {
                "analysis_text": f"Population dynamics adapt, shifting migration corridors toward the new '{scenario_text[:35]}...' development zones. Urban density index rises moderately.",
                "timeline_events": [
                    {"year": divergence_year + 12, "event": "Census reports register a major migration shift toward newly industrialized centers."},
                    {"year": divergence_year + 27, "event": "Metropolitan population indexes stabilize, showing balanced growth curves."}
                ],
                "impact_score": 12
            }
        }
    }

    # Add default fallbacks for templates that aren't fully populated yet
    # All share the same structure as "generic" if not defined in templates dict
    tpl = templates.get(category, templates["generic"])
    
    # Extract agent-specific dictionary from selected template
    agent_data = tpl.get(label, templates["generic"].get(label, {}))
    
    # Inject final details
    if label in ["historian", "economist", "technology", "society", "climate", "political", "energy", "healthcare", "demographics"]:
        # Ensure correct agent name property
        agent_data["agent_name"] = label
        
    return agent_data
