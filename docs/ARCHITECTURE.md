# CyberSphere AI — Architecture

## 1. System Overview

CyberSphere AI is a highly optimized, real-time cyber attack visualization platform. It consists of three primary subsystems:
1. **Frontend:** A high-performance React 3D client built with React Three Fiber.
2. **Backend:** A FastAPI server handling WebSocket streaming and REST routes.
3. **Machine Learning:** An inference pipeline for real-time threat classification.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              Browser (Client)                          │
│                                                                        │
│  ┌──────────────┐  ┌───────────────────────┐  ┌─────────────────────┐  │
│  │  LandingPage │  │    VisualizerPage     │  │   DashboardPage     │  │
│  │  (GSAP Hero) │  │ (3D Scene + Controls) │  │ (Recharts + KPIs)   │  │
│  └──────┬───────┘  └──────────┬────────────┘  └─────────┬───────────┘  │
│         │                     │                         │              │
│         ▼                     ▼                         ▼              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       Zustand State Stores                       │  │
│  │  useAppStore | useVisualizerStore | useDashboard | usePlayback   │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │ useWebSocket hook                 │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ WebSocket (ws://)
┌────────────────────────────────────▼───────────────────────────────────┐
│                             FastAPI Backend                            │
│                                                                        │
│  ┌──────────────┐  ┌───────────────────────┐  ┌─────────────────────┐  │
│  │  REST API    │  │   WebSocket Manager   │  │  Simulation Engine  │  │
│  │  /api/*      │  │   /ws                 │  │  (asyncio loop)     │  │
│  └──────────────┘  └──────────┬────────────┘  └─────────┬───────────┘  │
│                               │                         │              │
│                      ┌────────▼─────────────────────────▼────────┐     │
│                      │           ML Inference Service            │     │
│                      │  feature extraction → anomaly detection   │     │
│                      └───────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture & Performance

The frontend is designed to handle high-frequency data (up to 50 events/sec) without dropping below 60 FPS in the 3D scene.

### Routing & Predictive Prefetching
To eliminate "white-screen" loading times when switching to the heavy 3D Visualizer:
- **Code-Splitting:** The application uses `React.lazy()` and `Suspense`.
- **Idle-Time Prefetching:** The Dashboard automatically prefetches the Visualizer chunk in the background using `requestIdleCallback`.
- **Hover Intent:** Hovering over navigation links triggers an immediate chunk load.

### 3D Rendering Optimizations
The React Three Fiber scene (`CyberScene`) employs several advanced patterns:
1. **Zero-Allocation Render Loops:** In `NetworkNode3D.tsx`, `useFrame` utilizes pre-allocated module-level `THREE.Vector3` and `THREE.Color` objects. This prevents garbage collection (GC) spikes by ensuring no new objects are instantiated during the 60fps render loop.
2. **Decoupled Visual Shell:** The globe's visual shell (grid, atmosphere) rotates independently of the data layer (nodes, trails). The data layer remains static in world space, preventing visual drift and "wobble" calculations.
3. **Ref-Based Animation Tracking:** Animations like `AttackTrail` progress are tracked via a local `useRef(new Map())` rather than React State or Zustand. Mutating Zustand objects 60 times a second caused severe deoptimizations; the local ref approach bypassed React reconciliation entirely, resulting in smooth performance.
4. **Visibility Toggling:** The 3D canvas is never unmounted. When navigating to the dashboard, it is hidden via CSS (`visibility: hidden`). This keeps the WebGL context warm and prevents expensive shader recompilations on return.

### State Management (Zustand)
- **Ring Buffers:** Global event storage uses fixed-size ring buffers (max 5,000 events) to guarantee O(1) memory growth regardless of how long the application runs.
- **Throttling:** The `useDashboardStore` aggregates WebSocket events and only updates React state every 500ms. This decouples chart rendering from network throughput.
- **Optimistic UI:** Controls (like the Start/Stop simulation button) update the local UI state immediately, synchronously clearing the 3D scene in less than 1 frame while the API request completes in the background.

---

## 3. Backend Architecture

### REST Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Application status and version check |
| `POST` | `/api/simulation` | Starts/Stops the threat generation engine |
| `GET`  | `/api/nodes` | Returns the static network topology (nodes + edges) |
| `GET`  | `/api/events` | Fetches historical events (paginated) |

### WebSocket Protocol
The backend pushes enriched JSON payloads to all connected clients:
```json
{
  "type": "threat_event",
  "data": {
    "event_id": "uuid",
    "source_node_id": "fw-1",
    "target_node_id": "db-3",
    "attack_type": "DDoS",
    "severity": "Critical",
    "is_malicious": true,
    "timestamp": "ISO8601",
    "ml_prediction": {
      "risk_score": 82,
      "anomaly_score": 0.87,
      "predicted_class": "DDoS"
    }
  }
}
```

### Simulation Engine
Built on Python's `asyncio`, the engine utilizes specific "Scenarios" (e.g., Port Scan, DDoS, Brute Force). It generates synthetic network data targeting specific nodes based on the scenario profile, ensuring realistic traffic clustering and pacing.

---

## 4. Machine Learning Pipeline

### Data Flow
1. **Feature Extraction:** Raw simulation events are mapped to a 12-feature vector aligned with the CICIDS2017 dataset standard (e.g., packet counts, byte rates, flag frequencies).
2. **Anomaly Detection (Isolation Forest):** Evaluates how far the current packet deviates from historical "Calm" traffic baselines.
3. **Classification (XGBoost):** If flagged as an anomaly, XGBoost categorizes the specific attack vector (e.g., Botnet, SQLi).

### Rule-Based Fallback
To ensure seamless out-of-the-box operation for demos without requiring users to train Python models, the inference service includes a robust rule-based fallback. If `.joblib` models are not detected in the `ml/models` directory, the system safely falls back to heuristic risk scoring.
