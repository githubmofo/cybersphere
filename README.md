# CyberSphere AI

> **Real-Time Cyber Attack Visualization Platform with ML-Powered Threat Intelligence**

[![CI](https://github.com/your-username/cybersphere/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/cybersphere/actions)

CyberSphere AI is a full-stack, cinematic cybersecurity analytics platform. It simulates complex network attacks in real-time, classifies them using a machine learning pipeline, and visualizes the threats in an interactive 3D environment and comprehensive analytics dashboard.

---

## 🌟 Key Features

- **Cinematic 3D Network Visualization**
  - **Globe & Graph Modes:** Toggle between a rotating 3D globe and a force-directed graph.
  - **High-Performance Rendering:** 60 FPS achieved through zero-allocation render loops, separated static data layers from rotating visual shells, and local ref-based animation tracking.
  - **Dynamic Node States:** Nodes breathe and glow based on their threat level (Healthy, Suspicious, Compromised).

- **Real-Time ML Inference Pipeline**
  - **Anomaly Detection:** IsolationForest algorithms identify deviations from baseline traffic.
  - **Threat Classification:** XGBoost categorizes the type of attack (with rule-based fallbacks for out-of-the-box demo usage).
  - **WebSocket Streaming:** Low-latency event streaming from backend to client.

- **Advanced Analytics Dashboard**
  - **Live KPIs:** Instantly monitor total attacks, active threats, and network health.
  - **Heatmaps & Timelines:** 500ms-throttled charts decouple UI rendering from high-frequency WebSocket traffic.
  - **Instant Navigation:** Predictive prefetching ensures zero load times when switching between the dashboard and the heavy 3D visualizer.

- **Interactive Simulation Controls**
  - **6 Attack Scenarios:** Simulate DDoS, Brute Force, Port Scan, Botnet, Malware, and Mixed attacks.
  - **Optimistic UI:** Instant start/stop responsiveness with no server round-trip lag.
  - **Replay System:** Buffer up to 5,000 events and scrub through history at 1×, 2×, or 5× speeds.

---

## 🛠 Tech Stack

**Frontend Architecture**
- **Core:** React 19, TypeScript, Vite
- **3D Graphics:** React Three Fiber, Three.js, Drei
- **State Management:** Zustand (optimized ring buffers)
- **Animations:** GSAP, Framer Motion
- **Data Visualization:** Recharts
- **Styling:** Tailwind CSS

**Backend Architecture**
- **Core:** FastAPI, Python 3.11
- **Real-Time:** WebSockets
- **Machine Learning:** Scikit-learn, XGBoost
- **Validation:** Pydantic v2

**Infrastructure & Ops**
- Docker & Docker Compose
- GitHub Actions (CI)
- Vercel (Frontend Deployment)
- Railway (Backend Deployment)

---

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repo-url> cybersphere
   cd cybersphere
   ```

2. **Start the Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

3. **Start the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Launch the App**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Detailed Setup:** For Docker deployment, environment variable configuration, and ML model training instructions, please refer to the [Setup Guide](docs/SETUP.md).

---

## 📂 Project Structure

```text
cybersphere/
├── frontend/               # React + Vite + React Three Fiber
│   ├── src/
│   │   ├── pages/          # Application Routes (Landing, Visualizer, Dashboard)
│   │   ├── scenes/         # 3D Components (CyberScene, GlobeView, Node rendering)
│   │   ├── components/     # UI Components (Charts, Controls, Overlays)
│   │   ├── store/          # Zustand State Management
│   │   └── hooks/          # Custom Hooks (WebSockets, Throttling)
├── backend/                # FastAPI + Python
│   ├── api/                # REST Routes
│   ├── simulation/         # Network Event Generator
│   ├── ml/                 # Threat Inference Service
│   └── websocket/          # Real-time connection management
├── docs/                   # Comprehensive Documentation
└── docker-compose.yml      # Container orchestration
```

---

## 📚 Documentation Directory

- [**Architecture Guide**](docs/ARCHITECTURE.md) — Deep dive into system design, performance optimizations, and data flow.
- [**Setup & Installation**](docs/SETUP.md) — Comprehensive guide for local development, Docker, and environment variables.
- [**Demo Script**](docs/DEMO_SCRIPT.md) — A step-by-step 15-minute walkthrough for showcasing the platform's capabilities.

---

## 🧪 Testing & Validation

```bash
# Backend (Pytest Suite)
cd backend && python -m pytest tests/ -v

# Frontend (TypeScript Validation)
cd frontend && npx tsc --noEmit

# Frontend (Production Build Test)
cd frontend && npm run build
```

---

## 📄 License

MIT License
