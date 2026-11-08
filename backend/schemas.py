from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models import ServiceStatus, IncidentSeverity

class TelemetryRecord(BaseModel):
    service_id: int
    timestamp: Optional[datetime] = None
    cpu_usage: float
    memory_usage: float
    disk_utilization: float
    network_throughput: float
    request_count: int
    error_count: int
    response_time: float

class TelemetryBatch(BaseModel):
    records: List[TelemetryRecord]

class ServiceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: ServiceStatus
    created_at: datetime
    class Config: from_attributes = True

class AlertResponse(BaseModel):
    id: int
    service_id: int
    severity: IncidentSeverity
    message: str
    timestamp: datetime
    is_resolved: bool
    class Config: from_attributes = True
