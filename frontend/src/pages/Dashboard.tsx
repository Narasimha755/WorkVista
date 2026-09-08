import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  ArrowRight, 
  SlidersHorizontal, 
  RefreshCw, 
  RotateCcw, 
  Maximize2, 
  Layers, 
  BarChart2, 
  TrendingUp, 
  Download 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { MetricCard } from '../components/kpi/MetricCard';
import { ActualVsPredictedChart } from '../components/charts/ActualVsPredictedChart';
import { ProductivityDistributionDonut } from '../components/charts/ProductivityDistributionDonut';
import { AIPredictionEngineCard } from '../components/charts/AIPredictionEngineCard';
import { DepartmentProductivityChart } from '../components/charts/DepartmentProductivityChart';
import { KeyFactorsChart } from '../components/charts/KeyFactorsChart';
import { KeyInsightsPanel } from '../components/charts/KeyInsightsPanel';
import { RecommendedActionsPanel } from '../components/charts/RecommendedActionsPanel';
import { EmployeeTable } from '../components/tables/EmployeeTable';
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
}

type MaximizeType = 
  | 'kpis' 
  | 'actual_vs_predicted' 
  | 'distribution' 
  | 'ai_engine' 
  | 'department' 
  | 'key_factors' 
  | 'insights' 
  | 'actions' 
  | 'employees' 
  | null;

