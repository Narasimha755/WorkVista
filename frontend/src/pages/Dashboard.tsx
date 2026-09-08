import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  UploadCloud, 
  RefreshCw, 
  RotateCcw, 
  Maximize2 
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
    exp = selectedExperience,
    cohort = cohortGrouping
  ) => {
    setIsFiltering(true);
    try {
      const res = await api.getDashboard({
        department: dept === 'All Departments' ? 'All' : dept,
        status: status,
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
    applyFilters(dept, selectedStatus, selectedExperience, cohortGrouping);
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    applyFilters(selectedDepartment, status, selectedExperience, cohortGrouping);
  };

  const handleResetFilters = () => {
    setSelectedDepartment('All Departments');
    setSelectedStatus('All');
    setSelectedExperience('All');
    setCohortGrouping('department');
    applyFilters('All Departments', 'All', 'All', 'department');
  };

  const hasActiveFilters = 
    selectedDepartment !== 'All Departments' || 
    selectedStatus !== 'All' || 
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
      {/* 1. Main Dashboard Header matching Mockup */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Workforce Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time overview of workforce productivity, risk and predictive performance.
          </p>
        </div>

        {/* Status Indicators & Main Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* AI Model Active Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>AI Model Active</span>
            <span className="text-[10px] text-emerald-600 font-medium">({data.active_model_name || 'Random Forest v1.2'})</span>
          </div>

          {/* Last Updated Timestamp */}
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            Last Updated: <span className="text-slate-600 font-semibold">{data.last_refresh || 'Sep 15, 2026 10:24 AM'}</span>
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
          onClick={onViewAllEmployees}
        />
        <MetricCard
          type="avg"
          data={kpis?.avg_productivity}
          onClick={() => setMaximizedCard('actual_vs_predicted')}
        />
        <MetricCard
          type="high"
          data={kpis?.high_performers}
          onClick={() => handleStatusFilterChange('High')}
        />
        <MetricCard
          type="risk"
          data={kpis?.at_risk}
          onClick={() => setMaximizedCard('risk_matrix')}
        />
        <MetricCard
          type="improvement"
          data={kpis?.predicted_improvement}
          onClick={() => setMaximizedCard('actual_vs_predicted')}
        />
        <MetricCard
          type="decline"
          data={kpis?.predicted_decline}
          onClick={() => setMaximizedCard('risk_matrix')}
        />
      </div>

      {/* 4. Row 2: 3 Major Analytical Panels (Trend, Health Score, Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Productivity Trend: Actual vs Predicted (Keep Maximize) */}
        <div className="lg:col-span-6 flex flex-col">
          <ProductivityTrendChart
            data={data.actual_vs_predicted}
            hasTemporalData={data.has_temporal_data}
            onMaximize={() => setMaximizedCard('actual_vs_predicted')}
          />
        </div>

        {/* Workforce Health Score */}
        <div className="sm:col-span-6 lg:col-span-3 flex flex-col">
          <WorkforceHealthGauge
            data={healthData}
          />
        </div>

        {/* Productivity Distribution Donut */}
        <div className="sm:col-span-6 lg:col-span-3 flex flex-col">
          <ProductivityDistributionDonut
            data={data.productivity_distribution}
            totalEmployees={data.distribution_total || kpis?.total_employees?.value || 520}
          />
        </div>
      </div>

      {/* 5. Row 3: Dual Intelligence Panels & AI Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Department Performance Bar Chart (Keep Maximize) */}
        <div className="lg:col-span-4 flex flex-col">
          <DepartmentPerformanceBars
            data={data.department_productivity}
            onMaximize={() => setMaximizedCard('department')}
          />
        </div>

        {/* Risk vs Performance Matrix (Keep Maximize) */}
        <div className="lg:col-span-5 flex flex-col">
          <RiskPerformanceMatrix
            data={data.risk_matrix}
            onViewEmployee={onViewEmployee}
            onMaximize={() => setMaximizedCard('risk_matrix')}
          />
        </div>

        {/* Right Column Stack: AI Insights, Recommendations, Quick Filters */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          <KeyInsightsPanel
            insights={data.key_insights}
          />
          <RecommendedActionsPanel
            actions={data.recommended_actions}
            onActionClick={onActionClick}
          />
          <QuickFiltersWidget
            onApplyFilters={(filters) => {
              if (filters.department) handleDepartmentFilterChange(filters.department);
            }}
            selectedDepartment={selectedDepartment}
            selectedRisk={selectedStatus}
          />
        </div>
      </div>

      {/* 6. Row 4: Employee Predictions / Intelligence Table */}
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
            maximizedCard === 'kpis' ? 'Workforce Core KPI Performance Indicators' :
            'Employee Intelligence & Prediction Register'
          }
          subtitle={
            maximizedCard === 'actual_vs_predicted' ? 'Continuous tracking of actual baseline output vs. AI-predicted output' :
            maximizedCard === 'health_score' ? 'Composite 0–100 workforce index across 5 foundational dimensions' :
            maximizedCard === 'risk_matrix' ? 'Flight risk vs. productivity positioning for targeted intervention' :
            maximizedCard === 'department' ? 'Departmental baseline actuals against predictive target output' :
            'Expanded analytics view'
          }
          badge={
            maximizedCard === 'health_score' ? `${healthData.score}/100 Score` :
            maximizedCard === 'risk_matrix' ? `${(data.risk_matrix || []).length} Positions Mapped` :
            maximizedCard === 'department' ? `${(data.department_productivity || []).length} Departments` :
            'Executive Deep-Dive'
          }
          onExportCsv={() => api.triggerExportCsv()}
        >
          {maximizedCard === 'actual_vs_predicted' && (
            <ProductivityTrendChart 
              data={data.actual_vs_predicted || []}
              hasTemporalData={data.has_temporal_data}
            />
          )}

          {maximizedCard === 'health_score' && (
            <div className="flex justify-center p-6">
              <WorkforceHealthGauge data={healthData} />
            </div>
          )}

          {maximizedCard === 'distribution' && (
            <div className="flex justify-center p-6">
              <ProductivityDistributionDonut 
                data={data?.productivity_distribution}
                totalEmployees={kpis?.total_employees?.value || 520}
              />
            </div>
          )}

          {maximizedCard === 'department' && (
            <div className="h-[480px]">
              <DepartmentPerformanceBars data={data.department_productivity || []} />
            </div>
          )}

          {maximizedCard === 'risk_matrix' && (
            <div className="h-[520px]">
              <RiskPerformanceMatrix 
                data={data.risk_matrix || []}
                onViewEmployee={onViewEmployee}
              />
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
