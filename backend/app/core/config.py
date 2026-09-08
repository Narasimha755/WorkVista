import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
MODELS_DIR = DATA_DIR / "models"
REPORTS_DIR = DATA_DIR / "reports"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "WorkVista"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'workvista.db'}")
    
    # Prediction Thresholds (configurable via UI)
    DEFAULT_HIGH_PERF_THRESHOLD: float = 80.0
    DEFAULT_MEDIUM_PERF_THRESHOLD: float = 50.0
    DEFAULT_RISK_THRESHOLD: float = 50.0
    
    # Model defaults
    DEFAULT_MODEL_TYPE: str = "RandomForest"
    DEFAULT_TEST_SIZE: float = 0.2
    RANDOM_STATE: int = 42

settings = Settings()
