from database import SessionLocal, engine
import models

def seed_services():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(models.Service).count() > 0:
        print("Services already seeded.")
        db.close()
        return

    services = [
        "Auth Service", "Payment Processing", "Customer Management", 
        "Database Server", "API Gateway", "Background Jobs", 
        "Notification Service", "File Processing", "Search Engine", "Analytics Engine"
    ]
    
    for s in services:
        db.add(models.Service(name=s, description=f"Simulated {s}"))
    db.commit()
    db.close()
    print("10 Services seeded successfully!")

if __name__ == "__main__":
    seed_services()
