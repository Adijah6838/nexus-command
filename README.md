# NEXUS COMMAND - Distributed Cloud Monitoring & Incident Management Platform

Nexus Command is an expert-level, full-stack infrastructure monitoring platform. It simulates ingesting real-time telemetry from multiple distributed services, detects anomalies, triggers alerts, and visualizes system health through an interactive dashboard.

## 🚀 Features
- **Telemetry Ingestion**: FastAPI endpoint that processes batch telemetry from 10 simulated services.
- **Alert Detection Engine**: Automatically detects CPU spikes (>85%) and latency anomalies (>500ms), changing service status and creating incident alerts.
- **Real-Time Updates**: Uses WebSockets to push updates to the frontend the moment an anomaly is detected.
- **Service Dependency Graph**: Interactive React Flow visualization mapping service dependencies.
- **Dynamic Analytics**: Recharts-powered visualizations with configurable time-aggregation windows.
- **Python Simulator**: Deterministic data generator that mimics normal load and random anomaly spikes.

## 💻 Tech Stack
- **Frontend**: React, TypeScript, Vite, Recharts, React Flow, Lucide React.
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite, WebSockets, Pydantic.
- **Testing**: Pytest, Vitest.

## 🛠️ Local Setup
*(See `backend/` and `frontend/` folders for specific setup instructions).*
