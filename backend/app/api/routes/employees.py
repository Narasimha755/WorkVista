import io
import csv
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.core.database import get_db
from app.models import Employee, Prediction, EmployeeNote, EmployeeTask, AuditLog
from app.schemas import (
    EmployeeNoteCreate,
    EmployeeNoteResponse,
    EmployeeTaskCreate,
    EmployeeTaskUpdate,
    EmployeeTaskResponse,
)
from app.services.pdf_generator import generate_employee_profile_pdf

router = APIRouter()

@router.get("/employees")
def list_employees(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = "id",
    sort_dir: str = "asc",
    db: Session = Depends(get_db)
):
    query = db.query(Employee).outerjoin(Prediction, Employee.employee_id == Prediction.employee_id)

    # Search filter
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Employee.employee_name.ilike(search_pattern),
                Employee.employee_id.ilike(search_pattern),
                Employee.role.ilike(search_pattern),
                Employee.department.ilike(search_pattern)
            )
        )

    # Department filter
    if department and department != "All Departments" and department != "All":
        query = query.filter(Employee.department == department)

    # Performance Status filter
    if status and status != "All":
        query = query.filter(Prediction.status == status)

    # Risk level filter
    if risk_level and risk_level != "All":
        query = query.filter(Prediction.risk_level == risk_level)

    total = query.count()

    # Sorting
    sort_col = getattr(Employee, sort_by, Employee.id)
    if sort_dir.lower() == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))

    # Pagination
    offset = (page - 1) * page_size
    employees = query.offset(offset).limit(page_size).all()

    items = []
    for emp in employees:
        pred = emp.prediction
        items.append({
            "id": emp.id,
            "employee_id": emp.employee_id,
            "employee_name": emp.employee_name,
            "department": emp.department,
            "role": emp.role,
            "experience": emp.experience,
            "attendance": emp.attendance,
            "workload": emp.workload,
            "working_hours": emp.working_hours,
            "engagement": emp.engagement,
            "skill_level": emp.skill_level,
            "projects": emp.projects,
            "tasks_completed": emp.tasks_completed,
            "deadline_adherence": emp.deadline_adherence,
            "previous_productivity": emp.previous_productivity,
            "productivity_score": emp.productivity_score,
            "performance_rating": emp.performance_rating,
            "prediction": {
                "predicted_productivity": pred.predicted_productivity if pred else emp.productivity_score,
                "change_pct": pred.change_pct if pred else 0.0,
                "status": pred.status if pred else "Medium",
                "risk_level": pred.risk_level if pred else "Low",
                "risk_score": pred.risk_score if pred else 20.0,
                "confidence_score": pred.confidence_score if pred else 90.0
            } if pred else None,
            "created_at": emp.created_at
        })

    total_pages = max(1, (total + page_size - 1) // page_size)

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }

