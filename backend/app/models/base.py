import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    missing_values_pct = Column(Float, default=0.0)
    duplicate_rows = Column(Integer, default=0)
    numeric_features = Column(Integer, default=0)
    categorical_features = Column(Integer, default=0)
    quality_score = Column(Float, default=100.0)
    columns_json = Column(Text, default="[]")
    has_dates = Column(Boolean, default=False)
    date_column = Column(String(100), nullable=True)
    date_min = Column(String(50), nullable=True)
    date_max = Column(String(50), nullable=True)
    training_period_str = Column(String(100), default="Single period snapshot")
    is_active = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    @property
    def columns(self):
        return json.loads(self.columns_json) if self.columns_json else []

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(100), unique=True, index=True, nullable=False)
    employee_name = Column(String(200), nullable=False, index=True)
    department = Column(String(100), nullable=False, index=True)
    role = Column(String(100), default="Staff")
    experience = Column(Float, default=1.0)
    attendance = Column(Float, default=90.0)
    workload = Column(Float, default=70.0)
    working_hours = Column(Float, default=40.0)
    engagement = Column(Float, default=75.0)
    skill_level = Column(Float, default=70.0)
    projects = Column(Integer, default=3)
    tasks_completed = Column(Integer, default=25)
    deadline_adherence = Column(Float, default=85.0)
    previous_productivity = Column(Float, default=70.0)
    productivity_score = Column(Float, default=75.0)
    performance_rating = Column(String(50), default="Medium")
    record_date = Column(String(50), nullable=True)
    additional_features = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    prediction = relationship("Prediction", back_populates="employee", uselist=False, cascade="all, delete-orphan")
    notes = relationship("EmployeeNote", back_populates="employee", cascade="all, delete-orphan", order_by="desc(EmployeeNote.id)")
    tasks = relationship("EmployeeTask", back_populates="employee", cascade="all, delete-orphan", order_by="desc(EmployeeTask.id)")

class EmployeeNote(Base):
    __tablename__ = "employee_notes"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(100), ForeignKey("employees.employee_id", ondelete="CASCADE"), index=True, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), default="NARASIMHA")
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="notes")

class EmployeeTask(Base):
    __tablename__ = "employee_tasks"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(100), ForeignKey("employees.employee_id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    task_type = Column(String(100), default="Performance Review")
    due_date = Column(String(50), default="")
    status = Column(String(50), default="Pending") # Pending, In Progress, Completed
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="tasks")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(100), ForeignKey("employees.employee_id", ondelete="CASCADE"), unique=True, index=True)
    current_productivity = Column(Float, default=0.0)
    predicted_productivity = Column(Float, default=0.0)
    change_pct = Column(Float, default=0.0)
    status = Column(String(50), default="Medium", index=True)  # Performance status: High, Medium, Low
    risk_level = Column(String(50), default="Low", index=True) # Risk tier: High, Moderate, Low
    risk_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=90.0)
    key_factors = Column(Text, default="[]")  # JSON: list of factor attribution
    period = Column(String(50), default="Next Month")
    model_name = Column(String(100), default="Random Forest")
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="prediction")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    employee_count = Column(Integer, default=0)
    avg_productivity = Column(Float, default=0.0)
    predicted_productivity = Column(Float, default=0.0)
    high_performers_count = Column(Integer, default=0)
    at_risk_count = Column(Integer, default=0)
    avg_workload = Column(Float, default=0.0)
    avg_attendance = Column(Float, default=0.0)
    avg_engagement = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow)

class ModelRecord(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    model_type = Column(String(100), default="RandomForest")
    task_type = Column(String(50), default="regression")  # regression | classification
    target_column = Column(String(100), default="productivity_score")
    
    # Regression metrics
    r2_score = Column(Float, nullable=True)
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    mape = Column(Float, nullable=True)
    
    # Classification metrics
    accuracy = Column(Float, nullable=True)
    precision_score = Column(Float, nullable=True)
    recall_score = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)

    dataset_size = Column(Integer, default=0)
    features_count = Column(Integer, default=0)
    feature_names = Column(Text, default="[]")  # JSON
    feature_importances = Column(Text, default="[]")  # JSON list of {name, importance}
    training_duration_sec = Column(Float, default=0.0)
    training_period_str = Column(String(100), default="Single period snapshot")
    model_path = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), default="Executive Summary")
    summary = Column(Text, default="")
    kpis = Column(Text, default="{}")  # JSON
    key_findings = Column(Text, default="[]")  # JSON
    recommendations = Column(Text, default="[]")  # JSON
    format = Column(String(20), default="PDF")
    created_at = Column(DateTime, default=datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(255), default="")
    updated_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, default="")
    user = Column(String(100), default="NARASIMHA")
    created_at = Column(DateTime, default=datetime.utcnow)
