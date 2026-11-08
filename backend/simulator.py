import time
import random
import argparse
import requests
from datetime import datetime

API_URL = "http://127.0.0.1:8000/api/telemetry/ingest"
NUM_SERVICES = 10

def generate_telemetry(service_id, is_spike=False):
    """Generates a single telemetry record."""
    if is_spike:
        # Generate an anomaly (spike)
        cpu = random.uniform(85.0, 99.0)
        mem = random.uniform(80.0, 95.0)
        resp = random.uniform(500.0, 2000.0)
        errors = random.randint(10, 50)
    else:
        # Normal operation
        cpu = random.uniform(10.0, 45.0)
        mem = random.uniform(30.0, 60.0)
        resp = random.uniform(50.0, 150.0)
        errors = random.randint(0, 2)

    return {
        "service_id": service_id,
        "timestamp": datetime.utcnow().isoformat(),
        "cpu_usage": round(cpu, 2),
        "memory_usage": round(mem, 2),
        "disk_utilization": round(random.uniform(20.0, 50.0), 2),
        "network_throughput": round(random.uniform(100.0, 1000.0), 2),
        "request_count": random.randint(100, 5000),
        "error_count": errors,
        "response_time": round(resp, 2)
    }

def run_simulator(interval, seed):
    if seed is not None:
        random.seed(seed)
        print(f"Running with deterministic seed: {seed}")

    print(f"Starting telemetry simulation for {NUM_SERVICES} services...")
    print(f"Pushing data every {interval} seconds. Press Ctrl+C to stop.")
    
    try:
        while True:
            batch = []
            # 10% chance of a service experiencing a spike in this batch
            spike_service = random.randint(1, NUM_SERVICES) if random.random() < 0.1 else None

            for service_id in range(1, NUM_SERVICES + 1):
                is_spike = (service_id == spike_service)
                if is_spike:
                    print(f"🚨 INJECTING ANOMALY for Service ID {service_id}!")
                
                batch.append(generate_telemetry(service_id, is_spike))

            payload = {"records": batch}
            
            try:
                response = requests.post(API_URL, json=payload)
                if response.status_code == 200:
                    print(f"✅ Batch ingested at {datetime.now().strftime('%H:%M:%S')} (Accepted: {response.json().get('accepted')})")
                else:
                    print(f"❌ Failed: {response.status_code} - {response.text}")
            except requests.exceptions.ConnectionError:
                print("❌ Cannot connect to backend. Is uvicorn running?")
            
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\nSimulator stopped.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Nexus Command Telemetry Simulator")
    parser.add_argument("--interval", type=float, default=3.0, help="Seconds between batches")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for deterministic testing")
    args = parser.parse_args()

    run_simulator(args.interval, args.seed)