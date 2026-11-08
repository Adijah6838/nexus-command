from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Set
from datetime import datetime
import asyncio
from database import engine, get_db
import models
import schemas

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Nexus Command API")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# --- WEBSOCKET MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root(): return {"message": "Nexus Command API is running"}

@app.get("/api/services", response_model=List[schemas.ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    return db.query(models.Service).all()

# CHANGED TO async def to support WebSockets
@app.post("/api/telemetry/ingest")
async def ingest_telemetry(batch: schemas.TelemetryBatch, db: Session = Depends(get_db)):
    if not batch.records:
        raise HTTPException(status_code=400, detail="Empty batch")
    
    alert_triggered = False
    for record in batch.records:
        service = db.query(models.Service).filter(models.Service.id == record.service_id).first()
        if not service:
            continue
            
        telemetry = models.Telemetry(
            service_id=record.service_id, cpu_usage=record.cpu_usage, memory_usage=record.memory_usage,
            disk_utilization=record.disk_utilization, network_throughput=record.network_throughput,
            request_count=record.request_count, error_count=record.error_count, response_time=record.response_time
        )
        db.add(telemetry)
        
        # Alert Engine
        if record.cpu_usage > 85.0 or record.response_time > 500.0:
            existing_alert = db.query(models.Alert).filter(models.Alert.service_id == record.service_id, models.Alert.is_resolved == False).first()
            if not existing_alert:
                new_alert = models.Alert(
                    service_id=record.service_id,
                    severity=models.IncidentSeverity.CRITICAL if record.cpu_usage > 95 else models.IncidentSeverity.HIGH,
                    message=f"Anomaly detected: CPU {record.cpu_usage}%, Response Time {record.response_time}ms"
                )
                db.add(new_alert)
                service.status = models.ServiceStatus.DEGRADED
                alert_triggered = True
        else:
            existing_alert = db.query(models.Alert).filter(models.Alert.service_id == record.service_id, models.Alert.is_resolved == False).first()
            if existing_alert:
                existing_alert.is_resolved = True
                service.status = models.ServiceStatus.HEALTHY
                alert_triggered = True
        
    db.commit()
    
    # BROADCAST TO WEBSOCKETS!
    if alert_triggered:
        await manager.broadcast("NEW_ALERT")
    
    return {"message": "Telemetry ingested"}

@app.get("/api/alerts", response_model=List[schemas.AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(models.Alert).order_by(models.Alert.timestamp.desc()).all()

from datetime import timedelta # Add this import at the top of main.py if not there

@app.get("/api/analytics/dashboard")
def get_dashboard_data(time_range: str = "15m", db: Session = Depends(get_db)):
    total = db.query(models.Service).count()
    healthy = db.query(models.Service).filter(models.Service.status == models.ServiceStatus.HEALTHY).count()
    
    # Calculate time cutoff
    now = datetime.utcnow()
    if time_range == "15m": delta = timedelta(minutes=15)
    elif time_range == "1h": delta = timedelta(hours=1)
    elif time_range == "6h": delta = timedelta(hours=6)
    elif time_range == "24h": delta = timedelta(days=1)
    else: delta = timedelta(minutes=15)
    
    cutoff = now - delta
    recent = db.query(models.Telemetry).filter(models.Telemetry.timestamp >= cutoff).all()
    
    avg_cpu = sum([t.cpu_usage for t in recent]) / len(recent) if recent else 0
    avg_mem = sum([t.memory_usage for t in recent]) / len(recent) if recent else 0
    avg_res = sum([t.response_time for t in recent]) / len(recent) if recent else 0

    # Aggregate data for charts (Group by minute)
    chart_dict = {}
    for t in recent:
        time_key = t.timestamp.strftime("%H:%M")
        if time_key not in chart_dict:
            chart_dict[time_key] = {"cpu": [], "mem": [], "resp": []}
        chart_dict[time_key]["cpu"].append(t.cpu_usage)
        chart_dict[time_key]["mem"].append(t.memory_usage)
        chart_dict[time_key]["resp"].append(t.response_time)

    chart_data = []
    for time_key in sorted(chart_dict.keys()):
        d = chart_dict[time_key]
        chart_data.append({
            "time": time_key,
            "cpu": round(sum(d["cpu"]) / len(d["cpu"]), 2),
            "mem": round(sum(d["mem"]) / len(d["mem"]), 2),
            "resp": round(sum(d["resp"]) / len(d["resp"]), 2),
        })
    
    return {
        "total_services": total, "healthy_services": healthy,
        "avg_cpu": round(avg_cpu, 2), "avg_mem": round(avg_mem, 2), "avg_response": round(avg_res, 2),
        "chart_data": chart_data
    }