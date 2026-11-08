from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class ServiceStatus(str, enum.Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    OFFLINE = "offline"

class IncidentSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    status = Column(Enum(ServiceStatus), default=ServiceStatus.HEALTHY)
    created_at = Column(DateTime, default=datetime.utcnow)

    telemetry = relationship("Telemetry", back_populates="service")
    alerts = relationship("Alert", back_populates="service")

class Telemetry(Base):
    __tablename__ = "telemetry"
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    disk_utilization = Column(Float)
    network_throughput = Column(Float)
    request_count = Column(Integer)
    error_count = Column(Integer)
    response_time = Column(Float)

    service = relationship("Service", back_populates="telemetry")

class AlertRule(Base):
    __tablename__ = "alert_rules"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    metric_type = Column(String) # e.g., cpu_usage, response_time
    threshold = Column(Float)
    duration_minutes = Column(Integer)
    is_active = Column(Boolean, default=True)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    rule_id = Column(Integer, ForeignKey("alert_rules.id"))
    severity = Column(Enum(IncidentSeverity), default=IncidentSeverity.MEDIUM)
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_resolved = Column(Boolean, default=False)

    service = relationship("Service", back_populates="alerts")

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    severity = Column(Enum(IncidentSeverity), default=IncidentSeverity.MEDIUM)
    status = Column(String, default="open") # open, investigating, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
