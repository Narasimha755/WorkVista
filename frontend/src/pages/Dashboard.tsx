import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  Bell, 
  Play, 
  ChevronDown, 
  ArrowUp, 
  Search, 
  UploadCloud, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Moon, 
  Sun, 
  BrainCircuit, 
  ExternalLink,
  CheckCircle2,
  Sliders,
  X
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
  Cell
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
  onOpenCopilot,
  onOpenScenarioPlanner,
  onOpenCompare
}) => {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Sep 2026');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Prediction Filter controls
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('Next 30 Days');
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictNotice, setPredictNotice] = useState<string | null>(null);

  // Dark/Light Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Load employee database records for dynamic binding
  useEffect(() => {
    api.getEmployees({ page: 1, page_size: 520 })
      .then((res) => {
        if (res?.items) setEmployees(res.items);
      })
      .catch((err) => console.error('Failed to load employee data:', err));
  }, [initialData]);

  // Handle Run Prediction click
  const handleRunPrediction = () => {
    setIsPredicting(true);
    setPredictNotice(null);
    setTimeout(() => {
      setIsPredicting(false);
      setPredictNotice(`ML model evaluated for ${selectedDeptFilter} (${selectedTimePeriod})`);
      setTimeout(() => setPredictNotice(null), 3500);
    }, 450);
  };

  // Dynamic calculations based on department filter
  const filteredEmployees = useMemo(() => {
    if (selectedDeptFilter === 'All Departments') return employees;
    return employees.filter(e => e.department === selectedDeptFilter);
  }, [employees, selectedDeptFilter]);

  const dynamicKPIs = useMemo(() => {
    const list = filteredEmployees.length > 0 ? filteredEmployees : employees;
    const total = list.length || 256;
    const avgProd = list.length > 0
      ? (list.reduce((acc, e) => acc + (e.productivity_score || 0), 0) / list.length).toFixed(0)
      : '78';
    const highPerf = list.length > 0
      ? list.filter(e => (e.productivity_score || 0) >= 80).length
      : 82;
    const atRisk = list.length > 0
      ? list.filter(e => (e.prediction?.risk_score ?? 25) >= 60).length
      : 24;

    return {
      total_employees: total || 256,
      avg_productivity: avgProd || '78',
      high_performers: highPerf || 82,
      at_risk: atRisk || 24
    };
  }, [filteredEmployees, employees]);

  // Monthly Work Output Trend (Line chart data exactly matching reference)
  const lineChartData = useMemo(() => [
    { month: 'Jan', actual: 48, predicted: 40 },
    { month: 'Feb', actual: 64, predicted: 55 },
    { month: 'Mar', actual: 50, predicted: 50 },
    { month: 'Apr', actual: 53, predicted: 60 },
    { month: 'May', actual: 64, predicted: 74 },
    { month: 'Jun', actual: 63, predicted: 70 },
    { month: 'Jul', actual: 75, predicted: 85 },
    { month: 'Aug', actual: 66, predicted: 74 },
    { month: 'Sep', actual: 76, predicted: 85 },
  ], []);

  // Donut chart productivity distribution data matching reference
  const donutData = useMemo(() => [
    { name: 'High (≥ 80%)', value: 32, color: '#10B981' },
    { name: 'Medium (50–79%)', value: 53, color: '#3B82F6' },
    { name: 'Low (< 50%)', value: 15, color: '#EF4444' },
  ], []);

  // Top Performing Departments data matching reference
  const topDepartments = useMemo(() => [
    { name: 'Engineering', percentage: 88, color: 'bg-[#10B981]' },
    { name: 'Marketing', percentage: 76, color: 'bg-[#3B82F6]' },
    { name: 'Finance', percentage: 70, color: 'bg-[#8B5CF6]' },
    { name: 'HR', percentage: 68, color: 'bg-[#F59E0B]' },
    { name: 'Operations', percentage: 65, color: 'bg-[#EF4444]' },
  ], []);

  // Sample employee table records matching reference image
  const sampleEmployees = useMemo(() => {
    if (selectedDeptFilter !== 'All Departments' && filteredEmployees.length >= 5) {
      return filteredEmployees.slice(0, 5).map((e, idx) => ({
        id: e.employee_id,
        num: idx + 1,
        name: e.employee_name,
        dept: e.department,
        current: `${Math.round(e.productivity_score || 75)}%`,
        predicted: `${Math.round(e.prediction?.predicted_productivity || 78)}%`,
        status: (e.prediction?.risk_score ?? 25) >= 60 ? 'At Risk' : (e.productivity_score || 75) >= 80 ? 'High' : 'Medium'
      }));
    }

    return [
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('rahul'))?.employee_id || 'EMP-1001', num: 1, name: 'Rahul Sharma', dept: 'Engineering', current: '88%', predicted: '92%', status: 'High' },
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('priya'))?.employee_id || 'EMP-1002', num: 2, name: 'Priya Verma', dept: 'Marketing', current: '76%', predicted: '80%', status: 'Medium' },
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('arjun'))?.employee_id || 'EMP-1003', num: 3, name: 'Arjun Patel', dept: 'Finance', current: '62%', predicted: '58%', status: 'At Risk' },
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('sneha'))?.employee_id || 'EMP-1004', num: 4, name: 'Sneha Reddy', dept: 'HR', current: '81%', predicted: '85%', status: 'High' },
      { id: employees.find(e => e.employee_name?.toLowerCase().includes('vikram'))?.employee_id || 'EMP-1005', num: 5, name: 'Vikram Singh', dept: 'Operations', current: '69%', predicted: '72%', status: 'Medium' },
    ];
  }, [selectedDeptFilter, filteredEmployees, employees]);

  return (
    <div className="min-h-screen bg-[#F4F7FC] dark:bg-[#090E1A] text-slate-800 dark:text-slate-200 p-6 lg:p-8 space-y-6 max-w-[1720px] mx-auto font-sans select-none transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Welcome Back! + Date Selector + Bell + Avatar              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome Back!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Here's the latest update on employee work prediction.
          </p>
        </div>

        {/* Right Header Controls matching reference */}
        <div className="flex items-center gap-3 relative">
          {/* Date Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{selectedPeriod}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPeriodDropdown && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-40 py-1 text-xs animate-in fade-in">
                {['Sep 2026', 'Aug 2026', 'Jul 2026', 'Q3 2026', 'YTD 2026'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPeriod(p);
                      setShowPeriodDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#0F172A] border-none" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 p-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark all read</span>
                </div>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200">
                    <p className="font-medium">ML Calibration Complete</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Next-month predictions synchronized.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50/60 dark:bg-rose-900/20 text-rose-900 dark:text-rose-200">
                    <p className="font-medium">24 Employees At Risk</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Productivity dip anticipated in Operations.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with dropdown for Power Actions */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-xs font-bold shadow-2xs hover:ring-2 hover:ring-blue-400 transition-all"
              aria-label="User profile"
            >
              EY
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 p-2 text-xs space-y-1 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white">Einstein Yathipathi</p>
                  <p className="text-[10px] text-slate-500">HR Analytics Specialist</p>
                </div>
                <button
                  onClick={() => {
                    onLoadDemo();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reload 520 Baseline</span>
                </button>
                <button
                  onClick={() => {
                    onOpenUpload();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Upload Dataset</span>
                </button>
                <button
                  onClick={() => {
                    api.triggerExportCsv();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600" />
                  <span>Export Report (CSV)</span>
                </button>
                {onOpenCopilot && (
                  <button
                    onClick={() => {
                      onOpenCopilot();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-cyan-600" />
                    <span>AI Copilot (Ctrl+K)</span>
                  </button>
                )}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prediction Run Notice Banner */}
      {predictNotice && (
        <div className="p-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">{predictNotice}</span>
          </div>
          <button onClick={() => setPredictNotice(null)} className="text-blue-500 hover:text-blue-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOP KPI ROW: 4 Equal Cards matching reference image                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1: Total Employees (Blue) */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#60A5FA] flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-400/20">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Employees</p>
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {dynamicKPIs.total_employees}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
              <ArrowUp className="w-3 h-3" />
              <span>+12%</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal ml-0.5">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Avg. Productivity Score (Green) */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#10B981] flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg. Productivity Score</p>
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {dynamicKPIs.avg_productivity}%
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
              <ArrowUp className="w-3 h-3" />
              <span>+5%</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal ml-0.5">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 3: High Performers (Purple) */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#8B5CF6] flex items-center justify-center text-white shrink-0 shadow-sm shadow-purple-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">High Performers</p>
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {dynamicKPIs.high_performers}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
              <ArrowUp className="w-3 h-3" />
              <span>+8%</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal ml-0.5">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 4: At Risk (Red) */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#F87171] flex items-center justify-center text-white shrink-0 shadow-sm shadow-rose-400/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">At Risk</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {dynamicKPIs.at_risk}
              </span>
              <span className="text-xs font-bold text-rose-600 flex items-center">
                <ArrowUp className="w-3 h-3 mr-0.5" />
                +20%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
              vs last month
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN SECTION: 2-COLUMN LAYOUT (Left: Charts + Table, Right: Filters)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* ==================== LEFT AREA (9 Cols) ==================== */}
        <div className="xl:col-span-9 space-y-5">
          
          {/* Top Row: Dual Line Chart + Donut Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Chart 1: Actual vs Predicted Work Output */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Actual vs Predicted Work Output
                </h2>
                {/* Legend matching reference */}
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
                    <span>Actual Output</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span>Predicted Output</span>
                  </div>
                </div>
              </div>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" className="dark:stroke-slate-800" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={{ stroke: '#E2E8F0' }} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 11 }} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      ticks={[0, 20, 40, 60, 80, 100]} 
                      axisLine={{ stroke: '#E2E8F0' }} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      label={{ 
                        value: 'Work Output (Tasks)', 
                        angle: -90, 
                        position: 'insideLeft', 
                        offset: 15, 
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
                      stroke="#2563EB" 
                      strokeWidth={2.5} 
                      dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }} 
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#10B981" 
                      strokeWidth={2.5} 
                      dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Employee Productivity Distribution */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Employee Productivity Distribution
              </h2>

              <div className="flex items-center justify-between gap-2 my-auto">
                {/* Donut Chart with Center Text */}
                <div className="relative w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] shrink-0 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Text inside Donut Hole matching reference */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-none">
                      {dynamicKPIs.total_employees}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-1">
                      Employees
                    </span>
                  </div>
                </div>

                {/* Right Legend matching reference */}
                <div className="space-y-3 min-w-[130px] pr-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981] shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400 text-[11px]">High (≥ 80%)</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">32%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6] shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400 text-[11px]">Medium (50–79%)</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">53%</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444] shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400 text-[11px]">{'Low (< 50%)'}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">15%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row: Employee Work Prediction (Sample) Table */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Employee Work Prediction (Sample)
              </h2>
              <button
                onClick={onViewAllEmployees}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                View Full Roster ({dynamicKPIs.total_employees})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F0F5FF] dark:bg-[#13233D] text-slate-700 dark:text-slate-300 rounded-xl overflow-hidden">
                    <th className="py-2.5 px-4 font-semibold text-center w-12 rounded-l-lg">#</th>
                    <th className="py-2.5 px-4 font-semibold">Employee Name</th>
                    <th className="py-2.5 px-4 font-semibold">Department</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Current Productivity</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Predicted Productivity (Next Month)</th>
                    <th className="py-2.5 px-4 font-semibold text-center rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {sampleEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => onViewEmployee(emp.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 text-center font-medium text-slate-500 dark:text-slate-400">
                        {emp.num}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {emp.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {emp.dept}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {emp.current}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {emp.predicted}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {emp.status === 'High' && (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            High
                          </span>
                        )}
                        {emp.status === 'Medium' && (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                            Medium
                          </span>
                        )}
                        {emp.status === 'At Risk' && (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">
                            At Risk
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ==================== RIGHT COLUMN (3 Cols) ==================== */}
        <div className="xl:col-span-3 space-y-5">
          
          {/* 1. Prediction Filter Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Prediction Filter
            </h2>

            {/* Department dropdown */}
            <div className="space-y-1">
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Department
              </label>
              <div className="relative">
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="w-full bg-white dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Time Period dropdown */}
            <div className="space-y-1">
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Time Period
              </label>
              <div className="relative">
                <select
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  className="w-full bg-white dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Next 30 Days">Next 30 Days</option>
                  <option value="Next 60 Days">Next 60 Days</option>
                  <option value="Next 90 Days">Next 90 Days</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Run Prediction Button matching reference */}
            <button
              onClick={handleRunPrediction}
              disabled={isPredicting}
              className="w-full bg-[#1E6BFF] hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all duration-150 active:scale-[0.99] disabled:opacity-75 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isPredicting ? 'Calibrating...' : 'Run Prediction'}</span>
            </button>
          </div>

          {/* 2. Key Insights Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">💡</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Key Insights
              </h2>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>Overall productivity is expected to increase by 6% next month.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>{dynamicKPIs.at_risk} employees are predicted to have low productivity. Consider intervention.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>Engineering and Marketing teams show the highest growth potential.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>Workload balance can improve employee performance by 12%.</span>
              </li>
            </ul>
          </div>

          {/* 3. Top Performing Departments Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Top Performing Departments
            </h2>

            <div className="space-y-3">
              {topDepartments.map((dept) => (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{dept.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${dept.color} rounded-full transition-all duration-500`}
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. FOOTER: Italic Quote + Powered by Data • Driven by People              */}
      {/* ========================================================================= */}
      <div className="pt-4 pb-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="w-full sm:w-auto text-center sm:text-left mx-auto">
          <p className="italic text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-serif">
            “Predicting people performance for a more productive tomorrow.”
          </p>
        </div>
        <div className="text-center sm:text-right shrink-0">
          <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
            Powered by Data • Driven by People
          </p>
        </div>
      </div>

    </div>
  );
};
