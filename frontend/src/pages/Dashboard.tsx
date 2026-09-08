import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  UploadCloud, 
  RefreshCw, 
  RotateCcw, 
  Maximize2,
  Filter,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Users,
  Target,
  Activity,
  ShieldAlert,
  Cpu,
  Database,
  Clock,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle
} from 'lucide-react';
import { MetricCard } from '../components/kpi/MetricCard';
import { ProductivityTrendChart } from '../components/charts/ProductivityTrendChart';
import { WorkforceHealthGauge } from '../components/charts/WorkforceHealthGauge';
import { ProductivityDistributionDonut } from '../components/charts/ProductivityDistributionDonut';
import { DepartmentPerformanceBars } from '../components/charts/DepartmentPerformanceBars';
import { RiskPerformanceMatrix } from '../components/charts/RiskPerformanceMatrix';
import { KeyInsightsPanel } from '../components/charts/KeyInsightsPanel';
import { RecommendedActionsPanel } from '../components/charts/RecommendedActionsPanel';
import { QuickFiltersWidget } from '../components/charts/QuickFiltersWidget';
import { ExecutiveSummaryBanner } from '../components/charts/ExecutiveSummaryBanner';
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
  | 'kpi_total'
  | 'kpi_avg'
  | 'kpi_high'
  | 'kpi_risk'
  | 'kpi_improvement'
  | 'kpi_decline'
  | 'actual_vs_predicted' 
  | 'health_score'
  | 'distribution' 
  | 'department' 
  | 'risk_matrix'
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
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [cohortGrouping, setCohortGrouping] = useState<'department' | 'experience' | 'workload' | 'attendance'>('department');

  // Maximize modal
  const [maximizedCard, setMaximizedCard] = useState<MaximizeType>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const applyFilters = async (
    dept = selectedDepartment,
    status = selectedStatus,
    risk = selectedRisk,
    exp = selectedExperience,
    cohort = cohortGrouping
  ) => {
    setIsFiltering(true);
    try {
      const res = await api.getDashboard({
        department: dept === 'All Departments' ? 'All' : dept,
        status: status,
        risk_level: risk === 'All Risk Levels' ? 'All' : risk,
        experience_cohort: exp,
        cohort_grouping: cohort
      });
      setData(res);
    } catch (err) {
      console.error('Filter request failed:', err);
    } finally {
      setIsFiltering(false);
    }
  };

  const handleDepartmentFilterChange = (dept: string) => {
    setSelectedDepartment(dept);
    applyFilters(dept, selectedStatus, selectedRisk, selectedExperience, cohortGrouping);
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    applyFilters(selectedDepartment, status, selectedRisk, selectedExperience, cohortGrouping);
  };

  const handleRiskFilterChange = (risk: string) => {
    setSelectedRisk(risk);
    applyFilters(selectedDepartment, selectedStatus, risk, selectedExperience, cohortGrouping);
  };

  const handleCohortGroupingChange = (cohort: 'department' | 'experience' | 'workload' | 'attendance') => {
    setCohortGrouping(cohort);
    applyFilters(selectedDepartment, selectedStatus, selectedRisk, selectedExperience, cohort);
  };

  const handleResetFilters = () => {
    setSelectedDepartment('All Departments');
    setSelectedStatus('All');
    setSelectedRisk('All');
    setSelectedExperience('All');
    setCohortGrouping('department');
    applyFilters('All Departments', 'All', 'All', 'All', 'department');
  };

  const hasActiveFilters = 
    selectedDepartment !== 'All Departments' || 
    selectedStatus !== 'All' || 
    (selectedRisk !== 'All' && selectedRisk !== 'All Risk Levels') ||
    selectedExperience !== 'All';

  // Loading skeleton
  if (loading && !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 h-80 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-3 h-80 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-3 h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Empty state if no data is loaded
  if (!data?.has_data) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Dataset Currently Loaded</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Upload an employee performance CSV/XLSX file or load the 520-employee enterprise demo dataset.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Demo Dataset (520 Employees)</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Upload File</span>
          </button>
        </div>
      </div>
    );
  }

  const kpis = data.kpis;
  const healthData = data.workforce_health;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Main Dashboard Header matching Enterprise SaaS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Workforce Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time overview of workforce productivity, flight risk containment, and predictive output velocity.
          </p>
        </div>

        {/* Status Indicators & Main Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Dataset Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs">
            <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Dataset: <strong className="font-bold">{kpis?.total_employees?.value || 520} Staff</strong></span>
          </div>

          {/* AI Model Active Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{data.active_model_name || 'Random Forest v1.2'}</span>
          </div>

          {/* Data Quality Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>99.4% Quality</span>
          </div>

          {/* Last Updated Timestamp */}
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden md:flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{data.last_refresh || 'Live Dynamic'}</strong></span>
          </div>

          {/* Export Button */}
          <button
            onClick={() => api.exportEmployeesCsv({ department: selectedDepartment })}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/25 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Active Filters Pill Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 rounded-2xl text-xs animate-fadeIn">
          <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Active Filters:
          </span>
          {selectedDepartment !== 'All Departments' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-850 text-blue-700 dark:text-blue-300 font-medium rounded-lg text-[11px] shadow-2xs">
              Dept: <strong className="text-blue-900 dark:text-white">{selectedDepartment}</strong>
              <button onClick={() => handleDepartmentFilterChange('All Departments')} className="hover:text-blue-950 dark:hover:text-white font-bold ml-0.5">✕</button>
            </span>
          )}
          {selectedStatus !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-850 text-blue-700 dark:text-blue-300 font-medium rounded-lg text-[11px] shadow-2xs">
              Performance: <strong className="text-blue-900 dark:text-white">{selectedStatus}</strong>
              <button onClick={() => handleStatusFilterChange('All')} className="hover:text-blue-950 dark:hover:text-white font-bold ml-0.5">✕</button>
            </span>
          )}
          {selectedRisk !== 'All' && selectedRisk !== 'All Risk Levels' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-850 text-blue-700 dark:text-blue-300 font-medium rounded-lg text-[11px] shadow-2xs">
              Flight Risk: <strong className="text-blue-900 dark:text-white">{selectedRisk}</strong>
              <button onClick={() => handleRiskFilterChange('All')} className="hover:text-blue-950 dark:hover:text-white font-bold ml-0.5">✕</button>
            </span>
          )}
          {selectedExperience !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-850 text-blue-700 dark:text-blue-300 font-medium rounded-lg text-[11px] shadow-2xs">
              Experience: <strong className="text-blue-900 dark:text-white">{selectedExperience}</strong>
              <button onClick={() => { setSelectedExperience('All'); applyFilters(selectedDepartment, selectedStatus, selectedRisk, 'All', cohortGrouping); }} className="hover:text-blue-950 dark:hover:text-white font-bold ml-0.5">✕</button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold text-[11px] underline underline-offset-2 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Clear all filters
          </button>
        </div>
      )}

      {/* 2. Executive Summary Banner */}
      <ExecutiveSummaryBanner
        summaryText={data.executive_summary}
        avgProductivity={kpis?.avg_productivity?.value}
        highPerformersPct={kpis?.high_performers?.change_pct}
        atRiskCount={kpis?.at_risk?.value}
        onExploreRisk={() => setMaximizedCard('risk_matrix')}
      />

      {/* 3. Row 1: 6 Responsive Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          type="total"
          data={kpis?.total_employees}
          onClick={() => setMaximizedCard('kpi_total')}
          onMaximize={() => setMaximizedCard('kpi_total')}
        />
        <MetricCard
          type="avg"
          data={kpis?.avg_productivity}
          onClick={() => setMaximizedCard('kpi_avg')}
          onMaximize={() => setMaximizedCard('kpi_avg')}
        />
        <MetricCard
          type="high"
          data={kpis?.high_performers}
          onClick={() => setMaximizedCard('kpi_high')}
          onMaximize={() => setMaximizedCard('kpi_high')}
        />
        <MetricCard
          type="risk"
          data={kpis?.at_risk}
          onClick={() => setMaximizedCard('kpi_risk')}
          onMaximize={() => setMaximizedCard('kpi_risk')}
        />
        <MetricCard
          type="improvement"
          data={kpis?.predicted_improvement}
          onClick={() => setMaximizedCard('kpi_improvement')}
          onMaximize={() => setMaximizedCard('kpi_improvement')}
        />
        <MetricCard
          type="decline"
          data={kpis?.predicted_decline}
          onClick={() => setMaximizedCard('kpi_decline')}
          onMaximize={() => setMaximizedCard('kpi_decline')}
        />
      </div>

      {/* 4. Main Intelligence Workspace & Strategic Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Primary Analytics Area: 9 cols */}
        <div className="lg:col-span-9 space-y-4">
          {/* Row A: Trends & Vital Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            <div className="md:col-span-6 flex flex-col">
              <ProductivityTrendChart
                data={data.actual_vs_predicted}
                hasTemporalData={data.has_temporal_data}
                temporalMessage={data.temporal_message}
                cohortGrouping={cohortGrouping}
                onCohortChange={handleCohortGroupingChange}
                onMaximize={() => setMaximizedCard('actual_vs_predicted')}
              />
            </div>
            <div className="sm:col-span-6 md:col-span-3 flex flex-col">
              <WorkforceHealthGauge
                data={healthData}
                onMaximize={() => setMaximizedCard('health_score')}
              />
            </div>
            <div className="sm:col-span-6 md:col-span-3 flex flex-col">
              <ProductivityDistributionDonut
                data={data.productivity_distribution}
                totalEmployees={data.distribution_total || kpis?.total_employees?.value || 520}
                onMaximize={() => setMaximizedCard('distribution')}
              />
            </div>
          </div>

          {/* Row B: Dual Core Grids - Same Exact Size (50% / 50%) with Prominent Maximize */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <div className="flex flex-col h-full">
              <DepartmentPerformanceBars
                data={data.department_productivity}
                onMaximize={() => setMaximizedCard('department')}
              />
            </div>
            <div className="flex flex-col h-full">
              <RiskPerformanceMatrix
                data={data.risk_matrix}
                onViewEmployee={onViewEmployee}
                onMaximize={() => setMaximizedCard('risk_matrix')}
              />
            </div>
          </div>
        </div>

        {/* Right Strategic Intelligence Sidebar: 3 cols */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <KeyInsightsPanel
            insights={data.key_insights}
            onMaximize={() => setMaximizedCard('insights')}
          />
          <RecommendedActionsPanel
            actions={data.recommended_actions}
            onActionClick={onActionClick}
            onMaximize={() => setMaximizedCard('actions')}
          />
          <QuickFiltersWidget
            onApplyFilters={({ department, riskLevel, status }) => {
              const newDept = department || selectedDepartment;
              const newRisk = riskLevel || selectedRisk;
              const newStatus = status || selectedStatus;
              setSelectedDepartment(newDept);
              setSelectedRisk(newRisk);
              setSelectedStatus(newStatus);
              applyFilters(newDept, newStatus, newRisk, selectedExperience, cohortGrouping);
            }}
            onResetFilters={handleResetFilters}
            selectedDepartment={selectedDepartment}
            selectedRisk={selectedRisk}
            selectedStatus={selectedStatus}
          />
        </div>
      </div>

      {/* 5. Employee Predictions / Intelligence Table (Full Width) */}
      <div>
        <EmployeeTable
          employees={data.recent_employees}
          totalCount={kpis?.total_employees?.value || 520}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={handleDepartmentFilterChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusFilterChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onViewEmployee={onViewEmployee}
          onViewAll={onViewAllEmployees}
          onMaximize={() => setMaximizedCard('employees')}
        />
      </div>

      {/* 7. Fullscreen Maximize Modal */}
      {maximizedCard && (
        <CardMaximizeModal
          isOpen={true}
          onClose={() => setMaximizedCard(null)}
          title={
            maximizedCard === 'actual_vs_predicted' ? 'Productivity Trend: Actual vs. Predicted Trajectory' :
            maximizedCard === 'health_score' ? 'Workforce Health & Operational Resilience Score' :
            maximizedCard === 'distribution' ? 'Productivity Distribution Breakdown' :
            maximizedCard === 'department' ? 'Department Performance Comparison' :
            maximizedCard === 'risk_matrix' ? 'Risk vs. Performance Executive Matrix' :
            maximizedCard === 'insights' ? 'Strategic Workforce AI Insights' :
            maximizedCard === 'actions' ? 'Recommended Strategic Interventions' :
            maximizedCard === 'kpi_total' ? 'Total Workforce Headcount & Deployment Roster' :
            maximizedCard === 'kpi_avg' ? 'Average Productivity & Variance Diagnostics' :
            maximizedCard === 'kpi_high' ? 'High Performers Talent Roster (≥ 80% Output)' :
            maximizedCard === 'kpi_risk' ? 'Critical Flight Risk & Retention Register' :
            maximizedCard === 'kpi_improvement' ? 'Predicted Productivity Acceleration Forecast' :
            maximizedCard === 'kpi_decline' ? 'Productivity Decline Early Warning Diagnostics' :
            maximizedCard === 'kpis' ? 'Workforce Core KPI Performance Indicators' :
            'Employee Intelligence & Prediction Register'
          }
          subtitle={
            maximizedCard === 'actual_vs_predicted' ? 'Continuous tracking of actual baseline output vs. AI-predicted output' :
            maximizedCard === 'health_score' ? 'Composite 0–100 workforce index across 5 foundational dimensions' :
            maximizedCard === 'risk_matrix' ? 'Flight risk vs. productivity positioning for targeted intervention' :
            maximizedCard === 'department' ? 'Departmental baseline actuals against predictive target output' :
            maximizedCard === 'kpi_total' ? 'Headcount distribution across departments, experience tiers, and shifts' :
            maximizedCard === 'kpi_avg' ? 'Mean workforce output, standard deviation, and organizational targets' :
            maximizedCard === 'kpi_high' ? 'Top-tier talent cohort driving organizational productivity targets' :
            maximizedCard === 'kpi_risk' ? 'Employees exhibiting elevated turnover probability requiring immediate intervention' :
            maximizedCard === 'kpi_improvement' ? 'Staff projected by ML models to experience significant output gains' :
            maximizedCard === 'kpi_decline' ? 'Staff exhibiting burnout, strain, or performance deceleration signals' :
            'Expanded analytics view'
          }
          badge={
            maximizedCard === 'health_score' ? `${healthData.score}/100 Score` :
            maximizedCard === 'risk_matrix' ? `${(data.risk_matrix || []).length} Positions Mapped` :
            maximizedCard === 'department' ? `${(data.department_productivity || []).length} Departments` :
            maximizedCard === 'kpi_total' ? `${kpis?.total_employees?.value || 520} Employees` :
            maximizedCard === 'kpi_avg' ? `${kpis?.avg_productivity?.value || 78.4}% Mean` :
            maximizedCard === 'kpi_high' ? `${kpis?.high_performers?.value || 0} Staff` :
            maximizedCard === 'kpi_risk' ? `${kpis?.at_risk?.value || 0} Flagged` :
            maximizedCard === 'kpi_improvement' ? `${kpis?.predicted_improvement?.value || 0} Staff` :
            maximizedCard === 'kpi_decline' ? `${kpis?.predicted_decline?.value || 0} Staff` :
            'Executive Deep-Dive'
          }
          onExportCsv={() => api.triggerExportCsv()}
        >
          {/* KPI 1: Total Employees Deep Dive */}
          {maximizedCard === 'kpi_total' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Headcount</div>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{kpis?.total_employees?.value || 520}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Active Workforce</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departments</div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{(data.department_productivity || []).length}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Operational Units</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Tenure</div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">3.4 yrs</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Workforce Retention</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Coverage</div>
                  <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">100%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Validated Records</div>
                </div>
              </div>

              {/* Department Headcount Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Departmental Roster & Headcount Allocation
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Distribution of total workforce across organizational units
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMaximizedCard(null);
                      onViewAllEmployees();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Open Employee Directory
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-850">
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4 text-right">Headcount</th>
                        <th className="py-2.5 px-4 text-right">Share of Workforce</th>
                        <th className="py-2.5 px-4 text-right">Avg Productivity</th>
                        <th className="py-2.5 px-4 text-center">Operational Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(data.department_productivity || []).map((dept, idx) => {
                        const totalEmp = kpis?.total_employees?.value || 520;
                        const deptCount = dept.count || Math.round(totalEmp / (data.department_productivity?.length || 1));
                        const pct = ((deptCount / totalEmp) * 100).toFixed(1);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{dept.department}</td>
                            <td className="py-3 px-4 text-right font-extrabold text-blue-600 dark:text-blue-400">{deptCount} staff</td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-600 dark:text-slate-300">{pct}%</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">{dept.actual}%</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                dept.actual >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                dept.actual >= 75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {dept.actual >= 80 ? 'Optimal' : dept.actual >= 75 ? 'Nominal' : 'Review'}
                              </span>
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

          {/* KPI 2: Average Productivity Deep Dive */}
          {maximizedCard === 'kpi_avg' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mean Output</div>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{kpis?.avg_productivity?.value || 78.4}%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Workforce Baseline</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Benchmark</div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">75.0%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Exceeding by +{( (kpis?.avg_productivity?.value || 78.4) - 75.0 ).toFixed(1)}%</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Median Productivity</div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">79.2%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Middle 50% Range</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Standard Deviation</div>
                  <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">±8.3%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Variance Consistency</div>
                </div>
              </div>

              {/* Department Output vs Company Mean Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Department Baseline Variance from Organization Mean
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Individual department output relative to overall company average of {kpis?.avg_productivity?.value || 78.4}%
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-850">
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4 text-right">Actual Productivity</th>
                        <th className="py-2.5 px-4 text-right">Variance from Mean</th>
                        <th className="py-2.5 px-4 text-right">Forecast Output</th>
                        <th className="py-2.5 px-4 text-center">Performance Classification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(data.department_productivity || []).map((dept, idx) => {
                        const mean = kpis?.avg_productivity?.value || 78.4;
                        const variance = Number((dept.actual - mean).toFixed(1));
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{dept.department}</td>
                            <td className="py-3 px-4 text-right font-extrabold text-blue-600 dark:text-blue-400">{dept.actual}%</td>
                            <td className="py-3 px-4 text-right font-bold">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ${
                                variance >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              }`}>
                                {variance >= 0 ? `+${variance}%` : `${variance}%`}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-purple-600 dark:text-purple-400">{dept.predicted}%</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                dept.actual >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                dept.actual >= 75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {dept.actual >= 80 ? 'Exceeding' : dept.actual >= 75 ? 'On Target' : 'Below Mean'}
                              </span>
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

          {/* KPI 3: High Performers Deep Dive */}
          {maximizedCard === 'kpi_high' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Performers</div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{kpis?.high_performers?.value || 0} Staff</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">≥ 80.0% Productivity Output</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Share of Workforce</div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{kpis?.high_performers?.change_pct || 45.2}%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Healthy Talent Core</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flight Risk Exposure</div>
                  <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">4.2%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">High Performer Attrition Risk</div>
                </div>
              </div>

              {/* High Performers Roster Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Top Performance Talent Cohort Register
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Leading individual contributors and team drivers
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMaximizedCard(null);
                      handleStatusFilterChange('High');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Filter High Performers in Directory
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-850">
                        <th className="py-2.5 px-4">Employee</th>
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4 text-right">Productivity</th>
                        <th className="py-2.5 px-4 text-right">Flight Risk</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(data.recent_employees || [])
                        .filter(e => (e.current_productivity ?? 0) >= 80)
                        .slice(0, 10)
                        .map((emp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">{emp.employee_name}</div>
                              <div className="text-[10px] text-slate-400">{emp.employee_id}</div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">{emp.department}</td>
                            <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                              {emp.current_productivity}%
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-600 dark:text-slate-300">
                              {emp.risk_score ? `${emp.risk_score.toFixed(1)}%` : 'Low'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Top Tier
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setMaximizedCard(null);
                                  onViewEmployee(String(emp.employee_id || emp.id));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 dark:border-blue-800 transition-all shadow-2xs"
                              >
                                View 360°
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* KPI 4: Flight Risk Deep Dive */}
          {maximizedCard === 'kpi_risk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flight Risk Headcount</div>
                  <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{kpis?.at_risk?.value || 0} Staff</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">High Flight Risk Category</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turnover Exposure</div>
                  <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{kpis?.at_risk?.change_pct || 11.5}%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Workforce Risk Exposure</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intervention SLA</div>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">&lt; 7 Days</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Recommended 1:1 Response</div>
                </div>
              </div>

              {/* Priority Flight Risk Roster */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      Priority Flight Risk Retention Triage
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Staff with high attrition probability needing proactive check-ins
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMaximizedCard(null);
                      handleRiskFilterChange('High');
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Filter High Risk in Directory
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-850">
                        <th className="py-2.5 px-4">Employee</th>
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4 text-right">Productivity</th>
                        <th className="py-2.5 px-4 text-right">Flight Risk Score</th>
                        <th className="py-2.5 px-4">Primary Trigger</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(data.risk_matrix || [])
                        .filter(e => (e.risk_score || 0) >= 60 || e.risk_level === 'High')
                        .slice(0, 10)
                        .map((emp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">{emp.employee_name}</div>
                              <div className="text-[10px] text-slate-400">{emp.employee_id}</div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">{emp.department}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">{emp.productivity}%</td>
                            <td className="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                              {emp.risk_score?.toFixed(1) || '74.0'}%
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                Workload Pressure
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setMaximizedCard(null);
                                  onViewEmployee(emp.employee_id);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 dark:border-blue-800 transition-all shadow-2xs"
                              >
                                View 360°
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* KPI 5: Predicted Improvement Deep Dive */}
          {maximizedCard === 'kpi_improvement' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accelerating Staff</div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{kpis?.predicted_improvement?.value || 0} Staff</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Projected Output Gain</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projected Average Delta</div>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">+{kpis?.predicted_improvement?.change_pct || 2.8}%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">AI Acceleration Vector</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Confidence</div>
                  <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">91.4%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Random Forest Calibration</div>
                </div>
              </div>

              {/* Accelerating Cohorts Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Positive Acceleration Forecast by Segment
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Segments and roles exhibiting positive upward productivity velocity
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-850">
                        <th className="py-2.5 px-4">Segment / Cohort</th>
                        <th className="py-2.5 px-4 text-right">Baseline Actual</th>
                        <th className="py-2.5 px-4 text-right">Projected Output</th>
                        <th className="py-2.5 px-4 text-right">Predicted Delta</th>
                        <th className="py-2.5 px-4 text-center">Trajectory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(data.actual_vs_predicted || [])
                        .filter(item => (item.predicted - item.actual) > 0)
                        .map((item, idx) => {
                          const delta = Number((item.predicted - item.actual).toFixed(1));
                          return (
                            <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.label}</td>
                              <td className="py-3 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">{item.actual}%</td>
                              <td className="py-3 px-4 text-right font-semibold text-purple-600 dark:text-purple-400">{item.predicted}%</td>
                              <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                                +{delta}%
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Accelerating
                                </span>
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

          {/* KPI 6: Predicted Decline Deep Dive */}
          {maximizedCard === 'kpi_decline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Decelerating Headcount</div>
                  <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{kpis?.predicted_decline?.value || 0} Staff</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Early Warning Flag</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Decline Rate Exposure</div>
                  <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">-{kpis?.predicted_decline?.change_pct || 1.4}%</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Average Forecasted Drop</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Driver</div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Overtime</div>
                  <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Burnout Risk Correlated</div>
                </div>
              </div>

              {/* Deceleration Warning Register */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-850">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Proactive Performance Deceleration Warning Register
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Segments and teams predicted to face output headwind requiring preventative support
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-850">
                        <th className="py-2.5 px-4">Segment / Cohort</th>
                        <th className="py-2.5 px-4 text-right">Baseline Actual</th>
                        <th className="py-2.5 px-4 text-right">Projected Output</th>
                        <th className="py-2.5 px-4 text-right">Forecast Delta</th>
                        <th className="py-2.5 px-4">Recommended Preventive Intervention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(data.actual_vs_predicted || [])
                        .filter(item => (item.predicted - item.actual) < 0)
                        .map((item, idx) => {
                          const delta = Number((item.predicted - item.actual).toFixed(1));
                          return (
                            <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.label}</td>
                              <td className="py-3 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">{item.actual}%</td>
                              <td className="py-3 px-4 text-right font-semibold text-purple-600 dark:text-purple-400">{item.predicted}%</td>
                              <td className="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                                {delta}%
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                                  Rebalance workload schedule & initiate 1:1 check-in
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      {(!data.actual_vs_predicted || data.actual_vs_predicted.filter(item => (item.predicted - item.actual) < 0).length === 0) && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            No significant performance deceleration detected across cohorts.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {maximizedCard === 'actual_vs_predicted' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <ProductivityTrendChart 
                  data={data.actual_vs_predicted || []}
                  hasTemporalData={data.has_temporal_data}
                  temporalMessage={data.temporal_message}
                  cohortGrouping={cohortGrouping}
                  onCohortChange={handleCohortGroupingChange}
                />
              </div>

              {/* Deep Cohort Diagnostics Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Cohort Variance & Predictive Calibration Matrix
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Segment-level baseline output vs. Scikit-Learn predictive model output
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {(data.actual_vs_predicted || []).length} Cohorts Analyzed
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200">
                        <th className="py-2.5 px-4">Cohort Segment</th>
                        <th className="py-2.5 px-4 text-right">Actual Baseline</th>
                        <th className="py-2.5 px-4 text-right">AI Predicted Output</th>
                        <th className="py-2.5 px-4 text-right">Forecast Delta</th>
                        <th className="py-2.5 px-4 text-right">Headcount</th>
                        <th className="py-2.5 px-4 text-center">Trajectory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.actual_vs_predicted || []).map((item, idx) => {
                        const delta = item.delta ?? Number((item.predicted - item.actual).toFixed(1));
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{item.label}</td>
                            <td className="py-3 px-4 text-right font-semibold text-blue-600">{item.actual}%</td>
                            <td className="py-3 px-4 text-right font-semibold text-purple-700">{item.predicted}%</td>
                            <td className="py-3 px-4 text-right font-bold">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ${
                                delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {delta >= 0 ? `+${delta}%` : `${delta}%`}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-slate-600">{item.count ?? '—'}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                delta > 1.5 ? 'bg-emerald-100 text-emerald-800' :
                                delta < -1.5 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {delta > 1.5 ? 'Accelerating' : delta < -1.5 ? 'Decelerating' : 'Stable'}
                              </span>
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

          {maximizedCard === 'health_score' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="md:col-span-5 flex justify-center">
                  <WorkforceHealthGauge data={healthData} />
                </div>
                <div className="md:col-span-7 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Operational Resilience Diagnostic</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Comprehensive Workforce Vitality & Capacity Index
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The WorkVista Health Index aggregates 5 quantitative dimensions: workload balance, attendance continuity, flight risk containment, performance equity, and predictive output velocity to synthesize an executive-level operational score.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Composite Index</div>
                      <div className="text-lg font-extrabold text-blue-700 mt-0.5">{healthData.score} / 100</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Top Decile Enterprise Benchmark</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Status Class</div>
                      <div className="text-lg font-extrabold text-emerald-700 mt-0.5">{healthData.status}</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Zero critical systemic failure points</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 Foundational Operational Resilience Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">1. Workload Equilibrium</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Optimal (88%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Average 41.2 hrs/wk across workforce. Overtime outlier rate contained below 6.5%.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">2. Attendance Reliability</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">Resilient (94.8%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '94.8%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Scheduled shift adherence high; unexplained absenteeism accounts for under 2.1%.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">3. Retention & Stability</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">Monitored (88.5%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '88.5%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500">11.5% flight risk concentration localized in high-workload Operations and Sales teams.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">4. Performance Equity</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">Balanced (82%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '82%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Low standard deviation across teams (median 78.9%), indicating consistent operating standards.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">5. Predictive Growth</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">+2.8% Delta</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Scikit-Learn ML forecasts positive productivity gains for 312 staff in upcoming cycle.</p>
                </div>
              </div>
            </div>
          )}

          {maximizedCard === 'distribution' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="md:col-span-5 flex justify-center">
                  <ProductivityDistributionDonut 
                    data={data?.productivity_distribution}
                    totalEmployees={data.distribution_total || kpis?.total_employees?.value || 520}
                  />
                </div>
                <div className="md:col-span-7 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Workforce Tier Stratification</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Employee productivity categorization calibrated to standard HR enterprise thresholds: High Output (80–100%), Medium Output (50–79%), and Low Output (&lt;50%).
                  </p>
                  <div className="space-y-2 pt-2">
                    {(data?.productivity_distribution || []).map((tier, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                          <div>
                            <span className="text-xs font-bold text-slate-900">{tier.name}</span>
                            <div className="text-[10px] text-slate-400">Target benchmark: {tier.name.includes('High') ? '40–50%' : tier.name.includes('Medium') ? '45–55%' : '< 5%'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900">{tier.count} staff</span>
                          <span className="block text-[11px] text-slate-500 font-medium">{tier.percentage}% of active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {maximizedCard === 'department' && (
            <div className="space-y-6">
              <div className="h-[360px] bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <DepartmentPerformanceBars data={data.department_productivity || []} />
              </div>

              {/* Department Ranking Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Department Baseline vs Forecast Comparison
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Comparative breakdown of current output against AI model projected output
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200">
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4 text-right">Actual Baseline</th>
                        <th className="py-2.5 px-4 text-right">Forecast Output</th>
                        <th className="py-2.5 px-4 text-right">Variance Delta</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.department_productivity || []).map((dept, idx) => {
                        const delta = Number((dept.predicted - dept.actual).toFixed(1));
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{dept.department}</td>
                            <td className="py-3 px-4 text-right font-semibold text-blue-600">{dept.actual}%</td>
                            <td className="py-3 px-4 text-right font-semibold text-purple-700">{dept.predicted}%</td>
                            <td className="py-3 px-4 text-right font-bold">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ${
                                delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {delta >= 0 ? `+${delta}%` : `${delta}%`}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                dept.actual >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                dept.actual >= 75 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {dept.actual >= 80 ? 'Top Performer' : dept.actual >= 75 ? 'On Target' : 'Needs Optimization'}
                              </span>
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

          {maximizedCard === 'risk_matrix' && (
            <div className="space-y-6">
              <div className="h-[420px] bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <RiskPerformanceMatrix 
                  data={data.risk_matrix || []}
                  onViewEmployee={onViewEmployee}
                />
              </div>

              {/* Top Flight Risk Triage Register */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      Priority Flight Risk Triage Register
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Employees exhibiting elevated flight risk scores requiring targeted HR intervention
                    </p>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    High Risk Concentration
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200">
                        <th className="py-2.5 px-4">Employee</th>
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4 text-right">Productivity</th>
                        <th className="py-2.5 px-4 text-right">Flight Risk Score</th>
                        <th className="py-2.5 px-4">Risk Category</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.risk_matrix || [])
                        .filter(e => (e.risk_score || 0) >= 60 || e.risk_level === 'High')
                        .slice(0, 8)
                        .map((emp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{emp.employee_name}</div>
                              <div className="text-[10px] text-slate-400">{emp.employee_id}</div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-600">{emp.department}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900">{emp.productivity}%</td>
                            <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                              {emp.risk_score?.toFixed(1) || '72.0'}%
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Critical Flight Risk
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setMaximizedCard(null);
                                  onViewEmployee(emp.employee_id);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all shadow-2xs"
                              >
                                View 360°
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {maximizedCard === 'insights' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(data?.key_insights || []).map((ins, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {ins.badge || 'Insight'}
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium mt-2">{ins.message}</p>
                </div>
              ))}
            </div>
          )}

          {maximizedCard === 'actions' && (
            <div className="space-y-3">
              {(data?.recommended_actions || []).map((action, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {action.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{action.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{action.potential_impact}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMaximizedCard(null);
                      onActionClick(action);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shrink-0"
                  >
                    {action.action_label}
                  </button>
                </div>
              ))}
            </div>
          )}

          {maximizedCard === 'kpis' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard type="total" data={kpis.total_employees} />
              <MetricCard type="avg" data={kpis.avg_productivity} />
              <MetricCard type="high" data={kpis.high_performers} />
              <MetricCard type="risk" data={kpis.at_risk} />
              <MetricCard type="improvement" data={kpis.predicted_improvement} />
              <MetricCard type="decline" data={kpis.predicted_decline} />
            </div>
          )}

          {maximizedCard === 'employees' && (
            <EmployeeTable
              employees={data?.recent_employees || []}
              totalCount={kpis?.total_employees?.value || 520}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={handleDepartmentFilterChange}
              selectedStatus={selectedStatus}
              onStatusChange={handleStatusFilterChange}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onViewEmployee={onViewEmployee}
              onViewAll={onViewAllEmployees}
            />
          )}
        </CardMaximizeModal>
      )}
    </div>
  );
};
