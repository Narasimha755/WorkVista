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
  ArrowDown
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
import { CardMaximizeModal } from '../components/modals/CardMaximizeModal';
import { DashboardData, RecommendedActionItem } from '../types';
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

type MaximizeType = 
  | 'productivity_trend' 
  | 'department_performance' 
  | 'workforce_health' 
  | 'risk_performance' 
  | 'key_insights' 
  | 'recent_activity' 
  | null;

export const Dashboard: React.FC<DashboardProps> = ({
  data: initialData,
  loading,
  onOpenUpload,
  onLoadDemo,
  onViewEmployee,
  onViewAllEmployees,
  onOpenCopilot,
  onOpenScenarioPlanner,
}) => {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [activeTimeframe, setActiveTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('1Y');
  const [maximizedCard, setMaximizedCard] = useState<MaximizeType>(null);
  const [hoveredScatterEmployee, setHoveredScatterEmployee] = useState<any>({
    name: 'Rahul Sharma',
    department: 'Engineering',
    productivity: 82.4,
    predicted: 88.1,
    risk_score: 18.5,
    risk_level: 'Low'
  });

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const kpis = data?.kpis;

  // 12-Month Data for Productivity Trend matching reference
  const productivityTrendData = useMemo(() => [
    { month: 'Jan', actual: 62, predicted: 65, lower: 55, upper: 72 },
    { month: 'Feb', actual: 69, predicted: 67, lower: 60, upper: 76 },
    { month: 'Mar', actual: 74, predicted: 70, lower: 63, upper: 79 },
    { month: 'Apr', actual: 73, predicted: 72, lower: 65, upper: 81 },
    { month: 'May', actual: 76, predicted: 74, lower: 67, upper: 83 },
    { month: 'Jun', actual: 77, predicted: 73, lower: 66, upper: 82 },
    { month: 'Jul', actual: 78, predicted: 74, lower: 68, upper: 84 },
    { month: 'Aug', actual: 79, predicted: 75, lower: 68, upper: 85 },
    { month: 'Sep', actual: 78, predicted: 76, lower: 69, upper: 86 },
    { month: 'Oct', actual: 80, predicted: 77, lower: 70, upper: 87 },
    { month: 'Nov', actual: 81, predicted: 79, lower: 72, upper: 89 },
    { month: 'Dec', actual: 83, predicted: 81, lower: 74, upper: 91 },
  ], []);

  // Department Performance rows matching reference
  const departmentsData = [
    { name: 'Engineering', percentage: 88.4, delta: 4.2, isUp: true, color: '#3B82F6' },
    { name: 'Sales', percentage: 76.1, delta: 1.8, isUp: true, color: '#06B6D4' },
    { name: 'Marketing', percentage: 72.3, delta: 1.1, isUp: false, color: '#8B5CF6' },
    { name: 'Operations', percentage: 68.9, delta: 2.6, isUp: true, color: '#F97316' },
    { name: 'HR', percentage: 82.7, delta: 3.4, isUp: true, color: '#EC4899' },
  ];

  // Scatter plot points matching reference
  const scatterPoints = useMemo(() => [
    { x: 82.4, y: 18.5, dept: 'Engineering', name: 'Rahul Sharma', color: '#3B82F6', pred: 88.1, rLevel: 'Low', z: 12 },
    { x: 74.0, y: 22.0, dept: 'Engineering', name: 'Priya Patel', color: '#3B82F6', pred: 79.0, rLevel: 'Low', z: 8 },
    { x: 91.0, y: 14.0, dept: 'Engineering', name: 'Aarav Mehta', color: '#3B82F6', pred: 94.0, rLevel: 'Low', z: 10 },
    { x: 68.0, y: 35.0, dept: 'Sales', name: 'Vikram Singh', color: '#10B981', pred: 71.0, rLevel: 'Moderate', z: 9 },
    { x: 85.0, y: 28.0, dept: 'Sales', name: 'Neha Gupta', color: '#10B981', pred: 87.0, rLevel: 'Low', z: 7 },
    { x: 62.0, y: 44.0, dept: 'Marketing', name: 'Ananya Roy', color: '#8B5CF6', pred: 65.0, rLevel: 'Moderate', z: 8 },
    { x: 77.0, y: 31.0, dept: 'Marketing', name: 'Rohan Joshi', color: '#8B5CF6', pred: 80.0, rLevel: 'Low', z: 6 },
    { x: 58.0, y: 62.0, dept: 'Operations', name: 'Kavita Nair', color: '#F59E0B', pred: 60.0, rLevel: 'High', z: 9 },
    { x: 49.0, y: 71.0, dept: 'Operations', name: 'Aditya Rao', color: '#F59E0B', pred: 52.0, rLevel: 'Critical', z: 8 },
    { x: 84.0, y: 19.0, dept: 'HR', name: 'Sneha Verma', color: '#EC4899', pred: 86.0, rLevel: 'Low', z: 7 },
    { x: 79.0, y: 25.0, dept: 'HR', name: 'Manish Kumar', color: '#EC4899', pred: 81.0, rLevel: 'Low', z: 6 },
    { x: 65.0, y: 48.0, dept: 'Operations', name: 'Tanvi Shah', color: '#F59E0B', pred: 67.0, rLevel: 'Moderate', z: 7 },
    { x: 88.0, y: 16.0, dept: 'Engineering', name: 'Karan Dave', color: '#3B82F6', pred: 90.0, rLevel: 'Low', z: 10 },
    { x: 71.0, y: 38.0, dept: 'Sales', name: 'Deepak Seth', color: '#10B981', pred: 74.0, rLevel: 'Moderate', z: 8 },
    { x: 93.0, y: 12.0, dept: 'Engineering', name: 'Ishita Sen', color: '#3B82F6', pred: 95.0, rLevel: 'Low', z: 11 },
    { x: 42.0, y: 78.0, dept: 'Operations', name: 'Gaurav Jain', color: '#F59E0B', pred: 45.0, rLevel: 'Critical', z: 9 },
    { x: 76.0, y: 29.0, dept: 'Marketing', name: 'Pooja Hegde', color: '#8B5CF6', pred: 78.0, rLevel: 'Low', z: 7 },
    { x: 81.0, y: 21.0, dept: 'HR', name: 'Rajesh Pillai', color: '#EC4899', pred: 83.0, rLevel: 'Low', z: 8 },
  ], []);

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
            <span>Upload CSV</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 p-5 lg:p-6 space-y-4 max-w-[1720px] mx-auto font-sans relative selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO / HEADER AREA: Welcome back, NARASIMHA + Quote + Mountain Silhouette */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1426]/70 border border-slate-800/80 p-5 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Abstract dark-blue mountain/data-wave silhouette background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 select-none">
          <svg 
            className="w-full h-full object-cover" 
            viewBox="0 0 1200 240" 
            preserveAspectRatio="none" 
            fill="none"
          >
            <path 
              d="M0 240 L0 140 Q 150 60, 300 130 T 600 100 T 900 150 T 1200 90 L 1200 240 Z" 
              fill="#172A46" 
            />
            <path 
              d="M0 240 L0 180 Q 200 110, 400 160 T 800 130 T 1200 170 L 1200 240 Z" 
              fill="#101F35" 
            />
            <path 
              d="M0 240 L0 205 Q 350 160, 700 190 T 1200 195 L 1200 240 Z" 
              fill="#0D182A" 
            />
          </svg>
        </div>

        {/* Left: Greeting & Heading */}
        <div className="relative z-10">
          <div className="text-xs italic font-serif text-slate-400 tracking-wide">
            &laquo; Welcome <span className="not-italic text-slate-500 font-sans">back,</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
            NARASIMHA
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Here's your workforce at a glance.
          </p>
        </div>

        {/* Right: Elegant Corporate Quote matching reference */}
        <div className="relative z-10 text-right hidden sm:block">
          <p className="text-xs italic text-slate-300 font-serif leading-relaxed">
            &ldquo;Better people insights<br />build stronger tomorrows.&rdquo;
          </p>
          <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mt-1 font-semibold flex items-center justify-end gap-1.5">
            <span className="w-5 h-[1px] bg-slate-700" />
            <span>WORKVISTA</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KPI ROW: 6 Compact Premium Cards matching reference image */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* 1. Total Employees */}
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-400 truncate">Total Employees</span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white tracking-tight">
              {kpis?.total_employees?.value ?? 520}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
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
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-400 truncate">Avg. Productivity</span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white tracking-tight">
              {kpis?.avg_productivity?.value ? `${kpis.avg_productivity.value}%` : '78.9%'}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
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
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Star className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-400 truncate">High Performers</span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white tracking-tight">
              {kpis?.high_performers?.value ?? 235}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
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
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-400 truncate">At Risk</span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white tracking-tight">
              {kpis?.at_risk?.value ?? 6}
            </span>
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-0.5">
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
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-400 truncate">Predicted Improvement</span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white tracking-tight">
              {kpis?.predicted_improvement?.value ?? 259}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
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
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-400 truncate">Predicted Decline</span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white tracking-tight">
              {kpis?.predicted_decline?.value ?? 250}
            </span>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-0.5">
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
        <div className="lg:col-span-6 xl:col-span-6 bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Productivity Trend</h2>
              <p className="text-[11px] text-slate-400">Actual vs Predicted</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Timeframe selector pills */}
              <div className="flex items-center bg-[#090E1A] p-0.5 rounded-lg border border-slate-800">
                {(['7D', '30D', '90D', '1Y'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                      activeTimeframe === tf 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setMaximizedCard('productivity_trend')}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Maximize chart"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Line / Area Chart */}
          <div className="h-56 w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="confidenceRange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748B" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={v => `${v}%`}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#090E1A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ padding: 0 }}
                  formatter={(value: any) => [`${value}%`]}
                />
                {/* Confidence Range Shading */}
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confidenceRange)" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#0F172A" />

                {/* Actual Line (Cyan / Blue) */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#38BDF8" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#38BDF8', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#38BDF8' }}
                  name="Actual"
                />

                {/* Predicted Line (Purple dashed) */}
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#A855F7" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#A855F7', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#A855F7' }}
                  name="Predicted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Chart Legend matching reference */}
          <div className="flex items-center justify-center gap-5 mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
              <span>Predicted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-cyan-500/20 border border-cyan-500/40" />
              <span>Confidence Range</span>
            </div>
          </div>
        </div>

        {/* CENTER: Department Performance */}
        <div className="lg:col-span-3 xl:col-span-3 bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">Department Performance</h2>
            <button 
              onClick={onViewAllEmployees}
              className="text-[11px] font-semibold text-blue-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Progress Rows */}
          <div className="space-y-3.5 my-auto">
            {departmentsData.map(d => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{d.percentage}%</span>
                    <span className={`text-[10px] font-semibold flex items-center ${d.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {d.isUp ? '↑' : '↓'} {d.delta}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#090E1A] h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${d.percentage}%`, backgroundColor: d.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Workforce Health Gauge */}
        <div className="lg:col-span-3 xl:col-span-3 bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Workforce Health</h2>
            <button 
              onClick={() => setMaximizedCard('workforce_health')}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Maximize card"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Semi-circular Cyan Gauge */}
          <div className="relative flex flex-col items-center justify-center my-auto py-2">
            <svg className="w-36 h-28 overflow-visible" viewBox="0 0 160 100">
              {/* Background Track */}
              <path
                d="M 20 90 A 60 60 0 0 1 140 90"
                fill="none"
                stroke="#1E293B"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Cyan Progress Arc (78.9%) */}
              <path
                d="M 20 90 A 60 60 0 0 1 140 90"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="12"
                strokeDasharray="188.4"
                strokeDashoffset={188.4 * (1 - 0.789)}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute top-9 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-cyan-950/60 text-cyan-400 flex items-center justify-center mb-0.5">
                <Leaf className="w-3 h-3" />
              </div>
              <span className="text-2xl font-black text-white leading-none">78.9</span>
              <span className="text-[10px] font-bold text-emerald-400 mt-0.5">Healthy</span>
            </div>
          </div>

          {/* Summary Text */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed mt-2">
            Workforce health is stable, with improving engagement across departments.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SECOND ANALYTICS ROW: Scatter Plot, Key Insights, Recent Activity */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* LEFT: Employee Risk vs Performance Scatter Plot */}
        <div className="lg:col-span-6 xl:col-span-5 bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs relative">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Employee Risk vs Performance</h2>
              <p className="text-[11px] text-slate-400">Each dot represents an employee</p>
            </div>
            <button 
              onClick={() => setMaximizedCard('risk_performance')}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Maximize card"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-between h-56 mt-2">
            {/* Scatter Graph Area */}
            <div className="flex-1 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: -20 }}>
                  <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Productivity Score" 
                    domain={[0, 100]} 
                    ticks={[0, 50, 100]} 
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
                    data={scatterPoints} 
                    onMouseEnter={(node) => setHoveredScatterEmployee(node)}
                  >
                    {scatterPoints.map((entry, index) => (
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
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-medium">
                Productivity Score
              </span>
              <span className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 text-[9px] text-slate-500 font-medium origin-left">
                Risk Score
              </span>

              {/* Floating Rahul Sharma Tooltip Card matching reference */}
              {hoveredScatterEmployee && (
                <div className="absolute top-6 left-1/4 bg-[#090E1A]/95 border border-cyan-500/40 rounded-xl p-2.5 shadow-xl text-left pointer-events-none z-20 min-w-[150px] backdrop-blur-sm animate-fadeIn">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                    <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-[10px] font-bold">
                      {hoveredScatterEmployee.name?.charAt(0) || 'R'}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white leading-tight">
                        {hoveredScatterEmployee.name}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {hoveredScatterEmployee.department || hoveredScatterEmployee.dept}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Productivity</span>
                      <span className="text-white font-semibold">{hoveredScatterEmployee.productivity || hoveredScatterEmployee.x}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Predicted</span>
                      <span className="text-cyan-300 font-semibold">{hoveredScatterEmployee.predicted || hoveredScatterEmployee.pred}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Risk Score</span>
                      <span className="text-emerald-400 font-semibold">
                        {hoveredScatterEmployee.risk_score || hoveredScatterEmployee.y}% ({hoveredScatterEmployee.risk_level || hoveredScatterEmployee.rLevel})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Department Color Legend on Right */}
            <div className="w-24 pl-2 space-y-2 text-[10px] text-slate-400 shrink-0">
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
        <div className="lg:col-span-3 xl:col-span-3.5 bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Key Insights</h2>
            <button 
              onClick={() => onOpenCopilot && onOpenCopilot()}
              className="text-[11px] font-semibold text-blue-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* 4 Insight Rows */}
          <div className="space-y-2 my-auto">
            {/* 1. Productivity is stable */}
            <div 
              onClick={() => onOpenCopilot && onOpenCopilot('Analyze productivity stability')}
              className="p-2 rounded-lg bg-[#090E1A]/80 border border-slate-800 hover:border-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors group"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-950/60 text-cyan-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">Productivity is stable</div>
                <div className="text-[10px] text-slate-400 truncate">Overall productivity remains steady at 78.9%.</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
            </div>

            {/* 2. Workload rising in Operations */}
            <div 
              onClick={() => onOpenScenarioPlanner && onOpenScenarioPlanner('Operations')}
              className="p-2 rounded-lg bg-[#090E1A]/80 border border-slate-800 hover:border-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors group"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">Workload rising in Operations</div>
                <div className="text-[10px] text-slate-400 truncate">14% increase in workload may impact future performance.</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
            </div>

            {/* 3. Engineering shows strong growth */}
            <div 
              onClick={() => onOpenCopilot && onOpenCopilot('Review Engineering growth')}
              className="p-2 rounded-lg bg-[#090E1A]/80 border border-slate-800 hover:border-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors group"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-950/60 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">Engineering shows strong growth</div>
                <div className="text-[10px] text-slate-400 truncate">Highest predicted improvement (+12.3%).</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
            </div>

            {/* 4. 6 employees at critical risk */}
            <div 
              onClick={() => onViewAllEmployees()}
              className="p-2 rounded-lg bg-[#090E1A]/80 border border-slate-800 hover:border-slate-700 flex items-center gap-2.5 cursor-pointer transition-colors group"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-950/60 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">6 employees at critical risk</div>
                <div className="text-[10px] text-slate-400 truncate">Immediate attention recommended.</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
            </div>
          </div>
        </div>

        {/* RIGHT: Recent Activity Timeline */}
        <div className="lg:col-span-3 xl:col-span-3.5 bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Recent Activity</h2>
            <button 
              onClick={onViewAllEmployees}
              className="text-[11px] font-semibold text-blue-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Timeline entries */}
          <div className="space-y-3 my-auto">
            {/* 1 */}
            <div className="flex items-start gap-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_6px_#10b981]" />
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold leading-snug">Model trained successfully</div>
                <div className="text-[10px] text-slate-400">v1.2 · 520 records</div>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">10:42 AM</span>
            </div>

            {/* 2 */}
            <div className="flex items-start gap-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0 shadow-[0_0_6px_#60a5fa]" />
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold leading-snug">Prediction completed</div>
                <div className="text-[10px] text-slate-400">Generated predictions for 520 employees</div>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">09:18 AM</span>
            </div>

            {/* 3 */}
            <div className="flex items-start gap-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_6px_#22d3ee]" />
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold leading-snug">Dataset updated</div>
                <div className="text-[10px] text-slate-400">Enterprise Dataset</div>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">Yesterday</span>
            </div>

            {/* 4 */}
            <div className="flex items-start gap-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0 shadow-[0_0_6px_#f43f5e]" />
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold leading-snug">3 employees flagged at risk</div>
                <div className="text-[10px] text-slate-400">Requires attention</div>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">Yesterday</span>
            </div>

            {/* 5 */}
            <div className="flex items-start gap-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-[0_0_6px_#fbbf24]" />
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold leading-snug">New note added</div>
                <div className="text-[10px] text-slate-400">For Rahul Sharma</div>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">Dec 28</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CARD MAXIMIZE MODAL (Retains full deep-dive functionality) */}
      {/* ========================================================================= */}
      {maximizedCard && (
        <CardMaximizeModal
          isOpen={true}
          title={
            maximizedCard === 'productivity_trend' ? 'Productivity Trend: Actual vs Predicted' :
            maximizedCard === 'workforce_health' ? 'Workforce Health & Vitality Deep Dive' :
            maximizedCard === 'risk_performance' ? 'Employee Risk vs Performance Matrix' :
            'Enterprise Intelligence Deep Dive'
          }
          onClose={() => setMaximizedCard(null)}
        >
          <div className="p-6 text-slate-300">
            <h3 className="text-lg font-bold text-white mb-2">High-Resolution Enterprise Telemetry</h3>
            <p className="text-xs text-slate-400 mb-6">
              Deep analytical inspection for calibrated workforce telemetry across all 520 records.
            </p>
            <div className="h-80 w-full bg-[#090E1A] rounded-xl border border-slate-800 p-4 flex items-center justify-center text-slate-500 text-sm">
              Telemetry expanded view active
            </div>
          </div>
        </CardMaximizeModal>
      )}
    </div>
  );
};

