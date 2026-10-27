from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, distinct

from app import models, schemas
from app.config import settings

# ----------------- Company & Tag Helpers -----------------
def get_or_create_company(db: Session, name: str, website: Optional[str] = None) -> models.Company:
    cleaned_name = name.strip()
    company = db.query(models.Company).filter(func.lower(models.Company.name) == func.lower(cleaned_name)).first()
    if not company:
        company = models.Company(name=cleaned_name, website=website)
        db.add(company)
        db.flush()
    elif website and not company.website:
        company.website = website
        db.flush()
    return company

def get_or_create_tags(db: Session, tag_names: List[str]) -> List[models.Tag]:
    tags = []
    for raw_name in tag_names:
        name = raw_name.strip()
        if not name:
            continue
        tag = db.query(models.Tag).filter(func.lower(models.Tag.name) == func.lower(name)).first()
        if not tag:
            tag = models.Tag(name=name)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags

# ----------------- Application CRUD -----------------
def get_applications(
    db: Session,
    status: Optional[str] = None,
    work_mode: Optional[str] = None,
    search: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Application]:
    query = (
        db.query(models.Application)
        .options(
            joinedload(models.Application.company),
            joinedload(models.Application.tags),
            joinedload(models.Application.interviews).joinedload(models.InterviewRound.feedback)
        )
    )

    if status:
        query = query.filter(models.Application.status == status)
    if work_mode:
        query = query.filter(models.Application.work_mode == work_mode)
    if is_favorite is not None:
        query = query.filter(models.Application.is_favorite == is_favorite)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.join(models.Application.company).filter(
            or_(
                models.Application.role_title.ilike(search_pattern),
                models.Company.name.ilike(search_pattern),
                models.Application.location.ilike(search_pattern),
                models.Application.notes.ilike(search_pattern)
            )
        )

    return query.order_by(models.Application.applied_date.desc(), models.Application.id.desc()).offset(skip).limit(limit).all()

def get_application_by_id(db: Session, application_id: int) -> Optional[models.Application]:
    return (
        db.query(models.Application)
        .options(
            joinedload(models.Application.company),
            joinedload(models.Application.tags),
            joinedload(models.Application.interviews).joinedload(models.InterviewRound.feedback),
            joinedload(models.Application.timeline_events)
        )
        .filter(models.Application.id == application_id)
        .first()
    )

def create_application(db: Session, app_in: schemas.ApplicationCreate) -> models.Application:
    company = get_or_create_company(db, app_in.company_name, app_in.company_website)
    tags = get_or_create_tags(db, app_in.tag_names)

    app_data = app_in.model_dump(exclude={"company_name", "company_website", "tag_names"})
    db_application = models.Application(
        **app_data,
        company_id=company.id,
        tags=tags
    )
    db.add(db_application)
    db.flush()

    # Automatically record creation event in timeline
    timeline_event = models.TimelineEvent(
        application_id=db_application.id,
        event_type="created",
        to_state=db_application.status,
        description=f"Created application for {app_in.role_title} at {company.name}"
    )
    db.add(timeline_event)
    db.commit()
    db.refresh(db_application)
    return db_application

def update_application_status(
    db: Session,
    application_id: int,
    new_status: str,
    note: Optional[str] = None
) -> Optional[models.Application]:
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        return None

    old_status = app.status
    if old_status != new_status:
        app.status = new_status
        timeline_event = models.TimelineEvent(
            application_id=app.id,
            event_type="status_change",
            from_state=old_status,
            to_state=new_status,
            description=note or f"Status transitioned from {old_status} to {new_status}"
        )
        db.add(timeline_event)
        db.commit()
        db.refresh(app)
    return app

def update_application(
    db: Session,
    application_id: int,
    app_update: schemas.ApplicationUpdate
) -> Optional[models.Application]:
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        return None

    update_dict = app_update.model_dump(exclude_unset=True)

    if "company_name" in update_dict and update_dict["company_name"]:
        company = get_or_create_company(db, update_dict.pop("company_name"))
        app.company_id = company.id
    elif "company_name" in update_dict:
        update_dict.pop("company_name")

    if "tag_names" in update_dict and update_dict["tag_names"] is not None:
        tags = get_or_create_tags(db, update_dict.pop("tag_names"))
        app.tags = tags
    elif "tag_names" in update_dict:
        update_dict.pop("tag_names")

    # If status is being updated, log timeline event
    if "status" in update_dict and update_dict["status"] != app.status:
        timeline_event = models.TimelineEvent(
            application_id=app.id,
            event_type="status_change",
            from_state=app.status,
            to_state=update_dict["status"],
            description="Status updated via detail editor"
        )
        db.add(timeline_event)

    for field, value in update_dict.items():
        setattr(app, field, value)

    db.commit()
    db.refresh(app)
    return app

