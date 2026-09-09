from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Interview, Candidate, AuditLog, Note
from app.schemas import InterviewCreate, InterviewUpdate, InterviewResponse

router = APIRouter()

@router.get("/interviews")
def list_interviews(
    candidate_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Interview)
    if candidate_id:
        query = query.filter(Interview.candidate_id == candidate_id)
    if status and status != "All":
        query = query.filter(Interview.status == status)

    interviews = query.order_by(Interview.id.desc()).all()
    return [
        {
            "id": i.id,
            "candidate_id": i.candidate_id,
            "candidate_name": i.candidate_name,
            "role_id": i.role_id,
            "role_title": i.role_title,
            "interviewer": i.interviewer,
            "scheduled_time": i.scheduled_time,
            "interview_type": i.interview_type,
            "status": i.status,
            "feedback": i.feedback or "",
            "rating": i.rating,
            "notes": i.notes or "",
            "created_at": i.created_at
        }
        for i in interviews
    ]

@router.post("/interviews")
def schedule_interview(payload: InterviewCreate, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.candidate_id == payload.candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    interview = Interview(
        candidate_id=payload.candidate_id,
        candidate_name=cand.name,
        role_id=payload.role_id or cand.role_id,
        role_title=payload.role_title or cand.role_title,
        interviewer=payload.interviewer or "NARASIMHA",
        scheduled_time=payload.scheduled_time,
        interview_type=payload.interview_type or "Technical",
        status="Scheduled",
        notes=payload.notes or ""
    )
    db.add(interview)

    # If candidate is New/Screening/Shortlisted, advance status to Interview
    if cand.status in ["New", "Screening", "Shortlisted"]:
        cand.status = "Interview"
        cand.updated_at = datetime.utcnow()

    # Add audit log
    audit = AuditLog(
        action="INTERVIEW_SCHEDULED",
        details=f"Scheduled {interview.interview_type} interview with {cand.name} on {interview.scheduled_time}.",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()
    db.refresh(interview)

    return {
        "success": True,
        "interview_id": interview.id,
        "message": f"Interview scheduled with {cand.name}."
    }

@router.patch("/interviews/{interview_id}")
def update_interview(interview_id: int, payload: InterviewUpdate, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")

    if payload.status is not None: interview.status = payload.status
    if payload.feedback is not None: interview.feedback = payload.feedback
    if payload.rating is not None: interview.rating = payload.rating
    if payload.notes is not None: interview.notes = payload.notes

    # Add feedback note to candidate record if provided
    if payload.feedback:
        note = Note(
            entity_type="candidate",
            entity_id=interview.candidate_id,
            content=f"Interview Feedback ({interview.interview_type}, Rating: {interview.rating}/5.0): {payload.feedback}",
            author="NARASIMHA"
        )
        db.add(note)

    audit = AuditLog(
        action="INTERVIEW_UPDATED",
        details=f"Updated interview #{interview_id} for {interview.candidate_name}: Status={interview.status}.",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": f"Interview #{interview_id} updated."}
