import csv
import io
import json
from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, crud

router = APIRouter(prefix="/data", tags=["Data Transfer"])

@router.get("/export/json")
def export_json(db: Session = Depends(get_db)):
    apps = crud.get_applications(db, limit=10000)
    data = []
    for app in apps:
        data.append({
            "company_name": app.company.name,
            "company_website": app.company.website,
            "role_title": app.role_title,
            "job_url": app.job_url,
            "location": app.location,
            "work_mode": app.work_mode,
            "status": app.status,
            "salary_min": app.salary_min,
            "salary_max": app.salary_max,
            "currency": app.currency,
            "applied_date": app.applied_date.isoformat(),
            "resume_version": app.resume_version,
            "referral_name": app.referral_name,
            "referral_email": app.referral_email,
            "job_description": app.job_description,
            "notes": app.notes,
            "tags": [t.name for t in app.tags],
            "interviews": [
                {
                    "round_number": r.round_number,
                    "round_type": r.round_type,
                    "scheduled_at": r.scheduled_at.isoformat() if r.scheduled_at else None,
                    "interviewer_name": r.interviewer_name,
                    "outcome": r.outcome,
                    "completed": r.completed
                }
                for r in app.interviews
            ]
        })
    content = json.dumps(data, indent=2)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=applications_backup_{date.today().isoformat()}.json"}
    )