@router.get("/employees/{employee_id}")
def get_employee_detail(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found.")

    pred = emp.prediction
    key_factors = json.loads(pred.key_factors) if pred and pred.key_factors else []

    # Real baseline vs current vs predicted progression (Zero fake months)
    historical = [
        {"period": "Baseline Cycle", "value": emp.previous_productivity, "label": "Baseline Output"},
        {"period": "Current Cycle", "value": emp.productivity_score, "label": "Current Output"},
        {"period": "Forecasted Cycle", "value": pred.predicted_productivity if pred else emp.productivity_score, "label": "AI Predicted"}
    ]

    # Dynamic honest explanation
    change_pct = pred.change_pct if pred else 0.0
    predicted_val = pred.predicted_productivity if pred else emp.productivity_score
    top_factor_desc = key_factors[0]["factor"] if key_factors else "operational adherence"

    if change_pct > 0:
        explanation = f"Employee {emp.employee_name} is projected to achieve {predicted_val}% productivity (+{change_pct}%), supported by strong {top_factor_desc.lower()} and favorable engagement metrics."
    elif change_pct < -2.0:
        explanation = f"Employee {emp.employee_name} exhibits a risk of decline to {predicted_val}% ({change_pct}%), primarily influenced by {top_factor_desc.lower()}. Proactive workload adjustments recommended."
    else:
        explanation = f"Employee {emp.employee_name} maintains steady output at {predicted_val}%, reflecting balanced operational cadence."

    # Load real notes & tasks
    notes = [
        {
            "id": n.id,
            "employee_id": n.employee_id,
            "content": n.content,
            "author": n.author,
            "created_at": n.created_at
        }
        for n in emp.notes
    ]
    tasks = [
        {
            "id": t.id,
            "employee_id": t.employee_id,
            "title": t.title,
            "task_type": t.task_type,
            "due_date": t.due_date,
            "status": t.status,
            "created_at": t.created_at
        }
        for t in emp.tasks
    ]

    return {
        "id": emp.id,
        "employee_id": emp.employee_id,
        "employee_name": emp.employee_name,
        "department": emp.department,
        "role": emp.role,
        "experience": emp.experience,
        "attendance": emp.attendance,
        "workload": emp.workload,
        "working_hours": emp.working_hours,
        "engagement": emp.engagement,
        "skill_level": emp.skill_level,
        "projects": emp.projects,
        "tasks_completed": emp.tasks_completed,
        "deadline_adherence": emp.deadline_adherence,
        "previous_productivity": emp.previous_productivity,
        "productivity_score": emp.productivity_score,
        "performance_rating": emp.performance_rating,
        "predicted_productivity": predicted_val,
        "prediction_change_pct": change_pct,
        "status": pred.status if pred else "Medium",
        "risk_level": pred.risk_level if pred else "Low",
        "risk_score": pred.risk_score if pred else 20.0,
        "prediction_confidence": pred.confidence_score if pred else 91.0,
        "key_factors": key_factors,
        "historical_productivity": historical,
        "has_historical": False,
        "ai_explanation": explanation,
        "notes": notes,
        "tasks": tasks,
        "created_at": emp.created_at
    }

# ==================== NOTES ENDPOINTS ====================

@router.get("/employees/{employee_id}/notes")
def get_employee_notes(employee_id: str, db: Session = Depends(get_db)):
    notes = db.query(EmployeeNote).filter(EmployeeNote.employee_id == employee_id).order_by(EmployeeNote.id.desc()).all()
    return [
        {
            "id": n.id,
            "employee_id": n.employee_id,
            "content": n.content,
            "author": n.author,
            "created_at": n.created_at
        }
        for n in notes
    ]

@router.post("/employees/{employee_id}/notes")
def add_employee_note(employee_id: str, payload: EmployeeNoteCreate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found.")

    note = EmployeeNote(
        employee_id=employee_id,
        content=payload.content.strip(),
        author=payload.author or "NARASIMHA"
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    audit = AuditLog(
        action="NOTE_ADDED",
        details=f"HR Note added for employee {employee_id} ({emp.employee_name}).",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {
        "id": note.id,
        "employee_id": note.employee_id,
        "content": note.content,
        "author": note.author,
        "created_at": note.created_at
    }

# ==================== TASKS ENDPOINTS ====================

@router.get("/employees/{employee_id}/tasks")
def get_employee_tasks(employee_id: str, db: Session = Depends(get_db)):
    tasks = db.query(EmployeeTask).filter(EmployeeTask.employee_id == employee_id).order_by(EmployeeTask.id.desc()).all()
    return [
        {
            "id": t.id,
            "employee_id": t.employee_id,
            "title": t.title,
            "task_type": t.task_type,
            "due_date": t.due_date,
            "status": t.status,
            "created_at": t.created_at
        }
        for t in tasks
    ]

@router.post("/employees/{employee_id}/tasks")
def create_employee_task(employee_id: str, payload: EmployeeTaskCreate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found.")

    task = EmployeeTask(
        employee_id=employee_id,
        title=payload.title.strip(),
        task_type=payload.task_type or "Performance Review",
        due_date=payload.due_date or "",
        status="Pending"
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    audit = AuditLog(
        action="TASK_CREATED",
        details=f"Review task '{task.title}' created for employee {employee_id} ({emp.employee_name}).",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {
        "id": task.id,
        "employee_id": task.employee_id,
        "title": task.title,
        "task_type": task.task_type,
        "due_date": task.due_date,
        "status": task.status,
        "created_at": task.created_at
    }

@router.patch("/employees/{employee_id}/tasks/{task_id}")
def update_employee_task(employee_id: str, task_id: int, payload: EmployeeTaskUpdate, db: Session = Depends(get_db)):
    task = db.query(EmployeeTask).filter(EmployeeTask.id == task_id, EmployeeTask.employee_id == employee_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if payload.status is not None:
        task.status = payload.status
    if payload.title is not None:
        task.title = payload.title
    if payload.due_date is not None:
        task.due_date = payload.due_date

    db.commit()
    db.refresh(task)
    return {
        "id": task.id,
        "employee_id": task.employee_id,
        "title": task.title,
        "task_type": task.task_type,
        "due_date": task.due_date,
        "status": task.status,
        "created_at": task.created_at
    }

# ==================== EXPORT ENDPOINTS (PDF, CSV, JSON) ====================

@router.get("/employees/{employee_id}/export/{export_format}")
def export_employee_profile(employee_id: str, export_format: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found.")

    pred = emp.prediction
    notes = [
        {"author": n.author, "content": n.content, "created_at": str(n.created_at)}
        for n in emp.notes
    ]
    tasks = [
        {"title": t.title, "task_type": t.task_type, "status": t.status, "due_date": t.due_date}
        for t in emp.tasks
    ]

    emp_dict = {
        "id": emp.id,
        "employee_id": emp.employee_id,
        "employee_name": emp.employee_name,
        "department": emp.department,
        "role": emp.role,
        "experience": emp.experience,
        "attendance": emp.attendance,
        "workload": emp.workload,
        "working_hours": emp.working_hours,
        "engagement": emp.engagement,
        "skill_level": emp.skill_level,
        "projects": emp.projects,
        "tasks_completed": emp.tasks_completed,
        "deadline_adherence": emp.deadline_adherence,
        "previous_productivity": emp.previous_productivity,
        "productivity_score": emp.productivity_score,
        "performance_rating": emp.performance_rating
    }
    pred_dict = {
        "predicted_productivity": pred.predicted_productivity if pred else emp.productivity_score,
        "change_pct": pred.change_pct if pred else 0.0,
        "status": pred.status if pred else "Medium",
        "risk_level": pred.risk_level if pred else "Low",
        "risk_score": pred.risk_score if pred else 20.0,
        "confidence_score": pred.confidence_score if pred else 90.0
    }

    fmt = export_format.lower()
    if fmt == "pdf":
        pdf_bytes = generate_employee_profile_pdf(
            employee_dict=emp_dict,
            prediction_dict=pred_dict,
            notes=notes,
            tasks=tasks,
            author="NARASIMHA"
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="employee_{emp.employee_id}_dossier.pdf"'
            }
        )
    elif fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Field", "Value"])
        for k, v in emp_dict.items():
            writer.writerow([k, v])
        for k, v in pred_dict.items():
            writer.writerow([f"prediction_{k}", v])
        csv_content = output.getvalue()
        output.close()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="employee_{emp.employee_id}_dossier.csv"'
            }
        )
    elif fmt == "json":
        data = {
            "employee": emp_dict,
            "prediction": pred_dict,
            "notes": notes,
            "tasks": tasks,
            "exported_at": str(db.query(Employee).first().created_at if db.query(Employee).first() else ""),
            "author": "NARASIMHA"
        }
        return JSONResponse(
            content=data,
            headers={
                "Content-Disposition": f'attachment; filename="employee_{emp.employee_id}_dossier.json"'
            }
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export format: {export_format}. Use 'pdf', 'csv', or 'json'.")