export const Dashboard: React.FC<DashboardProps> = ({
  data: initialData,
  loading,
  onOpenUpload,
  onLoadDemo,
  onViewEmployee,
  onViewAllEmployees,
  searchQuery,
  onSearchChange,
  onActionClick,
}) => {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [cohortGrouping, setCohortGrouping] = useState<'department' | 'experience' | 'workload' | 'attendance'>('department');

  // Maximize modal
  const [maximizedCard, setMaximizedCard] = useState<MaximizeType>(null);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const applyFilters = async (
    dept = selectedDepartment,
    status = selectedStatus,
    exp = selectedExperience,
    cohort = cohortGrouping
  ) => {
    setIsFiltering(true);
    try {
      const res = await api.getDashboard({
        department: dept,
        status: status,
        experience_cohort: exp,
        cohort_grouping: cohort
      });
      setData(res);
    } catch (err) {
      console.error('Failed to filter dashboard data:', err);
    } finally {
      setIsFiltering(false);
    }
  };

  const handleDepartmentFilterChange = (dept: string) => {
    setSelectedDepartment(dept);
    applyFilters(dept, selectedStatus, selectedExperience, cohortGrouping);
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    applyFilters(selectedDepartment, status, selectedExperience, cohortGrouping);
  };

  const handleExperienceFilterChange = (exp: string) => {
    setSelectedExperience(exp);
    applyFilters(selectedDepartment, selectedStatus, exp, cohortGrouping);
  };

  const handleCohortGroupingChange = (cohort: 'department' | 'experience' | 'workload' | 'attendance') => {
    setCohortGrouping(cohort);
    applyFilters(selectedDepartment, selectedStatus, selectedExperience, cohort);
  };

  const handleResetFilters = () => {
    setSelectedDepartment('All Departments');
    setSelectedStatus('All');
    setSelectedExperience('All');
    setCohortGrouping('department');
    applyFilters('All Departments', 'All', 'All', 'department');
  };

  const handleModelChange = async (newModel: string) => {
    api.switchModel(newModel);
    await applyFilters();
  };

  const handleRetrain = async (modelType: string) => {
    setIsRetraining(true);
    try {
      await api.retrainModel({ model_type: modelType });
      await applyFilters();
    } catch (err: any) {
      alert(`Model calibration notice: ${err.message}`);
    } finally {
      setIsRetraining(false);
    }
  };

  const hasActiveFilters = selectedDepartment !== 'All Departments' || selectedStatus !== 'All' || selectedExperience !== 'All' || cohortGrouping !== 'department';
  // Loading skeleton state
  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-[1680px] mx-auto animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80 shadow-xs" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 h-[360px] bg-white rounded-2xl border border-slate-200/80" />
          <div className="lg:col-span-4 h-[360px] bg-white rounded-2xl border border-slate-200/80" />
          <div className="lg:col-span-3 h-[360px] bg-[#0B1120] rounded-2xl border border-slate-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[360px] bg-white rounded-2xl border border-slate-200/80" />
          ))}
        </div>
      </div>
    );
  }

  // Empty State if no dataset uploaded
  if (!data || !data.has_data) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20 animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-blue-500/10">
          <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Welcome to WorkVista
        </h2>
        <p className="text-base text-slate-600 max-w-lg mx-auto mb-8">
          Upload your employee dataset to begin AI workforce prediction, identify at-risk workers, and optimize organizational performance.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLoadDemo}
            className="px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Demo Dataset (520 Employees)</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="px-6 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl shadow-sm transition-all flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Upload Custom CSV / XLSX</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* 0. DYNAMIC GLOBAL FILTER & CONTROLS TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Cohort Filters:</span>
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => handleDepartmentFilterChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Filter by Department"
          >
            <option value="All Departments">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
            <option value="Sales">Sales</option>
          </select>

          {/* Performance Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Filter by Performance Status"
          >
            <option value="All">All Performance Statuses</option>
            <option value="High">High Performers (&gt;= 80%)</option>
            <option value="Medium">Medium Performers (50-79%)</option>
            <option value="Low">Low / At Risk (&lt; 50%)</option>
          </select>

          {/* Experience Filter */}
          <select
            value={selectedExperience}
            onChange={(e) => handleExperienceFilterChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Filter by Experience Tier"
          >
            <option value="All">All Experience Tiers</option>
            <option value="<2y">Junior (&lt; 2 years)</option>
            <option value="2-5y">Mid-level (2-5 years)</option>
            <option value="5-8y">Senior (5-8 years)</option>
            <option value=">8y">Lead / Principal (&gt; 8 years)</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              title="Clear all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Filter Summary & Quick Status */}
        <div className="flex items-center gap-3 text-xs">
          {isFiltering ? (
            <span className="flex items-center gap-1.5 text-blue-600 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Re-aggregating metrics...</span>
            </span>
          ) : (
            <span className="text-slate-500">
              Showing <b className="text-slate-900 font-semibold">{data?.kpis?.total_employees?.value || 0}</b> active profiles
            </span>
          )}

          <button
            onClick={() => setMaximizedCard('kpis')}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Maximize Overview KPIs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. TOP ROW: 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <MetricCard 
          type="total" 
          data={data?.kpis?.total_employees} 
          onMaximize={() => setMaximizedCard('kpis')}
        />
        <MetricCard 
          type="avg" 
          data={data?.kpis?.avg_productivity} 
          onMaximize={() => setMaximizedCard('kpis')}
        />
        <MetricCard 
          type="high" 
          data={data?.kpis?.high_performers} 
          onMaximize={() => setMaximizedCard('kpis')}
        />
        <MetricCard 
          type="risk" 
          data={data?.kpis?.at_risk} 
          onMaximize={() => setMaximizedCard('kpis')}
        />
      </div>

      {/* 2. MAIN ANALYTICS ROW: 3 CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Actual vs Predicted Work Output (6 cols) */}
        <div className="lg:col-span-5">
          <ActualVsPredictedChart 
            data={data?.actual_vs_predicted} 
            hasTemporalData={data?.has_temporal_data}
            cohortGrouping={cohortGrouping}
            onCohortChange={handleCohortGroupingChange}
            onMaximize={() => setMaximizedCard('actual_vs_predicted')}
          />
        </div>

        {/* Productivity Distribution Donut (4 cols) */}
        <div className="lg:col-span-4">
          <ProductivityDistributionDonut 
            data={data?.productivity_distribution} 
            total={data?.distribution_total} 
            onMaximize={() => setMaximizedCard('distribution')}
          />
        </div>

        {/* AI Prediction Engine Card (3 cols) */}
        <div className="lg:col-span-3">
          <AIPredictionEngineCard 
            data={data?.prediction_engine} 
            onModelChange={handleModelChange}
            onRetrain={handleRetrain}
            isRetraining={isRetraining}
            onMaximize={() => setMaximizedCard('ai_engine')}
          />
        </div>
      </div>

      {/* 3. SECOND ROW: 4 WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Department-wise Productivity */}
        <DepartmentProductivityChart 
          data={data?.department_productivity} 
          onMaximize={() => setMaximizedCard('department')}
        />

        {/* Key Factors Influencing Productivity */}
        <KeyFactorsChart 
          factors={data?.key_factors} 
          onMaximize={() => setMaximizedCard('key_factors')}
        />

        {/* Key Insights */}
        <KeyInsightsPanel 
          insights={data?.key_insights} 
          onViewAll={onViewAllEmployees} 
          onMaximize={() => setMaximizedCard('insights')}
        />

        {/* Recommended Actions */}
        <RecommendedActionsPanel 
          actions={data?.recommended_actions} 
          onActionClick={onActionClick} 
          onMaximize={() => setMaximizedCard('actions')}
        />
      </div>

      {/* 4. THIRD ROW: EMPLOYEE PREDICTION DETAILS TABLE */}
      <div>
        <EmployeeTable
          employees={data?.recent_employees}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onViewEmployee={onViewEmployee}
          onViewAll={onViewAllEmployees}
          isFullView={false}
          onMaximize={() => setMaximizedCard('employees')}
        />
      </div>

      {/* Footer Branding Banner */}
      <footer className="pt-6 pb-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <p>© 2026 WorkVista. All rights reserved.</p>
        <p className="italic">"People analytics for a more human, productive workplace."</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
          <span className="hover:text-slate-600 cursor-pointer">Terms</span>
          <span className="hover:text-slate-600 cursor-pointer">Help</span>
        </div>
      </footer>

      {/* UNIVERSAL CARD MAXIMIZE MODAL */}
      <CardMaximizeModal
        isOpen={maximizedCard !== null}
        onClose={() => setMaximizedCard(null)}
        title={
          maximizedCard === 'actual_vs_predicted' ? 'Actual vs Predicted Output by Cohort' :
          maximizedCard === 'distribution' ? 'Productivity Distribution (Predicted)' :
          maximizedCard === 'ai_engine' ? 'AI Prediction Engine Diagnostics & Calibration' :
          maximizedCard === 'department' ? 'Department-wise Productivity Comparison' :
          maximizedCard === 'key_factors' ? 'Key Factors Influencing Productivity' :
          maximizedCard === 'insights' ? 'Workforce Intelligence & Key Strategic Insights' :
          maximizedCard === 'actions' ? 'Prescriptive AI Action Plan' :
          maximizedCard === 'employees' ? 'Employee Prediction Details Directory' :
          'Workforce Analytics Overview'
        }
        subtitle={
          maximizedCard === 'actual_vs_predicted' ? `Grouped by ${cohortGrouping} across active cohort records` :
          maximizedCard === 'distribution' ? 'Dispersion of workforce across calibrated performance thresholds' :
          maximizedCard === 'ai_engine' ? `Supervised Estimator: ${data?.prediction_engine?.model_name || 'RandomForest'} (Regression)` :
          maximizedCard === 'department' ? 'Baseline actual output vs forecasted productivity by operational cohort' :
          maximizedCard === 'key_factors' ? 'Global Shapley feature attribution ranked by predictive weight' :
          maximizedCard === 'insights' ? 'Automated risk detection, workload imbalances, and cohort velocity' :
          maximizedCard === 'actions' ? 'Prioritized organizational interventions for retention and workload mitigation' :
          maximizedCard === 'employees' ? 'Comprehensive employee prediction records with confidence indexes' :
          'Overview of core workforce health indicators'
        }
        badge={maximizedCard === 'ai_engine' ? 'Optimal Fit' : 'Live Data'}
        onExportCsv={() => api.triggerExportCsv({ department: selectedDepartment, status: selectedStatus })}
        breakdownTable={
          maximizedCard === 'actual_vs_predicted' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Cohort Segment</th>
                  <th className="py-2.5 px-4 text-center">Headcount</th>
                  <th className="py-2.5 px-4 text-center">Actual Baseline</th>
                  <th className="py-2.5 px-4 text-center">Predicted Output</th>
                  <th className="py-2.5 px-4 text-center">Variance (Delta)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.actual_vs_predicted || []).map((item, idx) => {
                  const delta = Number((item.predicted - item.actual).toFixed(1));
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{item.label}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600">{item.count || '—'}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-blue-600">{item.actual}%</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-purple-600">{item.predicted}%</td>
                      <td className={`py-2.5 px-4 text-center font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {delta >= 0 ? `+${delta}%` : `${delta}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : maximizedCard === 'distribution' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Performance Tier</th>
                  <th className="py-2.5 px-4 text-center">Headcount</th>
                  <th className="py-2.5 px-4 text-center">Share of Workforce</th>
                  <th className="py-2.5 px-4">Threshold Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.productivity_distribution || []).map((seg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span>{seg.name}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold font-mono text-slate-800">{seg.count}</td>
                    <td className="py-2.5 px-4 text-center font-semibold text-slate-600">{seg.percentage}%</td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {seg.name.includes('High') ? 'Productivity >= 80%' : seg.name.includes('Medium') ? 'Productivity 50-79%' : 'Productivity < 50%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : maximizedCard === 'department' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4 text-center">Actual Productivity</th>
                  <th className="py-2.5 px-4 text-center">Predicted Productivity</th>
                  <th className="py-2.5 px-4 text-center">Growth Velocity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.department_productivity || []).map((dept, idx) => {
                  const gap = Number((dept.predicted - dept.actual).toFixed(1));
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{dept.department}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-blue-600">{dept.actual}%</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-purple-600">{dept.predicted}%</td>
                      <td className={`py-2.5 px-4 text-center font-bold ${gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {gap >= 0 ? `+${gap}%` : `${gap}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : maximizedCard === 'key_factors' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-4">Feature Vector</th>
                  <th className="py-2.5 px-4 text-center">Importance Weight</th>
                  <th className="py-2.5 px-4">Correlation Direction</th>
                  <th className="py-2.5 px-4">Impact Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.key_factors || []).map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{f.name}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-blue-600">{f.importance_pct}%</td>
                    <td className="py-2.5 px-4 text-emerald-600 font-semibold">Positive (+)</td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">Direct influence on baseline output trajectory</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null
        }
      >
        {/* Render Expanded Visual in Modal */}
        {maximizedCard === 'actual_vs_predicted' && (
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.actual_vs_predicted || []} margin={{ top: 20, right: 20, left: 0, bottom: 20 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="actual" name="Actual Output" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={45} />
                <Bar dataKey="predicted" name="Predicted Output" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {maximizedCard === 'distribution' && (
          <div className="h-[380px] w-full flex items-center justify-center">
            <div className="w-72 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.productivity_distribution || []}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={4}
                  >
                    {(data?.productivity_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {maximizedCard === 'ai_engine' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400">R² Score</span>
                <h3 className="text-2xl font-bold text-blue-400 mt-1">{data?.prediction_engine?.r2_score || 0.748}</h3>
                <span className="text-[10px] text-emerald-400">Optimal calibration</span>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400">Mean Absolute Error (MAE)</span>
                <h3 className="text-2xl font-bold text-indigo-400 mt-1">{data?.prediction_engine?.mae || 2.30} pts</h3>
                <span className="text-[10px] text-slate-400">Average residual error</span>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400">Root Mean Squared Error</span>
                <h3 className="text-2xl font-bold text-purple-400 mt-1">{data?.prediction_engine?.rmse || 2.82} pts</h3>
                <span className="text-[10px] text-slate-400">Penalized variance fit</span>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400">Sample Training Scope</span>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">{data?.prediction_engine?.dataset_size || 520} records</h3>
                <span className="text-[10px] text-slate-400">100% active workforce</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Current Estimator: {data?.prediction_engine?.model_name || 'RandomForest'}</h4>
                <p className="text-xs text-slate-500">Supervised ensemble pipeline producing multi-factor non-linear productivity predictions.</p>
              </div>
              <button
                onClick={() => handleRetrain(data?.prediction_engine?.model_name || 'RandomForest')}
                disabled={isRetraining}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                <span>{isRetraining ? 'Calibrating...' : 'Recalibrate Estimator'}</span>
              </button>
            </div>
          </div>
        )}

        {maximizedCard === 'department' && (
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.department_productivity || []} margin={{ top: 20, right: 20, left: 0, bottom: 20 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="actual" name="Actual Baseline" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={45} />
                <Bar dataKey="predicted" name="Predicted Output" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {maximizedCard === 'key_factors' && (
          <div className="space-y-4 py-4">
            {(data?.key_factors || []).map((f) => (
              <div key={f.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>{f.name}</span>
                  <span className="font-bold text-blue-600">{f.importance_pct}% attribution</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, f.importance_pct * 2.5)}%`, backgroundColor: f.color || '#3B82F6' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {maximizedCard === 'insights' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(data?.key_insights || []).map((ins, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {ins.badge || 'Insight'}
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">{ins.message}</p>
              </div>
            ))}
          </div>
        )}

        {maximizedCard === 'actions' && (
          <div className="space-y-3">
            {(data?.recommended_actions || []).map((action, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${action.urgency === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                    {action.category} ({action.urgency.toUpperCase()})
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{action.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{action.potential_impact}</p>
                </div>
                <button
                  onClick={() => onActionClick(action)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shrink-0"
                >
                  {action.action_label}
                </button>
              </div>
            ))}
          </div>
        )}

        {maximizedCard === 'employees' && (
          <div>
            <EmployeeTable
              employees={data?.recent_employees}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onViewEmployee={onViewEmployee}
              onViewAll={onViewAllEmployees}
              isFullView={true}
            />
          </div>
        )}

        {maximizedCard === 'kpis' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard type="total" data={data?.kpis?.total_employees} />
            <MetricCard type="avg" data={data?.kpis?.avg_productivity} />
            <MetricCard type="high" data={data?.kpis?.high_performers} />
            <MetricCard type="risk" data={data?.kpis?.at_risk} />
          </div>
        )}
      </CardMaximizeModal>
    </div>
  );
};
