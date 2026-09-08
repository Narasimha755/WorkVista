import json
import time
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.models import Employee, Prediction, Department, ModelRecord, AuditLog
from app.schemas import PredictionRunRequest, PredictionRunResponse
from app.ml.pipeline import ml_pipeline

router = APIRouter()

@router.post("/predict", response_model=PredictionRunResponse)
def run_prediction(req: PredictionRunRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    
    # Fetch employees
    query = db.query(Employee)
    if req.department_filter and req.department_filter != "All" and req.department_filter != "All Departments":
        query = query.filter(Employee.department == req.department_filter)
    
    employees = query.all()
    if not employees:
        raise HTTPException(status_code=400, detail="No employee records found matching the specified scope.")

    # Convert to DataFrame
    records = [
        {
            "employee_id": e.employee_id,
            "employee_name": e.employee_name,
            "department": e.department,
            "role": e.role,
            "experience": e.experience,
            "attendance": e.attendance,
            "workload": e.workload,
            "working_hours": e.working_hours,
            "engagement": e.engagement,
            "skill_level": e.skill_level,
            "projects": e.projects,
            "tasks_completed": e.tasks_completed,
            "deadline_adherence": e.deadline_adherence,
            "previous_productivity": e.previous_productivity,
            "productivity_score": e.productivity_score,
            "performance_rating": e.performance_rating
        }
        for e in employees
    ]
    df = pd.DataFrame(records)

    # Train or update model if needed
    model_type = req.model_type or "RandomForest"
    train_results = ml_pipeline.train(
        df,
        target_col=req.target_column or "productivity_score",
        model_type=model_type,
        test_size=0.2
    )

    # Save or update ModelRecord
    db.query(ModelRecord).update({"is_active": False})
    model_rec = ModelRecord(
        model_name=model_type,
        model_type=model_type,
        task_type=train_results["task_type"],
        target_column=req.target_column or "productivity_score",
        r2_score=train_results["metrics"].get("r2_score"),
        mae=train_results["metrics"].get("mae"),
        rmse=train_results["metrics"].get("rmse"),
        mape=train_results["metrics"].get("mape"),
        accuracy=train_results["metrics"].get("accuracy"),
        precision_score=train_results["metrics"].get("precision_score"),
        recall_score=train_results["metrics"].get("recall_score"),
        f1_score=train_results["metrics"].get("f1_score"),
        dataset_size=len(df),
        features_count=train_results["features_count"],
        feature_names=json.dumps(ml_pipeline.feature_names),
        feature_importances=json.dumps(train_results["feature_importances"]),
        training_duration_sec=train_results["training_duration_sec"],
        model_path=train_results["model_path"],
        is_active=True
    )
    db.add(model_rec)
    db.commit()

    # Generate predictions
    predictions = ml_pipeline.predict_all(
        df,
        high_threshold=req.high_perf_threshold or 80.0,
        medium_threshold=req.medium_perf_threshold or 50.0,
        risk_threshold=req.risk_threshold or 50.0
    )

    # Update predictions in database
    for p in predictions:
        existing = db.query(Prediction).filter(Prediction.employee_id == p["employee_id"]).first()
        r_lvl = p.get("risk_level") or ("High" if p["risk_score"] >= 70 else ("Moderate" if p["risk_score"] >= 30 else "Low"))
        if existing:
            existing.current_productivity = p["current_productivity"]
            existing.predicted_productivity = p["predicted_productivity"]
            existing.change_pct = p["change_pct"]
            existing.status = p["status"]
            existing.risk_level = r_lvl
            existing.risk_score = p["risk_score"]
            existing.confidence_score = p["confidence_score"]
            existing.key_factors = json.dumps(p["key_factors"])
            existing.period = req.prediction_period or "Next Month"
            existing.model_name = model_type
        else:
            new_pred = Prediction(
                employee_id=p["employee_id"],
                current_productivity=p["current_productivity"],
                predicted_productivity=p["predicted_productivity"],
                change_pct=p["change_pct"],
                status=p["status"],
                risk_level=r_lvl,
                risk_score=p["risk_score"],
                confidence_score=p["confidence_score"],
                key_factors=json.dumps(p["key_factors"]),
                period=req.prediction_period or "Next Month",
                model_name=model_type
            )
            db.add(new_pred)
    db.commit()

    # Update department stats
    departments = db.query(Department).all()
    for d in departments:
        dept_emps = [e for e in employees if e.department == d.name]
        if dept_emps:
            d_ids = {e.employee_id for e in dept_emps}
            d_preds = [p for p in predictions if p["employee_id"] in d_ids]
            if d_preds:
                d.predicted_productivity = round(sum(p["predicted_productivity"] for p in d_preds) / len(d_preds), 1)
                d.high_performers_count = sum(1 for p in d_preds if p["status"] == "High")
                d.at_risk_count = sum(1 for p in d_preds if p.get("risk_level") == "High" or p["risk_score"] >= 70.0)
    db.commit()

    high_count = sum(1 for p in predictions if p["status"] == "High")
    risk_count = sum(1 for p in predictions if p.get("risk_level") == "High" or p["risk_score"] >= 70.0)
    avg_pred = round(sum(p["predicted_productivity"] for p in predictions) / len(predictions), 1)
    duration = round(time.time() - start_time, 2)

    # Log audit
    audit = AuditLog(
        action="PREDICTION_EXECUTED",
        details=f"Executed on-demand prediction using {model_type} for {len(predictions)} employees. Avg predicted: {avg_pred}%.",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return PredictionRunResponse(
        success=True,
        message=f"Prediction successfully executed across {len(predictions)} employee profiles.",
        records_processed=len(df),
        employees_analyzed=len(predictions),
        model_used=model_type,
        target_column=req.target_column or "productivity_score",
        avg_predicted_score=avg_pred,
        high_performers_count=high_count,
        at_risk_count=risk_count,
        execution_time_sec=duration,
        timestamp=datetime.utcnow()
    )

@router.get("/predictions")
def list_predictions(db: Session = Depends(get_db)):
    predictions = db.query(Prediction).all()
    high_count = sum(1 for p in predictions if p.status == "High")
    risk_count = sum(1 for p in predictions if p.risk_level == "High" or p.risk_score >= 70.0)
    med_count = sum(1 for p in predictions if p.status == "Medium")
    low_count = sum(1 for p in predictions if p.status == "Low")
    total = len(predictions)

    return {
        "total": total,
        "high_performers": high_count,
        "medium_performers": med_count,
        "low_performers": low_count,
        "at_risk": risk_count,
        "avg_predicted": round(sum(p.predicted_productivity for p in predictions) / max(1, total), 1),
        "items": [
            {
                "employee_id": p.employee_id,
                "current_productivity": p.current_productivity,
                "predicted_productivity": p.predicted_productivity,
                "change_pct": p.change_pct,
                "status": p.status,
                "risk_level": p.risk_level,
                "risk_score": p.risk_score,
                "confidence_score": p.confidence_score,
                "created_at": p.created_at
            }
            for p in predictions[:100]
        ]
    }
