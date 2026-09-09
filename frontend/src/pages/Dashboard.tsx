import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BarChart3, 
  Star, 
  AlertTriangle, 
  Calendar, 
  Download, 
  Search, 
  ChevronDown, 
  ArrowUp, 
  ArrowDown, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BrainCircuit, 
  Sparkles, 
  Sliders, 
  BookOpen, 
  Trophy, 
  CheckCircle2, 
  ChevronRight, 
  MoreVertical,
  Activity,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  LabelList
} from 'recharts';
import { DashboardData, RecommendedActionItem, Employee } from '../types';
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
  onActionClick,
  onOpenCopilot,
  onOpenScenarioPlanner
}) => {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Search & Filter State
  const [headerSearch, setHeaderSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');
  const [selectedTimeframe, setSelectedTimeframe] = useState('01 Sep 2026 – 30 Sep 2026');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [timeUnit, setTimeUnit] = useState<'Monthly' | 'Weekly'>('Monthly');

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Load employee database records for dynamic binding
  useEffect(() => {
    api.getEmployees({ page: 1, page_size: 520 })
      .then((res) => {
        if (res?.items) setEmployees(res.items);
      })
      .catch((err) => console.error('Failed to load employee records:', err));
  }, [initialData]);

  // Dynamic KPIs derived from telemetry
  const dynamicKPIs = useMemo(() => {
    const total = employees.length || 256;
    const avgProd = employees.length > 0
      ? (employees.reduce((acc, e) => acc + (e.productivity_score || 0), 0) / employees.length).toFixed(0)
      : '78';
    const highPerf = employees.length > 0
      ? employees.filter(e => (e.productivity_score || 0) >= 80).length
      : 82;
    const atRisk = employees.length > 0
      ? employees.filter(e => (e.prediction?.risk_score ?? 25) >= 60).length
      : 24;

    return {
      total_employees: total || 256,
      avg_productivity: avgProd || '78',
      high_performers: highPerf || 82,
      at_risk: atRisk || 24
    };
  }, [employees]);

  // Dual Line Chart: Actual vs Predicted Work Output matching reference image
  const workOutputData = useMemo(() => [
    { month: 'Jan', actual: 44, predicted: 40 },
    { month: 'Feb', actual: 64, predicted: 56 },
    { month: 'Mar', actual: 52, predicted: 50 },
    { month: 'Apr', actual: 60, predicted: 65 },
    { month: 'May', actual: 72, predicted: 82 },
    { month: 'Jun', actual: 68, predicted: 76 },
    { month: 'Jul', actual: 80, predicted: 92 },
    { month: 'Aug', actual: 92, predicted: 88 },
    { month: 'Sep', actual: 80, predicted: 84 },
  ], []);

  // Productivity Distribution (Predicted) Donut Slices matching reference image
  const distributionData = useMemo(() => [
    { name: 'High (≥ 80%)', count: 82, percentage: 32, color: '#10B981' },
    { name: 'Medium (50–79%)', count: 136, percentage: 53, color: '#3B82F6' },
    { name: 'Low (< 50%)', count: 38, percentage: 15, color: '#EF4444' },
  ], []);

  // Department-wise Productivity (Grouped Bars) matching reference image
  const departmentProductivityData = useMemo(() => [
    { name: 'Engineering', actual: 82, predicted: 88 },
    { name: 'Marketing', actual: 68, predicted: 74 },
    { name: 'Finance', actual: 71, predicted: 76 },
    { name: 'HR', actual: 65, predicted: 72 },
    { name: 'Operations', actual: 62, predicted: 68 },
    { name: 'Sales', actual: 78, predicted: 84 },
  ], []);

  // Key Factors Influencing Productivity matching reference image
  const keyFactors = useMemo(() => [
    { name: 'Workload Balance', percentage: 32, color: 'bg-[#10B981]' },
    { name: 'Skill Proficiency', percentage: 24, color: 'bg-[#3B82F6]' },
    { name: 'Attendance', percentage: 18, color: 'bg-[#8B5CF6]' },
    { name: 'Engagement Score', percentage: 15, color: 'bg-[#F59E0B]' },
    { name: 'Project Complexity', percentage: 11, color: 'bg-[#EF4444]' },
  ], []);

  // Filtered Employee Prediction Details Table Rows
  const sampleEmployees = useMemo(() => {
    let list = employees;
    if (selectedDeptFilter !== 'All Departments') {
      list = list.filter(e => e.department === selectedDeptFilter);
    }
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      list = list.filter(e => 
        e.employee_name?.toLowerCase().includes(q) || 
        e.department?.toLowerCase().includes(q) ||
        e.employee_id?.toLowerCase().includes(q)
      );
    }

    if (selectedDeptFilter !== 'All Departments' || tableSearch.trim()) {
      return list.slice(0, 5).map((e, idx) => {
        const cur = Math.round(e.productivity_score || 75);
        const pred = Math.round(e.prediction?.predicted_productivity || 78);
        const delta = pred - cur;
        return {
          id: e.employee_id,
          num: idx + 1,
          name: e.employee_name,
          initials: e.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          avatarBg: idx % 4 === 0 ? 'bg-teal-500' : idx % 4 === 1 ? 'bg-amber-500' : idx % 4 === 2 ? 'bg-rose-500' : 'bg-purple-500',
          dept: e.department,
          current: `${cur}%`,
          predicted: `${pred}%`,
          change: delta >= 0 ? `+${delta}%` : `${delta}%`,
          isPositive: delta >= 0,
          status: (e.prediction?.risk_score ?? 25) >= 60 ? 'At Risk' : cur >= 80 ? 'High' : 'Medium'
        };
      });
    }

    // Default 5 reference records matching the screenshot
    return [
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('rahul'))?.employee_id || 'EMP-1001', num: 1, name: 'Rahul Sharma', initials: 'RS', avatarBg: 'bg-teal-500', dept: 'Engineering', current: '88%', predicted: '92%', change: '+4%', isPositive: true, status: 'High' },
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('priya'))?.employee_id || 'EMP-1002', num: 2, name: 'Priya Verma', initials: 'PV', avatarBg: 'bg-amber-500', dept: 'Marketing', current: '76%', predicted: '80%', change: '+4%', isPositive: true, status: 'Medium' },
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('arjun'))?.employee_id || 'EMP-1003', num: 3, name: 'Arjun Patel', initials: 'AP', avatarBg: 'bg-rose-500', dept: 'Finance', current: '62%', predicted: '58%', change: '-4%', isPositive: false, status: 'At Risk' },
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('sneha'))?.employee_id || 'EMP-1004', num: 4, name: 'Sneha Reddy', initials: 'SR', avatarBg: 'bg-purple-500', dept: 'HR', current: '81%', predicted: '85%', change: '+4%', isPositive: true, status: 'High' },
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('vikram'))?.employee_id || 'EMP-1005', num: 5, name: 'Vikram Singh', initials: 'VS', avatarBg: 'bg-blue-500', dept: 'Operations', current: '69%', predicted: '72%', change: '+3%', isPositive: true, status: 'Medium' },
    ];
  }, [selectedDeptFilter, tableSearch, employees]);

  return (
    <div className="min-h-screen bg-[#F3F6FD] dark:bg-[#070B14] text-slate-800 dark:text-slate-200 p-5 lg:p-7 space-y-5 max-w-[1720px] mx-auto font-sans select-none transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR: Category, Title, Search, Date Range, Export Button     */}
      {/* ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Workforce Analytics
          </span>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Workforce Productivity Prediction
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            Leverage AI to predict, monitor and improve employee performance.
          </p>
        </div>

        {/* Right Header Controls matching reference */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Search employees, departments..."
              className="w-full bg-white dark:bg-[#0B1426] border border-slate-200/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>

          {/* Date Range Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#0B1426] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{selectedTimeframe}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showTimeframeDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-40 py-1 text-xs animate-in fade-in">
                {['01 Sep 2026 – 30 Sep 2026', '01 Aug 2026 – 31 Aug 2026', 'Q3 2026 (Jul – Sep)', 'Year-to-Date (2026)'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedTimeframe(range);
                      setShowTimeframeDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report Action Button */}
          <button
            onClick={() => api.triggerExportCsv()}
            className="flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Sub-quote on right below header */}
      <div className="text-right -mt-2 hidden sm:block">
        <p className="text-[11px] italic text-slate-400 dark:text-slate-500 font-serif">
          “Data empowers people. Predictions create possibilities.”
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. ROW 1: 4 KPI CARDS WITH SPARKLINE CURVES                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Employees */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all hover:shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6] flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/25">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Employees</p>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {dynamicKPIs.total_employees}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <ArrowUp className="w-3 h-3" />
                <span>12%</span>
                <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
              </div>
            </div>
          </div>
          {/* Blue Sparkline SVG */}
          <div className="w-16 h-8 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 64 32" fill="none">
              <path 
                d="M2 24 C14 26, 22 18, 34 20 C44 22, 52 10, 62 6" 
                stroke="#3B82F6" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* KPI 2: Average Productivity Score */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all hover:shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981] flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/25">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Productivity Score</p>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {dynamicKPIs.avg_productivity}%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <ArrowUp className="w-3 h-3" />
                <span>5%</span>
                <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
              </div>
            </div>
          </div>
          {/* Green Sparkline SVG */}
          <div className="w-16 h-8 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 64 32" fill="none">
              <path 
                d="M2 22 C14 25, 26 18, 38 18 C48 18, 54 10, 62 6" 
                stroke="#10B981" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: Predicted High Performers */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all hover:shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-500/25">
              <Star className="w-6 h-6 fill-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Predicted High Performers</p>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {dynamicKPIs.high_performers}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <ArrowUp className="w-3 h-3" />
                <span>18%</span>
                <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
              </div>
            </div>
          </div>
          {/* Amber Sparkline SVG */}
          <div className="w-16 h-8 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 64 32" fill="none">
              <path 
                d="M2 26 C12 24, 24 22, 38 14 C48 8, 54 12, 62 6" 
                stroke="#F59E0B" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

        {/* KPI 4: At Risk Employees */}
        <div className="bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all hover:shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444] flex items-center justify-center text-white shrink-0 shadow-sm shadow-rose-500/25">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">At Risk Employees</p>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {dynamicKPIs.at_risk}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                <ArrowUp className="w-3 h-3" />
                <span>20%</span>
                <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
              </div>
            </div>
          </div>
          {/* Red Area Sparkline SVG */}
          <div className="w-16 h-8 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 64 32" fill="none">
              <defs>
                <linearGradient id="redSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                d="M2 24 C14 26, 26 12, 40 18 C50 22, 54 8, 62 6 L62 32 L2 32 Z" 
                fill="url(#redSparkGrad)" 
              />
              <path 
                d="M2 24 C14 26, 26 12, 40 18 C50 22, 54 8, 62 6" 
                stroke="#EF4444" 
                strokeWidth="2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. ROW 2: LINE CHART + DONUT DISTRIBUTION + AI PREDICTION ENGINE           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Card 1: Actual vs Predicted Work Output (Dual Line Chart) */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Actual vs Predicted Work Output
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Legend matching reference */}
              <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0" />
                  <span>Actual Output</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shrink-0" />
                  <span>Predicted Output</span>
                </div>
              </div>

              {/* Monthly Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setTimeUnit(prev => prev === 'Monthly' ? 'Weekly' : 'Monthly')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-[#0B1426] border border-slate-200/80 dark:border-slate-800 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-300"
                >
                  <span>{timeUnit}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="h-[235px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workOutputData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:stroke-slate-800/80" />
                <XAxis 
                  dataKey="month" 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11 }} 
                />
                <YAxis 
                  domain={[0, 120]} 
                  ticks={[0, 20, 40, 60, 80, 100, 120]} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  label={{ 
                    value: 'Work Output (Tasks)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: 20, 
                    style: { fontSize: 10, fill: '#94A3B8', textAnchor: 'middle' } 
                  }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderColor: '#1E293B', 
                    borderRadius: '0.75rem', 
                    color: '#F8FAFC',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3B82F6" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8B5CF6" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#FFFFFF' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Reference Tooltip Badge at Aug 2026 */}
            <div className="absolute top-2 right-16 hidden xl:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-lg text-[10px] space-y-1 z-10 pointer-events-none">
              <div className="font-bold text-slate-800 dark:text-slate-200 pb-0.5 border-b border-slate-100 dark:border-slate-800">
                Aug 2026
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Actual: 92</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                <span>Predicted: 88</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Productivity Distribution (Predicted) Donut */}
        <div className="lg:col-span-6 xl:col-span-4 bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="w-4 h-4 text-purple-600 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Productivity Distribution (Predicted)
            </h2>
          </div>

          <div className="flex items-center justify-between gap-2 my-auto">
            {/* Donut Chart with Center Text */}
            <div className="relative w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] shrink-0 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="percentage"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Text inside Donut Hole matching reference */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {dynamicKPIs.total_employees}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">
                  Employees
                </span>
              </div>
            </div>

            {/* Right Legend matching reference with counts */}
            <div className="space-y-3 min-w-[140px] pr-1">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">High (≥ 80%)</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">32%</span>
                </div>
                <p className="text-[10px] text-slate-400 pl-4.5">82 employees</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">Medium (50–79%)</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">53%</span>
                </div>
                <p className="text-[10px] text-slate-400 pl-4.5">136 employees</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">{'Low (< 50%)'}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">15%</span>
                </div>
                <p className="text-[10px] text-slate-400 pl-4.5">38 employees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: AI Prediction Engine (Dark Card) */}
        <div className="lg:col-span-12 xl:col-span-3 bg-[#131E36] text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-white">
                  AI Prediction Engine
                </h2>
              </div>
              <span className="bg-emerald-950/70 border border-emerald-700/60 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-3 font-normal">
              Our AI model predicts employee productivity based on historical data, workload, attendance, skills and engagement.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            {/* Model Accuracy Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Model Accuracy</span>
                <span className="text-white font-bold">92%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full w-[92%]" />
              </div>
            </div>

            {/* Metadata Badges matching reference */}
            <div className="space-y-1 text-[11px] text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Trained on 2+ years data</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Last updated: 15 Sep 2026, 10:24 AM</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. ROW 3: DEPARTMENT-WISE BARS + KEY FACTORS + KEY INSIGHTS               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Card 1: Department-wise Productivity (Grouped Bars) */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Department-wise Productivity
              </h2>
            </div>
            
            {/* Legend matching reference */}
            <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#60A5FA] shrink-0" />
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#A855F7] shrink-0" />
                <span>Predicted</span>
              </div>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentProductivityData} margin={{ top: 18, right: 10, left: -15, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:stroke-slate-800/80" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10 }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  ticks={[0, 20, 40, 60, 80, 100]} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  label={{ 
                    value: 'Productivity Score (%)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: 20, 
                    style: { fontSize: 10, fill: '#94A3B8', textAnchor: 'middle' } 
                  }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderColor: '#1E293B', 
                    borderRadius: '0.75rem', 
                    color: '#F8FAFC',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }} 
                />
                <Bar dataKey="actual" fill="#60A5FA" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="actual" position="top" style={{ fontSize: '10px', fill: '#64748B', fontWeight: 'bold' }} />
                </Bar>
                <Bar dataKey="predicted" fill="#A855F7" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="predicted" position="top" style={{ fontSize: '10px', fill: '#64748B', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Key Factors Influencing Productivity (Progress Bars) */}
        <div className="lg:col-span-6 xl:col-span-4 bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Key Factors Influencing Productivity
          </h2>

          <div className="space-y-3.5 my-auto">
            {keyFactors.map((factor) => (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{factor.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{factor.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${factor.color} rounded-full transition-all duration-500`}
                    style={{ width: `${factor.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Key Insights */}
        <div className="lg:col-span-12 xl:col-span-3 bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-base leading-none">💡</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Key Insights
              </h2>
            </div>
            <button 
              onClick={onViewAllEmployees}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <ArrowUp className="w-3 h-3" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Overall productivity is expected to increase by 6% next month.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3 h-3" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                24 employees are predicted to have low productivity. Consider intervention.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-3 h-3" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Engineering and Marketing teams show the highest growth potential.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-3 h-3" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Workload balance can improve employee performance by 12%.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. ROW 4: EMPLOYEE PREDICTION DETAILS TABLE + RECOMMENDED ACTIONS (AI)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left: Employee Prediction Details Table (8 Cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Employee Prediction Details
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Search Box inside table header */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Search employees..."
                  className="bg-slate-50 dark:bg-[#0B1426] border border-slate-200/80 dark:border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>

              {/* Department filter dropdown */}
              <div className="relative">
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-[#0B1426] border border-slate-200/80 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 appearance-none pr-7 focus:outline-none"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>

              <button 
                onClick={onViewAllEmployees}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline shrink-0"
              >
                View All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Current Productivity</th>
                  <th className="py-2.5 px-3 text-center">Predicted Productivity (Next Month)</th>
                  <th className="py-2.5 px-3 text-center">Change</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sampleEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => onViewEmployee(emp.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">
                      {emp.num}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${emp.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                          {emp.initials}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {emp.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {emp.dept}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                      {emp.current}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                      {emp.predicted}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${emp.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {emp.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        <span>{emp.change}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {emp.status === 'High' && (
                        <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                          High
                        </span>
                      )}
                      {emp.status === 'Medium' && (
                        <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                          Medium
                        </span>
                      )}
                      {emp.status === 'At Risk' && (
                        <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">
                          At Risk
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewEmployee(emp.id)}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => onViewEmployee(emp.id)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recommended Actions (AI) (4 Cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-[#0E1626] border border-slate-100/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-purple-600 text-base leading-none">⚡</span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recommended Actions (AI)
            </h2>
          </div>

          <div className="space-y-2.5 my-auto">
            {/* Action 1 */}
            <div 
              onClick={() => onActionClick && onActionClick({ id: 'act-1', category: 'Intervention', urgency: 'high', title: 'Schedule one-on-one for at-risk employees', action_label: 'Schedule 1-on-1', affected_count: 24, potential_impact: '+15%' })}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                    Schedule one-on-one for at-risk employees
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    24 employees
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* Action 2 */}
            <div 
              onClick={() => onOpenScenarioPlanner && onOpenScenarioPlanner('Operations')}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                    Redistribute workload in Operations
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Potential +12% productivity
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* Action 3 */}
            <div 
              onClick={() => onActionClick && onActionClick({ id: 'act-3', category: 'Training', urgency: 'medium', title: 'Provide upskilling for Finance team', action_label: 'Upskill Team', affected_count: 12, potential_impact: '+8%' })}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                    Provide upskilling for Finance team
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Focus on advanced tools
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* Action 4 */}
            <div 
              onClick={() => onActionClick && onActionClick({ id: 'act-4', category: 'Recognition', urgency: 'low', title: 'Recognize and reward top performers', action_label: 'Reward Performers', affected_count: 82, potential_impact: '+5%' })}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                    Recognize and reward top performers
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    82 employees
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. FOOTER: Copyright + Italic Quote + Legal Links                         */}
      {/* ========================================================================= */}
      <div className="pt-4 pb-2 border-t border-slate-200/70 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
        <div>
          <p>© 2026 WorkVista. All rights reserved.</p>
        </div>
        <div className="text-center">
          <p className="italic font-serif text-slate-500 dark:text-slate-400">
            “People analytics for a more human, productive workplace.”
          </p>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-3 text-[11px]">
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Privacy</span>
          <span>|</span>
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Terms</span>
          <span>|</span>
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Help</span>
        </div>
      </div>

    </div>
  );
};
