from fastapi import APIRouter
from typing import Dict
import psutil
import time

router = APIRouter()

def get_system_health() -> Dict:
    return {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage("/").percent,
    }

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "system": get_system_health(),
    }

@router.get("/health/live")
async def liveness():
    """Kubernetes liveness probe"""
    return {"status": "alive"}

@router.get("/health/ready")
async def readiness():
    """Kubernetes readiness probe"""
    # Add your readiness checks here (e.g., database connection)
    return {"status": "ready"} 