def delete_application(db: Session, application_id: int) -> bool:
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        return False
    db.delete(app)
    db.commit()
    return True

# ----------------- Interview Rounds CRUD -----------------
def add_interview_round(
    db: Session,
    application_id: int,
    round_in: schemas.InterviewRoundCreate
) -> Optional[models.InterviewRound]:
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        return None

    feedback_data = round_in.feedback
    round_data = round_in.model_dump(exclude={"feedback"})

    db_round = models.InterviewRound(
        **round_data,
        application_id=application_id
    )
    db.add(db_round)
    db.flush()

    if feedback_data:
        db_feedback = models.InterviewFeedback(
            **feedback_data.model_dump(),
            interview_round_id=db_round.id
        )
        db.add(db_feedback)

    timeline_event = models.TimelineEvent(
        application_id=application_id,
        event_type="interview_scheduled",
        description=f"Scheduled Round {round_in.round_number}: {round_in.round_type}"
    )
    db.add(timeline_event)

    db.commit()
    db.refresh(db_round)
    return db_round

def update_interview_round(
    db: Session,
    round_id: int,
    round_update: schemas.InterviewRoundUpdate
) -> Optional[models.InterviewRound]:
    db_round = db.query(models.InterviewRound).filter(models.InterviewRound.id == round_id).first()
    if not db_round:
        return None

    for field, value in round_update.model_dump(exclude_unset=True).items():
        setattr(db_round, field, value)

    db.commit()
    db.refresh(db_round)
    return db_round

def save_interview_feedback(
    db: Session,
    round_id: int,
    feedback_in: schemas.InterviewFeedbackCreate
) -> Optional[models.InterviewFeedback]:
    db_round = db.query(models.InterviewRound).filter(models.InterviewRound.id == round_id).first()
    if not db_round:
        return None

    feedback = db.query(models.InterviewFeedback).filter(models.InterviewFeedback.interview_round_id == round_id).first()
    if feedback:
        for field, value in feedback_in.model_dump(exclude_unset=True).items():
            setattr(feedback, field, value)
    else:
        feedback = models.InterviewFeedback(
            **feedback_in.model_dump(),
            interview_round_id=round_id
        )
        db.add(feedback)

    db.commit()
    db.refresh(feedback)
    return feedback