@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    apps = crud.get_applications(db, limit=10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Company", "Role", "Status", "Work Mode", "Location", "Applied Date",
        "Salary Min", "Salary Max", "Currency", "Tags", "Notes", "Job URL"
    ])
    for app in apps:
        writer.writerow([
            app.id,
            app.company.name,
            app.role_title,
            app.status,
            app.work_mode,
            app.location or "",
            app.applied_date.isoformat(),
            app.salary_min or "",
            app.salary_max or "",
            app.currency,
            ", ".join(t.name for t in app.tags),
            app.notes or "",
            app.job_url or ""
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=applications_{date.today().isoformat()}.csv"}
    )

@router.post("/seed")
def seed_sample_data(db: Session = Depends(get_db)):
    """Populates realistic, normalized applications and timeline events for testing."""
    # Check if already populated
    existing_count = db.query(models.Application).count()
    if existing_count > 0:
        return {"message": f"Database already contains {existing_count} applications.", "seeded": 0}

    seed_items = [
        {
            "company_name": "Stripe",
            "company_website": "https://stripe.com",
            "role_title": "Senior Fullstack Engineer",
            "job_url": "https://stripe.com/jobs/123",
            "location": "San Francisco, CA",
            "work_mode": "remote",
            "status": "offer",
            "salary_min": 185000,
            "salary_max": 220000,
            "currency": "USD",
            "applied_date": date.today() - timedelta(days=28),
            "tag_names": ["FinTech", "Tier 1", "Dream Job"],
            "notes": "Passed technical bar. Received competitive offer package.",
            "interviews": [
                {"round_number": 1, "round_type": "recruiter_screen", "outcome": "passed", "completed": True},
                {"round_number": 2, "round_type": "technical_coding", "outcome": "passed", "completed": True},
                {"round_number": 3, "round_type": "system_design", "outcome": "passed", "completed": True},
                {"round_number": 4, "round_type": "executive_final", "outcome": "passed", "completed": True}
            ]
        },
        {
            "company_name": "Datadog",
            "company_website": "https://datadoghq.com",
            "role_title": "Backend Systems Engineer",
            "job_url": "https://datadog.com/jobs/456",
            "location": "New York, NY",
            "work_mode": "hybrid",
            "status": "final_round",
            "salary_min": 170000,
            "salary_max": 200000,
            "currency": "USD",
            "applied_date": date.today() - timedelta(days=21),
            "tag_names": ["Cloud", "Observability"],
            "notes": "Final behavioral and architecture discussion scheduled for this Thursday.",
            "interviews": [
                {"round_number": 1, "round_type": "recruiter_screen", "outcome": "passed", "completed": True},
                {"round_number": 2, "round_type": "technical_coding", "outcome": "passed", "completed": True}
            ]
        },
        {
            "company_name": "Figma",
            "company_website": "https://figma.com",
            "role_title": "Product Engineer - Canvas",
            "job_url": "https://figma.com/careers/789",
            "location": "San Francisco, CA",
            "work_mode": "remote",
            "status": "technical",
            "salary_min": 180000,
            "salary_max": 210000,
            "currency": "USD",
            "applied_date": date.today() - timedelta(days=14),
            "tag_names": ["Design Tools", "Frontend", "Tier 1"],
            "notes": "Take-home code review scheduled.",
            "interviews": [
                {"round_number": 1, "round_type": "recruiter_screen", "outcome": "passed", "completed": True}
            ]
        },
        {
            "company_name": "Shopify",
            "company_website": "https://shopify.com",
            "role_title": "Staff Software Engineer",
            "location": "Remote",
            "work_mode": "remote",
            "status": "screening",
            "salary_min": 190000,
            "salary_max": 230000,
            "currency": "USD",
            "applied_date": date.today() - timedelta(days=7),
            "tag_names": ["E-Commerce", "High Scale"],
            "notes": "Spoke with recruiter; scheduled technical screen next Tuesday.",
            "interviews": []
        },
        {
            "company_name": "Vercel",
            "company_website": "https://vercel.com",
            "role_title": "Next.js Framework Engineer",
            "location": "San Francisco, CA",
            "work_mode": "remote",
            "status": "applied",
            "salary_min": 175000,
            "salary_max": 205000,
            "currency": "USD",
            "applied_date": date.today() - timedelta(days=3),
            "tag_names": ["DevTools", "Frontend", "Dream Job"],
            "notes": "Applied via referral from employee.",
            "interviews": []
        },
        {
            "company_name": "Airbnb",
            "company_website": "https://airbnb.com",
            "role_title": "Software Engineer, Search",
            "location": "San Francisco, CA",
            "work_mode": "hybrid",
            "status": "rejected",
            "salary_min": 170000,
            "salary_max": 195000,
            "currency": "USD",
            "applied_date": date.today() - timedelta(days=35),
            "tag_names": ["Travel", "Search"],
            "notes": "Position filled internally.",
            "interviews": [
                {"round_number": 1, "round_type": "recruiter_screen", "outcome": "passed", "completed": True},
                {"round_number": 2, "round_type": "technical_coding", "outcome": "failed", "completed": True}
            ]
        },
        {
            "company_name": "Slack",
            "company_website": "https://slack.com",
            "role_title": "Backend Engineer - Messaging",
            "location": "San Francisco, CA",
            "work_mode": "remote",
            "status": "applied",
            "salary_min": 165000,
            "salary_max": 195000,
            "currency": "USD",
            "applied_date": date.today() - timedelta(days=20),
            "tag_names": ["Enterprise", "Chat"],
            "notes": "Applied 20 days ago with no response. Auto-flagged as ghosted.",
            "interviews": []
        }
    ]

    seeded_count = 0
    for item in seed_items:
        interviews_data = item.pop("interviews", [])
        app_in = schemas.ApplicationCreate(**item)
        app = crud.create_application(db, app_in)
        
        # If seed item was in a later stage, add timeline events to populate funnel accurately
        stages_order = ["applied", "screening", "technical", "final_round", "offer"]
        if item["status"] in stages_order:
            curr_idx = stages_order.index(item["status"])
            for s in stages_order[1:curr_idx+1]:
                event = models.TimelineEvent(
                    application_id=app.id,
                    event_type="status_change",
                    to_state=s,
                    description=f"Auto transition to {s}",
                    created_at=datetime.utcnow() - timedelta(days=(curr_idx - stages_order.index(s)) * 4)
                )
                db.add(event)

        for r in interviews_data:
            round_obj = models.InterviewRound(
                application_id=app.id,
                round_number=r["round_number"],
                round_type=r["round_type"],
                outcome=r["outcome"],
                completed=r["completed"]
            )
            db.add(round_obj)

        seeded_count += 1

    db.commit()
    return {"message": f"Successfully seeded {seeded_count} realistic applications.", "seeded": seeded_count}
