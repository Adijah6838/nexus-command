from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Nexus Command API is running"}

def test_get_services():
    response = client.get("/api/services")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_telemetry_ingestion():
    payload = {
        "records": [{
            "service_id": 1,
            "cpu_usage": 45.0,
            "memory_usage": 60.0,
            "disk_utilization": 30.0,
            "network_throughput": 500.0,
            "request_count": 100,
            "error_count": 0,
            "response_time": 120.0
        }]
    }
    response = client.post("/api/telemetry/ingest", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Telemetry ingested"

def test_invalid_telemetry_missing_fields():
    payload = {"records": [{"service_id": 1}]} # Missing required fields
    response = client.post("/api/telemetry/ingest", json=payload)
    assert response.status_code == 422 # Pydantic Validation Error