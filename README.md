# Anamnesis-AI

### Reimagine the Past. Simulate the Future.

Anamnesis-AI is a **multi-agent simulation and decision intelligence web application** that explores alternate histories and future policy scenarios through collaborative AI reasoning.

It enables users to test “what-if” scenarios across economics, society, sustainability, governance, and technology, helping them understand long-term consequences of decisions before they are made.

The system is designed as a **Creative Agentic AI application built with GitHub Copilot assistance and integrated with Microsoft Foundry IQ for grounded reasoning.**

---

# 🎯 Challenge Alignment (Agents League – Creative Apps)

This project is built specifically for the **Microsoft Agents League Creative Apps track**, fulfilling all core requirements:

### ✔ GitHub Copilot Usage (Required)

* Copilot used for:

  * Code generation (frontend + backend)
  * Debugging agent workflows
  * Prompt design for multi-agent system
* Copilot Chat used for:

  * Iterating agent prompts
  * Structuring orchestration logic
* Development accelerated via AI-assisted coding workflow

### ✔ Microsoft IQ Integration (Required)

Anamnesis-AI integrates:

#### 🧠 Foundry IQ (Primary)

* Grounds agent reasoning in **real-world datasets and knowledge sources**
* Retrieves:

  * Historical events
  * Economic indicators
  * Policy documents
* Ensures responses are **cited, contextual, and less hallucinated**

#### 📊 Optional Extensions (Architecture Ready)

* Fabric IQ → for structured economic/sustainability datasets
* Work IQ → for organizational/policy context simulation (future extension)

---

# 🧠 Core Idea

Modern decision-making suffers from fragmented reasoning:

* Economists analyze cost
* Environmentalists analyze sustainability
* Policy experts analyze governance
* Social scientists analyze behavior

But these perspectives are rarely combined into a single simulation.

### Anamnesis-AI solves this by:

> Simulating decisions using multiple specialized AI agents that collaborate like an expert council.

---

# 🧩 System Features

* 🔄 Alternate History Simulation Engine
* 🔮 Future Scenario Forecasting
* 🏛 Policy Impact Analysis
* 🌍 Multi-domain reasoning (economy, society, governance, sustainability, technology)
* 📊 Structured impact reports with scores
* 🧠 Multi-agent debate + synthesis system
* 📚 Foundry IQ grounded reasoning (retrieval-based context)
* ⚖ Feasibility & risk evaluation layer

---

# 🤖 Agent Architecture

### 🧭 Orchestrator Agent

* Breaks down user query
* Assigns tasks to specialized agents
* Combines final report

---

### 📜 Historian Agent

* Reconstructs baseline reality
* Identifies divergence point in alternate history

---

### 💰 Economist Agent

* Simulates GDP, trade, employment, inflation impact

---

### 🌱 Sustainability Agent

* Models environmental consequences (carbon, energy, resources)

---

### 👥 Society Agent

* Predicts human behavioral and cultural changes

---

### 🏛 Governance Agent

* Evaluates policy feasibility, legal constraints, political response

---

### ⚙ Technology Agent

* Predicts innovation and industry disruption

---

### 🔎 Fact Verification Agent (Foundry IQ powered)

* Retrieves grounded knowledge
* Validates assumptions using real datasets
* Reduces hallucination in multi-agent outputs

---

# ⚙️ System Workflow

1. User inputs scenario
   Example: *“What if public transport became free globally?”*

2. Orchestrator decomposes into sub-questions:

   * Economic impact
   * Environmental impact
   * Social impact
   * Governance feasibility
   * Technological implications

3. Each agent independently analyzes its domain

4. Foundry IQ retrieves supporting real-world context and datasets

5. Fact Verification Agent validates consistency

6. Orchestrator merges outputs into:

   * Timeline of consequences
   * Impact dashboard
   * Risk analysis
   * Confidence score

---

# 📊 Data Sources

To ensure grounded reasoning, Anamnesis-AI uses:

* 🌍 World Bank Open Data (GDP, population, development indicators)
* 🏛 UN Data (sustainability and development metrics)
* 📚 Kaggle datasets (historical + socio-economic data)
* 📖 Wikipedia structured event data
* 🏙 Open Government datasets (policy and infrastructure data)

---

# 🧠 Microsoft IQ Integration

### Foundry IQ (Mandatory Core Component)

Used for:

* Context retrieval for historical events
* Economic and policy grounding
* Document-based reasoning support
* Improving factual accuracy in simulations

### Why it matters

* Ensures **grounded AI reasoning**
* Reduces hallucination in policy simulation
* Adds enterprise-grade intelligence layer
* Aligns with Microsoft ecosystem vision

---

# 🛠 Tech Stack

* Frontend: Next.js + Tailwind CSS
* Backend: Node.js / FastAPI
* Agent Framework: LangGraph / AutoGen / Semantic Kernel
* LLM: GPT / Claude / Gemini APIs
* Visualization: Chart.js / D3.js
* Data Layer: Kaggle datasets + APIs
* IQ Layer: Microsoft Foundry IQ integration

---

# 🎯 Skills Demonstrated

* Multi-Agent AI System Design
* AI Orchestration (Agentic Workflows)
* Scenario Simulation & Reasoning
* Microsoft IQ Integration (Foundry IQ)
* Prompt Engineering & Copilot-assisted development
* Data-driven decision systems
* Full-stack AI application development
* Explainable AI (XAI)

---

# 🚀 Impact Statement

Anamnesis-AI transforms AI from an answer engine into a **decision simulation system**.

It enables users to:

* Explore consequences before making decisions
* Understand cross-domain impacts
* Evaluate risks and feasibility
* Learn from alternate histories
* Forecast future scenarios responsibly

---

# ⚠️ Disclaimer

Anamnesis-AI provides simulated, AI-generated outcomes based on available data and probabilistic reasoning. It is intended for educational and exploratory purposes only and should not be treated as factual prediction or guaranteed forecasting.

---

## Run the Backend

Prerequisites:

- PostgreSQL running and reachable
- `DATABASE_URL` set in `.env`

From `/backend`:

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

From workspace root (alternative):

```bash
.venv\\Scripts\\activate
pip install -r requirements.txt
copy backend\\.env.example backend\\.env
alembic -c backend\\alembic.ini upgrade head
uvicorn app.main:app --reload --port 8000 --app-dir backend
```

Quick health check:

```bash
powershell -Command "(Invoke-WebRequest -Uri http://127.0.0.1:8000/ -UseBasicParsing).Content"
```

### Backend Troubleshooting

- If `POST /api/scenarios` returns `503`, database connection is unavailable.
- Verify `backend/.env` contains a valid `DATABASE_URL`.
- Ensure PostgreSQL is running and reachable from your machine.

Windows service check:

```bash
powershell -Command "Get-Service | Where-Object { $_.Name -match 'postgres' -or $_.DisplayName -match 'postgres' } | Select-Object Name,DisplayName,Status | Format-Table -AutoSize"
```

## Run the Frontend

From `/frontend`:

```bash
npm install
npm run dev
```
