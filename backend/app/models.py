import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, Date, ForeignKey, Table, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base

# Many-to-Many junction table: Application <-> Tag
application_tags = Table(
    "application_tags",
    Base.metadata,
    Column("application_id", Integer, ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    website = Column(String(255), nullable=True)
    domain = Column(String(100), unique=True, nullable=True, index=True)
    logo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    applications = relationship("Application", back_populates="company", cascade="all, delete-orphan")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    color_hex = Column(String(20), default="#6366f1", nullable=False)

    applications = relationship("Application", secondary=application_tags, back_populates="tags")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="RESTRICT"), nullable=False, index=True)
    role_title = Column(String(100), nullable=False, index=True)
    job_url = Column(String(500), nullable=True)
    location = Column(String(100), nullable=True)
    work_mode = Column(String(50), nullable=False)  # validated via config.yaml
    status = Column(String(50), nullable=False, index=True)  # validated via config.yaml
    
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    currency = Column(String(10), default="USD", nullable=False)
    
    applied_date = Column(Date, default=datetime.date.today, nullable=False, index=True)
    resume_version = Column(String(100), nullable=True)
    referral_name = Column(String(100), nullable=True)
    referral_email = Column(String(150), nullable=True)
    
    job_description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_favorite = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    company = relationship("Company", back_populates="applications")
    tags = relationship("Tag", secondary=application_tags, back_populates="applications")
    interviews = relationship("InterviewRound", back_populates="application", cascade="all, delete-orphan", order_by="InterviewRound.round_number")
    timeline_events = relationship("TimelineEvent", back_populates="application", cascade="all, delete-orphan", order_by="TimelineEvent.created_at")

class InterviewRound(Base):
    __tablename__ = "interview_rounds"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    round_number = Column(Integer, nullable=False)
    round_type = Column(String(50), nullable=False)  # validated via config.yaml
    scheduled_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=45, nullable=True)
    
    interviewer_name = Column(String(100), nullable=True)
    interviewer_email = Column(String(150), nullable=True)
    interviewer_linkedin = Column(String(255), nullable=True)
    
    outcome = Column(String(50), default="pending", nullable=False)  # validated via config.yaml
    preparation_notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    application = relationship("Application", back_populates="interviews")
    feedback = relationship("InterviewFeedback", back_populates="interview_round", uselist=False, cascade="all, delete-orphan")

class InterviewFeedback(Base):
    __tablename__ = "interview_feedback"

    id = Column(Integer, primary_key=True, index=True)
    interview_round_id = Column(Integer, ForeignKey("interview_rounds.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Structured STAR method fields
    star_situation = Column(Text, nullable=True)
    star_task = Column(Text, nullable=True)
    star_action = Column(Text, nullable=True)
    star_result = Column(Text, nullable=True)
    
    rating_score = Column(Integer, nullable=True)  # 1 to 5 scale
    personal_debrief = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    interview_round = relationship("InterviewRound", back_populates="feedback")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # validated via config.yaml
    from_state = Column(String(50), nullable=True)
    to_state = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)

    application = relationship("Application", back_populates="timeline_events")
