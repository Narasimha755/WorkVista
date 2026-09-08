import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.models import ModelRecord, Employee, AuditLog
from app.schemas import RetrainRequest
from app.ml.pipeline import ml_pipeline

router = APIRouter()

@router.get("/model")
def get_model_performance(db: Session = Depends(get_db)):
    model = db.query(ModelRecord).filter(ModelRecord.is_active == True).order_by(ModelRecord.id.desc()).first()
    if not model:
        return {
            "has_model": False,
            "message": "No machine learning model trained yet."
        }

    feature_importances = json.loads(model.feature_importances) if model.feature_importances else []

    # Residuals & Actual vs Predicted scatter points
    employees = db.query(Employee).all()
    records = [
        {
            "employee_id": e.employee_id,
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

    actual_vs_predicted_scatter = []
    residuals = []
    if not df.empty and ml_pipeline.model is not None:
        try:
            preds = ml_pipeline.predict_all(df)
            for i, p in enumerate(preds[:60]):
                act = p["current_productivity"]
                prd = p["predicted_productivity"]
                actual_vs_predicted_scatter.append({
                    "actual": act,
                    "predicted": prd,
                    "employee_id": p["employee_id"]
                })
                residuals.append(round(act - prd, 1))
        except Exception:
            pass

    # Bucket residuals for histogram chart
    residual_buckets = {
        "<-8": 0, "-8 to -4": 0, "-4 to 0": 0, "0 to 4": 0, "4 to 8": 0, ">8": 0
    }
    for r in residuals:
        if r < -8:
            residual_buckets["<-8"] += 1
        elif -8 <= r < -4:
            residual_buckets["-8 to -4"] += 1
        elif -4 <= r < 0:
            residual_buckets["-4 to 0"] += 1
        elif 0 <= r < 4:
            residual_buckets["0 to 4"] += 1
        elif 4 <= r < 8:
            residual_buckets["4 to 8"] += 1
        else:
            residual_buckets[">8"] += 1

    residuals_histogram = [{"range": k, "count": v} for k, v in residual_buckets.items()]

    all_models = db.query(ModelRecord).order_by(ModelRecord.id.desc()).all()
    model_history = [
        {
            "id": m.id,
            "name": m.model_name,
            "type": m.model_type,
            "r2_score": m.r2_score,
            "mae": m.mae,
            "rmse": m.rmse,
            "dataset_size": m.dataset_size,
            "is_active": m.is_active,
            "created_at": m.created_at,
            "trained_by": "NARASIMHA"
        }
        for m in all_models
    ]

    return {
        "has_model": True,
        "model_name": model.model_name,
        "model_type": model.model_type,
        "task_type": model.task_type,
        "target_column": model.target_column,
        "dataset_size": model.dataset_size,
        "features_count": model.features_count,
        "training_duration_sec": model.training_duration_sec,
        "created_at": model.created_at,
        "r2_score": model.r2_score,
        "mae": model.mae,
        "rmse": model.rmse,
        "mape": model.mape,
        "accuracy": model.accuracy,
        "precision_score": model.precision_score,
        "recall_score": model.recall_score,
        "f1_score": model.f1_score,
        "feature_importances": feature_importances,
        "actual_vs_predicted_scatter": actual_vs_predicted_scatter,
        "residuals_distribution": residuals_histogram,
        "model_history": model_history
    }

@router.post("/model/retrain")
def retrain_model(req: RetrainRequest, db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    if not employees:
        raise HTTPException(status_code=400, detail="No employee dataset available to retrain.")

    records = [
        {
            "employee_id": e.employee_id,
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

    train_results = ml_pipeline.train(
        df,
        target_col=req.target_column,
        model_type=req.model_type,
        test_size=req.test_size
    )

    db.query(ModelRecord).update({"is_active": False})
    new_model = ModelRecord(
        model_name=req.model_type,
        model_type=req.model_type,
        task_type=train_results["task_type"],
        target_column=req.target_column,
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
    db.add(new_model)
    db.commit()

    audit = AuditLog(
        action="MODEL_RETRAINED",
        details=f"Retrained predictive model using {req.model_type} on {len(df)} records.",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully retrained model with {req.model_type}.",
        "metrics": train_results["metrics"]
    }
