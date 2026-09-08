import { 
  DashboardData, 
  EmployeeListResponse, 
  EmployeeDetail, 
  DepartmentSummary, 
  ModelPerformanceData, 
  ReportItem, 
  SystemSettings, 
  AuditLogItem, 
  DataQualityReport 
} from '../types';
import mockData from './mockData.json';

const isStaticPreview = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:'
);

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  if (isStaticPreview && fallback) {
    return fallback();
  }
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (fallback) return fallback();
      let errorMsg = 'HTTP Error ' + res.status;
      try {
        const err = await res.json();
        errorMsg = err.detail || errorMsg;
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }
    return res.json();
  } catch (err) {
    if (fallback) {
      console.warn('Falling back to static preview data for ' + url, err);
      return fallback();
    }
    throw err;
  }
}

// In-memory storage for preview mode
const localNotes: Record<string, any[]> = {};
const localTasks: Record<string, any[]> = {};

export const api = {
  getDashboard: () => 
    fetchJson<DashboardData>(API_BASE + '/dashboard', undefined, () => mockData.dashboard as any),

  loadDemoData: () => 
    fetchJson<{ success: boolean; message: string; report: DataQualityReport }>(
      API_BASE + '/demo', 
      { method: 'POST' },
      () => ({
        success: true,
        message: 'Demo dataset loaded (520 employees)',
        report: (mockData.dashboard as any).data_quality
      })
    ),

  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson<{ success: boolean; message: string; report: DataQualityReport }>(
      API_BASE + '/upload', 
      { method: 'POST', body: formData },
      () => ({
        success: true,
        message: 'Dataset ' + file.name + ' processed (Preview Mode)',
        report: (mockData.dashboard as any).data_quality
      })
    );
  },

  getEmployees: (params: {
    page?: number;
    page_size?: number;
    search?: string;
    department?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    if (params.search) query.append('search', params.search);
    if (params.department && params.department !== 'All Departments') query.append('department', params.department);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_dir) query.append('sort_dir', params.sort_dir);

    return fetchJson<EmployeeListResponse>(API_BASE + '/employees?' + query.toString(), undefined, () => {
      const allItems: any[] = (mockData.employees as any).items || [];
      let filtered = [...allItems];
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(e => 
          (e.full_name && e.full_name.toLowerCase().includes(q)) ||
          (e.employee_id && e.employee_id.toLowerCase().includes(q)) ||
          (e.role && e.role.toLowerCase().includes(q))
        );
      }
      if (params.department && params.department !== 'All Departments') {
        filtered = filtered.filter(e => e.department === params.department);
      }
      if (params.status && params.status !== 'All') {
        filtered = filtered.filter(e => e.status === params.status);
      }
      const page = params.page || 1;
      const pageSize = params.page_size || 20;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);
      return {
        items: paginated,
        total: filtered.length,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(filtered.length / pageSize) || 1
      };
    });
  },

  getEmployeeDetail: (id: string) => 
    fetchJson<EmployeeDetail>(API_BASE + '/employees/' + id, undefined, () => {
      const allItems: any[] = (mockData.employees as any).items || [];
      const emp = allItems.find(e => e.employee_id === id) || allItems[0];
      return {
        ...emp,
        overtime_hours: 14.5,
        projects_completed: 6,
        satisfaction_score: 4.2,
        tenure_months: 28,
        training_hours: 32,
        risk_level: emp.burnout_risk_score >= 70 ? 'High Risk' : emp.burnout_risk_score >= 30 ? 'Moderate Risk' : 'Low Risk',
        historical_scores: [
          { period: 'Cohort Q1', actual: emp.productivity_score - 2, predicted: emp.productivity_score - 1 },
          { period: 'Cohort Q2', actual: emp.productivity_score, predicted: emp.predicted_score || emp.productivity_score }
        ],
        shap_factors: [
          { factor: 'Task Completion Rate', contribution: 4.5, direction: 'positive' },
          { factor: 'Attendance Consistency', contribution: 3.2, direction: 'positive' },
          { factor: 'Overtime & Burnout', contribution: -2.8, direction: 'negative' }
        ],
        actionable_recommendations: [
          'Maintain regular 1-on-1 performance check-ins.',
          'Review workload balance to mitigate burnout risk.'
        ]
      } as EmployeeDetail;
    }),

  runPrediction: (payload: any) => 
    fetchJson<any>(API_BASE + '/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Prediction executed successfully',
      predictions_count: 520,
      r2_score: 0.748,
      mae: 6.12,
      rmse: 7.94
    })),

  getPredictions: () => fetchJson<any>(API_BASE + '/predictions', undefined, () => []),

  getAnalytics: () => fetchJson<any>(API_BASE + '/analytics', undefined, () => mockData.analytics),

  getDepartments: () => fetchJson<DepartmentSummary[]>(API_BASE + '/departments', undefined, () => mockData.departments as any),

  getModelPerformance: () => fetchJson<ModelPerformanceData>(API_BASE + '/model', undefined, () => mockData.model as any),

  retrainModel: (payload: any) => fetchJson<any>(API_BASE + '/model/retrain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, () => ({
    success: true,
    message: 'Model retrained successfully',
    metrics: { r2: 0.752, mae: 5.98, rmse: 7.81 }
  })),

  getReports: () => fetchJson<ReportItem[]>(API_BASE + '/reports', undefined, () => mockData.reports as any),

  generateReport: (payload: any) => fetchJson<ReportItem>(API_BASE + '/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, () => ({
    id: Date.now(),
    title: payload.title || 'Workforce Productivity Report',
    report_type: payload.report_type || 'Executive Summary',
    summary: 'Executive intelligence analysis across departments and productivity cohorts.',
    kpis: { total_employees: 520, avg_productivity: 73.1 },
    key_findings: ['Engineering leads in productivity stability', 'Customer Support faces elevated overtime load'],
    recommendations: ['Calibrate workload distributions', 'Offer retention coaching for moderate risk staff'],
    format: 'PDF',
    created_at: new Date().toISOString()
  })),

  getSettings: () => fetchJson<SystemSettings>(API_BASE + '/settings', undefined, () => ({
    high_perf_threshold: 80,
    medium_perf_threshold: 50,
    risk_threshold: 70,
    default_model: 'RandomForest',
    test_split: 0.2,
    random_seed: 42,
    default_date_range: 'Last 90 Days',
    default_department: 'All',
    data_retention_days: 90,
    auto_retrain_enabled: false
  })),

  updateSettings: (settings: SystemSettings) => fetchJson<any>(API_BASE + '/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }, () => ({ success: true, message: 'Settings saved' })),

  getAuditLogs: () => fetchJson<AuditLogItem[]>(API_BASE + '/audit', undefined, () => [
    { id: 1, action: 'DATASET_LOAD', user: 'NARASIMHA', created_at: new Date().toISOString(), details: 'Demo dataset loaded' },
    { id: 2, action: 'MODEL_EVAL', user: 'NARASIMHA', created_at: new Date().toISOString(), details: 'RandomForest model evaluated' }
  ]),

  getEmployeeNotes: (id: string) => 
    fetchJson<any[]>(API_BASE + '/employees/' + id + '/notes', undefined, () => localNotes[id] || [
      { id: 1, employee_id: id, author: 'NARASIMHA', content: 'Performance review confirmed and aligned with benchmarks.', created_at: new Date().toISOString() }
    ]),

  addEmployeeNote: (id: string, content: string) =>
    fetchJson<any>(API_BASE + '/employees/' + id + '/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    }, () => {
      const note = { id: Date.now(), employee_id: id, author: 'NARASIMHA', content, created_at: new Date().toISOString() };
      if (!localNotes[id]) localNotes[id] = [];
      localNotes[id].unshift(note);
      return note;
    }),

  getEmployeeTasks: (id: string) =>
    fetchJson<any[]>(API_BASE + '/employees/' + id + '/tasks', undefined, () => localTasks[id] || [
      { id: 1, employee_id: id, title: 'Quarterly Check-in', task_type: 'Review', status: 'Pending', due_date: '2026-09-30' }
    ]),

  createEmployeeTask: (id: string, payload: any) =>
    fetchJson<any>(API_BASE + '/employees/' + id + '/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, () => {
      const task = { id: Date.now(), employee_id: id, title: payload.title, task_type: payload.task_type || 'General', status: 'Pending', due_date: payload.due_date || '2026-09-30' };
      if (!localTasks[id]) localTasks[id] = [];
      localTasks[id].push(task);
      return task;
    }),

  updateEmployeeTask: (id: string, taskId: number, payload: any) =>
    fetchJson<any>(API_BASE + '/employees/' + id + '/tasks/' + taskId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, () => {
      if (localTasks[id]) {
        const t = localTasks[id].find(item => item.id === taskId);
        if (t && payload.status) t.status = payload.status;
      }
      return { success: true };
    }),

  getEmployeeExportUrl: (id: string, format: 'pdf' | 'csv' | 'json') =>
    API_BASE + '/employees/' + id + '/export/' + format,

  getReportPdfUrl: (reportId: number) =>
    API_BASE + '/reports/' + reportId + '/pdf',

  getExportUrl: (format: 'csv' | 'xlsx' | 'json', filters?: { department?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (filters?.department && filters.department !== 'All Departments') query.append('department', filters.department);
    if (filters?.status && filters.status !== 'All') query.append('status', filters.status);
    if (filters?.search) query.append('search', filters.search);
    return API_BASE + '/export/' + format + '?' + query.toString();
  }
};
