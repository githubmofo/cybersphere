# CyberSphere AI

> **Real-Time Cyber Attack Visualization Platform with ML-Powered Threat Intelligence**

[

<p align="left">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React badge" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript badge" />
  <img src="https://img.shields.io/badge/Three.js-3D_Engine-111111?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js badge" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI badge" />
  <img src="https://img.shields.io/badge/XGBoost-ML-E76F00?style=for-the-badge&logoColor=white" alt="XGBoost badge" />
  <img src="https://img.shields.io/badge/WebSockets-Real_Time-6C63FF?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSockets badge" />
</p>

CyberSphere AI is a full-stack, cinematic cybersecurity analytics platform built to simulate cyber attacks in real time, analyze them through an AI-oriented inference layer, and visualize the results through an immersive 3D interface and a modern analytics dashboard.

It is designed as both a **portfolio-grade engineering project** and a **cybersecurity visualization system**, combining real-time simulation, attack playback, threat scoring, dashboard analytics, and interactive 3D network exploration in one product.

***

## Overview

CyberSphere AI transforms raw security event streams into a visual cyber intelligence experience.

Instead of reading plain logs or static tables, users can:
- observe attack activity on a 3D globe or internal graph view,
- inspect affected nodes and threat states,
- monitor live KPIs and anomaly metrics,
- replay attack sequences,
- and understand how simulated cyber events propagate through an infrastructure.

The project is especially useful for:
- recruiters reviewing advanced frontend + backend + ML capabilities,
- students learning cybersecurity visualization concepts,
- developers exploring real-time simulation architecture,
- hackathon judges evaluating technical depth and polish,
- and security enthusiasts interested in interactive monitoring systems.

***

## Key Features

### Cinematic 3D Visualization
- **Globe & Graph Modes** for switching between global cyber activity and internal infrastructure topology.
- **Dynamic Node States** with visual health transitions such as healthy, suspicious, and compromised.
- **Attack Trails and Pulses** to show packet movement, impact points, and threat propagation.
- **Interactive Node Inspection** for viewing IP data, threat score, event counts, and node metadata.

### AI-Powered Threat Intelligence
- **Anomaly Detection Pipeline** that evaluates suspicious behavior patterns.
- **Threat Classification Layer** that supports categories such as DDoS, brute force, port scan, malware, and bot activity.
- **Risk Scoring System** to generate threat severity, confidence, and attack priority.
- **Rule-Based Fallback Mode** for demo-ready operation even before full ML model training is enabled.

### Real-Time Monitoring Experience
- **WebSocket Event Streaming** for live updates between backend and frontend.
- **Scenario-Based Simulation Controls** for switching among calm, mixed, DDoS, brute force, and port scan behavior.
- **Playback and Timeline Review** to inspect previous attack sequences.
- **Analytics Dashboard** containing KPIs, trend views, health indicators, and threat distributions.

***

## Tech Stack

### Frontend
<p align="left">
  <img src="https://img.shields.io/badge/React-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="React Vite badge" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript strict badge" />
  <img src="https://img.shields.io/badge/React_Three_Fiber-3D-000000?style=for-the-badge&logo=react&logoColor=white" alt="R3F badge" />
  <img src="https://img.shields.io/badge/Zustand-State-433E38?style=for-the-badge&logoColor=white" alt="Zustand badge" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind badge" />
</p>

- React 19
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Zustand
- Framer Motion
- GSAP
- Recharts
- Tailwind CSS

### Backend
<p align="left">
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI Python badge" />
  <img src="https://img.shields.io/badge/WebSocket-Live_Stream-4A90E2?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSocket badge" />
  <img src="https://img.shields.io/badge/Scikit--learn-ML-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="Scikit-learn badge" />
  <img src="https://img.shields.io/badge/XGBoost-Classifier-E76F00?style=for-the-badge&logoColor=white" alt="XGBoost classifier badge" />
</p>

- FastAPI
- Python 3.11
- WebSockets
- Scikit-learn
- XGBoost
- Pydantic v2

### DevOps and Deployment
- Docker
- Docker Compose
- GitHub Actions
- Vercel
- Railway / Render

***

## How the Dashboard Data Works

One of the most important things to understand about CyberSphere AI is that the dashboard is currently driven by a **synthetic simulation engine** connected to an **ML inference layer**.

This means the data is intentionally generated for demonstration, visualization, testing, and portfolio purposes. It is designed to feel realistic and structurally meaningful, but it is **not yet coming from a live enterprise network, SIEM, firewall appliance, or packet capture stream**.

### 1. Simulation Engine

The data visible in the dashboard begins in the backend simulation engine, typically located in:

```text
backend/simulation/generator.py
```

Because the project is not connected to a real infrastructure, the backend generates synthetic network events asynchronously.

When a user chooses a scenario such as **Mixed**, **DDoS**, **Brute Force**, or **Port Scan**, the engine produces traffic between the nodes present in the 3D topology.

#### Normal Traffic Generation
The simulation continuously emits healthy baseline traffic to make the environment look alive and believable. Examples include:
- web server to API server requests,
- API server to database queries,
- internal DNS lookups,
- and standard service-to-service communication.

These events typically use lower byte counts, expected ports, safer traffic patterns, and low anomaly characteristics.

#### Attack Traffic Injection
On top of normal traffic, the simulation engine injects malicious behavior based on the selected scenario.

Examples include:
- an external source flooding a firewall or web service during a DDoS wave,
- repeated login attempts against a target during brute force activity,
- sequential probing behavior during a port scan,
- or suspicious propagation across nearby systems in malware-style activity.

To avoid looking repetitive or fake, the engine can randomize:
- source and target nodes,
- event timing,
- byte counts,
- ports,
- frequency bursts,
- severity tendencies,
- and traffic distribution patterns.

This is what gives the dashboard and 3D scene a more organic, animated, and visually convincing stream of cyber activity.

### 2. ML Inference Layer

Once a raw simulated event is created, it is passed through the ML inference layer before reaching the frontend.

Relevant backend area:

```text
backend/ml/inference.py
```

At the current MVP stage, if trained models are not enabled, the application can operate with:

```text
ENABLE_ML_INFERENCE=false
```

In that mode, the system uses a **rule-based fallback inference strategy**.

#### Rule-Based Fallback Logic
The fallback layer examines the raw event and estimates values such as:
- anomaly score,
- risk score,
- confidence,
- attack type label,
- and severity level.

Typical internal logic includes:
- assigning higher anomaly and severity weights to DDoS-style floods,
- giving medium-to-high suspicion to brute force or bot activity,
- treating port scans as lower impact but still suspicious,
- and mapping these outcomes into frontend-friendly metrics.

That is how the dashboard can still show meaningful values like:
- **AI Insights**,
- **Average Confidence**,
- **Threat Severity**,
- **Attack Type Distribution**,
- and **Network Health degradation**,

...even when real trained model files are not yet active.

### 3. How to Use Real ML Models

The architecture is already designed so the fallback logic can later be replaced by trained models.

To move closer to a real-world inference flow, the project can be connected to open cybersecurity datasets such as:
- **CICIDS2017**,
- **UNSW-NB15**,
- or other structured intrusion detection datasets.

For example, if CICIDS2017 is downloaded and the training scripts are executed from the ML workspace, the system can save actual model files such as `.joblib` artifacts.

Expected training areas may include:

```text
backend/ml/src/
ml/src/
```

Once trained models are available, enabling:

```text
ENABLE_ML_INFERENCE=true
```

allows the backend to stop relying on hardcoded heuristics and instead:
- extract structured features from each event,
- run anomaly detection using an Isolation Forest model,
- run attack classification using an XGBoost classifier,
- and produce more realistic ML-driven outputs for the visualizer and dashboard.

### 4. Why This Matters

This architecture is powerful because it supports **two useful stages of product maturity**:

| Stage | Data Source | Inference Type | Use Case |
|------|-------------|----------------|----------|
| MVP / Demo | Synthetic event simulation | Rule-based fallback | Portfolio demos, UI testing, interaction design, rapid iteration |
| Advanced / Research | Synthetic or processed dataset events | Trained ML models | ML experimentation, realistic cybersecurity analysis, academic extension |

So when presenting this project, the correct explanation is:

> The current dashboard is powered by a synthetic network simulation engine combined with a fallback AI inference layer. For more realistic model-backed results, the project can be extended using cybersecurity datasets such as CICIDS2017 and trained model artifacts.

***

## Data Flow

```text
Scenario Selection
      ↓
Simulation Engine generates synthetic traffic events
      ↓
Raw event passed into inference layer
      ↓
Fallback rules or ML models assign anomaly / risk / confidence
      ↓
Event is streamed through WebSockets
      ↓
Frontend updates 3D scene + dashboard + timelines
```

***

## Quick Start

### 1. Clone the Repository
```bash
git clone <repo-url> cybersphere
cd cybersphere
```

### 2. Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the Application
Visit:

```text
http://localhost:5173
```

***

## Recommended Environment Variables

```env
# Frontend
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws

# Backend
ENABLE_SIMULATION=true
ENABLE_ML_INFERENCE=false
```

To test trained model mode later:

```env
ENABLE_ML_INFERENCE=true
```

***

## Project Structure

```text
cybersphere/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Routes: Landing, Visualizer, Dashboard
│   │   ├── scenes/         # GlobeView, GraphView, CyberScene, camera, lighting
│   │   ├── components/     # Controls, overlays, charts, playback, inspection
│   │   ├── store/          # Zustand stores
│   │   ├── hooks/          # WebSocket, metrics, playback, interaction hooks
│   │   └── shaders/        # Pulse and trail shaders
│   └── package.json
├── backend/
│   ├── api/                # REST endpoints
│   ├── simulation/         # Synthetic event generator and scenarios
│   ├── ml/                 # Inference logic and model loading
│   ├── websocket/          # Live streaming layer
│   ├── services/           # Event processing
│   └── requirements.txt
├── ml/                     # Training notebooks, preprocessing, evaluation, model files
├── docs/                   # Project docs, architecture, setup, demo script
└── docker-compose.yml
```

***

## Core Scenarios

- **Calm** — baseline healthy traffic
- **DDoS** — high-volume traffic burst against a target
- **Brute Force** — repeated login/auth attempts
- **Port Scan** — suspicious probing behavior
- **Malware Spread** — neighbor-to-neighbor compromise behavior
- **Mixed** — blended threat activity for rich demo output

***

## Why This Project Stands Out

CyberSphere AI demonstrates multiple advanced engineering domains in one system:
- modern frontend architecture,
- Three.js / React Three Fiber 3D rendering,
- real-time WebSocket data pipelines,
- dashboard analytics,
- simulation systems,
- machine learning integration,
- backend API engineering,
- and polished product-oriented UX.

This makes it a strong showcase project for roles related to:
- frontend engineering,
- full-stack development,
- visualization engineering,
- AI-enabled product development,
- and security-focused software systems.

***

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Demo Script](docs/DEMO_SCRIPT.md)

***

## Testing

```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Frontend type check
cd frontend && npx tsc --noEmit

# Frontend build
cd frontend && npm run build
```

***

## Future Extensions

- connect to real packet capture or PCAP parsing,
- integrate Suricata or Zeek event streams,
- train and plug in real anomaly detection models,
- add collaborative SOC mode,
- support cloud infrastructure digital twins,
- and introduce predictive attack analytics.

***

