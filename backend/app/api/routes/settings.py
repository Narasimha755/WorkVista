import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Setting, AuditLog, Notification, Dataset, Prediction
from app.schemas import SystemSettings

router = APIRouter()

DEFAULT_SETTINGS = {
    "high_perf_threshold": "80.0",
    "medium_perf_threshold": "50.0",
    "risk_threshold": "50.0",
    "default_model": "RandomForest",
    "test_split": "0.2",
    "random_seed": "42",
    "default_date_range": "Last 30 Days",
    "default_department": "All Departments",
    "data_retention_days": "365",
    "auto_retrain_enabled": "true"
}

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings_records = db.query(Setting).all()
    current = dict(DEFAULT_SETTINGS)
    for s in settings_records:
        current[s.key] = s.value

    return {
        "high_perf_threshold": float(current.get("high_perf_threshold", 80.0)),
        "medium_perf_threshold": float(current.get("medium_perf_threshold", 50.0)),
        "risk_threshold": float(current.get("risk_threshold", 50.0)),
        "default_model": current.get("default_model", "RandomForest"),
        "test_split": float(current.get("test_split", 0.2)),
        "random_seed": int(current.get("random_seed", 42)),
        "default_date_range": current.get("default_date_range", "Last 30 Days"),
        "default_department": current.get("default_department", "All Departments"),
        "data_retention_days": int(current.get("data_retention_days", 365)),
        "auto_retrain_enabled": current.get("auto_retrain_enabled", "true").lower() == "true"
    }

@router.put("/settings")
def update_settings(payload: SystemSettings, db: Session = Depends(get_db)):
    # 1. Enforce strict mathematical validation
    if not (0.0 <= payload.medium_perf_threshold < payload.high_perf_threshold <= 100.0):
        raise HTTPException(
            status_code=400,
            detail="Invalid performance thresholds: Medium threshold must be less than High threshold (0 <= Medium < High <= 100)."
        )

    if not (0.0 <= payload.risk_threshold <= 100.0):
        raise HTTPException(
            status_code=400,
            detail="Invalid risk threshold: Must satisfy 0 <= Risk <= 100."
        )

    if not (0.05 <= payload.test_split <= 0.50):
        raise HTTPException(
            status_code=400,
            detail="Invalid test split: Must be between 5% and 50% (0.05 to 0.50)."
        )

    data = payload.dict()
    for key, value in data.items():
        val_str = str(value)
        record = db.query(Setting).filter(Setting.key == key).first()
        if record:
            record.value = val_str
            record.updated_at = datetime.utcnow()
        else:
            new_record = Setting(key=key, value=val_str, description=f"Setting for {key}")
            db.add(new_record)
    db.commit()

    audit = AuditLog(
        action="SETTINGS_UPDATED",
        details=f"Settings updated: High Threshold={payload.high_perf_threshold}, Medium={payload.medium_perf_threshold}, Risk={payload.risk_threshold}.",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Settings validated and updated successfully."}

@router.get("/audit")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "details": l.details,
            "user": l.user,
            "created_at": l.created_at.strftime("%d %b %Y, %I:%M %p") if l.created_at else "Just now"
        }
        for l in logs
    ]

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    db_notifs = db.query(Notification).order_by(Notification.id.desc()).limit(20).all()
    if not db_notifs:
        high_risk_count = db.query(Prediction).filter(Prediction.risk_score >= 70.0).count()
        latest_dataset = db.query(Dataset).order_by(Dataset.id.desc()).first()

        seeded = []
        if latest_dataset:
            seeded.append(Notification(
                title="Dataset Calibrated",
                message=f"Dataset '{latest_dataset.original_name}' active with {latest_dataset.row_count} employee records.",
                category="success",
                is_read=False
            ))
        if high_risk_count > 0:
            seeded.append(Notification(
                title="High Risk Attention",
                message=f"{high_risk_count} employees detected in high risk tier. Review interventions recommended.",
                category="risk",
                is_read=False
            ))
        seeded.append(Notification(
            title="AI Model Active",
            message="Random Forest regression model calibrated with active workforce parameters.",
            category="info",
            is_read=False
        ))
        for n in seeded:
            db.add(n)
        db.commit()
        db_notifs = db.query(Notification).order_by(Notification.id.desc()).limit(20).all()

    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "category": n.category,
            "is_read": n.is_read,
            "timestamp": n.created_at.strftime("%d %b %Y, %I:%M %p")
        }
        for n in db_notifs
    ]

@router.post("/notifications/{id}/read")
def mark_notification_read(id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}

@router.post("/notifications/read-all")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    db.query(Notification).update({"is_read": True})
    db.commit()
    return {"success": True}

@router.get("/datasets")
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).order_by(Dataset.id.desc()).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "original_name": d.original_name,
            "row_count": d.row_count,
            "column_count": d.column_count,
            "quality_score": d.quality_score,
            "has_dates": d.has_dates,
            "training_period_str": d.training_period_str,
            "is_active": d.is_active,
            "uploaded_at": d.uploaded_at.strftime("%d %b %Y, %I:%M %p") if d.uploaded_at else ""
        }
        for d in datasets
    ]

@router.post("/datasets/{id}/activate")
def activate_dataset(id: int, db: Session = Depends(get_db)):
    db.query(Dataset).update({"is_active": False})
    target = db.query(Dataset).filter(Dataset.id == id).first()
    if target:
        target.is_active = True
        db.commit()
        audit = AuditLog(
            action="DATASET_ACTIVATED",
            details=f"Switched active dataset to '{target.original_name}' (ID {id}).",
            user="NARASIMHA"
        )
        db.add(audit)
        db.commit()
        return {"success": True, "message": f"Activated dataset '{target.original_name}'"}
    raise HTTPException(status_code=404, detail="Dataset not found")
