from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Department, Employee, Prediction

router = APIRouter()

@router.get("/departments")
def list_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    if not departments:
        return []

    return [
        {
            "id": d.id,
            "name": d.name,
            "employee_count": d.employee_count,
            "avg_productivity": d.avg_productivity,
            "predicted_productivity": d.predicted_productivity,
            "high_performers_count": d.high_performers_count,
            "at_risk_count": d.at_risk_count,
            "avg_workload": d.avg_workload,
            "avg_attendance": d.avg_attendance,
            "avg_engagement": d.avg_engagement,
            "productivity_gap": round(d.predicted_productivity - d.avg_productivity, 1)
        }
        for d in departments
    ]
