from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.routers import applications, interviews, analytics, data_transfer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables automatically on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Work Application Tracker API",
    description="Production-grade, fully normalized job application tracking and analytics engine.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware dynamically populated from config.yaml
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.server.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
app.include_router(applications.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(data_transfer.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite",
        "wal_mode": True,
        "enums_count": len(settings.enums.application_statuses)
    }
