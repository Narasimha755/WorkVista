from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# ==================== DATASET & VALIDATION ====================
class DataQualityReport(BaseModel):
    total_rows: int
    total_columns: int
    missing_values_count: int
    missing_values_pct: float
    duplicate_rows: int
    numeric_features_count: int
    categorical_features_count: int
    quality_score: float
    detected_columns: Dict[str, str] # mapped_field -> actual_col
    unmapped_columns: List[str]
    sample_preview: List[Dict[str, Any]]
    cleaning_actions_taken: List[str]

class ColumnMappingConfirmRequest(BaseModel):
    mapping: Dict[str, str] # standard_field -> original_column_name
    file_id: int

class DatasetResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    row_count: int
    column_count: int
    quality_score: float
    uploaded_at: datetime

    class Config:
        from_attributes = True

# ==================== EMPLOYEE ====================
class EmployeeBase(BaseModel):
    employee_id: str
    employee_name: str
    department: str
    role: str = "Staff"
    experience: float = 1.0
    attendance: float = 90.0
    workload: float = 70.0
    working_hours: float = 40.0
    engagement: float = 75.0
    skill_level: float = 70.0
    projects: int = 3
    tasks_completed: int = 25
    deadline_adherence: float = 85.0
    previous_productivity: float = 70.0
    productivity_score: float = 75.0
    performance_rating: str = "Medium"

class PredictionBrief(BaseModel):
    predicted_productivity: float
    change_pct: float
    status: str
    risk_level: str = "Low"
    risk_score: float
    confidence_score: float

    class Config:
        from_attributes = True

class EmployeeNoteCreate(BaseModel):
    content: str
    author: Optional[str] = "NARASIMHA"

class EmployeeNoteResponse(BaseModel):
    id: int
    employee_id: str
    content: str
    author: str
    created_at: datetime

    class Config:
        from_attributes = True

class EmployeeTaskCreate(BaseModel):
    title: str
    task_type: Optional[str] = "Performance Review"
    due_date: Optional[str] = ""

class EmployeeTaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    due_date: Optional[str] = None

class EmployeeTaskResponse(BaseModel):
    id: int
    employee_id: str
    title: str
    task_type: str
    due_date: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class EmployeeResponse(EmployeeBase):
    id: int
    prediction: Optional[PredictionBrief] = None
    created_at: datetime

    class Config:
        from_attributes = True

class KeyFactorImpact(BaseModel):
    factor: str
    impact_pct: float
    direction: str # "positive" | "negative"
    description: str

class EmployeeDetailResponse(EmployeeResponse):
    prediction_confidence: float = 90.0
    prediction_change_pct: float = 0.0
    predicted_productivity: float = 0.0
    status: str = "Medium"
    risk_level: str = "Low"
    risk_score: float = 0.0
    key_factors: List[KeyFactorImpact] = []
    historical_productivity: List[Dict[str, Any]] = []
    has_historical: bool = False
    ai_explanation: str = ""
    notes: List[EmployeeNoteResponse] = []
    tasks: List[EmployeeTaskResponse] = []

class EmployeeListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[EmployeeResponse]

# ==================== PREDICTION ====================
class PredictionRunRequest(BaseModel):
    model_type: Optional[str] = "RandomForest"
    target_column: Optional[str] = "productivity_score"
    prediction_period: Optional[str] = "Next Month"
    department_filter: Optional[str] = None
    high_perf_threshold: Optional[float] = 80.0
    medium_perf_threshold: Optional[float] = 50.0
    risk_threshold: Optional[float] = 50.0

class PredictionRunResponse(BaseModel):
    success: bool
    message: str
    records_processed: int
    employees_analyzed: int
    model_used: str
    target_column: str
    avg_predicted_score: float
    high_performers_count: int
    at_risk_count: int
    execution_time_sec: float
    timestamp: datetime

# ==================== DASHBOARD ====================
class KPICardData(BaseModel):
    value: float
    display_value: str
    change_pct: float
    trend: str # "up" | "down" | "neutral"
    sparkline: List[float]

class ActualVsPredictedSeries(BaseModel):
    label: str
    actual: float
    predicted: float

class ProductivityDistributionItem(BaseModel):
    name: str # "High (>= 80%)", "Medium (50–79%)", "Low (< 50%)"
    count: int
    percentage: float
    color: str

class AIPredictionEngineCard(BaseModel):
    status: str = "Active"
    model_name: str
    model_type: str
    model_accuracy: float
    dataset_size: int
    features_count: int
    training_period: str
    last_updated: str

