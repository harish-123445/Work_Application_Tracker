from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from app.config import settings

# ----------------- Tag Schemas -----------------
class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color_hex: str = Field(default="#6366f1", max_length=20)

class TagCreate(TagBase):
    pass

class TagRead(TagBase):
    id: int
    class Config:
        from_attributes = True

# ----------------- Company Schemas -----------------
class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    website: Optional[str] = None
    domain: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyRead(CompanyBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# ----------------- Interview Feedback & Round Schemas -----------------
class InterviewFeedbackBase(BaseModel):
    star_situation: Optional[str] = None
    star_task: Optional[str] = None
    star_action: Optional[str] = None
    star_result: Optional[str] = None
    rating_score: Optional[int] = Field(None, ge=1, le=5)
    personal_debrief: Optional[str] = None

class InterviewFeedbackCreate(InterviewFeedbackBase):
    pass

class InterviewFeedbackRead(InterviewFeedbackBase):
    id: int
    interview_round_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class InterviewRoundBase(BaseModel):
    round_number: int = Field(..., ge=1)
    round_type: str
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = 45
    interviewer_name: Optional[str] = None
    interviewer_email: Optional[str] = None
    interviewer_linkedin: Optional[str] = None
    outcome: str = "pending"
    preparation_notes: Optional[str] = None
    completed: bool = False

    @field_validator("round_type")
    @classmethod
    def validate_round_type(cls, v: str) -> str:
        valid = settings.valid_interview_round_types
        if v not in valid:
            raise ValueError(f"Invalid round_type '{v}'. Must be one of: {valid}")
        return v

    @field_validator("outcome")
    @classmethod
    def validate_outcome(cls, v: str) -> str:
        valid = settings.valid_interview_outcomes
        if v not in valid:
            raise ValueError(f"Invalid outcome '{v}'. Must be one of: {valid}")
        return v

class InterviewRoundCreate(InterviewRoundBase):
    feedback: Optional[InterviewFeedbackCreate] = None

class InterviewRoundUpdate(BaseModel):
    round_number: Optional[int] = None
    round_type: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    interviewer_name: Optional[str] = None
    interviewer_email: Optional[str] = None
    interviewer_linkedin: Optional[str] = None
    outcome: Optional[str] = None
    preparation_notes: Optional[str] = None
    completed: Optional[bool] = None

    @field_validator("round_type")
    @classmethod
    def validate_round_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in settings.valid_interview_round_types:
            raise ValueError(f"Invalid round_type '{v}'. Must be one of: {settings.valid_interview_round_types}")
        return v

    @field_validator("outcome")
    @classmethod
    def validate_outcome(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in settings.valid_interview_outcomes:
            raise ValueError(f"Invalid outcome '{v}'. Must be one of: {settings.valid_interview_outcomes}")
        return v

class InterviewRoundRead(InterviewRoundBase):
    id: int
    application_id: int
    created_at: datetime
    feedback: Optional[InterviewFeedbackRead] = None
    class Config:
        from_attributes = True

# ----------------- Timeline Schemas -----------------
class TimelineEventRead(BaseModel):
    id: int
    application_id: int
    event_type: str
    from_state: Optional[str] = None
    to_state: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# ----------------- Application Schemas -----------------
class ApplicationBase(BaseModel):
    role_title: str = Field(..., min_length=1, max_length=100)
    job_url: Optional[str] = None
    location: Optional[str] = None
    work_mode: str
    status: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: str = "USD"
    applied_date: date = Field(default_factory=date.today)
    resume_version: Optional[str] = None
    referral_name: Optional[str] = None
    referral_email: Optional[str] = None
    job_description: Optional[str] = None
    notes: Optional[str] = None
    is_favorite: bool = False

    @field_validator("work_mode")
    @classmethod
    def validate_work_mode(cls, v: str) -> str:
        valid = settings.valid_work_modes
        if v not in valid:
            raise ValueError(f"Invalid work_mode '{v}'. Must be one of: {valid}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid = settings.valid_application_statuses
        if v not in valid:
            raise ValueError(f"Invalid status '{v}'. Must be one of: {valid}")
        return v

class ApplicationCreate(ApplicationBase):
    company_name: str = Field(..., min_length=1, max_length=100)
    company_website: Optional[str] = None
    tag_names: List[str] = Field(default_factory=list)

class ApplicationUpdate(BaseModel):
    role_title: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    status: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = None
    applied_date: Optional[date] = None
    resume_version: Optional[str] = None
    referral_name: Optional[str] = None
    referral_email: Optional[str] = None
    job_description: Optional[str] = None
    notes: Optional[str] = None
    is_favorite: Optional[bool] = None
    company_name: Optional[str] = None
    tag_names: Optional[List[str]] = None

    @field_validator("work_mode")
    @classmethod
    def validate_work_mode(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in settings.valid_work_modes:
            raise ValueError(f"Invalid work_mode '{v}'. Must be one of: {settings.valid_work_modes}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in settings.valid_application_statuses:
            raise ValueError(f"Invalid status '{v}'. Must be one of: {settings.valid_application_statuses}")
        return v

class ApplicationStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid = settings.valid_application_statuses
        if v not in valid:
            raise ValueError(f"Invalid status '{v}'. Must be one of: {valid}")
        return v

class ApplicationRead(ApplicationBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    company: CompanyRead
    tags: List[TagRead] = []
    interviews: List[InterviewRoundRead] = []
    class Config:
        from_attributes = True

class ApplicationDetailRead(ApplicationRead):
    timeline_events: List[TimelineEventRead] = []

# ----------------- Analytics & KPI Schemas -----------------
class KPISummary(BaseModel):
    total_applications: int
    active_in_pipeline: int
    offers_received: int
    rejections: int
    ghosted_count: int
    response_rate_pct: float
    interview_conversion_pct: float
    avg_first_response_days: Optional[float] = None

class FunnelStageMetric(BaseModel):
    stage_key: str
    stage_label: str
    count: int
    conversion_from_previous_pct: float

class StatusBreakdownItem(BaseModel):
    status_key: str
    label: str
    color: str
    count: int

class WorkModeBreakdownItem(BaseModel):
    work_mode_key: str
    label: str
    count: int

class WeeklyVelocityItem(BaseModel):
    week_label: str
    count: int
