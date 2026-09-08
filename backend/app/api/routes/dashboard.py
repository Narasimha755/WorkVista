import json
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.models import Employee, Prediction, Department, ModelRecord, Dataset
from app.services.insights_service import generate_dynamic_insights
from app.services.recommendations_service import generate_recommendations

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    if not employees:
        return {
            "has_data": False,
            "message": "No employee dataset loaded. Please upload a dataset or load the demo data."
        }

    predictions = db.query(Prediction).all()
    pred_map = {p.employee_id: p for p in predictions}
    departments = db.query(Department).all()
    active_model = db.query(ModelRecord).filter(ModelRecord.is_active == True).order_by(ModelRecord.id.desc()).first()
    latest_dataset = db.query(Dataset).order_by(Dataset.id.desc()).first()

    total_emp = len(employees)
    high_count = sum(1 for e in employees if e.productivity_score >= 80.0)
    med_count = sum(1 for e in employees if 50.0 <= e.productivity_score < 80.0)
    low_count = sum(1 for e in employees if e.productivity_score < 50.0)

    # Risk level counts (decoupled from performance status)
    high_risk_count = sum(1 for p in predictions if p.risk_level == "High" or p.risk_score >= 70.0)
    moderate_risk_count = sum(1 for p in predictions if (p.risk_level == "Moderate" or (30.0 <= p.risk_score < 70.0)))
    low_risk_count = sum(1 for p in predictions if (p.risk_level == "Low" or p.risk_score < 30.0))

    avg_current_prod = round(sum(e.productivity_score for e in employees) / max(1, total_emp), 1)
    avg_prev_prod = round(sum(e.previous_productivity for e in employees) / max(1, total_emp), 1)
    avg_pred_prod = round(sum(p.predicted_productivity for p in predictions) / max(1, len(predictions)), 1) if predictions else avg_current_prod

    # Truthful KPIs based on real database records
    # Productivity delta vs baseline cycle
    prod_delta = round(avg_current_prod - avg_prev_prod, 1)
    prod_pct_change = round(((avg_current_prod - avg_prev_prod) / max(1.0, avg_prev_prod)) * 100.0, 1)

    # High performers delta vs previous cycle
    prev_high_count = sum(1 for e in employees if e.previous_productivity >= 80.0)
    high_delta = high_count - prev_high_count
    high_pct_change = round(((high_delta) / max(1, prev_high_count)) * 100.0, 1) if prev_high_count > 0 else 0.0

    kpis = {
        "total_employees": {
            "value": float(total_emp),
            "display_value": str(total_emp),
            "change_pct": 0.0,
            "trend": "neutral",
            "subtitle": "Active workforce records",
            "sparkline": []
        },
        "avg_productivity": {
            "value": avg_current_prod,
            "display_value": f"{int(round(avg_current_prod))}%",
            "change_pct": prod_pct_change,
            "trend": "up" if prod_delta > 0 else ("down" if prod_delta < 0 else "neutral"),
            "subtitle": f"{'+' if prod_delta > 0 else ''}{prod_delta} pts vs baseline",
            "sparkline": []
        },
        "high_performers": {
            "value": float(high_count),
            "display_value": str(high_count),
            "change_pct": high_pct_change,
            "trend": "up" if high_delta > 0 else ("down" if high_delta < 0 else "neutral"),
            "subtitle": f"{'+' if high_delta > 0 else ''}{high_delta} vs baseline cycle",
            "sparkline": []
        },
        "at_risk": {
            "value": float(high_risk_count),
            "display_value": str(high_risk_count),
            "change_pct": round((high_risk_count / max(1, total_emp)) * 100.0, 1),
            "trend": "neutral" if high_risk_count > 0 else "up",
            "subtitle": f"{round((high_risk_count / max(1, total_emp)) * 100.0, 1)}% high risk tier",
            "sparkline": []
        }
    }

    # Data-driven Actual vs Predicted
    # Check if dataset has genuine dates or is cross-sectional
    has_dates = bool(latest_dataset and latest_dataset.has_dates)
    if has_dates:
        # Group by record_date if present
        actual_vs_predicted = []
        df_emp = pd.DataFrame([{"date": e.record_date, "actual": e.productivity_score, "predicted": pred_map[e.employee_id].predicted_productivity if e.employee_id in pred_map else e.productivity_score} for e in employees if e.record_date])
        if not df_emp.empty:
            grouped = df_emp.groupby("date").mean().reset_index()
            for _, r in grouped.iterrows():
                actual_vs_predicted.append({
                    "label": str(r["date"]),
                    "actual": round(float(r["actual"]), 1),
                    "predicted": round(float(r["predicted"]), 1)
                })
        else:
            has_dates = False

    if not has_dates:
        # Honest cross-sectional department comparison
        actual_vs_predicted = [
            {
                "label": d.name,
                "actual": d.avg_productivity,
                "predicted": d.predicted_productivity
            }
            for d in departments
        ]

    # Productivity Distribution Donut (Honest categorization)
    high_pct = round((high_count / max(1, total_emp)) * 100.0, 1)
    med_pct = round((med_count / max(1, total_emp)) * 100.0, 1)
    low_pct = round((low_count / max(1, total_emp)) * 100.0, 1)

    productivity_distribution = [
        {
            "name": "High (>= 80%)",
            "count": high_count,
            "percentage": high_pct,
            "color": "#10B981"  # Emerald
        },
        {
            "name": "Medium (50-79%)",
            "count": med_count,
            "percentage": med_pct,
            "color": "#3B82F6"  # Blue
        },
        {
            "name": "Low (< 50%)",
            "count": low_count,
            "percentage": low_pct,
            "color": "#EF4444"  # Rose / Coral
        }
    ]

    # AI Prediction Engine Card (Truthful metrics and training period)
    is_regression = (active_model.task_type == "regression") if active_model else True
    r2_score_val = active_model.r2_score if active_model else None
    mae_val = active_model.mae if active_model else None
    rmse_val = active_model.rmse if active_model else None
    accuracy_val = active_model.accuracy if active_model and not is_regression else None
    feat_count = active_model.features_count if active_model else 12

    training_period = (
        latest_dataset.training_period_str
        if (latest_dataset and latest_dataset.training_period_str)
        else f"Single period snapshot ({total_emp} records)"
    )
    updated_str = (
        active_model.created_at.strftime("%d %b %Y, %I:%M %p")
        if (active_model and active_model.created_at)
        else datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    )

    prediction_engine = {
        "status": "Active",
        "model_name": active_model.model_name if active_model else "Random Forest",
        "model_type": active_model.model_type if active_model else "RandomForest",
        "task_type": "regression" if is_regression else "classification",
        "r2_score": r2_score_val,
        "mae": mae_val,
        "rmse": rmse_val,
        "model_accuracy": accuracy_val,
        "dataset_size": total_emp,
        "features_count": feat_count,
        "training_period": training_period,
        "last_updated": updated_str
    }

    # Department-wise Productivity
    dept_items = [
        {
            "department": d.name,
            "actual": d.avg_productivity,
            "predicted": d.predicted_productivity
        }
        for d in departments
    ]

    # Key Factors from model importances
    key_factors = []
    if active_model and active_model.feature_importances:
        try:
            key_factors = json.loads(active_model.feature_importances)[:5]
        except Exception:
            key_factors = []

    # Dynamic Insights & Recommendations
    emp_records = [
        {
            "employee_id": e.employee_id,
            "employee_name": e.employee_name,
            "department": e.department,
            "workload": e.workload,
            "attendance": e.attendance,
            "engagement": e.engagement,
            "skill_level": e.skill_level,
            "productivity_score": e.productivity_score
        }
        for e in employees
    ]
    df_emp_analysis = pd.DataFrame(emp_records)
    pred_dicts = [
        {
            "employee_id": p.employee_id,
            "current_productivity": p.current_productivity,
            "predicted_productivity": p.predicted_productivity,
            "change_pct": p.change_pct,
            "status": p.status,
            "risk_level": p.risk_level,
            "risk_score": p.risk_score
        }
        for p in predictions
    ]

    key_insights = generate_dynamic_insights(df_emp_analysis, pred_dicts)
    recommended_actions = generate_recommendations(df_emp_analysis, pred_dicts)

    # Recent 5 Employees for preview table
    recent_employees = []
    for e in employees[:5]:
        p = pred_map.get(e.employee_id)
        recent_employees.append({
            "id": e.id,
            "employee_id": e.employee_id,
            "employee_name": e.employee_name,
            "department": e.department,
            "current_productivity": e.productivity_score,
            "predicted_productivity": p.predicted_productivity if p else e.productivity_score,
            "change_pct": p.change_pct if p else 0.0,
            "status": p.status if p else "Medium",
            "risk_level": p.risk_level if p else "Low",
            "risk_score": p.risk_score if p else 20.0
        })

    return {
        "has_data": True,
        "has_temporal_data": has_dates,
        "temporal_message": (
            "" if has_dates else "Historical longitudinal observations are not available in the uploaded dataset. Displaying cross-sectional workforce metrics."
        ),
        "kpis": kpis,
        "actual_vs_predicted": actual_vs_predicted,
        "productivity_distribution": productivity_distribution,
        "distribution_total": total_emp,
        "prediction_engine": prediction_engine,
        "department_productivity": dept_items,
        "key_factors": key_factors,
        "key_insights": key_insights,
        "recommended_actions": recommended_actions,
        "recent_employees": recent_employees
    }
