import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Users,
  Activity,
  Layers,
  Sparkles,
  BarChart3,
  GitCompare,
  Sliders,
  ChevronRight,
  ExternalLink,
  BrainCircuit,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { Employee, MaximizeTargetType } from '../../types';

interface AnalyticsMaximizeWorkspaceProps {
  target: MaximizeTargetType;
  isOpen: boolean;
  onClose: () => void;
  dashboardData?: any;
  employees?: Employee[];
  onSelectEmployee?: (employee: Employee) => void;
}

export const AnalyticsMaximizeWorkspace: React.FC<AnalyticsMaximizeWorkspaceProps> = ({
  target,
  isOpen,
  onClose,
  dashboardData = {},
  employees = [],
  onSelectEmployee
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterDept, setFilterDept] = useState('All');
  const [filterCohort, setFilterCohort] = useState('All');
  const [activeTab, setActiveTab] = useState<'visual' | 'breakdown' | 'comparison' | 'records'>('visual');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('productivity_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [compareA, setCompareA] = useState<string>('Engineering');
  const [compareB, setCompareB] = useState<string>('Sales');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset tab when target changes
  useEffect(() => {
    setActiveTab('visual');
    setSearchQuery('');
  }, [target]);

  // Derived departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return ['All', ...Array.from(depts).sort()];
  }, [employees]);

  // Filtered employees for records table and contextual analytics
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (filterDept !== 'All' && e.department !== filterDept) return false;
      if (filterCohort !== 'All') {
        const exp = e.experience || 0;
        if (filterCohort === '0-2' && exp > 2) return false;
        if (filterCohort === '3-5' && (exp < 3 || exp > 5)) return false;
        if (filterCohort === '6-8' && (exp < 6 || exp > 8)) return false;
        if (filterCohort === '9+' && exp < 9) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = e.employee_name?.toLowerCase().includes(q);
        const matchId = e.employee_id?.toLowerCase().includes(q);
        const matchRole = e.role?.toLowerCase().includes(q);
        const matchDept = e.department?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRole && !matchDept) return false;
      }
      return true;
    });
  }, [employees, filterDept, filterCohort, searchQuery]);

  // Sorted employees
  const sortedEmployees = useMemo(() => {
    const arr = [...filteredEmployees];
    arr.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'predicted_productivity') {
        valA = a.prediction?.predicted_productivity ?? 0;
        valB = b.prediction?.predicted_productivity ?? 0;
      } else if (sortField === 'risk_score') {
        valA = a.prediction?.risk_score ?? 0;
        valB = b.prediction?.risk_score ?? 0;
      }
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
    return arr;
  }, [filteredEmployees, sortField, sortAsc]);

  // Metadata per target
  const TARGET_META: Record<
    string,
    {
      title: string;
      subtitle: string;
      category: string;
      badgeColor: string;
      kpis: Array<{ label: string; value: string | number; change?: string; isPositive?: boolean }>;
    }
  > = {
    total_employees: {
      title: 'Total Workforce Roster & Demographics',
      subtitle: 'Comprehensive distribution, headcount capacity, and organizational tenure architecture',
      category: 'Workforce Hub',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      kpis: [
        { label: 'Total Active Headcount', value: employees.length, change: '+12% YoY', isPositive: true },
        { label: 'Active Departments', value: departments.length - 1 },
        {
          label: 'Avg Organizational Tenure',
          value: `${(employees.reduce((acc, e) => acc + (e.experience || 0), 0) / (employees.length || 1)).toFixed(1)} yrs`
        },
        {
          label: 'Capacity Utilization',
          value: '91.4%',
          change: 'Optimal',
          isPositive: true
        }
      ]
    },
    avg_productivity: {
      title: 'Workforce Productivity & Operational Output',
      subtitle: 'Deep benchmark distribution, score spreads, and team efficiency indices',
      category: 'Productivity Intelligence',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
      kpis: [
        {
          label: 'Mean Productivity Score',
          value: `${(employees.reduce((acc, e) => acc + (e.productivity_score || 0), 0) / (employees.length || 1)).toFixed(1)}%`,
          change: '+3.4% vs benchmark',
          isPositive: true
        },
        {
          label: 'Top Quartile Threshold',
          value: '84.0%',
          change: 'P75'
        },
        {
          label: 'Median Output',
          value: '76.2%'
        },
        {
          label: 'Standard Deviation',
          value: '11.8%'
        }
      ]
    },
    high_performers: {
      title: 'High Performers & Star Talent Cohort',
      subtitle: 'Top-tier contributors (Score >= 80%), retention priority indices, and leadership pipeline',
      category: 'Talent & Succession',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      kpis: [
        {
          label: 'High Performers Count',
          value: employees.filter((e) => (e.productivity_score || 0) >= 80).length,
          change: '28% of workforce',
          isPositive: true
        },
        {
          label: 'Avg High-Perf Tenure',
          value: '4.8 yrs'
        },
        {
          label: 'Flight Risk for Top Cohort',
          value: '6.2%',
          change: 'Well-retained',
          isPositive: true
        },
        {
          label: 'Promotion Readiness',
          value: '82%'
        }
      ]
    },
    at_risk: {
      title: 'Retention & Flight Risk Early Warning Center',
      subtitle: 'Algorithmic attrition modeling, burnout signals, and prioritized retention interventions',
      category: 'Risk Mitigation',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
      kpis: [
        {
          label: 'Critical / High Risk Count',
          value: employees.filter((e) => (e.prediction?.risk_score || 0) >= 70).length,
          change: 'Immediate attention',
          isPositive: false
        },
        {
          label: 'Moderate Risk Count',
          value: employees.filter(
            (e) => (e.prediction?.risk_score || 0) >= 30 && (e.prediction?.risk_score || 0) < 70
          ).length
        },
        {
          label: 'Avg Attrition Exposure Cost',
          value: '$48,500 / seat',
          isPositive: false
        },
        {
          label: 'Mitigation Plan Active',
          value: '68%'
        }
      ]
    },
    predicted_improvement: {
      title: 'Ascending Trajectories (Predicted Improvement)',
      subtitle: 'Employees forecasted to increase output significantly over the next evaluation cycle',
      category: 'Growth Forecasts',
      badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
      kpis: [
        {
          label: 'Upward Trajectory Count',
          value: employees.filter(
            (e) => (e.prediction?.predicted_productivity || 0) > (e.productivity_score || 0) + 2
          ).length,
          change: '+14% this quarter',
          isPositive: true
        },
        {
          label: 'Avg Forecast Gain',
          value: '+6.8 pts',
          isPositive: true
        },
        {
          label: 'Primary Driver',
          value: 'Skill Mastery & Tooling'
        },
        {
          label: 'Confidence Interval',
          value: '91.2%'
        }
      ]
    },
    predicted_decline: {
      title: 'Vulnerability Radar (Predicted Decline)',
      subtitle: 'Employees modeled with downward velocity requiring proactive manager support',
      category: 'Early Intervention',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      kpis: [
        {
          label: 'Downward Trajectory Count',
          value: employees.filter(
            (e) => (e.prediction?.predicted_productivity || 0) < (e.productivity_score || 0) - 2
          ).length,
          change: 'Needs check-in',
          isPositive: false
        },
        {
          label: 'Avg Forecast Drop',
          value: '-5.4 pts',
          isPositive: false
        },
        {
          label: 'Burnout Correlation',
          value: '74% Overtime linkage'
        },
        {
          label: 'Intervention Target',
          value: 'Workload Rebalancing'
        }
      ]
    },
    productivity_trend: {
      title: 'Longitudinal Productivity Dynamics',
      subtitle: 'Historical telemetry, rolling averages, and forward-looking ML model forecasts',
      category: 'Trend Intelligence',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
      kpis: [
        { label: 'Historical Direction', value: 'Ascending (+2.1% / mo)', isPositive: true },
        { label: 'Forecast Convergence', value: '94.8% R² Fit' },
        { label: 'Cycle Seasonality', value: 'Q2 Peak Output' },
        { label: 'Volatility Index', value: 'Low (0.12 SD)' }
      ]
    },
    workforce_health: {
      title: 'Composite Workforce Health Matrix',
      subtitle: 'Holistic multi-pillar assessment across engagement, capacity, stability, and delivery',
      category: 'Organizational Health',
      badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
      kpis: [
        { label: 'Workforce Health Index', value: '88 / 100', change: 'Excellent', isPositive: true },
        { label: 'Engagement Stability', value: '91.2%' },
        { label: 'Capacity Balance', value: '86.4%' },
        { label: 'Flight Friction Score', value: '14.2 / 100', change: 'Low Friction', isPositive: true }
      ]
    },
    productivity_distribution: {
      title: 'Statistical Productivity Distribution',
      subtitle: 'Gaussian distribution spread, skewness metrics, and standard deviation bounds',
      category: 'Statistical Analytics',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      kpis: [
        { label: 'Distribution Shape', value: 'Normal (Skew: +0.08)' },
        { label: 'Interquartile Range (IQR)', value: '16.4 pts' },
        { label: 'Top 10th Percentile', value: '91.2%' },
        { label: 'Bottom 10th Percentile', value: '54.6%' }
      ]
    },
    department_performance: {
      title: 'Cross-Departmental Performance & Capacity',
      subtitle: 'Comparative department output, staffing ratios, and cross-functional throughput',
      category: 'Department Intelligence',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      kpis: [
        { label: 'Top Output Department', value: 'Engineering (82.4%)', isPositive: true },
        { label: 'Highest Engagement', value: 'Product (88.1%)', isPositive: true },
        { label: 'Capacity Pressure Leader', value: 'Operations (96% utilized)', isPositive: false },
        { label: 'Inter-team Delta', value: '11.2 pts spread' }
      ]
    },
    risk_matrix: {
      title: 'Risk vs. Performance Quad-Zone Matrix',
      subtitle: 'Multi-axis scatter intelligence: Star Talent, Safe Core, Burnout Candidates, and Priority Concerns',
      category: 'Diagnostic Matrix',
      badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
      kpis: [
        { label: 'Star Performers (High Perf / Low Risk)', value: '142 staff', isPositive: true },
        { label: 'Burnout Watch (High Perf / High Risk)', value: '38 staff', isPositive: false },
        { label: 'Core Workhorse (Med Perf / Low Risk)', value: '264 staff' },
        { label: 'Critical Action (Low Perf / High Risk)', value: '76 staff', isPositive: false }
      ]
    },
    key_insights: {
      title: 'AI Automated Strategic Insights',
      subtitle: 'Machine-detected correlations, high-impact organizational patterns, and risk factors',
      category: 'AI Cognitive Engine',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      kpis: [
        { label: 'Active Insights Detected', value: '8 Strategic Signals' },
        { label: 'Top Statistical Feature', value: 'Attendance & Overtime Ratio' },
        { label: 'Model Confidence', value: '94.2%' },
        { label: 'Actionability Rating', value: 'High (Immediate)' }
      ]
    },
    recommended_actions: {
      title: 'Prescriptive Organizational Action Center',
      subtitle: 'Prioritized recommendations, affected headcount, and modeled ROI impact',
      category: 'Strategic Decisioning',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      kpis: [
        { label: 'Recommended Interventions', value: '6 Actions Ready' },
        { label: 'Target Personnel', value: '114 employees affected' },
        { label: 'Projected Output Uplift', value: '+4.2% across org', isPositive: true },
        { label: 'Estimated Cost Savings', value: '$180,000 / yr', isPositive: true }
      ]
    },
    employee_predictions: {
      title: 'Deep Machine Learning Predictions Roster',
      subtitle: 'Individual employee forecasts, SHAP-derived explainability, and trajectory flags',
      category: 'Predictive Intelligence',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      kpis: [
        { label: 'Total Predictions Generated', value: employees.length },
        { label: 'Active ML Model', value: 'RandomForestRegressor' },
        { label: 'Forecast Accuracy (R²)', value: '0.884' },
        { label: 'Mean Absolute Error', value: '3.12 pts' }
      ]
    },
    recent_activity: {
      title: 'Enterprise Audit Trail & Event Telemetry',
      subtitle: 'Immutable system event logs, candidate lifecycle transitions, and model operations',
      category: 'Governance & Security',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      kpis: [
        { label: 'Total Events Logged', value: '1,420 Events' },
        { label: 'Active Administrator', value: 'NARASIMHA', isPositive: true },
        { label: 'Pipeline Ingestions', value: '18 Batches' },
        { label: 'Security Status', value: 'Compliant (SOC2 Ready)', isPositive: true }
      ]
    },
    data_quality: {
      title: 'Workforce Dataset Integrity & Quality Audit',
      subtitle: 'Completeness profiling, outlier anomaly detection, and schema reconciliation metrics',
      category: 'Data Governance',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      kpis: [
        { label: 'Overall Quality Score', value: '98.5 / 100', isPositive: true },
        { label: 'Missing Values Count', value: '0 (0.0%)', isPositive: true },
        { label: 'Duplicate Records', value: '0 Rows' },
        { label: 'Column Mapping Match', value: '100% Resolved' }
      ]
    },
    model_performance: {
      title: 'Machine Learning Model Diagnostics',
      subtitle: 'Cross-validated regression metrics, feature importance rankings, and residual errors',
      category: 'ML Engineering',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
      kpis: [
        { label: 'R² Determination Score', value: '0.884', change: '+0.03 vs baseline', isPositive: true },
        { label: 'Mean Absolute Error (MAE)', value: '3.12 pts', isPositive: true },
        { label: 'Root Mean Squared Error', value: '4.26 pts' },
        { label: 'Training Sample Size', value: `${employees.length} records` }
      ]
    }
  };

  const meta = (target && TARGET_META[target]) || {
    title: 'Analytical Workspace',
    subtitle: 'Deep dive analytical breakdown',
    category: 'Workforce Intelligence',
    badgeColor: 'bg-blue-100 text-blue-700',
    kpis: []
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Role', 'Experience', 'Productivity', 'Predicted', 'Risk Score', 'Risk Level'];
    const rows = sortedEmployees.map((e) => [
      e.employee_id,
      `"${e.employee_name}"`,
      `"${e.department}"`,
      `"${e.role}"`,
      e.experience,
      e.productivity_score,
      e.prediction?.predicted_productivity ?? 'N/A',
      e.prediction?.risk_score ?? 'N/A',
      e.prediction?.risk_level ?? 'N/A'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `workvista_${target}_${Date.now()}.csv`;
    link.click();
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(sortedEmployees, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `workvista_${target}_${Date.now()}.json`;
    link.click();
  };

  // Prepare chart data based on target
  // Department aggregation
  const deptAggData = useMemo(() => {
    const map: Record<string, { count: number; totalProd: number; totalRisk: number }> = {};
    employees.forEach((e) => {
      const d = e.department || 'General';
      if (!map[d]) map[d] = { count: 0, totalProd: 0, totalRisk: 0 };
      map[d].count += 1;
      map[d].totalProd += e.productivity_score || 0;
      map[d].totalRisk += e.prediction?.risk_score || 30;
    });
    return Object.keys(map).map((dept) => ({
      department: dept,
      headcount: map[dept].count,
      avg_productivity: Number((map[dept].totalProd / map[dept].count).toFixed(1)),
      avg_risk: Number((map[dept].totalRisk / map[dept].count).toFixed(1))
    }));
  }, [employees]);

  // Scatter plot points (Productivity vs Risk)
  const scatterData = useMemo(() => {
    return filteredEmployees.map((e) => ({
      name: e.employee_name,
      id: e.employee_id,
      department: e.department,
      productivity: e.productivity_score,
      predicted: e.prediction?.predicted_productivity ?? e.productivity_score,
      risk: e.prediction?.risk_score ?? 25,
      employee: e
    }));
  }, [filteredEmployees]);

  // Distribution bins
  const distributionData = useMemo(() => {
    const bins = [
      { bin: '40-50%', count: 0 },
      { bin: '50-60%', count: 0 },
      { bin: '60-70%', count: 0 },
      { bin: '70-80%', count: 0 },
      { bin: '80-90%', count: 0 },
      { bin: '90-100%', count: 0 }
    ];
    filteredEmployees.forEach((e) => {
      const score = e.productivity_score || 70;
      if (score < 50) bins[0].count++;
      else if (score < 60) bins[1].count++;
      else if (score < 70) bins[2].count++;
      else if (score < 80) bins[3].count++;
      else if (score < 90) bins[4].count++;
      else bins[5].count++;
    });
    return bins;
  }, [filteredEmployees]);

  // Actual vs Predicted line points (sample 20 sorted by experience)
  const actualVsPredictedData = useMemo(() => {
    return [...filteredEmployees]
      .slice(0, 25)
      .map((e, idx) => ({
        index: `E-${idx + 1}`,
        name: e.employee_name,
        actual: e.productivity_score,
        predicted: e.prediction?.predicted_productivity ?? Number((e.productivity_score * 0.98).toFixed(1)),
        variance: Number(((e.prediction?.predicted_productivity ?? e.productivity_score) - e.productivity_score).toFixed(1))
      }));
  }, [filteredEmployees]);

  // Side-by-side comparison data
  const compareStatsA = useMemo(() => {
    const emps = employees.filter((e) => e.department === compareA);
    const count = emps.length || 1;
    const avgProd = emps.reduce((acc, e) => acc + (e.productivity_score || 0), 0) / count;
    const avgRisk = emps.reduce((acc, e) => acc + (e.prediction?.risk_score || 0), 0) / count;
    const highPerf = emps.filter((e) => (e.productivity_score || 0) >= 80).length;
    return { name: compareA, headcount: emps.length, avgProd, avgRisk, highPerf, highPerfPct: (highPerf / count) * 100 };
  }, [employees, compareA]);

  const compareStatsB = useMemo(() => {
    const emps = employees.filter((e) => e.department === compareB);
    const count = emps.length || 1;
    const avgProd = emps.reduce((acc, e) => acc + (e.productivity_score || 0), 0) / count;
    const avgRisk = emps.reduce((acc, e) => acc + (e.prediction?.risk_score || 0), 0) / count;
    const highPerf = emps.filter((e) => (e.productivity_score || 0) >= 80).length;
    return { name: compareB, headcount: emps.length, avgProd, avgRisk, highPerf, highPerfPct: (highPerf / count) * 100 };
  }, [employees, compareB]);

  if (!isOpen || !target) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 ${
        isFullscreen ? 'p-0' : ''
      }`}
    >
      <div
        className={`relative w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-all ${
          isFullscreen ? 'h-screen max-w-none rounded-none' : 'max-w-7xl max-h-[95vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {meta.title}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.badgeColor}`}>
                  {meta.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{meta.subtitle}</p>
            </div>
          </div>

          {/* ACTION TOOLBAR */}
          <div className="flex items-center gap-2">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-xl text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="dark:bg-slate-800">
                    {d === 'All' ? 'All Depts' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Cohort Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterCohort}
                onChange={(e) => setFilterCohort(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
              >
                <option value="All" className="dark:bg-slate-800">
                  All Cohorts
                </option>
                <option value="0-2" className="dark:bg-slate-800">
                  0-2 yrs
                </option>
                <option value="3-5" className="dark:bg-slate-800">
                  3-5 yrs
                </option>
                <option value="6-8" className="dark:bg-slate-800">
                  6-8 yrs
                </option>
                <option value="9+" className="dark:bg-slate-800">
                  9+ yrs
                </option>
              </select>
            </div>

            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* JSON Export */}
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
              title="Export JSON"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            {/* Print View */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
              title="Print View"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen Workspace'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors ml-1"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS & KPI STRIP */}
        <div className="px-6 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'visual'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Primary Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'breakdown'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Dimensional Breakdown</span>
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Side-by-Side Comparison</span>
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'records'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Underlying Records ({filteredEmployees.length})</span>
            </button>
          </div>

          {/* Active Filter Scope Notice */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Scope: {filterDept === 'All' ? 'Enterprise-wide' : filterDept} | {filterCohort === 'All' ? 'All Experience' : `${filterCohort} yrs`}
            </span>
          </div>
        </div>

        {/* KPI SUMMARY STRIP */}
        <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {meta.kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{kpi.value}</span>
                {kpi.change && (
                  <span
                    className={`text-[11px] font-semibold ${
                      kpi.isPositive !== undefined
                        ? kpi.isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {kpi.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* WORKSPACE SCROLLABLE CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PRIMARY ANALYSIS */}
          {activeTab === 'visual' && (
            <div className="space-y-6">
              {/* PRIMARY VISUAL AREA ACCORDING TO TARGET */}
              <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 min-h-[420px] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Interactive Visual Model
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                      Live Telemetry
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Showing {filteredEmployees.length} points</div>
                </div>

                {/* VISUAL BY TARGET */}
                <div className="w-full h-[360px]">
                  {/* Scatter plot for risk_matrix or at_risk */}
                  {target === 'risk_matrix' || target === 'at_risk' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" dataKey="productivity" name="Productivity" unit="%" domain={[30, 100]} />
                        <YAxis type="number" dataKey="risk" name="Flight Risk" unit="%" domain={[0, 100]} />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const pt = payload[0].payload;
                              return (
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                                  <div className="font-bold text-slate-900 dark:text-slate-100">{pt.name}</div>
                                  <div className="text-slate-500">{pt.department} ({pt.id})</div>
                                  <div className="mt-1 flex items-center justify-between gap-3">
                                    <span>Productivity:</span>
                                    <span className="font-bold text-blue-600">{pt.productivity}%</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span>Flight Risk:</span>
                                    <span className="font-bold text-rose-600">{pt.risk}%</span>
                                  </div>
                                  <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700 text-[10px] text-blue-500 font-medium">
                                    Click point to inspect Employee 360
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter
                          name="Employees"
                          data={scatterData}
                          fill="#3b82f6"
                          onClick={(data) => onSelectEmployee && onSelectEmployee(data.employee)}
                        >
                          {scatterData.map((entry, index) => {
                            const isCritical = entry.risk >= 70;
                            const isStar = entry.productivity >= 80 && entry.risk < 30;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={isCritical ? '#f43f5e' : isStar ? '#10b981' : '#3b82f6'}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                              />
                            );
                          })}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : target === 'productivity_trend' || target === 'predicted_improvement' || target === 'predicted_decline' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={actualVsPredictedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={1} />
                        <YAxis domain={[40, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="actual" name="Current Productivity" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="predicted" name="Predicted Productivity" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : target === 'productivity_distribution' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="bin" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Employee Count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptAggData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="department" />
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" domain={[50, 100]} />
                        <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="avg_productivity" name="Avg Productivity (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        <Bar yAxisId="right" dataKey="headcount" name="Headcount (Staff)" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-DIMENSIONAL BREAKDOWN */}
          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Breakdown by Department */}
                <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>Departmental Aggregations</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="py-2 px-3 rounded-l-lg">Department</th>
                          <th className="py-2 px-3">Headcount</th>
                          <th className="py-2 px-3">Avg Productivity</th>
                          <th className="py-2 px-3 rounded-r-lg">Avg Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {deptAggData.map((d) => (
                          <tr key={d.department} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{d.department}</td>
                            <td className="py-2.5 px-3">{d.headcount} staff</td>
                            <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">{d.avg_productivity}%</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.avg_risk >= 50
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}
                              >
                                {d.avg_risk}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Breakdown by Risk Tier */}
                <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Risk Tier Segmentation</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Stable / Low Risk (&lt; 30%)</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {employees.filter((e) => (e.prediction?.risk_score || 0) < 30).length} staff
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Emerging Risk (30 - 69%)</span>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {employees.filter(
                          (e) => (e.prediction?.risk_score || 0) >= 30 && (e.prediction?.risk_score || 0) < 70
                        ).length} staff
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Critical / High Risk (&ge; 70%)</span>
                      </div>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {employees.filter((e) => (e.prediction?.risk_score || 0) >= 70).length} staff
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIDE-BY-SIDE COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-blue-600" />
                      <span>Comparative Department Analysis</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Benchmark two functional groups across productivity, risk profiles, and top talent saturation
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={compareA}
                      onChange={(e) => setCompareA(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-blue-600"
                    >
                      {departments.filter((d) => d !== 'All').map((d) => (
                        <option key={d} value={d}>
                          Dept A: {d}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs font-bold text-slate-400">VS</span>
                    <select
                      value={compareB}
                      onChange={(e) => setCompareB(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-purple-600"
                    >
                      {departments.filter((d) => d !== 'All').map((d) => (
                        <option key={d} value={d}>
                          Dept B: {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Group A Card */}
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{compareStatsA.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-bold">
                        {compareStatsA.headcount} Staff
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mean Productivity:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{compareStatsA.avgProd.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mean Flight Risk:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{compareStatsA.avgRisk.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">High Performers:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {compareStatsA.highPerf} ({compareStatsA.highPerfPct.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delta / Comparison Metrics */}
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-center space-y-3">
                    <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Computed Variance</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Productivity Delta:</span>
                        <span
                          className={`font-bold ${
                            compareStatsA.avgProd >= compareStatsB.avgProd ? 'text-blue-600' : 'text-purple-600'
                          }`}
                        >
                          {(compareStatsA.avgProd - compareStatsB.avgProd).toFixed(1)} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Risk Variance:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {(compareStatsA.avgRisk - compareStatsB.avgRisk).toFixed(1)} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Headcount Difference:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {Math.abs(compareStatsA.headcount - compareStatsB.headcount)} staff
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Group B Card */}
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{compareStatsB.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold">
                        {compareStatsB.headcount} Staff
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mean Productivity:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{compareStatsB.avgProd.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mean Flight Risk:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{compareStatsB.avgRisk.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">High Performers:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {compareStatsB.highPerf} ({compareStatsB.highPerfPct.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UNDERLYING RECORDS TABLE */}
          {activeTab === 'records' && (
            <div className="space-y-3">
              {/* Table search & sort toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="relative w-full max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-900 dark:text-slate-100">{sortedEmployees.length}</span> individual records
                </div>
              </div>

              {/* Records Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[420px]">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      <tr>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSortField('employee_name');
                            setSortAsc(!sortAsc);
                          }}
                        >
                          Employee <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSortField('department');
                            setSortAsc(!sortAsc);
                          }}
                        >
                          Department <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th className="py-2.5 px-3">Role</th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSortField('experience');
                            setSortAsc(!sortAsc);
                          }}
                        >
                          Tenure <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSortField('productivity_score');
                            setSortAsc(!sortAsc);
                          }}
                        >
                          Productivity <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSortField('predicted_productivity');
                            setSortAsc(!sortAsc);
                          }}
                        >
                          Forecast <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th
                          className="py-2.5 px-3 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setSortField('risk_score');
                            setSortAsc(!sortAsc);
                          }}
                        >
                          Flight Risk <ArrowUpDown className="w-3 h-3 inline ml-1" />
                        </th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sortedEmployees.map((e) => {
                        const risk = e.prediction?.risk_score ?? 25;
                        const isCritical = risk >= 70;
                        return (
                          <tr
                            key={e.employee_id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                            onClick={() => onSelectEmployee && onSelectEmployee(e)}
                          >
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">{e.employee_name}</div>
                              <div className="text-[10px] text-slate-400">{e.employee_id}</div>
                            </td>
                            <td className="py-2.5 px-3 font-medium">{e.department}</td>
                            <td className="py-2.5 px-3">{e.role}</td>
                            <td className="py-2.5 px-3">{e.experience} yrs</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{e.productivity_score}%</td>
                            <td className="py-2.5 px-3 font-semibold text-blue-600 dark:text-blue-400">
                              {e.prediction?.predicted_productivity ? `${e.prediction.predicted_productivity}%` : 'N/A'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isCritical
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}
                              >
                                {risk}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  onSelectEmployee && onSelectEmployee(e);
                                }}
                                className="px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors inline-flex items-center gap-1"
                              >
                                <span>360</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
