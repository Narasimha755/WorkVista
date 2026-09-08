import os
import shutil
import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd

from app.core.database import get_db
from app.core.config import UPLOADS_DIR
from app.services.pipeline_orchestrator import process_and_persist_dataset
from app.services.demo_generator import generate_demo_dataset

router = APIRouter()

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV or Excel (.xlsx, .xls) file.")

    temp_path = UPLOADS_DIR / file.filename
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Read into dataframe
        if file.filename.endswith('.csv'):
            try:
                df = pd.read_csv(temp_path, encoding='utf-8')
            except UnicodeDecodeError:
                df = pd.read_csv(temp_path, encoding='latin1')
        else:
            df = pd.read_excel(temp_path)

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
