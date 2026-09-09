import os
import io
import shutil
import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.core.config import UPLOADS_DIR
from app.services.pipeline_orchestrator import process_and_persist_dataset
from app.services.demo_generator import generate_demo_dataset
from app.models import DatasetVersion, Dataset, AuditLog

router = APIRouter()

ALLOWED_EXTENSIONS = ('.csv', '.xlsx', '.xls', '.json', '.txt')

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename_lower = file.filename.lower()
    if not filename_lower.endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Please upload a CSV (.csv), Excel (.xlsx, .xls), JSON (.json), or Delimited Text (.txt) file."
        )

    temp_path = UPLOADS_DIR / file.filename
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Read into dataframe based on extension
        if filename_lower.endswith('.csv'):
            try:
                df = pd.read_csv(temp_path, encoding='utf-8')
            except UnicodeDecodeError:
                df = pd.read_csv(temp_path, encoding='latin1')
        elif filename_lower.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(temp_path)
        elif filename_lower.endswith('.json'):
            try:
                df = pd.read_json(temp_path)
            except Exception:
                # Handle list of records or dictionary JSON
                with open(temp_path, 'r', encoding='utf-8') as jf:
                    data = json.load(jf)
                if isinstance(data, dict):
                    # Check if there's an 'employees' or 'data' or 'records' key
                    for k in ['employees', 'data', 'records', 'items']:
                        if k in data and isinstance(data[k], list):
                            data = data[k]
                            break
                    if isinstance(data, dict):
                        data = [data]
                df = pd.DataFrame(data)
        elif filename_lower.endswith('.txt'):
            # Auto-detect separator (tab, comma, pipe)
            try:
                df = pd.read_csv(temp_path, sep=None, engine='python', encoding='utf-8')
            except Exception:
                df = pd.read_csv(temp_path, sep=r'\s+', engine='python', encoding='utf-8')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")

        if df.empty:
            raise HTTPException(status_code=400, detail="Uploaded file is empty. Please provide a file with employee records.")

        result = process_and_persist_dataset(
            df_raw=df,
            filename=file.filename,
            original_name=file.filename,
            db=db
        )
        return {
            "success": True,
            "message": f"Successfully processed {result['total_rows']} employee records.",
            "report": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data processing failed: {str(e)}")

@router.post("/demo")
def load_demo_dataset(db: Session = Depends(get_db)):
    try:
        df_demo = generate_demo_dataset(num_records=520, seed=42)
        demo_filename = "workvista_enterprise_demo.csv"
        demo_path = UPLOADS_DIR / demo_filename
        df_demo.to_csv(demo_path, index=False)

        result = process_and_persist_dataset(
            df_raw=df_demo,
            filename=demo_filename,
            original_name="WorkVista Demo Dataset (520 Employees)",
            db=db
        )
        return {
            "success": True,
            "message": "Realistic demo dataset generated and processed through ML pipeline.",
            "report": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate demo data: {str(e)}")

@router.get("/versions")
def get_dataset_versions(db: Session = Depends(get_db)):
    versions = db.query(DatasetVersion).order_by(DatasetVersion.id.desc()).all()
    return [
        {
            "id": v.id,
            "dataset_id": v.dataset_id,
            "version_tag": v.version_tag,
            "dataset_name": v.dataset_name,
            "record_count": v.record_count,
            "column_count": v.column_count,
            "quality_score": v.quality_score,
            "is_active": v.is_active,
            "created_at": v.created_at.isoformat() if v.created_at else None
        }
        for v in versions
    ]

@router.post("/versions/{version_id}/rollback")
def rollback_dataset_version(version_id: int, db: Session = Depends(get_db)):
    target_version = db.query(DatasetVersion).filter(DatasetVersion.id == version_id).first()
    if not target_version:
        raise HTTPException(status_code=404, detail="Dataset version not found.")

    db.query(DatasetVersion).update({"is_active": False})
    target_version.is_active = True

    # Also log audit entry
    audit = AuditLog(
        action="DATASET_VERSION_ROLLBACK",
        details=f"Rolled back active dataset to version {target_version.version_tag} ({target_version.dataset_name})",
        user="NARASIMHA"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully activated dataset {target_version.version_tag}",
        "version": {
            "id": target_version.id,
            "version_tag": target_version.version_tag,
            "dataset_name": target_version.dataset_name,
            "record_count": target_version.record_count,
            "is_active": True
        }
    }
