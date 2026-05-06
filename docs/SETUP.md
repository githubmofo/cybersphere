# CyberSphere AI — Setup Guide

This guide will walk you through setting up CyberSphere AI on your local machine for development, testing, and demonstration purposes.

---

## 📋 Prerequisites

Ensure your system has the following installed:
- **Node.js:** v20.0 or higher
- **Python:** v3.11 or higher
- **Git:** Any modern version
- *(Optional)* **Docker Desktop:** v4.0+ (Only required for containerized deployment)

---

## 1️⃣ Repository Setup

First, clone the repository and navigate into the project directory:

```bash
git clone <your-repo-url> cybersphere
cd cybersphere
```

### Environment Configuration
The project requires `.env` files for both the frontend and backend. 

**Backend:**
```bash
cp backend/.env.example backend/.env
```
*(The defaults in the backend `.env` are sufficient for local development. Supabase variables can be left blank).*

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```
Ensure the frontend `.env` contains:
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 2️⃣ Backend Installation & Launch

The backend is built with FastAPI and runs the simulation engine and WebSocket server.

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
4. **Verify:** Open your browser and go to `http://localhost:8000/health`. You should see:
   `{"status":"ok","version":"0.1.0"}`

---

## 3️⃣ Frontend Installation & Launch

The frontend is a React application powered by Vite and React Three Fiber.

1. Open a **new terminal window** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. **Access the App:** Open your browser and navigate to `http://localhost:5173`.

---

## 4️⃣ Running via Docker (Alternative)

If you prefer not to install Node or Python locally, you can run the entire stack using Docker Compose. This is ideal for production simulation or testing.

1. Ensure Docker Desktop is running.
2. From the root `cybersphere` directory, run:
   ```bash
   docker-compose up --build
   ```
3. The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:8000`.

---

## 🧠 Machine Learning Configuration (Optional)

By default, CyberSphere AI operates in **Rule-Based Fallback Mode**. This means it generates realistic risk scores and classifications using heuristics without requiring trained models. This is perfect for immediate demonstration.

To enable the real Machine Learning pipeline:
1. Download the CICIDS2017 dataset.
2. Run the training scripts:
   ```bash
   python ml/src/train_classifier.py
   python ml/src/train_anomaly.py
   ```
3. Ensure the output models (`.joblib` files) are saved in the `backend/ml/models/` directory.
4. Open `backend/.env` and update the flag:
   ```env
   ENABLE_ML_INFERENCE=true
   ```
5. Restart the backend server.

---

## 🛠 Troubleshooting

**1. The 3D nodes aren't glowing or visible.**
- Ensure your browser supports hardware acceleration and that it is turned on. The bloom post-processing requires WebGL 2.0.

**2. Simulation starts, but no trails appear.**
- Check your browser's developer console (F12) for WebSocket connection errors.
- Ensure the backend is running on port 8000.
- Verify `VITE_WS_URL` in `frontend/.env` exactly matches your backend address.

**3. "Missing module" errors during Python startup.**
- Ensure you activated your virtual environment (if using one) before running `pip install -r requirements.txt`.
