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

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const err = await res.json();
      errorMsg = err.detail || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  getDashboard: () => fetchJson<DashboardData>(`${API_BASE}/dashboard`),

  loadDemoData: () => 
    fetchJson<{ success: boolean; message: string; report: DataQualityReport }>(
      `${API_BASE}/demo`, 
      { method: 'POST' }
    ),

  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson<{ success: boolean; message: string; report: DataQualityReport }>(
      `${API_BASE}/upload`, 
      { method: 'POST', body: formData }
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

    return fetchJson<EmployeeListResponse>(`${API_BASE}/employees?${query.toString()}`);
  },

  getEmployeeDetail: (id: string) => 
    fetchJson<EmployeeDetail>(`${API_BASE}/employees/${id}`),

  runPrediction: (payload: {
    model_type?: string;
    target_column?: string;
    prediction_period?: string;
    department_filter?: string;
    high_perf_threshold?: number;
    medium_perf_threshold?: number;
    risk_threshold?: number;
  }) => fetchJson<any>(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),

  getPredictions: () => fetchJson<any>(`${API_BASE}/predictions`),

  getAnalytics: () => fetchJson<any>(`${API_BASE}/analytics`),

  getDepartments: () => fetchJson<DepartmentSummary[]>(`${API_BASE}/departments`),

  getModelPerformance: () => fetchJson<ModelPerformanceData>(`${API_BASE}/model`),

  retrainModel: (payload: {
    model_type: string;
    test_size: number;
    target_column: string;
  }) => fetchJson<any>(`${API_BASE}/model/retrain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),

  getReports: () => fetchJson<ReportItem[]>(`${API_BASE}/reports`),

  generateReport: (payload: {
    title: string;
    report_type: string;
    department?: string;
    format?: string;
  }) => fetchJson<ReportItem>(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),

  getSettings: () => fetchJson<SystemSettings>(`${API_BASE}/settings`),

  updateSettings: (settings: SystemSettings) => fetchJson<any>(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }),

  getAuditLogs: () => fetchJson<AuditLogItem[]>(`${API_BASE}/audit`),

  getEmployeeNotes: (id: string) => 
    fetchJson<any[]>(`${API_BASE}/employees/${id}/notes`),

  addEmployeeNote: (id: string, content: string) =>
    fetchJson<any>(`${API_BASE}/employees/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    }),

  getEmployeeTasks: (id: string) =>
    fetchJson<any[]>(`${API_BASE}/employees/${id}/tasks`),

  createEmployeeTask: (id: string, payload: { title: string; task_type?: string; due_date?: string }) =>
    fetchJson<any>(`${API_BASE}/employees/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  updateEmployeeTask: (id: string, taskId: number, payload: { status?: string; title?: string; due_date?: string }) =>
    fetchJson<any>(`${API_BASE}/employees/${id}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  getEmployeeExportUrl: (id: string, format: 'pdf' | 'csv' | 'json') =>
    `${API_BASE}/employees/${id}/export/${format}`,

  getReportPdfUrl: (reportId: number) =>
    `${API_BASE}/reports/${reportId}/pdf`,

  getExportUrl: (format: 'csv' | 'xlsx' | 'json', filters?: { department?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (filters?.department && filters.department !== 'All Departments') query.append('department', filters.department);
    if (filters?.status && filters.status !== 'All') query.append('status', filters.status);
    if (filters?.search) query.append('search', filters.search);
    return `${API_BASE}/export/${format}?${query.toString()}`;
  }
};
