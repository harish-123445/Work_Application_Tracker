from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas, crud

router = APIRouter(tags=["Interviews"])

@router.post("/applications/{application_id}/interviews", response_model=schemas.InterviewRoundRead, status_code=status.HTTP_201_CREATED)
def add_interview_round(
    application_id: int,
    round_in: schemas.InterviewRoundCreate,
    db: Session = Depends(get_db)
):
    round_obj = crud.add_interview_round(db, application_id, round_in)
    if not round_obj:
        raise HTTPException(status_code=404, detail=f"Application with ID {application_id} not found")
    return round_obj

@router.patch("/interviews/{round_id}", response_model=schemas.InterviewRoundRead)
def update_interview_round(
    round_id: int,
    round_update: schemas.InterviewRoundUpdate,
    db: Session = Depends(get_db)
):
    round_obj = crud.update_interview_round(db, round_id, round_update)
    if not round_obj:
        raise HTTPException(status_code=404, detail=f"Interview round with ID {round_id} not found")
    return round_obj

@router.post("/interviews/{round_id}/feedback", response_model=schemas.InterviewFeedbackRead)
def save_feedback(
    round_id: int,
    feedback_in: schemas.InterviewFeedbackCreate,
    db: Session = Depends(get_db)
):
    feedback = crud.save_interview_feedback(db, round_id, feedback_in)
    if not feedback:
        raise HTTPException(status_code=404, detail=f"Interview round with ID {round_id} not found")
    return feedback
