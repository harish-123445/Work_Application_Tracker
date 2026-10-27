from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas, crud

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=List[schemas.ApplicationRead])
def list_applications(
    status: Optional[str] = Query(None, description="Filter by application status"),
    work_mode: Optional[str] = Query(None, description="Filter by work mode"),
    search: Optional[str] = Query(None, description="Search company, role, location, or notes"),
    is_favorite: Optional[bool] = Query(None, description="Filter favorites"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    return crud.get_applications(
        db, status=status, work_mode=work_mode, search=search, is_favorite=is_favorite, skip=skip, limit=limit
    )

@router.post("", response_model=schemas.ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: schemas.ApplicationCreate,
    db: Session = Depends(get_db)
):
    return crud.create_application(db, app_in)

@router.get("/{application_id}", response_model=schemas.ApplicationDetailRead)
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    app = crud.get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application with ID {application_id} not found")
    return app

@router.patch("/{application_id}/status", response_model=schemas.ApplicationRead)
def update_status(
    application_id: int,
    status_in: schemas.ApplicationStatusUpdate,
    db: Session = Depends(get_db)
):
    app = crud.update_application_status(db, application_id, status_in.status, status_in.note)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application with ID {application_id} not found")
    return app

@router.put("/{application_id}", response_model=schemas.ApplicationRead)
def update_application(
    application_id: int,
    app_update: schemas.ApplicationUpdate,
    db: Session = Depends(get_db)
):
    app = crud.update_application(db, application_id, app_update)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application with ID {application_id} not found")
    return app

@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    success = crud.delete_application(db, application_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Application with ID {application_id} not found")
    return None
