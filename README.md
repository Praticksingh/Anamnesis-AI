# Anamnesis-AI

Anamnesis-AI is a multi-agent AI web application for exploring "what if" hypothetical scenarios. It uses specialized agents to analyze alternate timelines, economic effects, technology shifts, social impact, and confidence in the overall simulation.

## Run the Backend

From `/backend`:

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Run the Frontend

From `/frontend`:

```bash
npm install
npm run dev
```
