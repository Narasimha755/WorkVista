import io
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
import pandas as pd

from app.core.database import get_db
from app.models import Employee, Prediction

router = APIRouter()

def get_filtered_df(
    db: Session,
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None
) -> pd.DataFrame:
    query = db.query(Employee).outerjoin(Prediction, Employee.employee_id == Prediction.employee_id)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Employee.employee_name.ilike(search_pattern),
                Employee.employee_id.ilike(search_pattern),
                Employee.role.ilike(search_pattern)
            )
        )
    if department and department != "All Departments" and department != "All":
        query = query.filter(Employee.department == department)
    if status and status != "All":
        query = query.filter(Prediction.status == status)

    employees = query.all()
    records = []
    for e in employees:
        p = e.prediction
        records.append({
            "Employee ID": e.employee_id,
            "Employee Name": e.employee_name,
            "Department": e.department,
            "Role": e.role,
            "Experience (Yrs)": e.experience,
            "Attendance (%)": e.attendance,
            "Workload Score": e.workload,
            "Engagement (%)": e.engagement,
            "Current Productivity (%)": e.productivity_score,
            "Predicted Productivity (%)": p.predicted_productivity if p else e.productivity_score,
            "Change (%)": p.change_pct if p else 0.0,
            "Status": p.status if p else "Medium",
            "Risk Score": p.risk_score if p else 20.0,
            "Confidence (%)": p.confidence_score if p else 90.0
        })

    return pd.DataFrame(records)

@router.get("/export/csv")
def export_csv(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    df = get_filtered_df(db, search, department, status)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = Response(content=stream.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=workvista_employee_predictions.csv"
    return response

@router.get("/export/xlsx")
def export_xlsx(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    df = get_filtered_df(db, search, department, status)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Predictions')
    output.seek(0)

    headers = {"Content-Disposition": "attachment; filename=workvista_employee_predictions.xlsx"}
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )

@router.get("/export/json")
def export_json(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    df = get_filtered_df(db, search, department, status)
    return df.to_dict(orient="records")
