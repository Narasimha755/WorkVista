from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_schema():
    """
    Safely migrates columns for existing SQLite database without losing data.
    """
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    with engine.connect() as conn:
        # Check employees
        if "employees" in table_names:
            emp_cols = [c["name"] for c in inspector.get_columns("employees")]
            if "record_date" not in emp_cols:
                conn.execute(text("ALTER TABLE employees ADD COLUMN record_date VARCHAR(50)"))
                conn.commit()

        # Check predictions
        if "predictions" in table_names:
            pred_cols = [c["name"] for c in inspector.get_columns("predictions")]
            if "risk_level" not in pred_cols:
                conn.execute(text("ALTER TABLE predictions ADD COLUMN risk_level VARCHAR(50) DEFAULT 'Low'"))
                conn.commit()

        # Check datasets
        if "datasets" in table_names:
            ds_cols = [c["name"] for c in inspector.get_columns("datasets")]
            if "has_dates" not in ds_cols:
                conn.execute(text("ALTER TABLE datasets ADD COLUMN has_dates BOOLEAN DEFAULT 0"))
                conn.commit()
            if "date_column" not in ds_cols:
                conn.execute(text("ALTER TABLE datasets ADD COLUMN date_column VARCHAR(100)"))
                conn.commit()
            if "date_min" not in ds_cols:
                conn.execute(text("ALTER TABLE datasets ADD COLUMN date_min VARCHAR(50)"))
                conn.commit()
            if "date_max" not in ds_cols:
                conn.execute(text("ALTER TABLE datasets ADD COLUMN date_max VARCHAR(50)"))
                conn.commit()
            if "training_period_str" not in ds_cols:
                conn.execute(text("ALTER TABLE datasets ADD COLUMN training_period_str VARCHAR(100) DEFAULT 'Single period snapshot'"))
                conn.commit()

        # Check models
        if "models" in table_names:
            m_cols = [c["name"] for c in inspector.get_columns("models")]
            if "training_period_str" not in m_cols:
                conn.execute(text("ALTER TABLE models ADD COLUMN training_period_str VARCHAR(100) DEFAULT 'Single period snapshot'"))
                conn.commit()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
