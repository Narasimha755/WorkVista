import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BarChart3, 
  Star, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Maximize2, 
  ChevronRight, 
  Sparkles, 
  UploadCloud, 
  Leaf, 
  Clock, 
  FileText, 
  Database,
  ArrowUp,
  ArrowDown,
  Activity,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  BrainCircuit,
  Building2,
  GitCompare,
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { AnalyticsMaximizeWorkspace } from '../components/analytics/AnalyticsMaximizeWorkspace';
import { GlobalFilterBar } from '../components/layout/GlobalFilterBar';
import { DashboardData, RecommendedActionItem, Employee, MaximizeTargetType, GlobalFilterState, AuditLogItem } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  data: DashboardData | null;
  loading: boolean;
  onOpenUpload: () => void;
  onLoadDemo: () => void;
  onViewEmployee: (id: string) => void;
  onViewAllEmployees: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onActionClick: (action: RecommendedActionItem) => void;
  onOpenCopilot?: (query?: string) => void;
  onOpenScenarioPlanner?: (dept?: string) => void;
  onOpenCompare?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data: initialData,
  loading,
  onOpenUpload,
  onLoadDemo,
  onViewEmployee,
  onViewAllEmployees,
  onOpenCopilot,
  onOpenScenarioPlanner,
  onOpenCompare
}) => {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTimeframe, setActiveTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('1Y');
  const [maximizedCard, setMaximizedCard] = useState<MaximizeTargetType>(null);
  const [hoveredScatterEmployee, setHoveredScatterEmployee] = useState<any>(null);

  // Global Cross-Filter State
  const [filters, setFilters] = useState<GlobalFilterState>({
    department: 'All',
    role: 'All',
    performance_status: 'All',
    risk_level: 'All',
    experience_cohort: 'All',
    date_range: 'All',
    search: ''
  });

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Fetch full employee records for cross-filtering and deep analytical inspection
  useEffect(() => {
    api.getEmployees({ page: 1, page_size: 520 })
      .then((res) => {
        if (res?.items) setEmployees(res.items);
      })
      .catch((err) => console.error('Failed to load employee telemetry:', err));

    api.getAuditLogs(6)
      .then((res) => {
        if (res && Array.isArray(res)) setAuditLogs(res);
      })
      .catch((err) => console.error('Failed to load audit logs:', err));
  }, [initialData]);

  // Filtered employees based on active cross-filters
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (filters.department !== 'All' && e.department !== filters.department) return false;
      if (filters.role !== 'All' && e.role !== filters.role) return false;
      if (filters.performance_status !== 'All') {
        const perf = e.performance_rating || (e.productivity_score >= 80 ? 'High' : e.productivity_score < 50 ? 'Low' : 'Medium');
        if (perf !== filters.performance_status) return false;
      }
      if (filters.risk_level !== 'All') {
        const risk = e.prediction?.risk_score ?? 25;
        if (filters.risk_level === 'High' && risk < 60) return false;
        if (filters.risk_level === 'Medium' && (risk < 30 || risk >= 60)) return false;
        if (filters.risk_level === 'Low' && risk >= 30) return false;
      }
      if (filters.experience_cohort !== 'All') {
        const exp = e.experience || 0;
        if (filters.experience_cohort === '0-2' && exp > 2) return false;
        if (filters.experience_cohort === '3-5' && (exp < 3 || exp > 5)) return false;
        if (filters.experience_cohort === '6-8' && (exp < 6 || exp > 8)) return false;
        if (filters.experience_cohort === '9+' && exp < 9) return false;
      }
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchName = e.employee_name?.toLowerCase().includes(q);
        const matchId = e.employee_id?.toLowerCase().includes(q);
        const matchDept = e.department?.toLowerCase().includes(q);
        const matchRole = e.role?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDept && !matchRole) return false;
      }
      return true;
    });
  }, [employees, filters]);

  // Derived KPIs dynamically recalculated when filters are applied
  const dynamicKPIs = useMemo(() => {
    const list = filteredEmployees.length > 0 || (filters.department !== 'All' || filters.role !== 'All' || filters.risk_level !== 'All' || filters.performance_status !== 'All')
      ? filteredEmployees
      : employees;

    const total = list.length;
    const avgProd = total > 0 ? (list.reduce((acc, e) => acc + (e.productivity_score || 0), 0) / total).toFixed(1) : '78.9';
    const highPerf = list.filter((e) => (e.productivity_score || 0) >= 80).length;
    const atRisk = list.filter((e) => (e.prediction?.risk_score || 0) >= 60).length;
    const predImprove = list.filter((e) => (e.prediction?.predicted_productivity || 0) > (e.productivity_score || 0)).length;
    const predDecline = list.filter((e) => (e.prediction?.predicted_productivity || 0) < (e.productivity_score || 0)).length;

    return {
      total_employees: total || data?.kpis?.total_employees?.value || 520,
      avg_productivity: avgProd,
      high_performers: highPerf || data?.kpis?.high_performers?.value || 235,
      at_risk: atRisk,
      predicted_improvement: predImprove || 259,
      predicted_decline: predDecline || 250
    };
  }, [filteredEmployees, employees, filters, data]);

  // Live Department Performance derived from real employee telemetry or backend data
  const liveDepartmentsData = useMemo(() => {
    const deptMap: Record<string, { count: number; totalProd: number; color: string }> = {
      Engineering: { count: 0, totalProd: 0, color: '#3B82F6' },
      Sales: { count: 0, totalProd: 0, color: '#06B6D4' },
      Marketing: { count: 0, totalProd: 0, color: '#8B5CF6' },
      Operations: { count: 0, totalProd: 0, color: '#F97316' },
      HR: { count: 0, totalProd: 0, color: '#EC4899' },
      Finance: { count: 0, totalProd: 0, color: '#10B981' }
    };

    const targetList = filteredEmployees.length > 0 ? filteredEmployees : employees;

    targetList.forEach((e) => {
      const dept = e.department || 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = { count: 0, totalProd: 0, color: '#3B82F6' };
      }
      deptMap[dept].count += 1;
      deptMap[dept].totalProd += e.productivity_score || 0;
    });

    return Object.entries(deptMap)
      .filter(([_, val]) => val.count > 0)
      .map(([name, val]) => {
        const avg = Number((val.totalProd / val.count).toFixed(1));
        return {
          name,
          percentage: avg,
          delta: Number((avg - 75.0).toFixed(1)),
          isUp: avg >= 75.0,
          color: val.color,
          headcount: val.count
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [filteredEmployees, employees]);

  // Live Scatter Plot Points derived from real employee records
  const liveScatterPoints = useMemo(() => {
    const targetList = (filteredEmployees.length > 0 ? filteredEmployees : employees).slice(0, 45);
    const deptColors: Record<string, string> = {
      Engineering: '#3B82F6',
      Sales: '#10B981',
      Marketing: '#8B5CF6',
      Operations: '#F59E0B',
      HR: '#EC4899',
      Finance: '#06B6D4'
    };

    return targetList.map((e) => ({
      x: e.productivity_score || 75,
      y: e.prediction?.risk_score ?? 25,
      dept: e.department || 'General',
      name: e.employee_name,
      id: e.employee_id,
      color: deptColors[e.department] || '#3B82F6',
      pred: e.prediction?.predicted_productivity ?? e.productivity_score,
      rLevel: (e.prediction?.risk_score ?? 25) >= 60 ? 'Critical' : (e.prediction?.risk_score ?? 25) >= 30 ? 'Moderate' : 'Low',
      employee: e
    }));
  }, [filteredEmployees, employees]);

  // Dynamic Cohort / Trajectory Line from backend actual_vs_predicted or real employee telemetry cohorts
  const productivityTrendData = useMemo(() => {
    const trendList = (data as any)?.productivity_trend || (data as any)?.actual_vs_predicted;
    if (trendList && trendList.length > 0) {
      return trendList.map((pt: any) => {
        const act = Number((pt.actual_score ?? pt.actual ?? 75).toFixed(1));
        const pred = Number((pt.predicted_score ?? pt.predicted ?? 76).toFixed(1));
        return {
          month: pt.period || pt.month || pt.label || 'Cohort',
          actual: act,
          predicted: pred,
          lower: Math.max(0, Math.round(pred - 5)),
          upper: Math.min(100, Math.round(pred + 5))
        };
      });
    }
    const targetList = filteredEmployees.length > 0 ? filteredEmployees : employees;
    if (targetList.length > 0) {
      const depts = Array.from(new Set(targetList.map(e => e.department || 'General'))).slice(0, 6);
      return depts.map(d => {
        const emps = targetList.filter(e => (e.department || 'General') === d);
        const avgAct = emps.length > 0 ? Number((emps.reduce((s, e) => s + (e.productivity_score || 0), 0) / emps.length).toFixed(1)) : 75;
        const avgPred = emps.length > 0 ? Number((emps.reduce((s, e) => s + (e.prediction?.predicted_productivity ?? e.productivity_score ?? 75), 0) / emps.length).toFixed(1)) : avgAct;
        return {
          month: d,
          actual: avgAct,
          predicted: avgPred,
          lower: Math.max(0, Math.round(avgPred - 5)),
          upper: Math.min(100, Math.round(avgPred + 5))
        };
      });
    }
    return [];
  }, [data, filteredEmployees, employees]);

  // Dynamic Workforce Health metrics derived from data and active telemetry
  const dynamicHealthMetrics = useMemo(() => {
    const healthScore = data?.workforce_health?.score 
      ?? Math.min(100, Math.max(0, Math.round(Number(dynamicKPIs.avg_productivity) * 0.4 + (100 - (dynamicKPIs.at_risk / Math.max(1, dynamicKPIs.total_employees)) * 100) * 0.4 + (dynamicKPIs.high_performers / Math.max(1, dynamicKPIs.total_employees)) * 20)));

    const engagementVal = data?.workforce_health?.breakdown?.engagement 
      ?? (filteredEmployees.length > 0 ? Number((filteredEmployees.reduce((s, e) => s + (e.engagement || e.productivity_score || 85), 0) / filteredEmployees.length).toFixed(1)) : 91.2);

    const stabilityStatus = healthScore >= 80 ? 'Optimal' : healthScore >= 65 ? 'Stable' : 'Attention';

    return {
      score: healthScore,
      engagement: engagementVal,
      status: stabilityStatus
    };
  }, [data, dynamicKPIs, filteredEmployees]);

  // Loading skeleton
  if (loading && !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-[1720px] mx-auto bg-[#0B1120] min-h-screen text-slate-400 font-sans">
        <div className="h-20 bg-slate-900 rounded-2xl w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state fallback
  if (!data?.has_data) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4 bg-[#0F172A] rounded-2xl border border-slate-800 text-white my-12 font-sans">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/20">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold">No Dataset Calibrated</h2>
        <p className="text-xs text-slate-400">
          Initialize the 520-employee enterprise baseline or ingest custom telemetry.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load 520 Baseline</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <span>Upload Dataset</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 p-5 lg:p-6 space-y-4 max-w-[1720px] mx-auto font-sans relative selection:bg-cyan-500/30 selection:text-cyan-300 transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. HERO / HEADER AREA: Welcome back, NARASIMHA + Quote */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0B1426]/70 border border-slate-200 dark:border-slate-800/80 p-5 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
        
        {/* Silhouette waves */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 dark:opacity-25 select-none">
          <svg className="w-full h-full object-cover" viewBox="0 0 1200 240" preserveAspectRatio="none" fill="none">
            <path d="M0 240 L0 140 Q 150 60, 300 130 T 600 100 T 900 150 T 1200 90 L 1200 240 Z" fill="#172A46" />
            <path d="M0 240 L0 180 Q 200 110, 400 160 T 800 130 T 1200 170 L 1200 240 Z" fill="#101F35" />
            <path d="M0 240 L0 205 Q 350 160, 700 190 T 1200 195 L 1200 240 Z" fill="#0D182A" />
          </svg>
        </div>

        {/* Left: Greeting */}
        <div className="relative z-10">
          <div className="text-xs italic font-serif text-slate-500 dark:text-slate-400 tracking-wide">
            &laquo; Welcome <span className="not-italic text-slate-500 font-sans">back,</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            NARASIMHA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here's your workforce at a glance.
          </p>
        </div>

        {/* Right: Quote */}
        <div className="relative z-10 text-right hidden sm:block">
          <p className="text-xs italic text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
            &ldquo;Better people insights<br />build stronger tomorrows.&rdquo;
          </p>
          <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mt-1 font-semibold flex items-center justify-end gap-1.5">
            <span className="w-5 h-[1px] bg-slate-300 dark:bg-slate-700" />
            <span>WORKVISTA</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GLOBAL CROSS-FILTER BAR */}
      {/* ========================================================================= */}
      <GlobalFilterBar
        filters={filters}
        onChange={(upd) => setFilters((prev) => ({ ...prev, ...upd }))}
        onReset={() =>
          setFilters({
            department: 'All',
            role: 'All',
            performance_status: 'All',
            risk_level: 'All',
            experience_cohort: 'All',
            date_range: 'All',
            search: ''
          })
        }
        totalRecordsCount={employees.length || 520}
        filteredRecordsCount={filteredEmployees.length}
      />

      {/* ========================================================================= */}
      {/* 2. KPI ROW: 6 Compact Premium Cards with Maximize Buttons */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* 1. Total Employees */}
        <div 
          onClick={() => setMaximizedCard('total_employees')}
          className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 rounded-xl p-3.5 flex flex-col justify-between shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Total Staff</span>
            </div>
            <Maximize2 className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {dynamicKPIs.total_employees}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUp className="w-3 h-3" /> 2.1%
            </span>
          </div>
          <div className="mt-2 h-5 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 18 Q 25 14, 50 16 T 75 10 T 100 4" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 2. Avg. Productivity */}
        <div 
          onClick={() => setMaximizedCard('avg_productivity')}
          className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/50 rounded-xl p-3.5 flex flex-col justify-between shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-50 dark:bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Productivity</span>
            </div>
            <Maximize2 className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {dynamicKPIs.avg_productivity}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUp className="w-3 h-3" /> 1.4%
            </span>
          </div>
          <div className="mt-2 h-5 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 20 Q 20 18, 40 12 T 70 14 T 100 6" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 3. High Performers */}
        <div 
          onClick={() => setMaximizedCard('high_performers')}
          className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 rounded-xl p-3.5 flex flex-col justify-between shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Star className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">High Performers</span>
            </div>
            <Maximize2 className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {dynamicKPIs.high_performers}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUp className="w-3 h-3" /> 5.2%
            </span>
          </div>
          <div className="mt-2 h-5 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 20 Q 30 16, 60 10 T 100 4" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 4. At Risk */}
        <div 
          onClick={() => setMaximizedCard('at_risk')}
          className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 hover:border-rose-500/50 rounded-xl p-3.5 flex flex-col justify-between shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">At Risk</span>
            </div>
            <Maximize2 className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {dynamicKPIs.at_risk}
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
              <ArrowDown className="w-3 h-3" /> 1.1%
            </span>
          </div>
          <div className="mt-2 h-5 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 8 Q 30 12, 60 18 T 100 22" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 5. Predicted Improvement */}
        <div 
          onClick={() => setMaximizedCard('predicted_improvement')}
          className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 hover:border-purple-500/50 rounded-xl p-3.5 flex flex-col justify-between shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Ascending</span>
            </div>
            <Maximize2 className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {dynamicKPIs.predicted_improvement}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUp className="w-3 h-3" /> 12.3%
            </span>
          </div>
          <div className="mt-2 h-5 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 22 Q 25 18, 50 14 T 75 8 T 100 2" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 6. Predicted Decline */}
        <div 
          onClick={() => setMaximizedCard('predicted_decline')}
          className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/50 rounded-xl p-3.5 flex flex-col justify-between shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Declining</span>
            </div>
            <Maximize2 className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {dynamicKPIs.predicted_decline}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <ArrowDown className="w-3 h-3" /> 1.4%
            </span>
          </div>
          <div className="mt-2 h-5 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 6 Q 30 10, 60 14 T 100 18" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN ANALYTICS AREA (Row 1): Trend, Department, Workforce Health */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* LEFT: Productivity Trend (Actual vs Predicted) */}
        <div className="lg:col-span-6 xl:col-span-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Productivity Dynamics</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {(data as any)?.has_temporal_data ? 'Longitudinal Trajectory' : 'Actual vs Predicted by Cohort'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Timeframe selector pills */}
              <div className="flex items-center bg-slate-100 dark:bg-[#090E1A] p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {(['7D', '30D', '90D', '1Y'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                      activeTimeframe === tf 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Maximize Icon */}
              <button 
                onClick={() => setMaximizedCard('productivity_trend')}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Expand to Full Analytics Workspace"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recharts Area + Line */}
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.25} vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#F8FAFC'
                  }} 
                />
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bandGradient)" />
                <Area type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2.5} fill="url(#actualGradient)" />
                <Line type="monotone" dataKey="predicted" stroke="#06B6D4" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Strip */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-[2.5px] bg-[#3B82F6] rounded-full" />
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-[2px] bg-[#06B6D4] rounded-full border-t border-dashed border-[#06B6D4]" />
                <span>Predicted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xs" />
                <span>Confidence Band</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              RMSE: {data?.prediction_engine?.rmse ?? 3.12} · R²: {data?.prediction_engine?.r2_score ?? 0.884}
            </span>
          </div>
        </div>

        {/* MIDDLE: Department Performance Horizontal Bars */}
        <div className="lg:col-span-3 xl:col-span-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Department Performance</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">By productivity rate</p>
            </div>
            <button 
              onClick={() => setMaximizedCard('department_performance')}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Expand Department Analysis"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bars list */}
          <div className="space-y-3 my-auto">
            {liveDepartmentsData.map(dept => (
              <div key={dept.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{dept.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-900 dark:text-white font-bold">{dept.percentage}%</span>
                    <span className={`text-[10px] flex items-center font-semibold ${dept.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {dept.isUp ? '+' : ''}{dept.delta}%
                    </span>
                  </div>
                </div>
                {/* Progress bar container */}
                <div className="w-full bg-slate-100 dark:bg-[#090E1A] h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/60">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${dept.percentage}%`, backgroundColor: dept.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Department Bottom Action */}
          <button 
            onClick={() => onOpenScenarioPlanner && onOpenScenarioPlanner('Engineering')}
            className="w-full mt-2 py-1.5 bg-slate-100 dark:bg-[#090E1A] hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            <span>Simulate Org Shifts</span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        {/* RIGHT: Workforce Health Gauge Card */}
        <div className="lg:col-span-3 xl:col-span-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Workforce Health</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Overall telemetry score</p>
            </div>
            <button 
              onClick={() => setMaximizedCard('workforce_health')}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Expand Workforce Health"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Circular Gauge */}
          <div className="relative flex items-center justify-center my-auto py-2">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="54" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="10" fill="transparent" />
              <circle 
                cx="72" 
                cy="72" 
                r="54" 
                stroke="#10B981" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={339.29} 
                strokeDashoffset={339.29 * (1 - (dynamicHealthMetrics.score / 100))} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                {dynamicHealthMetrics.score}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                out of 100
              </span>
            </div>
          </div>

          {/* Bottom Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-center">
            <div className="bg-slate-100 dark:bg-[#090E1A] p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Engagement</span>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{dynamicHealthMetrics.engagement}%</div>
            </div>
            <div className="bg-slate-100 dark:bg-[#090E1A] p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Stability</span>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{dynamicHealthMetrics.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN ANALYTICS AREA (Row 2): Risk vs Perf, Key Insights, Recent Activity */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* LEFT: Risk vs. Performance Scatter Plot */}
        <div className="lg:col-span-6 xl:col-span-5.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Risk vs. Performance</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Employee distribution (click dot for 360 dossier)</p>
            </div>
            <button 
              onClick={() => setMaximizedCard('risk_matrix')}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Expand Risk Matrix"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scatter Chart */}
          <div className="flex items-center gap-2">
            <div className="h-56 flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.25} />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Productivity" 
                    domain={[30, 100]} 
                    ticks={[30, 65, 100]} 
                    stroke="#64748B" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Risk Score" 
                    domain={[0, 100]} 
                    ticks={[0, 50, 100]} 
                    stroke="#64748B" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Scatter 
                    data={liveScatterPoints} 
                    onMouseEnter={(node) => setHoveredScatterEmployee(node)}
                    onClick={(node) => onViewEmployee(node.id || node.employee?.employee_id)}
                  >
                    {liveScatterPoints.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        opacity={0.85} 
                        cursor="pointer" 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>

              {/* Axis labels */}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                Productivity Score
              </span>
              <span className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 text-[9px] text-slate-400 dark:text-slate-500 font-medium origin-left">
                Risk Score
              </span>

              {/* Tooltip Card */}
              {hoveredScatterEmployee && (
                <div 
                  className="pointer-events-none absolute top-4 left-1/4 bg-white/95 dark:bg-[#090E1A]/95 border border-cyan-500/50 rounded-xl p-2.5 shadow-xl text-left z-20 min-w-[170px] backdrop-blur-sm animate-in fade-in"
                >
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">
                      {hoveredScatterEmployee.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                        {hoveredScatterEmployee.name}
                      </div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">
                        {hoveredScatterEmployee.dept} ({hoveredScatterEmployee.id})
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-[10px]">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Productivity</span>
                      <span className="text-slate-900 dark:text-white font-semibold">{hoveredScatterEmployee.x}%</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Predicted</span>
                      <span className="text-cyan-600 dark:text-cyan-300 font-semibold">{hoveredScatterEmployee.pred}%</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Flight Risk</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{hoveredScatterEmployee.y}%</span>
                    </div>
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-slate-200 dark:border-slate-800 text-[9px] text-blue-600 dark:text-blue-400 font-medium flex items-center justify-between">
                    <span>Click for 360 Dossier</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Department Legend */}
            <div className="w-24 pl-2 space-y-2 text-[10px] text-slate-600 dark:text-slate-400 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span>Engineering</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                <span>Marketing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>Operations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
                <span>HR</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Key Insights Card */}
        <div className="lg:col-span-3 xl:col-span-3.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Key Insights</h2>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setMaximizedCard('key_insights')}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Maximize Key Insights"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onOpenCopilot && onOpenCopilot()}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
              >
                <span>Copilot</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Dynamic Key Insights */}
          <div className="space-y-2 my-auto">
            {data?.key_insights && data.key_insights.length > 0 ? (
              data.key_insights.slice(0, 4).map((insight: any, idx: number) => {
                const isWarn = insight.type === 'risk' || insight.type === 'warning';
                const isStar = insight.type === 'performance' || insight.type === 'positive';
                const Icon = isWarn ? AlertTriangle : isStar ? Star : TrendingUp;
                const iconColor = isWarn 
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : isStar
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400';

                return (
                  <div 
                    key={insight.id || idx}
                    onClick={() => onOpenCopilot && onOpenCopilot(insight.message)}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-[#090E1A]/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors group"
                  >
                    <div className={`w-6 h-6 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {insight.badge || (isWarn ? 'Retention Alert' : isStar ? 'Top Performer' : 'Productivity Insight')}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {insight.message}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors shrink-0" />
                  </div>
                );
              })
            ) : (
              <>
                <div 
                  onClick={() => onOpenCopilot && onOpenCopilot('Analyze productivity stability across departments')}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-[#090E1A]/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors group"
                >
                  <div className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Productivity Velocity</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Workforce average at {dynamicKPIs.avg_productivity}% across {dynamicKPIs.total_employees} staff.</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors shrink-0" />
                </div>

                <div 
                  onClick={() => onOpenCopilot && onOpenCopilot(`Investigate top performers in ${liveDepartmentsData[0]?.name || 'Engineering'}`)}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-[#090E1A]/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors group"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Star className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{liveDepartmentsData[0]?.name || 'Engineering'} Leads</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{dynamicKPIs.high_performers} high performers with {liveDepartmentsData[0]?.percentage || 80}% avg output.</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors shrink-0" />
                </div>

                <div 
                  onClick={() => onOpenCopilot && onOpenCopilot('Analyze flight risks and retention alerts')}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-[#090E1A]/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors group"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Retention Warning</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{dynamicKPIs.at_risk} team members flagged above risk threshold.</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors shrink-0" />
                </div>

                <div 
                  onClick={() => onOpenCopilot && onOpenCopilot('Evaluate attendance and overtime impact on burnout')}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-[#090E1A]/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors group"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Trajectory Projection</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{dynamicKPIs.predicted_improvement} staff projected to increase velocity.</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors shrink-0" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Recent Activity Timeline */}
        <div className="lg:col-span-3 xl:col-span-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h2>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setMaximizedCard('recent_activity')}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Maximize Activity Log"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={onViewAllEmployees}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Dynamic Audit Activity entries */}
          <div className="space-y-3 my-auto">
            {auditLogs.length > 0 ? (
              auditLogs.slice(0, 5).map((log, idx) => {
                const isModel = log.action?.includes('MODEL') || log.action?.includes('TRAIN');
                const isData = log.action?.includes('DATA') || log.action?.includes('UPLOAD');
                const isAlert = log.action?.includes('RISK') || log.action?.includes('FLAG');
                const dotColor = isAlert 
                  ? 'bg-rose-500 dark:bg-rose-400 shadow-[0_0_6px_#f43f5e]' 
                  : isModel 
                  ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_#10b981]' 
                  : isData 
                  ? 'bg-blue-500 dark:bg-blue-400 shadow-[0_0_6px_#3b82f6]' 
                  : 'bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_6px_#06b6d4]';

                const formattedAction = (log.action || 'System Event').replace(/_/g, ' ').toLowerCase();
                const displayAction = formattedAction.charAt(0).toUpperCase() + formattedAction.slice(1);
                const timeStr = log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';

                return (
                  <div key={log.id || idx} className="flex items-start gap-2.5 text-xs">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-900 dark:text-white font-semibold leading-snug truncate">
                        {displayAction}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {log.details || `Logged by ${log.user || 'NARASIMHA'}`}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">
                      {timeStr}
                    </span>
                  </div>
                );
              })
            ) : (
              [
                { action: 'Model calibrated successfully', details: `${data?.prediction_engine?.model_name || 'Random Forest'} · ${dynamicKPIs.total_employees} records`, time: 'Active', color: 'emerald' },
                { action: 'Predictions synchronized', details: `${dynamicKPIs.total_employees} employee trajectories updated`, time: 'Synced', color: 'blue' },
                { action: 'Dataset telemetry verified', details: `${(data as any)?.dataset_name || 'Enterprise Telemetry (v1.0)'}`, time: 'Loaded', color: 'cyan' },
                { action: 'Risk monitor active', details: `${dynamicKPIs.at_risk} retention alerts tracked`, time: 'Live', color: 'rose' },
                { action: 'Audit log initialized', details: 'Automated governance tracking enabled', time: 'Ready', color: 'amber' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color === 'emerald' ? 'bg-emerald-500' : item.color === 'blue' ? 'bg-blue-500' : item.color === 'cyan' ? 'bg-cyan-500' : item.color === 'rose' ? 'bg-rose-500' : 'bg-amber-500'} shadow-[0_0_6px]`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-900 dark:text-white font-semibold leading-snug truncate">{item.action}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.details}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">{item.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. UNIVERSAL ANALYTICS MAXIMIZE WORKSPACE (Supports all 17 card types) */}
      {/* ========================================================================= */}
      {Boolean(maximizedCard) && (
        <AnalyticsMaximizeWorkspace
          target={maximizedCard}
          isOpen={Boolean(maximizedCard)}
          onClose={() => setMaximizedCard(null)}
          dashboardData={data}
          employees={filteredEmployees.length > 0 ? filteredEmployees : employees}
          onSelectEmployee={(emp) => onViewEmployee(emp.employee_id)}
        />
      )}
    </div>
  );
};
