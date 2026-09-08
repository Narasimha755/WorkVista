from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.database import Base, engine, ensure_schema
from app.api.routes import (
    upload,
    dashboard,
    employees,
    predictions,
    analytics,
    departments,
    model,
    reports,
    settings as app_settings,
    export,
    copilot,
    scenario
)

Base.metadata.create_all(bind=engine)
ensure_schema()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="WorkVista — Workforce Productivity Prediction Platform API"
)

@app.on_event("startup")
def startup_event():
    from app.core.database import SessionLocal
    from app.models import Employee
    from app.core.config import UPLOADS_DIR
    from app.services.demo_generator import generate_demo_dataset
    from app.services.pipeline_orchestrator import process_and_persist_dataset

    db = SessionLocal()
    try:
        emp_count = db.query(Employee).count()
        if emp_count < 50:
            print("Auto-seeding demo dataset with 520 realistic employee profiles...")
            df_demo = generate_demo_dataset(num_records=520, seed=42)
            demo_filename = "workvista_enterprise_demo.csv"
            demo_path = UPLOADS_DIR / demo_filename
            df_demo.to_csv(demo_path, index=False)
            process_and_persist_dataset(
                df_raw=df_demo,
                filename=demo_filename,
                original_name="WorkVista Demo Dataset (520 Employees)",
                db=db
            )
            print("Database ready with 520 employees and active ML predictions.")
    except Exception as e:
        print(f"Startup initialization notice: {e}")
    finally:
        db.close()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router, prefix="/api", tags=["Upload & Demo"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(employees.router, prefix="/api", tags=["Employees"])
app.include_router(predictions.router, prefix="/api", tags=["Predictions"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(departments.router, prefix="/api", tags=["Departments"])
app.include_router(model.router, prefix="/api", tags=["Model Performance"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(app_settings.router, prefix="/api", tags=["Settings & Audit"])
app.include_router(export.router, prefix="/api", tags=["Export"])
app.include_router(copilot.router, prefix="/api", tags=["AI Copilot"])
app.include_router(scenario.router, prefix="/api", tags=["Scenario Planner"])

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION
    }

# Mount static frontend build so everything is accessible on one single URL
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        app.mount("/WorkVista/assets", StaticFiles(directory=assets_dir), name="workvista_assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("WorkVista/"):
            sub_path = full_path[len("WorkVista/"):]
            sub_file = os.path.join(frontend_dist, sub_path)
            if os.path.isfile(sub_file):
                return FileResponse(sub_file)
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred in the prediction platform. Please check dataset format or try retraining."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
