from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np

from app.core.database import get_db
from app.models import Employee, Prediction, Department, Dataset

router = APIRouter()

@router.get("/analytics")
def get_analytics_data(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    if not employees:
        return {
            "has_data": False,
            "message": "No data available."
        }

    predictions = db.query(Prediction).all()
    pred_map = {p.employee_id: p for p in predictions}
    departments = db.query(Department).all()
    latest_dataset = db.query(Dataset).order_by(Dataset.id.desc()).first()

    has_dates = bool(latest_dataset and latest_dataset.has_dates)
    trends = []

    if has_dates:
        # If genuine dates exist in dataset, aggregate by actual date
        df_records = []
        for e in employees:
            if e.record_date:
                df_records.append({
                    "date": e.record_date,
                    "department": e.department,
                    "productivity": e.productivity_score
                })
        if df_records:
            df_temporal = pd.DataFrame(df_records)
            grouped_date = df_temporal.groupby(["date", "department"])["productivity"].mean().unstack().fillna(0)
            overall = df_temporal.groupby("date")["productivity"].mean()
            for date_val, row in grouped_date.iterrows():
                t_row = {"month": str(date_val), "Overall": round(float(overall.get(date_val, 0.0)), 1)}
                for col in grouped_date.columns:
                    t_row[str(col)] = round(float(row[col]), 1)
                trends.append(t_row)
        else:
            has_dates = False

    # Department Comparison Bar / Metrics (Data-driven)
    dept_comparisons = [
        {
            "department": d.name,
            "employee_count": d.employee_count,
            "avg_productivity": d.avg_productivity,
            "predicted_productivity": d.predicted_productivity,
            "high_performers": d.high_performers_count,
            "at_risk": d.at_risk_count,
            "avg_workload": d.avg_workload,
            "avg_attendance": d.avg_attendance,
            "avg_engagement": d.avg_engagement
        }
        for d in departments
    ]

    # Scatter Plots (Real employee observations)
    sample_emps = employees[:150]
    workload_scatter = []
    attendance_scatter = []
    experience_scatter = []

    for e in sample_emps:
        p = pred_map.get(e.employee_id)
        pt = {
            "id": e.employee_id,
            "name": e.employee_name,
            "department": e.department,
            "predicted": p.predicted_productivity if p else e.productivity_score,
            "status": p.status if p else "Medium",
            "risk_level": p.risk_level if p else "Low",
            "risk_score": p.risk_score if p else 20.0
        }
        workload_scatter.append({**pt, "x": e.workload, "y": e.productivity_score})
        attendance_scatter.append({**pt, "x": e.attendance, "y": e.productivity_score})
        experience_scatter.append({**pt, "x": e.experience, "y": e.productivity_score})

    # Quantitative Risk Distribution (Decoupled from Performance Status)
    high_risk_cnt = sum(1 for p in predictions if p.risk_level == "High" or p.risk_score >= 70.0)
    med_risk_cnt = sum(1 for p in predictions if p.risk_level == "Moderate" or (30.0 <= p.risk_score < 70.0))
    low_risk_cnt = sum(1 for p in predictions if p.risk_level == "Low" or p.risk_score < 30.0)

    risk_distribution = [
        {"name": "Low Risk (< 30)", "count": low_risk_cnt, "color": "#10B981"},
        {"name": "Moderate Risk (30-69)", "count": med_risk_cnt, "color": "#3B82F6"},
        {"name": "High Risk (>= 70)", "count": high_risk_cnt, "color": "#EF4444"}
    ]

    # Authentic Data-driven Heatmap: Department × Experience Cohort
    cohorts = [
        ("Entry (0-2 yrs)", lambda exp: exp < 3.0),
        ("Associate (3-5 yrs)", lambda exp: 3.0 <= exp < 6.0),
        ("Senior (6-9 yrs)", lambda exp: 6.0 <= exp < 10.0),
        ("Lead (10+ yrs)", lambda exp: exp >= 10.0)
    ]
    heatmap = []
    for d in departments:
        dept_emps = [e for e in employees if e.department == d.name]
        for cohort_label, filter_fn in cohorts:
            cohort_emps = [e for e in dept_emps if filter_fn(e.experience)]
            if cohort_emps:
                val = round(sum(e.productivity_score for e in cohort_emps) / len(cohort_emps), 1)
            else:
                val = d.avg_productivity
            heatmap.append({
                "department": d.name,
                "cohort": cohort_label,
                "month": cohort_label,  # for backwards compatibility with UI heatmap renderer
                "value": val
            })

    return {
        "has_data": True,
        "has_temporal_data": has_dates,
        "temporal_message": (
            "" if has_dates else "Historical longitudinal observations are not available in the uploaded dataset. Displaying cross-sectional workforce metrics."
        ),
        "productivity_trends": trends,
        "department_comparisons": dept_comparisons,
        "workload_vs_productivity": workload_scatter,
        "attendance_vs_productivity": attendance_scatter,
        "experience_vs_productivity": experience_scatter,
        "risk_distribution": risk_distribution,
        "heatmap": heatmap
    }
