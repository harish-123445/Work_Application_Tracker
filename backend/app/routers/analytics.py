from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas, crud
from app.config import settings

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/kpis", response_model=schemas.KPISummary)
def get_kpi_summary(db: Session = Depends(get_db)):
    return crud.compute_kpis(db)

@router.get("/funnel", response_model=List[schemas.FunnelStageMetric])
def get_funnel_analytics(db: Session = Depends(get_db)):
    return crud.compute_funnel(db)

@router.get("/status-breakdown", response_model=List[schemas.StatusBreakdownItem])
def get_status_breakdown(db: Session = Depends(get_db)):
    return crud.compute_status_breakdown(db)

@router.get("/work-mode-breakdown", response_model=List[schemas.WorkModeBreakdownItem])
def get_work_mode_breakdown(db: Session = Depends(get_db)):
    return crud.compute_work_mode_breakdown(db)

@router.get("/weekly-velocity", response_model=List[schemas.WeeklyVelocityItem])
def get_weekly_velocity(db: Session = Depends(get_db)):
    return crud.compute_weekly_velocity(db)

@router.get("/config")
def get_public_config() -> Dict[str, Any]:
    """Exposes all dynamic enums and configuration directly to the frontend."""
    return {
        "enums": settings.enums.model_dump(),
        "analytics": settings.analytics.model_dump()
    }
