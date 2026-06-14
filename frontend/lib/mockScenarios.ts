import type { FinalReport } from "./types";

export interface LibraryScenario {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  report: FinalReport;
}

export const MOCK_SCENARIOS: LibraryScenario[] = [
  {
    id: "mock-roman-empire",
    title: "What if the Roman Empire never fell?",
    category: "History",
    excerpt: "Simulates the technological and political trajectory of a unified European-Mediterranean state extending into the modern era.",
    report: {
      scenario_summary: "A world where Rome preserved state stability, adapting to industrialization and global trade under a centralized senate.",
      alternate_timeline: [
        { year: 476, event: "Emperor Romulus Augustulus successfully repels the barbarian sieges of Ravenna using Greek Fire prototypes.", source_agent: "historian" },
        { year: 600, event: "Roman paved highways span the entire Eurasian continent, standardizing trade routes.", source_agent: "economist" },
        { year: 900, event: "Introduction of steam power to the Roman textile mills in Alexandria.", source_agent: "technology" },
        { year: 1200, event: "Roman ships arrive in the Americas, setting up colonial senates.", source_agent: "society" },
        { year: 1600, event: "Coal extraction in Britannia triggers early industrial microclimate adjustments.", source_agent: "climate" },
        { year: 1800, event: "The Senate approves Pax Electronica, standardizing telegraph lines across the empire.", source_agent: "technology" }
      ],
      agent_outputs: [
        {
          agent_name: "historian",
          analysis_text: "Repelling barbarian sieges in the 5th century maintains the administrative and educational hubs of Rome and Constantinople, preventing the decentralized collapse commonly termed the Dark Ages.",
          timeline_events: [],
          impact_score: 85
        },
        {
          agent_name: "economist",
          analysis_text: "A single currency and tax policy spanning Europe and North Africa decreases trade friction, yielding a stable economic base that finances early industrial ventures.",
          timeline_events: [],
          impact_score: 90
        },
        {
          agent_name: "technology",
          analysis_text: "With Roman focus on civil engineering, steam engines emerge in Alexandria to pump aqueducts, leading to early mechanical computation systems.",
          timeline_events: [],
          impact_score: 95
        },
        {
          agent_name: "society",
          analysis_text: "Roman citizenship is generalized globally, creating a standardized legal structure, although local cultural groups struggle against Roman assimilation.",
          timeline_events: [],
          impact_score: 75
        },
        {
          agent_name: "climate",
          analysis_text: "Early industrialization in the 10th century results in gradual carbon accumulation, though offset by large-scale public forestry initiatives.",
          timeline_events: [],
          impact_score: -40
        }
      ],
      impact_dashboard: {
        economy: 90,
        technology: 95,
        society: 75,
        politics: 85,
        climate: -40
      },
      confidence_score: 82,
      confidence_explanation: "Highly plausible administrative continuity. The primary friction point lies in the capability of a pre-modern senate to control vast colonial territories without modern communication networks.",
      risk_notes: [
        "Assumes Roman administrative stability avoids catastrophic civil wars.",
        "Projects industrial timeline without considering resource bottlenecks in Southern Europe."
      ],
      sources_consulted: ["Gibbon's Decline and Fall (Altered)", "Roman Industrial Archeology Studies"],
      retrieved_documents: ["Tax records of Roman Egypt", "Senate minutes on British Coal"]
    }
  },
  {
    id: "mock-sahara-forest",
    title: "What if the Sahara became a forest?",
    category: "Climate",
    excerpt: "Evaluates the shifts in carbon capture, global monsoon systems, and human migration if the Sahara reverted to a lush grassland and forest.",
    report: {
      scenario_summary: "A geographic divergence where changes in the African monsoon cycle transform North Africa into a global climate regulator.",
      alternate_timeline: [
        { year: 3000, event: "Orbital precession shifts the African Monsoon northward, initiating heavy rains across the Sahara.", source_agent: "climate" },
        { year: 3500, event: "Mega-Lake Chad forms, covering 400,000 square kilometers and feeding vast rainforest basins.", source_agent: "climate" },
        { year: 4000, event: "Trans-Saharan agricultural trade routes emerge, connecting Central Africa to the Mediterranean.", source_agent: "economist" },
        { year: 4500, event: "North African empires develop sustainable forestry-based economies, bypassing industrial carbon dependencies.", source_agent: "historian" },
        { year: 5000, event: "Global temperatures decrease by 1.2°C due to Saharan carbon sequestration sinks.", source_agent: "climate" }
      ],
      agent_outputs: [
        {
          agent_name: "climate",
          analysis_text: "The vegetation feedback cycle traps moisture, creating self-sustaining precipitation networks. This absorbs over 80 gigatons of carbon annually.",
          timeline_events: [],
          impact_score: 95
        },
        {
          agent_name: "economist",
          analysis_text: "North Africa becomes the agricultural breadbasket of Eurasia, exporting timber, grains, and biofuels.",
          timeline_events: [],
          impact_score: 80
        },
        {
          agent_name: "historian",
          analysis_text: "The presence of a fertile Sahara shifts the center of geopolitical power south of the Mediterranean, creating powerful, stable African kingdoms.",
          timeline_events: [],
          impact_score: 75
        },
        {
          agent_name: "technology",
          analysis_text: "Agricultural techniques focus heavily on hydrology, leading to advanced irrigation and canal networks.",
          timeline_events: [],
          impact_score: 60
        },
        {
          agent_name: "society",
          analysis_text: "Egalitarian agricultural communities form across the green belts, though population density pressures migration zones.",
          timeline_events: [],
          impact_score: 70
        }
      ],
      impact_dashboard: {
        economy: 80,
        technology: 60,
        society: 70,
        politics: 75,
        climate: 95
      },
      confidence_score: 88,
      confidence_explanation: "Supported by historical data from the African Humid Period. The model is highly accurate regarding monsoon dynamics and carbon cycles.",
      risk_notes: [
        "Precipitation feedback models assume minimal global atmospheric disruption elsewhere.",
        "Amazon basin fertilization might decrease due to the reduction of dust transport from the Sahara."
      ],
      sources_consulted: ["African Humid Period Studies", "Global Monsoon Precession Models"],
      retrieved_documents: ["Soil cores from Mega-Lake Chad", "Paleoclimate precipitation simulations"]
    }
  },
  {
    id: "mock-ai-office-jobs",
    title: "What if AI replaced 50% of office jobs?",
    category: "Economics",
    excerpt: "Explores the macroeconomic and societal impact of rapid corporate automation and the restructurings of global labor.",
    report: {
      scenario_summary: "A transition scenario where neural networks replace white-collar labor, shifting economies toward localized service and sovereign funds.",
      alternate_timeline: [
        { year: 2026, event: "Commercial deployment of autonomous multi-agent systems replaces basic legal, accounting, and coding tasks.", source_agent: "technology" },
        { year: 2028, event: "Global corporate margins rise by 30% while white-collar employment drops by 22% in developed nations.", source_agent: "economist" },
        { year: 2030, event: "Mass protests spark the 'Neo-Luddite' guild movement, demanding sovereign corporate wealth taxes.", source_agent: "society" },
        { year: 2032, event: "Implementation of the Universal Basic Dividend (UBD), funded by automated data taxes.", source_agent: "economist" },
        { year: 2035, event: "Localization of production: local additive manufacturing hubs replace corporate global shipping networks.", source_agent: "technology" }
      ],
      agent_outputs: [
        {
          agent_name: "technology",
          analysis_text: "Autonomous reasoning agents replace administrative pipelines, leading to rapid optimization of product designs but increasing systemic vulnerability to digital outages.",
          timeline_events: [],
          impact_score: 90
        },
        {
          agent_name: "economist",
          analysis_text: "Severe employment friction is mitigated by state intervention. Corporations are taxed on computational throughput to fund social dividends.",
          timeline_events: [],
          impact_score: 40
        },
        {
          agent_name: "society",
          analysis_text: "Human community focus redirects toward physical services, craft guilds, and local socialization, though mental health struggles rise due to identity friction.",
          timeline_events: [],
          impact_score: 50
        },
        {
          agent_name: "critic",
          analysis_text: "The simulation assumes rapid political consensus on basic dividends, which history shows is rare during major transitions.",
          timeline_events: [],
          impact_score: 65
        },
        {
          agent_name: "climate",
          analysis_text: "Data center power consumption spikes, but is partially offset by a 15% reduction in commuter and corporate office carbon footprints.",
          timeline_events: [],
          impact_score: -10
        }
      ],
      impact_dashboard: {
        economy: 40,
        technology: 90,
        society: 50,
        politics: 45,
        climate: -10
      },
      confidence_score: 74,
      confidence_explanation: "Moderate plausibility. The economic transition path is highly sensitive to legislative speeds which vary globally.",
      risk_notes: [
        "Assumes electricity grids can withstand the heavy load of AI compute farms.",
        "Undervalues potential geopolitical friction regarding international computing resource ownership."
      ],
      sources_consulted: ["Labor Market Automation Reports", "Corporate Taxation Studies"],
      retrieved_documents: ["Compute grid scalability statistics", "Sovereign wealth distribution models"]
    }
  },
  {
    id: "mock-no-gold",
    title: "What if gold was never discovered?",
    category: "Economics",
    excerpt: "Analyses the evolution of monetary currency, chemistry, and early industrial trade without the historical gold standard.",
    report: {
      scenario_summary: "An alternate timeline where silver, copper, and early paper-credit networks dictate the rise of financial empires.",
      alternate_timeline: [
        { year: 1000, event: "The Song Dynasty establishes the first pure paper fiat currency, backed by grain reserves.", source_agent: "economist" },
        { year: 1500, event: "Spanish treasure fleets focus entirely on silver and platinum extraction from Peru.", source_agent: "historian" },
        { year: 1700, event: "Advanced banking ledgers emerge in Amsterdam, utilizing encrypted cipher keys for ledger entries.", source_agent: "technology" },
        { year: 1850, event: "Global copper reserves become the primary trade security standard, accelerating telegraph wiring.", source_agent: "technology" }
      ],
      agent_outputs: [
        {
          agent_name: "economist",
          analysis_text: "Without the density of gold, coinage is dominated by silver and copper, leading to faster development of representative paper certificates and paper credits.",
          timeline_events: [],
          impact_score: 75
        },
        {
          agent_name: "historian",
          analysis_text: "Spanish conquests are driven by silver mining, altering wealth distribution and preventing early hyperinflation in Spain caused by massive gold influxes.",
          timeline_events: [],
          impact_score: 70
        },
        {
          agent_name: "technology",
          analysis_text: "Telegraphic and electronic components develop using copper, silver, and platinum. Chemistry discovers precious metal catalysis earlier.",
          timeline_events: [],
          impact_score: 80
        },
        {
          agent_name: "society",
          analysis_text: "Societal value is based on utility-metals (copper, iron) rather than purely ornamental reserves, creating a utilitarian social focus.",
          timeline_events: [],
          impact_score: 65
        },
        {
          agent_name: "climate",
          analysis_text: "Mining focus shifts to copper and iron ore, creating widespread regional landscape excavations but reducing cyanide mercury runoff from gold processing.",
          timeline_events: [],
          impact_score: -20
        }
      ],
      impact_dashboard: {
        economy: 75,
        technology: 80,
        society: 65,
        politics: 70,
        climate: -20
      },
      confidence_score: 79,
      confidence_explanation: "Highly consistent. Silver was already the primary transactional metal globally, meaning monetary networks adapt quickly without gold.",
      risk_notes: [
        "Assumes early banking ciphers could prevent counterfeiting of paper fiat certificates."
      ],
      sources_consulted: ["Global Monetary History Guides", "Platinum Group Metal Catalysis Studies"],
      retrieved_documents: ["Dutch East India Banking Ledgers", "Precious metal mineral abundance tables"]
    }
  },
  {
    id: "mock-analog-computing",
    title: "What if computing remained analog?",
    category: "Technology",
    excerpt: "Traces a technology path where vacuum tubes, mechanical gears, and fluidics advanced without silicon transistors.",
    report: {
      scenario_summary: "A reality where computation is performed via fluid dynamics, mechanical gears, and slide-rule automation.",
      alternate_timeline: [
        { year: 1945, event: "Vannevar Bush's Differential Analyzer becomes the standard computing model for national research.", source_agent: "technology" },
        { year: 1960, event: "Hydraulic analog calculators route city traffic and power grids using water pressure networks.", source_agent: "technology" },
        { year: 1980, event: "Analog mechanical pocket slide-rules reach extreme precision, utilizing nanometer-engraved brass gears.", source_agent: "technology" },
        { year: 2000, event: "Global networks communicate via analog frequency-division multiplexing over copper lines.", source_agent: "society" }
      ],
      agent_outputs: [
        {
          agent_name: "technology",
          analysis_text: "Calculation relies on physical simulations of variables rather than digital binary states. Fluidic and mechanical systems reach high precision.",
          timeline_events: [],
          impact_score: 60
        },
        {
          agent_name: "economist",
          analysis_text: "Financial trading is executed via localized physical markets. High-frequency algorithm trading is physically impossible.",
          timeline_events: [],
          impact_score: 50
        },
        {
          agent_name: "society",
          analysis_text: "The absence of digital databases prevents mass surveillance and social media polarization, but slows information availability and education access.",
          timeline_events: [],
          impact_score: 70
        },
        {
          agent_name: "climate",
          analysis_text: "Electronic e-waste is minimal; systems are crafted from repairable metals and glass. However, industrial optimization is less efficient.",
          timeline_events: [],
          impact_score: 15
        },
        {
          agent_name: "historian",
          analysis_text: "The Cold War focus remains on physical space telemetry rather than digital cryptography, prolonging espionage systems.",
          timeline_events: [],
          impact_score: 65
        }
      ],
      impact_dashboard: {
        economy: 50,
        technology: 60,
        society: 70,
        politics: 65,
        climate: 15
      },
      confidence_score: 85,
      confidence_explanation: "Highly plausible physics. Fluidic computers and mechanical differential analyzers were fully functional and scalable historically.",
      risk_notes: [
        "Fails to account for potential chemical analog computing pathways which could merge into organic systems."
      ],
      sources_consulted: ["Differential Analyzer Historical Records", "Fluidic Logic Gate Textbooks"],
      retrieved_documents: ["Vannevar Bush Memex papers", "Analog hydraulic grid blueprints"]
    }
  },
  {
    id: "mock-evs-1990",
    title: "What if EVs became mainstream in 1990?",
    category: "Climate",
    excerpt: "Simulates global climate and battery R&D dynamics if California's zero-emission mandate succeeded in 1990.",
    report: {
      scenario_summary: "A timeline where battery technology was prioritized early, shifting urban centers away from combustion engines.",
      alternate_timeline: [
        { year: 1990, event: "California enforces the Zero Emission Vehicle (ZEV) mandate, requiring 10% electric sales by 1998.", source_agent: "historian" },
        { year: 1994, event: "General Motors launches the EV1 with nickel-metal hydride batteries, achieving a 150-mile range.", source_agent: "technology" },
        { year: 2000, event: "Solid-state battery research receives a $10B global grant, solving early cycle life issues.", source_agent: "technology" },
        { year: 2010, event: "Urban air quality improves by 45% in major global metropolitan centers.", source_agent: "climate" },
        { year: 2020, event: "Global carbon emissions drop by 28% compared to the baseline timeline.", source_agent: "climate" }
      ],
      agent_outputs: [
        {
          agent_name: "climate",
          analysis_text: "Accelerated EV adoption significantly flattens the carbon emission curve, slowing atmospheric warming rates and improving urban air health.",
          timeline_events: [],
          impact_score: 85
        },
        {
          agent_name: "technology",
          analysis_text: "Battery chemistry advances rapidly, driving solar and wind grid storage integration 15 years ahead of schedule.",
          timeline_events: [],
          impact_score: 90
        },
        {
          agent_name: "economist",
          analysis_text: "Petroleum-dependent regions experience economic contractions, shifting capital to lithium and cobalt extraction regions.",
          timeline_events: [],
          impact_score: 60
        },
        {
          agent_name: "society",
          analysis_text: "Urban layouts reorganize around electric transit rails, decreasing noise pollution and respiratory diseases.",
          timeline_events: [],
          impact_score: 75
        },
        {
          agent_name: "critic",
          analysis_text: "Early solid-state success is highly optimistic, as metallurgical boundaries are difficult to solve without 21st-century nanotechnology.",
          timeline_events: [],
          impact_score: 70
        }
      ],
      impact_dashboard: {
        economy: 60,
        technology: 90,
        society: 75,
        politics: 65,
        climate: 85
      },
      confidence_score: 80,
      confidence_explanation: "Very high consistency. California's ZEV mandate was active, and GM's EV1 existed; the main divergence is policy stability.",
      risk_notes: [
        "Assumes electricity generation transitions to renewables fast enough to feed the growing EV grid."
      ],
      sources_consulted: ["California Air Resources Board Mandates", "Nickel-Metal Hydride Battery patents"],
      retrieved_documents: ["GM EV1 owner survey feedback", "Lithium reserve distribution reports"]
    }
  }
];
