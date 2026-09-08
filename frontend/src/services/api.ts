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
import { dynamicStore, downloadFile } from './dynamicStore';

export const isStaticPreview = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:'
);

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit, fallback?: () => T | Promise<T>): Promise<T> {
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
      console.warn('Using dynamic client engine for ' + url, err);
      return fallback();
    }
    throw err;
  }
}

export const api = {
  isStaticPreview,

  getDashboard: (params?: { department?: string; status?: string; experience_cohort?: string; cohort_grouping?: 'department' | 'experience' | 'workload' | 'attendance' }) => {
    const query = new URLSearchParams();
    if (params?.department && params.department !== 'All Departments' && params.department !== 'All') query.append('department', params.department);
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.experience_cohort && params.experience_cohort !== 'All') query.append('experience_cohort', params.experience_cohort);
    if (params?.cohort_grouping) query.append('cohort_grouping', params.cohort_grouping);
    const qs = query.toString();

    return fetchJson<DashboardData>(
      API_BASE + '/dashboard' + (qs ? '?' + qs : ''), 
      undefined, 
      () => dynamicStore.getDashboardData(params)
    );
  },

  switchModel: (modelType: string) => {
    dynamicStore.setModel(modelType);
  },

  loadDemoData: () => 
    fetchJson<{ success: boolean; message: string; report: DataQualityReport }>(
      API_BASE + '/demo', 
      { method: 'POST' },
      () => {
        dynamicStore.resetToInitial();
        return {
          success: true,
          message: 'Demo dataset calibrated (520 employees active)',
          report: (mockData.dashboard as any).data_quality
        };
      }
    ),

  uploadDataset: async (file: File) => {
    if (isStaticPreview) {
      return new Promise<{ success: boolean; message: string; report: DataQualityReport }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = (e.target?.result as string) || '';
            const res = dynamicStore.parseAndIngestCsv(text, file.name);
            resolve(res);
          } catch (err: any) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read uploaded file.'));
        reader.readAsText(file);
      });
    }

    const formData = new FormData();
    formData.append('file', file);
    return fetchJson<{ success: boolean; message: string; report: DataQualityReport }>(
      API_BASE + '/upload', 
      { method: 'POST', body: formData },
      () => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = (e.target?.result as string) || '';
            const res = dynamicStore.parseAndIngestCsv(text, file.name);
            resolve(res);
          } catch (err: any) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read uploaded file.'));
        reader.readAsText(file);
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

    return fetchJson<EmployeeListResponse>(
      API_BASE + '/employees?' + query.toString(), 
      undefined, 
      () => dynamicStore.getEmployees(params)
    );
  },

  getEmployeeDetail: (id: string) => 
    fetchJson<EmployeeDetail>(
      API_BASE + '/employees/' + id, 
      undefined, 
      () => dynamicStore.getEmployeeDetail(id)
    ),

  runPrediction: (payload: any) => 
    fetchJson<any>(
      API_BASE + '/predict', 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 
      () => dynamicStore.runPrediction(payload)
    ),

  getPredictions: () => 
    fetchJson<any>(
      API_BASE + '/predictions', 
      undefined, 
      () => ({
        total: dynamicStore.employees.length,
        avg_predicted: Number((dynamicStore.employees.reduce((acc, e) => acc + (e.predicted_score || e.productivity_score), 0) / (dynamicStore.employees.length || 1)).toFixed(1)),
        high_performers: dynamicStore.employees.filter(e => e.status === 'High').length,
        at_risk: dynamicStore.employees.filter(e => (e.burnout_risk_score || 0) >= dynamicStore.settings.risk_threshold).length
      })
    ),

  getAnalytics: () => 
    fetchJson<any>(API_BASE + '/analytics', undefined, () => (mockData as any).analytics),

  getDepartments: () => 
    fetchJson<DepartmentSummary[]>(API_BASE + '/departments', undefined, () => (mockData as any).departments),

  getModelPerformance: () => 
    fetchJson<ModelPerformanceData>(API_BASE + '/model', undefined, () => {
      const baseModel = JSON.parse(JSON.stringify((mockData as any).model || {}));
      baseModel.r2_score = dynamicStore.r2Score;
      baseModel.mae = dynamicStore.maeScore;
      baseModel.rmse = dynamicStore.rmseScore;
      baseModel.model_name = dynamicStore.activeModel;
      baseModel.model_type = dynamicStore.activeModel;
      return baseModel;
    }),

  retrainModel: (payload: any) => 
    fetchJson<any>(
      API_BASE + '/model/retrain', 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 
      () => dynamicStore.retrainModel(payload)
    ),

  getReports: () => 
    fetchJson<ReportItem[]>(API_BASE + '/reports', undefined, () => dynamicStore.reports),

  generateReport: (payload: any) => 
    fetchJson<ReportItem>(
      API_BASE + '/reports', 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 
      () => dynamicStore.generateReport(payload)
    ),

  getSettings: () => 
    fetchJson<SystemSettings>(API_BASE + '/settings', undefined, () => dynamicStore.settings),

  updateSettings: (settings: SystemSettings) => 
    fetchJson<any>(
      API_BASE + '/settings', 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      }, 
      () => {
        dynamicStore.settings = settings;
        dynamicStore.recalculateCategorizations();
        return { success: true, message: 'Settings saved and thresholds applied' };
      }
    ),

  getAuditLogs: () => 
    fetchJson<AuditLogItem[]>(API_BASE + '/audit', undefined, () => dynamicStore.auditLogs),

  getEmployeeNotes: (id: string) => 
    fetchJson<any[]>(
      API_BASE + '/employees/' + id + '/notes', 
      undefined, 
      () => dynamicStore.notes[id] || [
        { id: 1, employee_id: id, author: 'NARASIMHA', content: 'Performance review confirmed and aligned with benchmarks.', created_at: new Date().toISOString() }
      ]
    ),

  addEmployeeNote: (id: string, content: string) => 
    fetchJson<any>(
      API_BASE + '/employees/' + id + '/notes', 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      }, 
      () => {
        const note = { id: Date.now(), employee_id: id, author: 'NARASIMHA', content, created_at: new Date().toISOString() };
        if (!dynamicStore.notes[id]) dynamicStore.notes[id] = [];
        dynamicStore.notes[id].unshift(note);
        return note;
      }
    ),

  getEmployeeTasks: (id: string) => 
    fetchJson<any[]>(
      API_BASE + '/employees/' + id + '/tasks', 
      undefined, 
      () => dynamicStore.tasks[id] || [
        { id: 1, employee_id: id, title: 'Quarterly Check-in', task_type: 'Review', status: 'Pending', due_date: '2026-09-30' }
      ]
    ),

  createEmployeeTask: (id: string, payload: any) => 
    fetchJson<any>(
      API_BASE + '/employees/' + id + '/tasks', 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 
      () => {
        const task = { 
          id: Date.now(), 
          employee_id: id, 
          title: payload.title, 
          task_type: payload.task_type || 'General', 
          status: 'Pending', 
          due_date: payload.due_date || '2026-09-30' 
        };
        if (!dynamicStore.tasks[id]) dynamicStore.tasks[id] = [];
        dynamicStore.tasks[id].push(task);
        return task;
      }
    ),

  updateEmployeeTask: (id: string, taskId: number, payload: any) => 
    fetchJson<any>(
      API_BASE + '/employees/' + id + '/tasks/' + taskId, 
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 
      () => {
        if (dynamicStore.tasks[id]) {
          const t = dynamicStore.tasks[id].find(item => item.id === taskId);
          if (t && payload.status) t.status = payload.status;
        }
        return { success: true };
      }
    ),

  // Export handlers that work seamlessly on both local server and GitHub Pages
  triggerExportCsv: (filters?: { department?: string; status?: string; search?: string }) => {
    if (isStaticPreview) {
      dynamicStore.exportEmployeesCsv(filters);
    } else {
      const query = new URLSearchParams();
      if (filters?.department && filters.department !== 'All Departments') query.append('department', filters.department);
      if (filters?.status && filters.status !== 'All') query.append('status', filters.status);
      if (filters?.search) query.append('search', filters.search);
      window.location.href = API_BASE + '/export/csv?' + query.toString();
    }
  },

  triggerExportEmployeeDossier: (employeeId: string, format: 'pdf' | 'csv' | 'json') => {
    if (isStaticPreview) {
      dynamicStore.exportEmployeeDossier(employeeId, format);
    } else {
      window.location.href = API_BASE + '/employees/' + employeeId + '/export/' + format;
    }
  },

  triggerExportReportPdf: (reportId: number, reportObj?: ReportItem) => {
    if (isStaticPreview) {
      if (typeof window !== 'undefined' && reportObj) {
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write('<html><head><title>' + reportObj.title + '</title><style>body{font-family:sans-serif;padding:30px;color:#1e293b}h1{color:#1e40af}h2{color:#475569}.card{background:#f8fafc;padding:15px;border-radius:10px;margin-bottom:15px;border:1px solid #e2e8f0}</style></head><body><h1>WorkVista Executive Report</h1><h2>' + reportObj.title + '</h2><p><b>Generated:</b> ' + new Date(reportObj.created_at).toLocaleString() + ' | <b>Author:</b> NARASIMHA</p><div class="card"><h3>Executive Briefing</h3><p>' + reportObj.summary + '</p></div><div class="card"><h3>Key Analytical Findings</h3><ul>' + (reportObj.key_findings || []).map((f: string) => '<li>' + f + '</li>').join('') + '</ul></div><div class="card"><h3>AI Strategic Interventions</h3><ul>' + (reportObj.recommendations || []).map((r: string) => '<li>' + r + '</li>').join('') + '</ul></div><p style="margin-top:40px;font-size:12px;color:#94a3b8">Generated by WorkVista AI Workforce Prediction Engine</p></body></html>');
          printWin.document.close();
          printWin.focus();
          printWin.print();
        }
      }
    } else {
      window.location.href = API_BASE + '/reports/' + reportId + '/pdf';
    }
  },

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
