import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import JobRole, Candidate, AuditLog
from app.schemas import JobRoleCreate, JobRoleUpdate, JobRoleResponse

router = APIRouter()

@router.get("/roles")
def list_roles(status: Optional[str] = None, department: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(JobRole)
    if status and status != "All":
        query = query.filter(JobRole.status == status)
    if department and department != "All" and department != "All Departments":
        query = query.filter(JobRole.department == department)

    roles = query.order_by(JobRole.id.desc()).all()
    results = []
    for r in roles:
        cand_count = db.query(Candidate).filter(Candidate.role_id == r.id).count()
        req_skills = json.loads(r.required_skills) if r.required_skills else []
        pref_skills = json.loads(r.preferred_skills) if r.preferred_skills else []
        results.append({
            "id": r.id,
            "title": r.title,
            "department": r.department,
            "location": r.location,
            "required_skills": req_skills,
            "preferred_skills": pref_skills,
            "min_experience": r.min_experience,
            "max_experience": r.max_experience,
            "education": r.education,
            "min_salary": r.min_salary,
            "max_salary": r.max_salary,
            "employment_type": r.employment_type,
            "description": r.description,
            "status": r.status,
            "candidate_count": cand_count,
            "created_at": r.created_at
        })
    return results

@router.post("/roles")
def create_role(payload: JobRoleCreate, db: Session = Depends(get_db)):
    role = JobRole(
        title=payload.title,
        department=payload.department,
        location=payload.location or "Remote",
        required_skills=json.dumps(payload.required_skills or []),
        preferred_skills=json.dumps(payload.preferred_skills or []),
        min_experience=payload.min_experience or 1.0,
        max_experience=payload.max_experience or 10.0,
        education=payload.education or "Bachelor's Degree",
        min_salary=payload.min_salary or 60000.0,
        max_salary=payload.max_salary or 120000.0,
        employment_type=payload.employment_type or "Full-Time",
        description=payload.description or "",
        status=payload.status or "Active"
    )
    db.add(role)
    db.commit()
    db.refresh(role)

    audit = AuditLog(
        action="JOB_ROLE_CREATED",
        details=f"Created job role '{role.title}' in {role.department}.",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "id": role.id,
        "title": role.title,
        "message": f"Job role '{role.title}' created successfully."
    }

@router.put("/roles/{role_id}")
def update_role(role_id: int, payload: JobRoleUpdate, db: Session = Depends(get_db)):
    role = db.query(JobRole).filter(JobRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")

    if payload.title is not None: role.title = payload.title
    if payload.department is not None: role.department = payload.department
    if payload.location is not None: role.location = payload.location
    if payload.required_skills is not None: role.required_skills = json.dumps(payload.required_skills)
    if payload.preferred_skills is not None: role.preferred_skills = json.dumps(payload.preferred_skills)
    if payload.min_experience is not None: role.min_experience = payload.min_experience
    if payload.max_experience is not None: role.max_experience = payload.max_experience
    if payload.education is not None: role.education = payload.education
    if payload.min_salary is not None: role.min_salary = payload.min_salary
    if payload.max_salary is not None: role.max_salary = payload.max_salary
    if payload.employment_type is not None: role.employment_type = payload.employment_type
    if payload.description is not None: role.description = payload.description
    if payload.status is not None: role.status = payload.status

    db.commit()

    audit = AuditLog(
        action="JOB_ROLE_UPDATED",
        details=f"Updated job role '{role.title}' (#{role_id}).",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": f"Role '{role.title}' updated."}

@router.delete("/roles/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(JobRole).filter(JobRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")

    db.delete(role)
    audit = AuditLog(
        action="JOB_ROLE_DELETED",
        details=f"Deleted job role '{role.title}' (#{role_id}).",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()
    return {"success": True, "message": f"Role #{role_id} deleted."}
