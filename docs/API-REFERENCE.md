# API Reference

<p align="left">
  <img src="https://img.shields.io/badge/FastAPI-REST%20%26%20WS-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI badge" />
  <img src="https://img.shields.io/badge/WebSocket-Realtime-6C63FF?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSocket badge" />
  <img src="https://img.shields.io/badge/CyberSphere%20AI-API-111111?style=for-the-badge&logoColor=white" alt="CyberSphere badge" />
</p>

This document describes the HTTP and WebSocket API used by CyberSphere AI.

## Base URLs

- Local backend: `http://localhost:8000`
- WebSocket endpoint: `ws://localhost:8000/ws`

## Authentication

The MVP does not require authentication. If you add auth later, document the token format and protected routes here.

## Common Response Shape

Most API responses are JSON and follow this pattern:

```json
{
  "success": true,
  "data": {},
  "message": "optional message"
}
```

Errors usually follow:

```json
{
  "success": false,
  "error": "Human readable error message"
}
```

## Health

### GET `/health`
Checks whether the backend is running.

#### Response
```json
{
  "status": "ok",
  "service": "cybersphere-backend",
  "version": "1.0.0"
}
```

#### Use
- Monitoring
- Deployment checks
- Load balancer health checks

## Simulation

### POST `/api/simulation/start`
Starts the synthetic traffic simulation.

#### Request Body
```json
{
  "scenario": "mixed",
  "intensity": "normal"
}
```

#### Supported Scenarios
- `calm`
- `ddos`
- `brute_force`
- `port_scan`
- `malware_spread`
- `mixed`

#### Response
```json
{
  "success": true,
  "data": {
    "active": true,
    "scenario": "mixed"
  }
}
```

### POST `/api/simulation/stop`
Stops the active simulation.

#### Response
```json
{
  "success": true,
  "data": {
    "active": false
  }
}
```

### POST `/api/simulation/scenario`
Changes the current simulation scenario without restarting the app.

#### Request Body
```json
{
  "scenario": "ddos"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "scenario": "ddos"
  }
}
```

## Nodes

### GET `/api/nodes`
Returns all nodes in the current topology.

#### Response Example
```json
{
  "success": true,
  "data": [
    {
      "node_id": "node-01",
      "ip_address": "10.0.0.1",
      "role": "firewall",
      "location": "edge",
      "state": "healthy",
      "current_risk_score": 12,
      "tags": ["gateway", "security"]
    }
  ]
}
```

### GET `/api/nodes/{node_id}`
Returns a single node and its metadata.

#### Path Params
- `node_id`: string

#### Response Example
```json
{
  "success": true,
  "data": {
    "node_id": "node-01",
    "ip_address": "10.0.0.1",
    "role": "firewall",
    "location": "edge",
    "state": "compromised",
    "current_risk_score": 88,
    "tags": ["gateway", "security"],
    "last_seen": "2026-05-06T09:00:00Z"
  }
}
```

## Events

### GET `/api/events`
Returns recent historical events.

#### Query Parameters
- `limit` (optional): number of events to return, default `100`
- `offset` (optional): pagination offset, default `0`
- `node_id` (optional): filter by node
- `attack_type` (optional): filter by attack type

#### Response Example
```json
{
  "success": true,
  "data": [
    {
      "event_id": "evt-001",
      "timestamp": "2026-05-06T09:10:00Z",
      "source_node_id": "node-12",
      "target_node_id": "node-01",
      "protocol": "TCP",
      "bytes": 1840,
      "is_malicious": true,
      "attack_type": "ddos",
      "anomaly_score": 0.93,
      "risk_score": 91,
      "severity": "Critical"
    }
  ]
}
```

## ML Inference

### POST `/api/ml/predict`
Runs inference on a single event payload.

#### Request Body
```json
{
  "flow_duration": 12.5,
  "total_fwd_packets": 58,
  "total_bwd_packets": 5,
  "flow_bytes_per_s": 10240.4,
  "flow_packets_per_s": 14.2,
  "syn_flag_count": 4,
  "rst_flag_count": 0,
  "psh_flag_count": 11,
  "ack_flag_count": 52
}
```

#### Response Example
```json
{
  "success": true,
  "data": {
    "anomaly_score": 0.81,
    "attack_type": "ddos",
    "confidence": 0.92,
    "risk_score": 89,
    "severity": "Critical"
  }
}
```

#### Notes
- In MVP mode, this may use rule-based fallback scoring.
- When `ENABLE_ML_INFERENCE=true`, the backend should load trained models instead.

## WebSocket API

### Endpoint: `ws://localhost:8000/ws`
Used for live simulation events, node updates, and status messages.

### Client Messages

#### Subscribe to events
```json
{
  "action": "subscribe",
  "channel": "events"
}
```

#### Start simulation
```json
{
  "action": "start_simulation",
  "scenario": "mixed"
}
```

#### Stop simulation
```json
{
  "action": "stop_simulation"
}
```

#### Change scenario
```json
{
  "action": "set_scenario",
  "scenario": "port_scan"
}
```

### Server Messages

#### Event message
```json
{
  "type": "event",
  "data": {
    "event_id": "evt-001",
    "source_node_id": "node-12",
    "target_node_id": "node-01",
    "attack_type": "ddos",
    "risk_score": 91
  }
}
```

#### Node update message
```json
{
  "type": "node_update",
  "data": {
    "node_id": "node-01",
    "state": "compromised",
    "risk_score": 88
  }
}
```

#### Simulation status message
```json
{
  "type": "simulation_status",
  "data": {
    "active": true,
    "scenario": "mixed",
    "events_per_second": 50
  }
}
```

#### Error message
```json
{
  "type": "error",
  "data": {
    "message": "Invalid scenario"
  }
}
```

## Frontend Integration Notes

- Use `/api/simulation/start` when the user clicks Start.
- Use `/api/nodes` to initialize the 3D scene and dashboard node state.
- Use `/api/events` for initial history and replay buffering.
- Use the WebSocket stream for live updates.
- Keep UI responsive by updating charts and 3D objects in throttled batches.

## Status Codes

- `200` Success
- `400` Invalid request
- `404` Resource not found
- `500` Internal server error

## Versioning

If the API grows, add versioning such as:
- `/api/v1/...`
- `/ws/v1`

## Example Curl

```bash
curl http://localhost:8000/health
```

```bash
curl -X POST http://localhost:8000/api/simulation/start   -H "Content-Type: application/json"   -d '{"scenario":"mixed"}'
```

## Related Docs

- [README](README.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Setup](docs/SETUP.md)
- [Demo Script](docs/DEMO_SCRIPT.md)
