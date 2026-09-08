export interface KPICardData {
  value: number;
  display_value: string;
  change_pct: number;
  trend: 'up' | 'down' | 'neutral';
  subtitle?: string;
  sparkline: number[];
}

export interface ActualVsPredictedSeries {
  label: string;
  actual: number;
  predicted: number;
  count?: number;
  delta?: number;
}

export interface ProductivityDistributionItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AIPredictionEngineCard {
  status: string;
  model_name: string;
  model_type: string;
  task_type?: string;
  r2_score?: number;
  mae?: number;
  rmse?: number;
  model_accuracy?: number;
  dataset_size: number;
  features_count: number;
  training_period: string;
  last_updated: string;
}

export interface DepartmentProductivityItem {
  department: string;
  actual: number;
  predicted: number;
}

export interface KeyFactorItem {
  name: string;
  raw_key?: string;
  importance_pct: number;
  color: string;
}

export interface KeyInsightItem {
  id: string;
  type: string;
  icon: string;
  message: string;
  badge?: string;
}

export interface RecommendedActionItem {
  id: string;
  title: string;
  category: string;
  affected_count: number;
  potential_impact: string;
  action_label: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface DashboardEmployeeItem {
  id: number;
  employee_id: string;
  employee_name: string;
  department: string;
  current_productivity: number;
  predicted_productivity: number;
  change_pct: number;
  status: 'High' | 'Medium' | 'At Risk';
  risk_score: number;
}

export interface DashboardData {
  has_data: boolean;
  has_temporal_data?: boolean;
  temporal_message?: string;
  message?: string;
  kpis?: {
    total_employees: KPICardData;
    avg_productivity: KPICardData;
    high_performers: KPICardData;
    at_risk: KPICardData;
  };
  actual_vs_predicted?: ActualVsPredictedSeries[];
  productivity_distribution?: ProductivityDistributionItem[];
  distribution_total?: number;
  prediction_engine?: AIPredictionEngineCard;
  department_productivity?: DepartmentProductivityItem[];
  key_factors?: KeyFactorItem[];
  key_insights?: KeyInsightItem[];
  recommended_actions?: RecommendedActionItem[];
  recent_employees?: DashboardEmployeeItem[];
}

export interface KeyFactorImpact {
  factor: string;
  impact_pct: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface Employee {
  id: number;
  employee_id: string;
  employee_name: string;
  full_name?: string;
  department: string;
  role: string;
  experience: number;
  attendance: number;
  workload: number;
  working_hours: number;
  engagement: number;
  skill_level: number;
  projects: number;
  tasks_completed: number;
  deadline_adherence: number;
  previous_productivity: number;
  productivity_score: number;
  performance_rating: string;
  predicted_score?: number;
  predicted_productivity?: number;
  prediction_change_pct?: number;
  status?: string;
  risk_level?: string;
  burnout_risk_score?: number;
  prediction?: {
    predicted_productivity: number;
    change_pct: number;
    status: string;
    risk_level?: string;
    risk_score: number;
    confidence_score: number;
  };
  created_at: string;
}

export interface EmployeeNote {
  id: number;
  employee_id: string;
  content: string;
  author: string;
  created_at: string;
}

export interface EmployeeTask {
  id: number;
  employee_id: string;
  title: string;
  task_type: string;
  due_date: string;
  status: string;
  created_at: string;
}

export interface EmployeeDetail extends Employee {
  predicted_productivity: number;
  prediction_change_pct: number;
  status: string;
  risk_level?: string;
  risk_score: number;
  prediction_confidence: number;
  key_factors: KeyFactorImpact[];
  historical_productivity: { period?: string; month?: string; value: number; label?: string }[];
  has_historical?: boolean;
  ai_explanation: string;
  notes?: EmployeeNote[];
  tasks?: EmployeeTask[];
}

export interface EmployeeListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: Employee[];
}

export interface DepartmentSummary {
  id: number;
  name: string;
  employee_count: number;
  avg_productivity: number;
  predicted_productivity: number;
  high_performers_count: number;
  at_risk_count: number;
  avg_workload: number;
  avg_attendance: number;
  avg_engagement: number;
  productivity_gap: number;
}

export interface ModelPerformanceData {
  has_model: boolean;
  message?: string;
  model_name?: string;
  model_type?: string;
  task_type?: string;
  target_column?: string;
  dataset_size?: number;
  features_count?: number;
  training_duration_sec?: number;
  created_at?: string;
  r2_score?: number;
  mae?: number;
  rmse?: number;
  mape?: number;
  accuracy?: number;
  precision_score?: number;
  recall_score?: number;
  f1_score?: number;
  feature_importances?: KeyFactorItem[];
  actual_vs_predicted_scatter?: { actual: number; predicted: number; employee_id: string }[];
  residuals_distribution?: { range: string; count: number }[];
}

export interface ReportItem {
  id: number;
  title: string;
  report_type: string;
  summary: string;
  kpis: Record<string, any>;
  key_findings: string[];
  recommendations: string[];
  format: string;
  created_at: string;
}

export interface SystemSettings {
  high_perf_threshold: number;
  medium_perf_threshold: number;
  risk_threshold: number;
  default_model: string;
  test_split: number;
  random_seed: number;
  default_date_range: string;
  default_department: string;
  data_retention_days: number;
  auto_retrain_enabled: boolean;
}

export interface AuditLogItem {
  id: number;
  action: string;
  details: string;
  user: string;
  created_at: string;
}

export interface DataQualityReport {
  dataset_id: number;
  total_rows: number;
  total_columns: number;
  missing_values_count: number;
  missing_values_pct: number;
  duplicate_rows: number;
  numeric_features_count: number;
  categorical_features_count: number;
  quality_score: number;
  detected_columns: Record<string, string>;
  unmapped_columns: string[];
  sample_preview: any[];
  cleaning_actions_taken: string[];
  model_used: string;
  accuracy: number;
}