class DepartmentProductivityItem(BaseModel):
    department: str
    actual: float
    predicted: float

class KeyFactorItem(BaseModel):
    name: str
    importance_pct: float
    color: str

class KeyInsightItem(BaseModel):
    id: str
    type: str # "trend", "risk", "team", "correlation"
    icon: str
    message: str
    badge: Optional[str] = None

class RecommendedActionItem(BaseModel):
    id: str
    title: str
    category: str
    affected_count: int
    potential_impact: str
    action_label: str
    urgency: str # "high", "medium", "low"

class DashboardEmployeeItem(BaseModel):
    id: int
    employee_id: str
    employee_name: str
    department: str
    current_productivity: float
    predicted_productivity: float
    change_pct: float
    status: str
    risk_score: float

class DashboardResponse(BaseModel):
    kpis: Dict[str, KPICardData]
    actual_vs_predicted: List[ActualVsPredictedSeries]
    productivity_distribution: List[ProductivityDistributionItem]
    distribution_total: int
    prediction_engine: AIPredictionEngineCard
    department_productivity: List[DepartmentProductivityItem]
    key_factors: List[KeyFactorItem]
    key_insights: List[KeyInsightItem]
    recommended_actions: List[RecommendedActionItem]
    recent_employees: List[DashboardEmployeeItem]

# ==================== ANALYTICS ====================
class ScatterPoint(BaseModel):
    id: str
    name: str
    department: str
    x: float
    y: float
    predicted: float
    risk_score: float

class HeatmapCell(BaseModel):
    department: str
    month: str
    value: float

class AnalyticsResponse(BaseModel):
    productivity_trends: List[Dict[str, Any]]
    department_comparisons: List[Dict[str, Any]]
    workload_vs_productivity: List[ScatterPoint]
    attendance_vs_productivity: List[ScatterPoint]
    experience_vs_productivity: List[ScatterPoint]
    risk_distribution: List[Dict[str, Any]]
    heatmap: List[HeatmapCell]

# ==================== DEPARTMENTS ====================
class DepartmentSummary(BaseModel):
    id: int
    name: str
    employee_count: int
    avg_productivity: float
    predicted_productivity: float
    high_performers_count: int
    at_risk_count: int
    avg_workload: float
    avg_attendance: float
    avg_engagement: float

# ==================== MODEL PERFORMANCE ====================
class ModelPerformanceResponse(BaseModel):
    model_name: str
    model_type: str
    task_type: str
    target_column: str
    dataset_size: int
    features_count: int
    training_duration_sec: float
    created_at: datetime
    
    # Metrics
    r2_score: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None
    accuracy: Optional[float] = None
    precision_score: Optional[float] = None
    recall_score: Optional[float] = None
    f1_score: Optional[float] = None
    
    feature_importances: List[KeyFactorItem] = []
    actual_vs_predicted_scatter: List[Dict[str, float]] = []
    residuals_distribution: List[Dict[str, Any]] = []

class RetrainRequest(BaseModel):
    model_type: str = "RandomForest"
    test_size: float = 0.2
    n_estimators: int = 100
    target_column: str = "productivity_score"

# ==================== REPORTS ====================
class ReportCreateRequest(BaseModel):
    title: str
    report_type: str = "Executive Summary"
    department: Optional[str] = "All"
    format: str = "PDF"

class ReportResponse(BaseModel):
    id: int
    title: str
    report_type: str
    summary: str
    kpis: Dict[str, Any]
    key_findings: List[str]
    recommendations: List[str]
    format: str
    created_at: datetime

# ==================== SETTINGS & AUDIT ====================
class SystemSettings(BaseModel):
    high_perf_threshold: float = 80.0
    medium_perf_threshold: float = 50.0
    risk_threshold: float = 50.0
    default_model: str = "RandomForest"
    test_split: float = 0.2
    random_seed: int = 42
    default_date_range: str = "Last 30 Days"
    default_department: str = "All Departments"
    data_retention_days: int = 365
    auto_retrain_enabled: bool = True

class AuditLogItem(BaseModel):
    id: int
    action: str
    details: str
    user: str
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== ROLES & RECRUITMENT ====================
class JobRoleCreate(BaseModel):
    title: str
    department: str
    location: Optional[str] = "Remote"
    required_skills: Optional[List[str]] = []
    preferred_skills: Optional[List[str]] = []
    min_experience: Optional[float] = 1.0
    max_experience: Optional[float] = 10.0
    education: Optional[str] = "Bachelor's Degree"
    min_salary: Optional[float] = 60000.0
    max_salary: Optional[float] = 120000.0
    employment_type: Optional[str] = "Full-Time"
    description: Optional[str] = ""
    status: Optional[str] = "Active"

class JobRoleUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    min_experience: Optional[float] = None
    max_experience: Optional[float] = None
    education: Optional[str] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class JobRoleResponse(BaseModel):
    id: int
    title: str
    department: str
    location: str
    required_skills: List[str]
    preferred_skills: List[str]
    min_experience: float
    max_experience: float
    education: str
    min_salary: float
    max_salary: float
    employment_type: str
    description: str
    status: str
    candidate_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== CANDIDATES ====================
class CandidateCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    location: Optional[str] = "Remote"
    role_id: Optional[int] = None
    role_title: Optional[str] = "Software Engineer"
    department: Optional[str] = "Engineering"
    experience: Optional[float] = 2.0
    skills: Optional[List[str]] = []
    education: Optional[str] = "Bachelor's Degree"
    expected_salary: Optional[float] = 90000.0
    availability: Optional[str] = "Immediate"
    notice_period: Optional[str] = "30 days"
    source: Optional[str] = "Direct"
    resume_url: Optional[str] = None
    resume_text: Optional[str] = ""
    portfolio_url: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    status: Optional[str] = "New"

class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    role_id: Optional[int] = None
    role_title: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[float] = None
    skills: Optional[List[str]] = None
    education: Optional[str] = None
    expected_salary: Optional[float] = None
    availability: Optional[str] = None
    notice_period: Optional[str] = None
    source: Optional[str] = None
    resume_text: Optional[str] = None
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    status: Optional[str] = None

class CandidateStageUpdate(BaseModel):
    status: str  # New, Screening, Shortlisted, Interview, Offer, Hired, Rejected, On Hold
    notes: Optional[str] = ""

class CandidateMatchBreakdown(BaseModel):
    skills_match_pct: float
    experience_match_pct: float
    education_match_pct: float
    role_match_pct: float
    location_match_pct: float
    overall_match_pct: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []

class CandidateResponse(BaseModel):
    id: int
    candidate_id: str
    name: str
    email: str
    phone: str
    location: str
    role_id: Optional[int] = None
    role_title: str
    department: str
    experience: float
    skills: List[str]
    education: str
    expected_salary: float
    availability: str
    notice_period: str
    source: str
    resume_url: Optional[str] = None
    resume_text: Optional[str] = ""
    portfolio_url: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    status: str
    match_score: float
    match_breakdown: Optional[Dict[str, Any]] = None
    converted_employee_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConvertCandidateRequest(BaseModel):
    starting_salary: Optional[float] = None
    start_date: Optional[str] = None
    assigned_role: Optional[str] = None
    assigned_department: Optional[str] = None

# ==================== INTERVIEWS ====================
class InterviewCreate(BaseModel):
    candidate_id: str
    role_id: Optional[int] = None
    role_title: Optional[str] = ""
    interviewer: Optional[str] = "NARASIMHA"
    scheduled_time: str
    interview_type: Optional[str] = "Technical"
    notes: Optional[str] = ""

class InterviewUpdate(BaseModel):
    status: Optional[str] = None  # Scheduled, Completed, Cancelled
    feedback: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None

class InterviewResponse(BaseModel):
    id: int
    candidate_id: str
    candidate_name: str
    role_id: Optional[int] = None
    role_title: str
    interviewer: str
    scheduled_time: str
    interview_type: str
    status: str
    feedback: str
    rating: float
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== UNIVERSAL TASKS & NOTES ====================
class UniversalTaskCreate(BaseModel):
    entity_type: str = "employee"
    entity_id: str
    title: str
    task_type: Optional[str] = "General"
    due_date: Optional[str] = ""
    priority: Optional[str] = "Medium"
    assigned_to: Optional[str] = "NARASIMHA"

class UniversalTaskUpdate(BaseModel):
    title: Optional[str] = None
    task_type: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class UniversalTaskResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: str
    title: str
    task_type: str
    due_date: str
    priority: str
    status: str
    assigned_to: str
    created_at: datetime

    class Config:
        from_attributes = True

class UniversalNoteCreate(BaseModel):
    entity_type: str = "employee"
    entity_id: str
    content: str
    author: Optional[str] = "NARASIMHA"

class UniversalNoteResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: str
    content: str
    author: str
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetVersionResponse(BaseModel):
    id: int
    dataset_id: Optional[int] = None
    version_tag: str
    dataset_name: str
    record_count: int
    column_count: int
    quality_score: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

