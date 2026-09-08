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
    const rawItems = ((mockData as any).employees?.items || []) as any[];
    this.employees = rawItems.map(item => {
      const pred = item.prediction || {};
      const riskScore = item.burnout_risk_score ?? pred.risk_score ?? 20;
      const predProd = item.predicted_productivity ?? item.predicted_score ?? pred.predicted_productivity ?? item.productivity_score;
      const changePct = item.prediction_change_pct ?? pred.change_pct ?? Number((predProd - item.productivity_score).toFixed(1));
      const status = item.status ?? pred.status ?? item.performance_rating ?? (item.productivity_score >= 80 ? 'High' : item.productivity_score >= 50 ? 'Medium' : 'Low');
      const riskLevel = item.risk_level ?? pred.risk_level ?? (riskScore >= 70 ? 'High Risk' : riskScore >= 30 ? 'Moderate Risk' : 'Low Risk');

      return {
        ...item,
        employee_name: item.employee_name || item.full_name || 'Employee',
        full_name: item.full_name || item.employee_name || 'Employee',
        predicted_score: predProd,
        predicted_productivity: predProd,
        prediction_change_pct: changePct,
        burnout_risk_score: riskScore,
        status,
        risk_level: riskLevel,
        prediction: {
          predicted_productivity: predProd,
          change_pct: changePct,
          status,
          risk_level: riskLevel,
          risk_score: riskScore,
          confidence_score: pred.confidence_score || 85
        }
      };
    });
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

      const riskScore = emp.burnout_risk_score ?? (emp as any).prediction?.risk_score ?? 0;
      emp.burnout_risk_score = riskScore;
      if (riskScore >= riskThresh) {
        emp.risk_level = 'High Risk';
      } else if (riskScore >= 30) {
        emp.risk_level = 'Moderate Risk';
      } else {
        emp.risk_level = 'Low Risk';
      }

      if (emp.prediction) {
        emp.prediction.status = emp.status;
        emp.prediction.risk_level = emp.risk_level;
        emp.prediction.risk_score = riskScore;
      }
    });
  }

  public getDashboardData(filters?: {
    department?: string;
    status?: string;
    experience_cohort?: string;
    cohort_grouping?: 'department' | 'experience' | 'workload' | 'attendance';
  }): DashboardData {
    this.recalculateCategorizations();

    // 1. Filter employees
    let activeEmployees = [...this.employees];

    if (filters?.department && filters.department !== 'All Departments' && filters.department !== 'All') {
      activeEmployees = activeEmployees.filter(e => e.department === filters.department);
    }

    if (filters?.status && filters.status !== 'All') {
      activeEmployees = activeEmployees.filter(e => e.status === filters.status);
    }

    if (filters?.experience_cohort && filters.experience_cohort !== 'All') {
      if (filters.experience_cohort.includes('<2')) {
        activeEmployees = activeEmployees.filter(e => e.experience < 2);
      } else if (filters.experience_cohort.includes('2-5')) {
        activeEmployees = activeEmployees.filter(e => e.experience >= 2 && e.experience <= 5);
      } else if (filters.experience_cohort.includes('5-8')) {
        activeEmployees = activeEmployees.filter(e => e.experience > 5 && e.experience <= 8);
      } else if (filters.experience_cohort.includes('>8')) {
        activeEmployees = activeEmployees.filter(e => e.experience > 8);
      }
    }

    const total = activeEmployees.length;
    const allTotal = this.employees.length;
    const avgProd = total > 0 ? Number((activeEmployees.reduce((acc, e) => acc + e.productivity_score, 0) / total).toFixed(1)) : 0;
    const highPerformers = activeEmployees.filter(e => e.status === 'High').length;
    const atRisk = activeEmployees.filter(e => (e.burnout_risk_score || 0) >= this.settings.risk_threshold).length;

    const baseDashboard = JSON.parse(JSON.stringify((mockData as any).dashboard || {}));

    baseDashboard.has_data = allTotal > 0;
    const isFiltered = total !== allTotal;
    const subtitleSuffix = isFiltered ? ` (filtered from ${allTotal})` : '';

    baseDashboard.kpis = {
      total_employees: { 
        value: total, 
        display_value: String(total), 
        change_pct: 0, 
        trend: 'neutral' as const, 
        subtitle: isFiltered ? `Filtered cohort (${total} of ${allTotal})` : `Active workforce records`, 
        sparkline: [] 
      },
      avg_productivity: { 
        value: avgProd, 
        display_value: `${avgProd}%`, 
        change_pct: 1.4, 
        trend: 'up' as const, 
        subtitle: `+1.1 pts vs baseline${subtitleSuffix}`, 
        sparkline: [] 
      },
      high_performers: { 
        value: highPerformers, 
        display_value: String(highPerformers), 
        change_pct: Number(((highPerformers / (total || 1)) * 100).toFixed(1)), 
        trend: 'up' as const, 
        subtitle: `of active workforce`, 
        sparkline: [38, 40, 41, 42, 42.3] 
      },
      at_risk: { 
        value: atRisk, 
        display_value: String(atRisk), 
        change_pct: Number(((atRisk / (total || 1)) * 100).toFixed(1)), 
        trend: atRisk > 10 ? 'down' as const : 'neutral' as const, 
        subtitle: `critical flight risk`, 
        sparkline: [12, 10, 9, 8.5] 
      },
      predicted_improvement: {
        value: activeEmployees.filter(e => (e.predicted_score || e.predicted_productivity || e.productivity_score) > e.productivity_score).length,
        display_value: String(activeEmployees.filter(e => (e.predicted_score || e.predicted_productivity || e.productivity_score) > e.productivity_score).length),
        change_pct: Number(((activeEmployees.filter(e => (e.predicted_score || e.predicted_productivity || e.productivity_score) > e.productivity_score).length / (total || 1)) * 100).toFixed(1)),
        trend: 'up' as const,
        subtitle: `projected upward trend`,
        sparkline: [95, 102, 108, 112]
      },
      predicted_decline: {
        value: activeEmployees.filter(e => (e.predicted_score || e.predicted_productivity || e.productivity_score) < e.productivity_score).length,
        display_value: String(activeEmployees.filter(e => (e.predicted_score || e.predicted_productivity || e.productivity_score) < e.productivity_score).length),
        change_pct: Number(((activeEmployees.filter(e => (e.predicted_score || e.predicted_productivity || e.productivity_score) < e.productivity_score).length / (total || 1)) * 100).toFixed(1)),
        trend: 'down' as const,
        subtitle: `targeted intervention`,
        sparkline: [48, 42, 38, 36]
      }
    };

    const mediumCount = activeEmployees.filter(e => e.status === 'Medium').length;
    const lowCount = activeEmployees.filter(e => e.status === 'Low').length;

    baseDashboard.productivity_distribution = [
      { name: `High (>= ${this.settings.high_perf_threshold}%)`, count: highPerformers, percentage: Number(((highPerformers / (total || 1)) * 100).toFixed(1)), color: '#10B981' },
      { name: `Medium (${this.settings.medium_perf_threshold}-${this.settings.high_perf_threshold - 1}%)`, count: mediumCount, percentage: Number(((mediumCount / (total || 1)) * 100).toFixed(1)), color: '#3B82F6' },
      { name: `Low (< ${this.settings.medium_perf_threshold}%)`, count: lowCount, percentage: Number(((lowCount / (total || 1)) * 100).toFixed(1)), color: '#EF4444' }
    ];
    baseDashboard.distribution_total = total;

    // 2. Dynamic Actual vs Predicted by Cohort
    const grouping = filters?.cohort_grouping || 'department';
    let cohortSeries: { label: string; actual: number; predicted: number; count: number; delta: number }[] = [];

    const cohortSource = total > 0 ? activeEmployees : this.employees;

    if (grouping === 'department') {
      const depts = ['Engineering', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales'];
      cohortSeries = depts.map(d => {
        const emps = cohortSource.filter(e => e.department === d);
        const count = emps.length;
        const act = count ? emps.reduce((a, e) => a + e.productivity_score, 0) / count : 0;
        const pred = count ? emps.reduce((a, e) => a + (e.predicted_score || e.predicted_productivity || e.productivity_score), 0) / count : 0;
        return {
          label: d,
          actual: Number(act.toFixed(1)),
          predicted: Number(pred.toFixed(1)),
          count,
          delta: Number((pred - act).toFixed(1))
        };
      }).filter(item => item.count > 0 || !filters?.department || filters.department === 'All');
    } else if (grouping === 'experience') {
      const expRanges = [
        { label: 'Junior (<2y)', filter: (e: Employee) => e.experience < 2 },
        { label: 'Mid-level (2-5y)', filter: (e: Employee) => e.experience >= 2 && e.experience <= 5 },
        { label: 'Senior (5-8y)', filter: (e: Employee) => e.experience > 5 && e.experience <= 8 },
        { label: 'Lead (>8y)', filter: (e: Employee) => e.experience > 8 }
      ];
      cohortSeries = expRanges.map(r => {
        const emps = cohortSource.filter(r.filter);
        const count = emps.length;
        const act = count ? emps.reduce((a, e) => a + e.productivity_score, 0) / count : 0;
        const pred = count ? emps.reduce((a, e) => a + (e.predicted_score || e.predicted_productivity || e.productivity_score), 0) / count : 0;
        return {
          label: r.label,
          actual: Number(act.toFixed(1)),
          predicted: Number(pred.toFixed(1)),
          count,
          delta: Number((pred - act).toFixed(1))
        };
      });
    } else if (grouping === 'workload') {
      const wlRanges = [
        { label: 'Light (<55)', filter: (e: Employee) => e.workload < 55 },
        { label: 'Optimal (55-70)', filter: (e: Employee) => e.workload >= 55 && e.workload <= 70 },
        { label: 'Heavy (>70)', filter: (e: Employee) => e.workload > 70 }
      ];
      cohortSeries = wlRanges.map(r => {
        const emps = cohortSource.filter(r.filter);
        const count = emps.length;
        const act = count ? emps.reduce((a, e) => a + e.productivity_score, 0) / count : 0;
        const pred = count ? emps.reduce((a, e) => a + (e.predicted_score || e.predicted_productivity || e.productivity_score), 0) / count : 0;
        return {
          label: r.label,
          actual: Number(act.toFixed(1)),
          predicted: Number(pred.toFixed(1)),
          count,
          delta: Number((pred - act).toFixed(1))
        };
      });
    } else if (grouping === 'attendance') {
      const attRanges = [
        { label: 'High (>90%)', filter: (e: Employee) => e.attendance > 90 },
        { label: 'Standard (80-90%)', filter: (e: Employee) => e.attendance >= 80 && e.attendance <= 90 },
        { label: 'Irregular (<80%)', filter: (e: Employee) => e.attendance < 80 }
      ];
      cohortSeries = attRanges.map(r => {
        const emps = cohortSource.filter(r.filter);
        const count = emps.length;
        const act = count ? emps.reduce((a, e) => a + e.productivity_score, 0) / count : 0;
        const pred = count ? emps.reduce((a, e) => a + (e.predicted_score || e.predicted_productivity || e.productivity_score), 0) / count : 0;
        return {
          label: r.label,
          actual: Number(act.toFixed(1)),
          predicted: Number(pred.toFixed(1)),
          count,
          delta: Number((pred - act).toFixed(1))
        };
      });
    }

    baseDashboard.actual_vs_predicted = cohortSeries;

    // 3. Department Productivity
    const deptsAll = ['Engineering', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales'];
    baseDashboard.department_productivity = deptsAll.map(d => {
      const emps = this.employees.filter(e => e.department === d);
      const act = emps.length ? emps.reduce((a, e) => a + e.productivity_score, 0) / emps.length : 0;
      const pred = emps.length ? emps.reduce((a, e) => a + (e.predicted_score || e.productivity_score), 0) / emps.length : 0;
      return {
        department: d,
        actual: Number(act.toFixed(1)),
        predicted: Number(pred.toFixed(1))
      };
    });

    baseDashboard.prediction_engine = {
      ...baseDashboard.prediction_engine,
      model_name: this.activeModel,
      model_type: this.activeModel,
      r2_score: this.r2Score,
      mae: this.maeScore,
      rmse: this.rmseScore,
      status: 'Active',
      dataset_size: allTotal,
      training_period: `Single period snapshot (${allTotal} records)`,
      last_updated: 'Updated just now'
    };

    // 4. Workforce Health Score
    const avgEng = Number((activeEmployees.reduce((a, e) => a + (e.engagement || 75), 0) / (total || 1)).toFixed(1));
    const avgAtt = Number((activeEmployees.reduce((a, e) => a + (e.attendance || 90), 0) / (total || 1)).toFixed(1));
    const avgWlBal = Number((activeEmployees.reduce((a, e) => {
      const wl = e.workload || 40;
      const dev = wl > 55 ? (wl - 55) * 1.4 : wl < 30 ? (30 - wl) * 1.2 : 0;
      return a + Math.max(50, Math.min(100, 92 - dev));
    }, 0) / (total || 1)).toFixed(1));
    const riskPct = Number(((atRisk / (total || 1)) * 100).toFixed(1));
    const healthNum = Math.round(avgProd * 0.35 + avgEng * 0.25 + avgAtt * 0.20 + avgWlBal * 0.10 + (100 - riskPct) * 0.10);
    const healthStatus = healthNum >= 85 ? 'Excellent' : healthNum >= 75 ? 'Healthy' : healthNum >= 60 ? 'Watch' : 'Critical';

    baseDashboard.workforce_health = {
      score: healthNum,
      status: healthStatus,
      breakdown: {
        productivity: avgProd,
        engagement: avgEng,
        attendance: avgAtt,
        workload_balance: avgWlBal,
        risk_level_pct: riskPct,
        risk_level_label: riskPct < 15 ? 'Low' : riskPct < 30 ? 'Moderate' : 'High'
      }
    };

    // 5. Dynamic Executive Summary
    const nonDecliningPct = Number((((total - (baseDashboard.kpis?.predicted_decline?.value || 0)) / (total || 1)) * 100).toFixed(1));
    baseDashboard.executive_summary = `Workforce productivity is stable with ${Math.round(avgProd)}% average output. ${nonDecliningPct}% of employees are predicted to maintain or improve performance. Engineering leads organizational velocity.`;

    // 6. Risk vs Performance Matrix Coordinates
    baseDashboard.risk_matrix = activeEmployees.map(e => {
      const predProd = e.predicted_score || e.predicted_productivity || e.productivity_score;
      const riskScore = e.burnout_risk_score || 0;
      let rLevel = 'Low';
      if (riskScore >= 70) rLevel = 'Critical';
      else if (riskScore >= 50) rLevel = 'High';
      else if (riskScore >= 30) rLevel = 'Moderate';
      return {
        id: e.id,
        employee_id: e.employee_id,
        employee_name: e.full_name || e.employee_name,
        department: e.department,
        role: e.role || 'Specialist',
        productivity: Number(e.productivity_score.toFixed(1)),
        risk_score: Number(riskScore.toFixed(1)),
        risk_level: rLevel,
        predicted: Number(predProd.toFixed(1))
      };
    });

    baseDashboard.active_dataset_name = 'WorkVista Enterprise Demo (520 Employees)';
    baseDashboard.active_model_name = `${this.activeModel} (v1.2)`;
    baseDashboard.model_status = 'AI Model Active';
    baseDashboard.last_refresh = 'Sep 15, 2026 10:24 AM';

    baseDashboard.recent_employees = activeEmployees.slice(0, 10).map(e => {
      const predProd = e.predicted_score || e.predicted_productivity || e.productivity_score;
      const changePct = e.prediction_change_pct ?? Number((predProd - e.productivity_score).toFixed(1));
      const riskScore = e.burnout_risk_score || 0;
      let status: 'High' | 'Medium' | 'At Risk' = 'Medium';
      if (e.productivity_score >= this.settings.high_perf_threshold) status = 'High';
      else if (riskScore >= this.settings.risk_threshold) status = 'At Risk';
      let rLevel = 'Low';
      if (riskScore >= 70) rLevel = 'High';
      else if (riskScore >= 30) rLevel = 'Moderate';

      return {
        id: e.id,
        employee_id: e.employee_id,
        employee_name: e.full_name || e.employee_name,
        department: e.department,
        role: e.role || 'Specialist',
        current_productivity: Number(e.productivity_score.toFixed(1)),
        predicted_productivity: Number(predProd.toFixed(1)),
        change_pct: Number(changePct.toFixed(1)),
        status,
        risk_score: Number(riskScore.toFixed(1)),
        confidence_score: 91,
        last_updated: '15 Sep 2026'
      };
    });
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

    if (payload.model_type) {
      this.setModel(payload.model_type);
    }

    this.recalculateCategorizations();
    const highCount = this.employees.filter(e => e.status === 'High').length;
    const atRiskCount = this.employees.filter(e => (e.burnout_risk_score || 0) >= this.settings.risk_threshold).length;
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

  public setModel(modelName: string) {
    this.activeModel = modelName;
    if (modelName === 'GradientBoosting') {
      this.r2Score = 0.782;
      this.maeScore = 2.05;
      this.rmseScore = 2.54;
    } else if (modelName === 'LinearRidge') {
      this.r2Score = 0.715;
      this.maeScore = 2.65;
      this.rmseScore = 3.15;
    } else {
      this.activeModel = 'RandomForest';
      this.r2Score = 0.748;
      this.maeScore = 2.30;
      this.rmseScore = 2.82;
    }

    this.employees.forEach(emp => {
      let delta = 0;
      if (modelName === 'GradientBoosting') {
        delta = (emp.experience * 0.15) + (emp.attendance * 0.015) - 1.2;
      } else if (modelName === 'LinearRidge') {
        delta = (emp.workload * 0.03) - 1.8;
      } else {
        delta = Number((Math.sin(emp.id) * 1.5).toFixed(1));
      }
      const newPred = Math.max(25, Math.min(100, Number((emp.productivity_score + delta).toFixed(1))));
      emp.predicted_productivity = newPred;
      emp.predicted_score = newPred;
      emp.prediction_change_pct = Number((newPred - emp.productivity_score).toFixed(1));
      if (emp.prediction) {
        emp.prediction.predicted_productivity = newPred;
        emp.prediction.change_pct = emp.prediction_change_pct;
      }
    });

    this.auditLogs.unshift({
      id: Date.now(),
      action: 'MODEL_SWITCH',
      user: 'NARASIMHA',
      created_at: new Date().toISOString(),
      details: `Active estimator switched to ${this.activeModel} (Calibrated R2: ${this.r2Score})`
    });
  }

  public retrainModel(payload: any) {
    if (payload.model_type) this.setModel(payload.model_type);
    this.r2Score = Number(Math.min(0.92, this.r2Score + 0.015).toFixed(3));
    this.maeScore = Number(Math.max(1.5, this.maeScore - 0.12).toFixed(2));
    this.rmseScore = Number(Math.max(2.0, this.rmseScore - 0.15).toFixed(2));

    this.auditLogs.unshift({
      id: Date.now(),
      action: 'RETRAIN_MODEL',
      user: 'NARASIMHA',
      created_at: new Date().toISOString(),
      details: `Retrained and recalibrated estimator: ${this.activeModel} (New R2: ${this.r2Score}, MAE: ${this.maeScore})`
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
        prediction: {
          predicted_productivity: predScore,
          change_pct: delta,
          status: prod >= this.settings.high_perf_threshold ? 'High' : prod >= this.settings.medium_perf_threshold ? 'Medium' : 'Low',
          risk_level: risk >= this.settings.risk_threshold ? 'High Risk' : risk >= 30 ? 'Moderate Risk' : 'Low Risk',
          risk_score: risk,
          confidence_score: 85
        },
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

  public getNotifications() {
    return [
      {
        id: 1,
        title: 'Dataset Calibrated',
        message: 'WorkVista Enterprise Demo active with 520 verified employee profiles.',
        category: 'success',
        is_read: false,
        timestamp: '15 Sep 2026, 10:24 AM'
      },
      {
        id: 2,
        title: 'High Risk Alert',
        message: '44 employees flagged in elevated risk tier. One-on-one review sessions recommended.',
        category: 'risk',
        is_read: false,
        timestamp: '15 Sep 2026, 09:15 AM'
      },
      {
        id: 3,
        title: 'AI Prediction Model Ready',
        message: `Active model (${this.activeModel}) recalibrated with R² = ${this.r2Score.toFixed(3)}.`,
        category: 'info',
        is_read: false,
        timestamp: '14 Sep 2026, 04:30 PM'
      }
    ];
  }

  public getDatasets() {
    return [
      {
        id: 1,
        filename: 'workvista_enterprise_demo.csv',
        original_name: 'WorkVista Enterprise Demo (520 Employees)',
        row_count: 520,
        column_count: 15,
        quality_score: 98.4,
        has_dates: false,
        training_period_str: 'Single period snapshot (520 records)',
        is_active: true,
        uploaded_at: '15 Sep 2026, 10:20 AM'
      },
      {
        id: 2,
        filename: 'q2_engineering_workforce.csv',
        original_name: 'Q2 Engineering Workforce Benchmark',
        row_count: 140,
        column_count: 14,
        quality_score: 96.2,
        has_dates: false,
        training_period_str: 'Q2 Cohort snapshot',
        is_active: false,
        uploaded_at: '01 Aug 2026, 02:15 PM'
      }
    ];
  }

  public addTask(employeeId: string, task: { title: string; task_type?: string; due_date?: string }) {
    if (!this.tasks[employeeId]) this.tasks[employeeId] = [];
    const newTask = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      employee_id: employeeId,
      title: task.title || 'Review',
      task_type: task.task_type || 'Review',
      status: 'Pending',
      due_date: task.due_date || '30 Sep 2026'
    };
    this.tasks[employeeId].push(newTask);
    return newTask;
  }

  public addNote(employeeId: string, content: string) {
    if (!this.notes[employeeId]) this.notes[employeeId] = [];
    const newNote = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      employee_id: employeeId,
      author: 'NARASIMHA',
      content,
      created_at: new Date().toISOString()
    };
    this.notes[employeeId].unshift(newNote);
    return newNote;
  }

  public addAuditLog(action: string, details: string) {
    const log: AuditLogItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      action,
      user: 'NARASIMHA',
      details,
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    return log;
  }

  public bulkAssignReview(employeeIds: string[], taskTitle: string): { success: boolean; count: number } {
    employeeIds.forEach(empId => {
      this.addTask(empId, {
        title: taskTitle || 'Scheduled Performance Review',
        task_type: 'Review',
        due_date: '30 Sep 2026'
      });
    });
    this.addAuditLog('BULK_REVIEW_ASSIGNED', `Assigned review '${taskTitle}' to ${employeeIds.length} employees.`);
    return { success: true, count: employeeIds.length };
  }

  public bulkAddNote(employeeIds: string[], content: string): { success: boolean; count: number } {
    employeeIds.forEach(empId => {
      this.addNote(empId, content);
    });
    this.addAuditLog('BULK_NOTE_ADDED', `Added note to ${employeeIds.length} employees.`);
    return { success: true, count: employeeIds.length };
  }

  public bulkFlagEmployees(employeeIds: string[], reason: string): { success: boolean; count: number } {
    employeeIds.forEach(empId => {
      const emp = this.employees.find(e => e.employee_id === empId);
      if (emp) {
        emp.burnout_risk_score = Math.max(emp.burnout_risk_score || 0, 75);
        emp.risk_level = 'High';
      }
    });
    this.addAuditLog('BULK_EMPLOYEES_FLAGGED', `Flagged ${employeeIds.length} employees: ${reason}.`);
    return { success: true, count: employeeIds.length };
  }
}

export const dynamicStore = new DynamicStore();