# ----------------- Deterministic Analytics Engine -----------------
def compute_kpis(db: Session) -> schemas.KPISummary:
    total_apps = db.query(func.count(models.Application.id)).scalar() or 0
    
    # Terminal statuses configured in config.yaml
    terminal_statuses = [
        item.key for item in settings.enums.application_statuses if item.is_terminal
    ]
    
    active_in_pipeline = (
        db.query(func.count(models.Application.id))
        .filter(models.Application.status.notin_(terminal_statuses))
        .scalar() or 0
    )
    
    offers_received = (
        db.query(func.count(models.Application.id))
        .filter(models.Application.status == "offer")
        .scalar() or 0
    )
    
    rejections = (
        db.query(func.count(models.Application.id))
        .filter(models.Application.status == "rejected")
        .scalar() or 0
    )

    # Deterministic Ghosting Rule:
    # Applications in 'applied' status where CURRENT_DATE - applied_date > threshold_days
    threshold_date = date.today() - timedelta(days=settings.analytics.ghosting_threshold_days)
    ghosted_count = (
        db.query(func.count(models.Application.id))
        .filter(
            or_(
                models.Application.status == "ghosted",
                and_(
                    models.Application.status == "applied",
                    models.Application.applied_date <= threshold_date
                )
            )
        )
        .scalar() or 0
    )

    # Response Rate: applications that progressed beyond 'applied' or 'wishlist'
    advanced_apps = (
        db.query(func.count(models.Application.id))
        .filter(models.Application.status.notin_(["wishlist", "applied"]))
        .scalar() or 0
    )
    total_applied = (
        db.query(func.count(models.Application.id))
        .filter(models.Application.status != "wishlist")
        .scalar() or 0
    )

    response_rate_pct = round((advanced_apps / total_applied * 100), 1) if total_applied > 0 else 0.0

    # Interview to Offer Conversion
    interviewed_apps = (
        db.query(func.count(distinct(models.InterviewRound.application_id))).scalar() or 0
    )
    interview_conversion_pct = round((offers_received / interviewed_apps * 100), 1) if interviewed_apps > 0 else 0.0

    # Average days to first response (from timeline events)
    first_events = (
        db.query(
            models.Application.applied_date,
            func.min(models.TimelineEvent.created_at).label("first_contact")
        )
        .join(models.TimelineEvent, models.Application.id == models.TimelineEvent.application_id)
        .filter(models.TimelineEvent.to_state.in_(["screening", "technical", "final_round", "rejected"]))
        .group_by(models.Application.id)
        .all()
    )

    avg_days: Optional[float] = None
    if first_events:
        total_days = sum((event.first_contact.date() - event.applied_date).days for event in first_events if event.first_contact)
        avg_days = round(total_days / len(first_events), 1)

    return schemas.KPISummary(
        total_applications=total_apps,
        active_in_pipeline=active_in_pipeline,
        offers_received=offers_received,
        rejections=rejections,
        ghosted_count=ghosted_count,
        response_rate_pct=response_rate_pct,
        interview_conversion_pct=interview_conversion_pct,
        avg_first_response_days=avg_days
    )

def compute_funnel(db: Session) -> List[schemas.FunnelStageMetric]:
    funnel_stages = settings.analytics.funnel_stages
    status_meta = {item.key: item.label for item in settings.enums.application_statuses}

    # Count applications that either currently are in or have transitioned into each stage
    metrics = []
    prev_count = None

    for stage_key in funnel_stages:
        # Count apps that reached this stage
        count = (
            db.query(func.count(distinct(models.TimelineEvent.application_id)))
            .filter(models.TimelineEvent.to_state == stage_key)
            .scalar() or 0
        )

        conversion_pct = 100.0
        if prev_count is not None and prev_count > 0:
            conversion_pct = round((count / prev_count) * 100, 1)

        metrics.append(
            schemas.FunnelStageMetric(
                stage_key=stage_key,
                stage_label=status_meta.get(stage_key, stage_key.title()),
                count=count,
                conversion_from_previous_pct=conversion_pct
            )
        )
        prev_count = count

    return metrics

def compute_status_breakdown(db: Session) -> List[schemas.StatusBreakdownItem]:
    status_counts = dict(
        db.query(models.Application.status, func.count(models.Application.id))
        .group_by(models.Application.status)
        .all()
    )

    items = []
    for item in settings.enums.application_statuses:
        items.append(
            schemas.StatusBreakdownItem(
                status_key=item.key,
                label=item.label,
                color=item.color or "#64748b",
                count=status_counts.get(item.key, 0)
            )
        )
    return items

def compute_work_mode_breakdown(db: Session) -> List[schemas.WorkModeBreakdownItem]:
    mode_counts = dict(
        db.query(models.Application.work_mode, func.count(models.Application.id))
        .group_by(models.Application.work_mode)
        .all()
    )

    items = []
    for item in settings.enums.work_modes:
        items.append(
            schemas.WorkModeBreakdownItem(
                work_mode_key=item.key,
                label=item.label,
                count=mode_counts.get(item.key, 0)
            )
        )
    return items

def compute_weekly_velocity(db: Session, weeks: int = 8) -> List[schemas.WeeklyVelocityItem]:
    today = date.today()
    items = []

    for i in range(weeks - 1, -1, -1):
        start_of_week = today - timedelta(days=today.weekday() + (i * 7))
        end_of_week = start_of_week + timedelta(days=6)
        
        count = (
            db.query(func.count(models.Application.id))
            .filter(and_(models.Application.applied_date >= start_of_week, models.Application.applied_date <= end_of_week))
            .scalar() or 0
        )
        
        label = start_of_week.strftime("%b %d")
        items.append(schemas.WeeklyVelocityItem(week_label=label, count=count))

    return items
