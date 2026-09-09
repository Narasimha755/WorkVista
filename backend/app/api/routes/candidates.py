import json
import os
import re
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Candidate, JobRole, Employee, AuditLog, Note, Task
from app.schemas import (
    CandidateCreate,
    CandidateUpdate,
    CandidateStageUpdate,
    CandidateResponse,
    ConvertCandidateRequest,
    UniversalNoteCreate,
    UniversalTaskCreate
)
from app.services.candidate_matcher import calculate_candidate_match
from app.services.resume_parser import parse_resume_text

router = APIRouter()

@router.get("/candidates")
def list_candidates(
    status: Optional[str] = None,
    department: Optional[str] = None,
    role_id: Optional[int] = None,
    search: Optional[str] = None,
    min_match: Optional[float] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=2000),
    sort_by: Optional[str] = "match_score",
    sort_dir: Optional[str] = "desc",
    db: Session = Depends(get_db)
):
    if db.query(Candidate).count() == 0:
        from app.services.demo_generator import seed_recruitment_data
        seed_recruitment_data(db)

    query = db.query(Candidate)

    if status and status != "All":
        query = query.filter(Candidate.status == status)

    if department and department != "All" and department != "All Departments":
        query = query.filter(Candidate.department == department)

    if role_id:
        query = query.filter(Candidate.role_id == role_id)

    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            (Candidate.name.ilike(s)) |
            (Candidate.email.ilike(s)) |
            (Candidate.candidate_id.ilike(s)) |
            (Candidate.role_title.ilike(s))
        )

    if min_match:
        query = query.filter(Candidate.match_score >= min_match)

    total = query.count()

    # Sorting
    if hasattr(Candidate, sort_by or "match_score"):
        col = getattr(Candidate, sort_by or "match_score")
        query = query.order_by(col.desc() if sort_dir == "desc" else col.asc())
    else:
        query = query.order_by(Candidate.match_score.desc())

    candidates = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for c in candidates:
        skills_list = json.loads(c.skills) if c.skills else []
        breakdown = json.loads(c.match_breakdown) if c.match_breakdown else {}
        items.append({
            "id": c.id,
            "candidate_id": c.candidate_id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone or "",
            "location": c.location or "Remote",
            "role_id": c.role_id,
            "role_title": c.role_title,
            "department": c.department,
            "experience": c.experience,
            "skills": skills_list,
            "education": c.education,
            "expected_salary": c.expected_salary,
            "availability": c.availability,
            "notice_period": c.notice_period,
            "source": c.source,
            "resume_url": c.resume_url,
            "resume_text": c.resume_text,
            "portfolio_url": c.portfolio_url or "",
            "linkedin_url": c.linkedin_url or "",
            "status": c.status,
            "match_score": c.match_score,
            "match_breakdown": breakdown,
            "converted_employee_id": c.converted_employee_id,
            "created_at": c.created_at,
            "updated_at": c.updated_at
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1,
        "items": items
    }

@router.get("/candidates/{candidate_id}")
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    skills_list = json.loads(c.skills) if c.skills else []
    breakdown = json.loads(c.match_breakdown) if c.match_breakdown else {}

    # Get associated notes and tasks
    notes = db.query(Note).filter(Note.entity_type == "candidate", Note.entity_id == candidate_id).order_by(Note.id.desc()).all()
    tasks = db.query(Task).filter(Task.entity_type == "candidate", Task.entity_id == candidate_id).order_by(Task.id.desc()).all()

    return {
        "id": c.id,
        "candidate_id": c.candidate_id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone or "",
        "location": c.location or "Remote",
        "role_id": c.role_id,
        "role_title": c.role_title,
        "department": c.department,
        "experience": c.experience,
        "skills": skills_list,
        "education": c.education,
        "expected_salary": c.expected_salary,
        "availability": c.availability,
        "notice_period": c.notice_period,
        "source": c.source,
        "resume_url": c.resume_url,
        "resume_text": c.resume_text,
        "portfolio_url": c.portfolio_url or "",
        "linkedin_url": c.linkedin_url or "",
        "status": c.status,
        "match_score": c.match_score,
        "match_breakdown": breakdown,
        "converted_employee_id": c.converted_employee_id,
        "notes": [{"id": n.id, "content": n.content, "author": n.author, "created_at": n.created_at} for n in notes],
        "tasks": [{"id": t.id, "title": t.title, "task_type": t.task_type, "due_date": t.due_date, "priority": t.priority, "status": t.status} for t in tasks],
        "created_at": c.created_at,
        "updated_at": c.updated_at
    }

@router.post("/candidates")
def create_candidate(payload: CandidateCreate, db: Session = Depends(get_db)):
    # Generate unique candidate ID
    count = db.query(Candidate).count()
    candidate_id = f"CAN-{count + 101:04d}"

    # Calculate match score against target job role
    role = None
    if payload.role_id:
        role = db.query(JobRole).filter(JobRole.id == payload.role_id).first()

    req_skills = json.loads(role.required_skills) if (role and role.required_skills) else []
    pref_skills = json.loads(role.preferred_skills) if (role and role.preferred_skills) else []
    min_exp = role.min_experience if role else 1.0
    max_exp = role.max_experience if role else 10.0
    edu = role.education if role else "Bachelor's Degree"
    r_title = role.title if role else payload.role_title
    r_dept = role.department if role else payload.department
    r_loc = role.location if role else "Remote"

    match_result = calculate_candidate_match(
        candidate_skills=payload.skills or [],
        candidate_experience=payload.experience or 2.0,
        candidate_education=payload.education or "Bachelor's Degree",
        candidate_role=payload.role_title or "Software Engineer",
        candidate_dept=payload.department or "Engineering",
        candidate_location=payload.location or "Remote",
        role_required_skills=req_skills,
        role_preferred_skills=pref_skills,
        role_min_exp=min_exp,
        role_max_exp=max_exp,
        role_education=edu,
        role_title=r_title,
        role_dept=r_dept,
        role_location=r_loc
    )

    candidate = Candidate(
        candidate_id=candidate_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone or "",
        location=payload.location or "Remote",
        role_id=payload.role_id,
        role_title=r_title,
        department=r_dept,
        experience=payload.experience or 2.0,
        skills=json.dumps(payload.skills or []),
        education=payload.education or "Bachelor's Degree",
        expected_salary=payload.expected_salary or 90000.0,
        availability=payload.availability or "Immediate",
        notice_period=payload.notice_period or "30 days",
        source=payload.source or "Direct",
        resume_url=payload.resume_url,
        resume_text=payload.resume_text or "",
        portfolio_url=payload.portfolio_url or "",
        linkedin_url=payload.linkedin_url or "",
        status=payload.status or "New",
        match_score=match_result["overall_match_pct"],
        match_breakdown=json.dumps(match_result)
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # Add audit log
    audit = AuditLog(
        action="CANDIDATE_CREATED",
        details=f"Created candidate {candidate.name} ({candidate.candidate_id}) for {candidate.role_title} with AI match {candidate.match_score}%.",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "candidate_id": candidate.candidate_id,
        "match_score": candidate.match_score,
        "message": f"Candidate {candidate.name} added successfully."
    }

@router.patch("/candidates/{candidate_id}/stage")
def update_candidate_stage(candidate_id: str, payload: CandidateStageUpdate, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    old_status = c.status
    c.status = payload.status
    c.updated_at = datetime.utcnow()

    if payload.notes:
        note = Note(
            entity_type="candidate",
            entity_id=candidate_id,
            content=f"Stage transition ({old_status} -> {payload.status}): {payload.notes}",
            author="NARASIMHA"
        )
        db.add(note)

    audit = AuditLog(
        action="CANDIDATE_STAGE_CHANGED",
        details=f"Candidate {c.name} moved from {old_status} to {payload.status}.",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "candidate_id": candidate_id,
        "new_status": c.status,
        "message": f"Updated stage to {c.status}."
    }

@router.post("/candidates/{candidate_id}/convert-to-employee")
def convert_candidate_to_employee(candidate_id: str, payload: Optional[ConvertCandidateRequest] = None, db: Session = Depends(get_db)):
    """
    Transforms a hired candidate into a fully active Employee record in WorkVista.
    Preserves skills, role, and department, and creates a clear audit trail.
    """
    c = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    if c.converted_employee_id:
        return {
            "success": True,
            "employee_id": c.converted_employee_id,
            "message": f"Candidate already converted to employee {c.converted_employee_id}."
        }

    # Generate employee ID
    emp_count = db.query(Employee).count()
    new_emp_id = f"EMP-{emp_count + 1:04d}"

    assigned_dept = payload.assigned_department if (payload and payload.assigned_department) else c.department
    assigned_role = payload.assigned_role if (payload and payload.assigned_role) else c.role_title

    # Create new Employee
    new_employee = Employee(
        employee_id=new_emp_id,
        employee_name=c.name,
        department=assigned_dept,
        role=assigned_role,
        experience=float(c.experience or 2.0),
        attendance=96.0,
        workload=60.0,
        working_hours=40.0,
        engagement=85.0,
        skill_level=min(95.0, max(65.0, float(c.match_score or 75.0))),
        projects=1,
        tasks_completed=5,
        deadline_adherence=92.0,
        previous_productivity=76.0,
        productivity_score=78.0,
        performance_rating="High" if (c.match_score or 75) >= 85 else "Medium"
    )
    db.add(new_employee)

    # Mark candidate as Hired and link employee ID
    c.status = "Hired"
    c.converted_employee_id = new_emp_id
    c.updated_at = datetime.utcnow()

    # Log transfer note
    note = Note(
        entity_type="employee",
        entity_id=new_emp_id,
        content=f"Candidate {c.name} ({c.candidate_id}) successfully converted to active employee. Initial Match Score: {c.match_score}%.",
        author="NARASIMHA"
    )
    db.add(note)

    audit = AuditLog(
        action="CANDIDATE_HIRED_CONVERTED",
        details=f"Candidate {c.name} converted to Employee {new_emp_id} in {assigned_dept}.",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "employee_id": new_emp_id,
        "message": f"Candidate {c.name} successfully converted to Employee {new_emp_id}."
    }

@router.post("/candidates/upload-resume")
async def upload_candidate_resume(file: UploadFile = File(...)):
    """
    Parses resume files (PDF, DOCX, DOC, TXT) and returns structured candidate draft fields.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    content = await file.read()

    text = ""
    if ext in [".txt", ".md"]:
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin1", errors="ignore")
    elif ext in [".pdf", ".docx", ".doc"]:
        # Extract text strings from document bytes
        raw = content.decode("latin1", errors="ignore")
        # Extract readable chunks
        readable = re.findall(r'[a-zA-Z0-9.,@:\-\s\(\)\/]{4,}', raw)
        text = "\n".join(readable)
    else:
        raise HTTPException(status_code=400, detail="Supported formats: PDF, DOCX, DOC, TXT.")

    parsed = parse_resume_text(text, filename=file.filename)
    return {
        "success": True,
        "filename": file.filename,
        "parsed_data": parsed
    }

@router.delete("/candidates/{candidate_id}")
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    db.delete(c)
    audit = AuditLog(
        action="CANDIDATE_DELETED",
        details=f"Deleted candidate {c.name} ({candidate_id}).",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()
    return {"success": True, "message": f"Candidate {candidate_id} deleted."}

@router.get("/candidates/{candidate_id}/notes")
def get_candidate_notes(candidate_id: str, db: Session = Depends(get_db)):
    notes = db.query(Note).filter(Note.entity_type == "candidate", Note.entity_id == candidate_id).order_by(Note.id.desc()).all()
    return [{"id": n.id, "entity_id": n.entity_id, "content": n.content, "author": n.author, "created_at": n.created_at} for n in notes]

@router.post("/candidates/{candidate_id}/notes")
def add_candidate_note(candidate_id: str, payload: UniversalNoteCreate, db: Session = Depends(get_db)):
    note = Note(
        entity_type="candidate",
        entity_id=candidate_id,
        content=payload.content,
        author=payload.author or "NARASIMHA"
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "content": note.content, "author": note.author, "created_at": note.created_at}
