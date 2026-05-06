# CyberSphere AI — Demo Script

## Overview
This script provides a structured, 10-to-15-minute walkthrough of CyberSphere AI's capabilities. It highlights both the visual impact of the platform and the underlying technical optimizations. 

**Pre-requisite:** Ensure both the frontend and backend are running locally without errors.

---

## Part 1: Landing Page & Capabilities (2 min)

**Action:** Open `http://localhost:5173` in your browser.

**Talking Points:**
1. Wait for the page to load and observe the **GSAP cinematic text reveal**.
2. Move your mouse around the background — notice how the canvas particle grid reacts dynamically to your cursor.
3. Scroll down slowly. Highlight the **System Capabilities** strip:
   - *Global Threat Detection, Live Event Streaming, XGBoost Risk Scoring, 3D Network Topology, Cinematic Visualization, Real-time Dashboards.*
4. Click **"Launch App"**. Notice the instant, zero-delay transition into the 3D application.

---

## Part 2: 3D Visualizer — Globe Mode (3 min)

**Action:** The 3D scene loads in Globe mode, displaying a 20-node network.

**Talking Points:**
1. **Cinematic Stability:** Click and drag to rotate the globe. Scroll to zoom. Point out how the camera is clamped to prevent clipping, and how the data nodes stay perfectly anchored to the surface without drifting.
2. **Visual Hierarchy:** Point out the distinct node colors:
   - 🟢 **Green:** Healthy
   - 🟠 **Orange:** Suspicious
   - 🔵 **Blue:** Compromised
3. **Node Inspection:** Click on any node.
   - The **Node Inspection Panel** slides in smoothly from the right.
   - Show the circular Risk Gauge, the metadata, and the (currently empty) event table.

---

## Part 3: Simulation & Graph Mode (3 min)

**Action:** Change the view and start the attack simulation.

1. Click **"Graph"** in the top-right toggle. Watch the globe smoothly transition into a force-directed spatial graph.
2. Click the **"Start"** button on the bottom control bar.
3. Change the scenario dropdown to **"DDoS"**.

**Talking Points:**
1. **Real-time Streaming:** Watch the colored attack trails animate between nodes. These are driven by live WebSockets.
2. **Visual Feedback:** Notice the nodes pulsating. Compromised (blue) nodes pulse rapidly, while healthy (green) nodes breathe slowly. The emissive glow adjusts dynamically based on the network's threat level.
3. **Instant Stop (Optimistic UI):** Click **"Stop"**. Point out how the 3D scene clears instantly, in the exact same frame, rather than waiting for server confirmation.
4. Click **"Start"** again and set the scenario to **"Mixed"**.

---

## Part 4: Analytics Dashboard (3 min)

**Action:** Click the **"Analytics"** link in the top-right header.

**Talking Points:**
1. **Instant Navigation:** Mention that the switch was instantaneous because the Dashboard prefetches the Visualizer chunk in the background. (And vice-versa, the WebGL canvas is kept warm in memory).
2. **Live KPIs:** Point out the top cards updating every 500ms (Total Attacks, Active Threats, Network Health). Explain that this 500ms throttle decouples heavy React chart rendering from high-speed WebSocket traffic.
3. **Visualizations:**
   - **Attack Timeline:** Shows the stacked volume of attacks over time.
   - **Threat Heatmap:** Matrix cells glow brighter as specific node-to-node attack frequency increases.
   - **AI Insights:** Donut chart showing the distribution of attack classifications.

---

## Part 5: Replay Mode (2 min)

**Action:** Click the **"CyberSphere 3D"** logo in the top-left to return to the Visualizer.

**Talking Points:**
1. Look at the top right: the **"REPLAY"** button will show a badge with the number of buffered events (e.g., `(450)`).
2. Click **REPLAY**. The live simulation will pause.
3. Click the **▶ Play** button on the bottom playback bar.
4. Watch past events replay in the 3D scene.
5. Change the speed multiplier: **1× → 2× → 5×**.
6. Grab the timeline scrubber and drag it back and forth to time-travel through the attacks.
7. Click **"LIVE"** to instantly snap back to the real-time WebSocket feed.

---

## Part 6: Wrap-up & Technical Highlights (2 min)

**Closing Statements:**
- **Zero-Allocation Rendering:** The 3D scene handles thousands of elements at 60 FPS because the render loop uses pre-allocated memory blocks, eliminating JavaScript garbage collection stutter.
- **Production Ready:** The application utilizes a robust architecture featuring Docker, GitHub Actions, and scalable Zustand ring-buffers that prevent memory leaks during 24/7 continuous operation.
- **ML Flexibility:** The system uses rule-based heuristic fallbacks for this demo, meaning no complex Python model training was required out-of-the-box, but it is fully wired to accept trained `.joblib` Scikit-learn models.
