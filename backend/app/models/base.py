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

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="info")  # info, warning, success, risk
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    full_name = Column(String(200), default="NARASIMHA")
    role = Column(String(50), default="Super Admin")  # Super Admin, HR Director, HR Manager, Recruiter, Department Manager, Analyst, Viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class JobRole(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True, nullable=False)
    department = Column(String(100), index=True, nullable=False)
    location = Column(String(100), default="Remote")
    required_skills = Column(Text, default="[]")  # JSON list
    preferred_skills = Column(Text, default="[]")  # JSON list
    min_experience = Column(Float, default=1.0)
    max_experience = Column(Float, default=10.0)
    education = Column(String(100), default="Bachelor's Degree")
    min_salary = Column(Float, default=60000.0)
    max_salary = Column(Float, default=120000.0)
    employment_type = Column(String(50), default="Full-Time")
    description = Column(Text, default="")
    status = Column(String(50), default="Active")  # Active, Archived, Draft
    created_at = Column(DateTime, default=datetime.utcnow)

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200), index=True, nullable=False)
    email = Column(String(200), index=True, nullable=False)
    phone = Column(String(50), default="")
    location = Column(String(100), default="Remote")
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    role_title = Column(String(200), default="Software Engineer")
    department = Column(String(100), default="Engineering")
    experience = Column(Float, default=2.0)
    skills = Column(Text, default="[]")  # JSON list
    education = Column(String(100), default="Bachelor's Degree")
    expected_salary = Column(Float, default=90000.0)
    availability = Column(String(50), default="Immediate")
    notice_period = Column(String(50), default="30 days")
    source = Column(String(100), default="LinkedIn")
    resume_url = Column(String(255), nullable=True)
    resume_text = Column(Text, default="")
    portfolio_url = Column(String(255), default="")
    linkedin_url = Column(String(255), default="")
    status = Column(String(50), default="New", index=True)  # New, Screening, Shortlisted, Interview, Offer, Hired, Rejected, On Hold
    match_score = Column(Float, default=75.0)
    match_breakdown = Column(Text, default="{}")  # JSON
    converted_employee_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(100), ForeignKey("candidates.candidate_id", ondelete="CASCADE"), index=True, nullable=False)
    skill_name = Column(String(100), nullable=False)
    proficiency_level = Column(String(50), default="Intermediate")
    is_match = Column(Boolean, default=True)

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(100), ForeignKey("candidates.candidate_id", ondelete="CASCADE"), index=True, nullable=False)
    candidate_name = Column(String(200), nullable=False)
    role_id = Column(Integer, nullable=True)
    role_title = Column(String(200), default="")
    interviewer = Column(String(100), default="NARASIMHA")
    scheduled_time = Column(String(100), nullable=False)
    interview_type = Column(String(50), default="Technical")
    status = Column(String(50), default="Scheduled")  # Scheduled, Completed, Cancelled
    feedback = Column(Text, default="")
    rating = Column(Float, default=4.0)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), default="employee")  # employee, candidate, department, report
    entity_id = Column(String(100), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    task_type = Column(String(100), default="Performance Review")
    due_date = Column(String(50), default="")
    priority = Column(String(50), default="Medium")  # High, Medium, Low
    status = Column(String(50), default="Pending")  # Pending, In Progress, Completed
    assigned_to = Column(String(100), default="NARASIMHA")
    created_at = Column(DateTime, default=datetime.utcnow)

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), default="employee")  # employee, candidate, department, dataset, model
    entity_id = Column(String(100), index=True, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), default="NARASIMHA")
    created_at = Column(DateTime, default=datetime.utcnow)

class DatasetVersion(Base):
    __tablename__ = "dataset_versions"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, nullable=True)
    version_tag = Column(String(50), nullable=False)
    dataset_name = Column(String(255), nullable=False)
    record_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    quality_score = Column(Float, default=100.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, nullable=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    dataset_version = Column(String(50), default="v1.0")
    evaluation_date = Column(DateTime, default=datetime.utcnow)

class SavedFilter(Base):
    __tablename__ = "saved_filters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    filter_type = Column(String(50), default="global")
    filter_json = Column(Text, nullable=False)
    user = Column(String(100), default="NARASIMHA")
    created_at = Column(DateTime, default=datetime.utcnow)

class DashboardLayout(Base):
    __tablename__ = "dashboard_layouts"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String(100), default="NARASIMHA", index=True)
    layout_json = Column(Text, default="{}")
    updated_at = Column(DateTime, default=datetime.utcnow)

class EmployeeMetric(Base):
    __tablename__ = "employee_metrics"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(100), ForeignKey("employees.employee_id", ondelete="CASCADE"), index=True, nullable=False)
    period = Column(String(50), nullable=False)
    productivity_score = Column(Float, default=75.0)
    workload = Column(Float, default=70.0)
    attendance = Column(Float, default=90.0)
    engagement = Column(Float, default=75.0)
    created_at = Column(DateTime, default=datetime.utcnow)

