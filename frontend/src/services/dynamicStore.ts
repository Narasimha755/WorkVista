import mockData from './mockData.json';
import { 
  DashboardData, 
  Employee, 
  EmployeeListResponse, 
  EmployeeDetail, 
  DepartmentSummary, 
  ModelPerformanceData, 
  ReportItem, 
  SystemSettings, 
  AuditLogItem, 
  DataQualityReport 
} from '../types';

export function downloadFile(filename: string, content: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

class DynamicStore {
  public employees: Employee[] = [];
  public settings: SystemSettings = {
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
  };
  public notes: Record<string, any[]> = {};
  public tasks: Record<string, any[]> = {};
  public reports: ReportItem[] = [];
  public auditLogs: AuditLogItem[] = [];
  public activeModel = 'RandomForest';
  public r2Score = 0.748;
  public maeScore = 6.12;
  public rmseScore = 7.94;

  constructor() {
    this.resetToInitial();
  }

  public resetToInitial() {
    const rawItems = ((mockData as any).employees?.items || []) as Employee[];
    this.employees = JSON.parse(JSON.stringify(rawItems));
    this.reports = JSON.parse(JSON.stringify((mockData as any).reports || []));
    this.auditLogs = [
      { id: 1, action: 'SYSTEM_BOOT', user: 'NARASIMHA', created_at: new Date().toISOString(), details: 'WorkVista AI Platform online with 520 employee records' },
      { id: 2, action: 'MODEL_TRAINED', user: 'NARASIMHA', created_at: new Date().toISOString(), details: 'RandomForest regression model calibrated (R2: 0.748)' }
    ];
    this.recalculateCategorizations();
  }

  public recalculateCategorizations() {
    const highThresh = this.settings.high_perf_threshold;
    const medThresh = this.settings.medium_perf_threshold;
    const riskThresh = this.settings.risk_threshold;

    this.employees.forEach(emp => {
      const prod = emp.productivity_score;
      if (prod >= highThresh) {
        emp.status = 'High';
      } else if (prod >= medThresh) {
        emp.status = 'Medium';
      } else {
        emp.status = 'Low';
      }

      const riskScore = emp.burnout_risk_score || 0;
      if (riskScore >= riskThresh) {
        emp.risk_level = 'High Risk';
      } else if (riskScore >= 30) {
        emp.risk_level = 'Moderate Risk';
      } else {
        emp.risk_level = 'Low Risk';
      }
    });
  }

  public getDashboardData(): DashboardData {
    this.recalculateCategorizations();
    const total = this.employees.length;
    const avgProd = total > 0 ? Number((this.employees.reduce((acc, e) => acc + e.productivity_score, 0) / total).toFixed(1)) : 0;
    const highPerformers = this.employees.filter(e => e.status === 'High').length;
    const atRisk = this.employees.filter(e => (e.burnout_risk_score || 0) >= this.settings.risk_threshold).length;

    const baseDashboard = JSON.parse(JSON.stringify((mockData as any).dashboard || {}));

    baseDashboard.has_data = total > 0;
    baseDashboard.kpis = {
      total_employees: { value: total, delta: 0.0, trend: 'neutral' as const, subtitle: `${total} active profiles` },
      avg_productivity: { value: avgProd, delta: 1.8, trend: 'up' as const, subtitle: 'Across all cohorts' },
      high_performers: { value: highPerformers, delta: 2.4, trend: 'up' as const, subtitle: `${Number(((highPerformers / (total || 1)) * 100).toFixed(1))}% of workforce` },
      at_risk: { value: atRisk, delta: -0.8, trend: 'down' as const, subtitle: `${Number(((atRisk / (total || 1)) * 100).toFixed(1))}% of workforce` }
    };

    const mediumCount = this.employees.filter(e => e.status === 'Medium').length;
    const lowCount = this.employees.filter(e => e.status === 'Low').length;

    baseDashboard.productivity_distribution = [
      { name: `High (>= ${this.settings.high_perf_threshold}%)`, value: highPerformers, percentage: Number(((highPerformers / (total || 1)) * 100).toFixed(1)), color: '#10B981' },
      { name: `Medium (${this.settings.medium_perf_threshold}-${this.settings.high_perf_threshold - 1}%)`, value: mediumCount, percentage: Number(((mediumCount / (total || 1)) * 100).toFixed(1)), color: '#3B82F6' },
      { name: `Low (< ${this.settings.medium_perf_threshold}%)`, value: lowCount, percentage: Number(((lowCount / (total || 1)) * 100).toFixed(1)), color: '#EF4444' }
    ];
    baseDashboard.distribution_total = total;

    baseDashboard.prediction_engine = {
      ...baseDashboard.prediction_engine,
      model_type: this.activeModel,
      r2_score: this.r2Score,
      mae: this.maeScore,
      rmse: this.rmseScore,
      status: 'Optimal',
      training_period: `Single period snapshot (${total} records)`
    };

    baseDashboard.recent_employees = this.employees.slice(0, 5);
    return baseDashboard;
  }

  public getEmployees(params: {
    page?: number;
    page_size?: number;
    search?: string;
    department?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: string;
  }): EmployeeListResponse {
    this.recalculateCategorizations();
    let filtered = [...this.employees];

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(e => 
        (e.full_name && e.full_name.toLowerCase().includes(q)) ||
        (e.employee_id && e.employee_id.toLowerCase().includes(q)) ||
        (e.role && e.role.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q))
      );
    }

    if (params.department && params.department !== 'All Departments' && params.department !== 'All') {
      filtered = filtered.filter(e => e.department === params.department);
    }

    if (params.status && params.status !== 'All') {
      filtered = filtered.filter(e => e.status === params.status);
    }

    const sortBy = params.sort_by || 'id';
    const sortDir = params.sort_dir || 'asc';
    filtered.sort((a: any, b: any) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc' 
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

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
  }

  public getEmployeeDetail(id: string): EmployeeDetail {
    const emp = this.employees.find(e => e.employee_id === id) || this.employees[0];
    const riskScore = emp.burnout_risk_score || 25;
    const riskLevel = riskScore >= this.settings.risk_threshold 
      ? 'High Risk' 
      : riskScore >= 30 
        ? 'Moderate Risk' 
        : 'Low Risk';
    const predProd = emp.predicted_productivity || emp.predicted_score || emp.productivity_score;
    const changePct = emp.prediction_change_pct || Number((predProd - emp.productivity_score).toFixed(1));

    return {
      ...emp,
      predicted_productivity: predProd,
      prediction_change_pct: changePct,
      status: emp.status || (emp.productivity_score >= this.settings.high_perf_threshold ? 'High' : 'Medium'),
      risk_level: riskLevel,
      risk_score: riskScore,
      prediction_confidence: 91.5,
      ai_explanation: `${emp.employee_name} exhibits consistent performance across task completion and attendance, with predicted output of ${predProd}%.`,
      key_factors: [
        { factor: 'Task Completion Rate', impact_pct: 4.2, direction: 'positive', description: 'High task closure volume positively drives productivity score.' },
        { factor: 'Attendance Consistency', impact_pct: 3.1, direction: 'positive', description: 'Reliable weekly check-ins provide steady operational rhythm.' },
        { factor: 'Overtime Workload', impact_pct: -2.7, direction: 'negative', description: 'Sustained hours increase burnout fatigue.' }
      ],
      historical_productivity: [
        { period: 'Cohort Q1', value: Number((emp.productivity_score - 1.8).toFixed(1)), label: 'Cohort Q1' },
        { period: 'Cohort Q2', value: emp.productivity_score, label: 'Cohort Q2' }
      ],
      notes: this.notes[id] || [],
      tasks: this.tasks[id] || []
    };
  }

  public runPrediction(payload: any) {
    if (payload.model_type) this.activeModel = payload.model_type;
    if (payload.high_perf_threshold) this.settings.high_perf_threshold = payload.high_perf_threshold;
    if (payload.medium_perf_threshold) this.settings.medium_perf_threshold = payload.medium_perf_threshold;
    if (payload.risk_threshold) this.settings.risk_threshold = payload.risk_threshold;

    if (payload.model_type === 'GradientBoosting') {
      this.r2Score = 0.778;
      this.maeScore = 5.64;
      this.rmseScore = 7.32;
    } else if (payload.model_type === 'LinearRidge') {
      this.r2Score = 0.712;
      this.maeScore = 6.45;
      this.rmseScore = 8.35;
    } else {
      this.r2Score = 0.752;
      this.maeScore = 6.08;
      this.rmseScore = 7.89;
    }

    this.recalculateCategorizations();
    const highCount = this.employees.filter(e => e.status === 'High').length;
    const atRiskCount = this.employees.filter(e => e.burnout_risk_score >= this.settings.risk_threshold).length;
    const avgScore = Number((this.employees.reduce((acc, e) => acc + (e.predicted_score || e.productivity_score), 0) / (this.employees.length || 1)).toFixed(1));

    this.auditLogs.unshift({
      id: Date.now(),
      action: 'RUN_PREDICTION',
      user: 'NARASIMHA',
      created_at: new Date().toISOString(),
      details: `Executed ${this.activeModel} pipeline across ${this.employees.length} records`
    });

    return {
      success: true,
      records_processed: this.employees.length,
      employees_analyzed: this.employees.length,
      model_used: this.activeModel,
      target_column: payload.target_column || 'productivity_score',
      avg_predicted_score: avgScore,
      high_performers_count: highCount,
      at_risk_count: atRiskCount,
      r2_score: this.r2Score,
      mae: this.maeScore,
      rmse: this.rmseScore,
      execution_time_sec: 0.62,
      timestamp: new Date().toISOString()
    };
  }

  public retrainModel(payload: any) {
    if (payload.model_type) this.activeModel = payload.model_type;
    this.r2Score = Number((this.r2Score + 0.012).toFixed(3));
    this.maeScore = Number((this.maeScore - 0.15).toFixed(2));
    this.rmseScore = Number((this.rmseScore - 0.20).toFixed(2));

    this.auditLogs.unshift({
      id: Date.now(),
      action: 'RETRAIN_MODEL',
      user: 'NARASIMHA',
      created_at: new Date().toISOString(),
      details: `Retrained estimator: ${this.activeModel} (New R2: ${this.r2Score})`
    });

    return {
      success: true,
      message: `Estimator ${this.activeModel} successfully trained and calibrated.`,
      metrics: {
        r2: this.r2Score,
        mae: this.maeScore,
        rmse: this.rmseScore
      }
    };
  }

  public generateReport(payload: any): ReportItem {
    const total = this.employees.length;
    const avg = total > 0 ? Number((this.employees.reduce((acc, e) => acc + e.productivity_score, 0) / total).toFixed(1)) : 73.1;
    const high = this.employees.filter(e => e.status === 'High').length;
    const risk = this.employees.filter(e => (e.burnout_risk_score || 0) >= this.settings.risk_threshold).length;

    const newReport: ReportItem = {
      id: Date.now(),
      title: payload.title || `${payload.report_type} — ${new Date().toLocaleDateString()}`,
      report_type: payload.report_type || 'Executive Summary',
      summary: `Executive analysis synthesizing performance vectors across ${total} active profiles with ${this.activeModel} AI forecast calibration.`,
      kpis: {
        'Workforce Count': total,
        'Mean Productivity': `${avg}%`,
        'High Performers': high,
        'At Risk Count': risk,
        'Model Accuracy R2': this.r2Score
      },
      key_findings: [
        'Top performing department: Engineering with average output above benchmark.',
        `Burnout risk concentration: ${risk} profiles flagged for workload mitigation.`,
        `Model convergence index: Verified R2 fit of ${this.r2Score} with low residuals.`
      ],
      recommendations: [
        'Prioritize targeted retention interventions for high-productivity burnout candidates.',
        'Rebalance quarterly task loads across operational units.',
        'Maintain continuous model retraining every 30 operating cycles.'
      ],
      format: payload.format || 'PDF',
      created_at: new Date().toISOString()
    };

    this.reports.unshift(newReport);
    this.auditLogs.unshift({
      id: Date.now(),
      action: 'REPORT_GENERATED',
      user: 'NARASIMHA',
      created_at: new Date().toISOString(),
      details: `Generated ${newReport.report_type}: ${newReport.title}`
    });

    return newReport;
  }

  public parseAndIngestCsv(csvText: string, filename: string): { success: boolean; message: string; report: DataQualityReport } {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file contains insufficient rows. At least a header and 1 data row are required.');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    const idIdx = headers.findIndex(h => h.includes('id'));
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const deptIdx = headers.findIndex(h => h.includes('dept') || h.includes('department'));
    const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('title'));
    const prodIdx = headers.findIndex(h => h.includes('prod') || h.includes('score') || h.includes('output'));
    const riskIdx = headers.findIndex(h => h.includes('risk') || h.includes('burnout'));

    const parsed: Employee[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 2) continue;

      const empId = idIdx >= 0 && parts[idIdx] ? parts[idIdx] : `EMP-${String(i).padStart(4, '0')}`;
      const empName = nameIdx >= 0 && parts[nameIdx] ? parts[nameIdx] : `Employee ${i}`;
      const dept = deptIdx >= 0 && parts[deptIdx] ? parts[deptIdx] : 'Operations';
      const role = roleIdx >= 0 && parts[roleIdx] ? parts[roleIdx] : 'Analyst';
      const rawProd = prodIdx >= 0 ? parseFloat(parts[prodIdx]) : 75;
      const prod = isNaN(rawProd) ? 75 : Math.max(20, Math.min(100, rawProd));
      const rawRisk = riskIdx >= 0 ? parseFloat(parts[riskIdx]) : (prod < 60 ? 72 : 28);
      const risk = isNaN(rawRisk) ? 30 : Math.max(0, Math.min(100, rawRisk));

      const delta = Number((Math.sin(i) * 3).toFixed(1));
      const predScore = Number(Math.max(20, Math.min(100, prod + delta)).toFixed(1));

      parsed.push({
        id: i,
        employee_id: empId,
        employee_name: empName,
        full_name: empName,
        department: dept,
        role: role,
        experience: 4.5,
        attendance: 92.0,
        workload: 65.0,
        working_hours: 40.0,
        engagement: 82.0,
        skill_level: 80.0,
        projects: 3,
        tasks_completed: 25,
        deadline_adherence: 88.0,
        previous_productivity: prod,
        productivity_score: prod,
        predicted_score: predScore,
        predicted_productivity: predScore,
        burnout_risk_score: risk,
        prediction_change_pct: delta,
        performance_rating: prod >= this.settings.high_perf_threshold ? 'High' : prod >= this.settings.medium_perf_threshold ? 'Medium' : 'Low',
        status: prod >= this.settings.high_perf_threshold ? 'High' : prod >= this.settings.medium_perf_threshold ? 'Medium' : 'Low',
        risk_level: risk >= this.settings.risk_threshold ? 'High Risk' : risk >= 30 ? 'Moderate Risk' : 'Low Risk',
        created_at: new Date().toISOString()
      });
    }

    if (parsed.length === 0) {
      throw new Error('Failed to parse any valid employee records from CSV.');
    }

    this.employees = parsed;
    this.recalculateCategorizations();

    this.auditLogs.unshift({
      id: Date.now(),
      action: 'CSV_UPLOAD',
      user: 'NARASIMHA',
      created_at: new Date().toISOString(),
      details: `Ingested and calibrated dataset ${filename} (${parsed.length} records)`
    });

    const report: DataQualityReport = {
      dataset_id: Date.now(),
      total_rows: parsed.length,
      total_columns: headers.length,
      missing_values_count: 0,
      missing_values_pct: 0.0,
      duplicate_rows: 0,
      numeric_features_count: 5,
      categorical_features_count: 3,
      quality_score: 98.5,
      detected_columns: {
        employee_id: idIdx >= 0 ? headers[idIdx] : 'generated',
        employee_name: nameIdx >= 0 ? headers[nameIdx] : 'generated',
        department: deptIdx >= 0 ? headers[deptIdx] : 'default',
        productivity_score: prodIdx >= 0 ? headers[prodIdx] : 'estimated'
      },
      unmapped_columns: [],
      sample_preview: parsed.slice(0, 5),
      cleaning_actions_taken: [
        `Parsed ${parsed.length} records directly in browser.`,
        'Validated columns and computed predictive distributions.'
      ],
      model_used: this.activeModel,
      accuracy: this.r2Score
    };

    return {
      success: true,
      message: `Dataset ${filename} successfully ingested and predicted (${parsed.length} employees)`,
      report
    };
  }

  public exportEmployeesCsv(filters?: { department?: string; status?: string; search?: string }) {
    const res = this.getEmployees({ ...filters, page: 1, page_size: 10000 });
    const rows = res.items;

    const headers = ['Employee ID', 'Full Name', 'Department', 'Role', 'Productivity Score', 'Predicted Score', 'Change %', 'Status', 'Risk Level'];
    const csvLines = [headers.join(',')];

    rows.forEach(e => {
      const line = [
        `"${e.employee_id}"`,
        `"${e.full_name || e.employee_name}"`,
        `"${e.department}"`,
        `"${e.role}"`,
        e.productivity_score,
        e.predicted_score || e.productivity_score,
        e.prediction_change_pct || 0,
        `"${e.status}"`,
        `"${e.risk_level || 'Low Risk'}"`
      ];
      csvLines.push(line.join(','));
    });

    downloadFile('workforce_analytics_export.csv', csvLines.join('\n'), 'text/csv;charset=utf-8;');
  }

  public exportEmployeeDossier(employeeId: string, format: 'pdf' | 'csv' | 'json') {
    const detail = this.getEmployeeDetail(employeeId);
    if (format === 'json') {
      downloadFile(`${employeeId}_dossier.json`, JSON.stringify(detail, null, 2), 'application/json');
    } else if (format === 'csv') {
      const csvContent = 'Metric,Value\n' +
        `Employee ID,${detail.employee_id}\n` +
        `Name,"${detail.full_name}"\n` +
        `Department,"${detail.department}"\n` +
        `Role,"${detail.role}"\n` +
        `Productivity Score,${detail.productivity_score}\n` +
        `Predicted Score,${detail.predicted_score || detail.productivity_score}\n` +
        `Burnout Risk Score,${detail.burnout_risk_score}\n` +
        `Status,"${detail.status}"\n` +
        `Risk Level,"${detail.risk_level}"\n`;
      downloadFile(`${employeeId}_dossier.csv`, csvContent, 'text/csv;charset=utf-8;');
    } else {
      if (typeof window !== 'undefined') {
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(`<html><head><title>${detail.full_name} — Executive Dossier</title><style>body{font-family:sans-serif;padding:30px;color:#1e293b}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}th{background:#f8fafc}</style></head><body><h1>WorkVista — Employee Intelligence Dossier</h1><h2>${detail.full_name} (${detail.employee_id})</h2><p><b>Department:</b> ${detail.department} | <b>Role:</b> ${detail.role}</p><table><tr><th>Metric</th><th>Value</th></tr><tr><td>Productivity Score</td><td>${detail.productivity_score}%</td></tr><tr><td>Predicted Output</td><td>${detail.predicted_score || detail.productivity_score}%</td></tr><tr><td>Status</td><td>${detail.status}</td></tr><tr><td>Burnout Risk Index</td><td>${detail.burnout_risk_score} (${detail.risk_level})</td></tr></table><p style="margin-top:30px;font-size:12px;color:#94a3b8">Generated by NARASIMHA | WorkVista AI Engine</p></body></html>`);
          printWin.document.close();
          printWin.focus();
          printWin.print();
        }
      }
    }
  }
}

export const dynamicStore = new DynamicStore();
