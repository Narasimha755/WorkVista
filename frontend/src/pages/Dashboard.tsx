import React from 'react';
import { Sparkles, UploadCloud, ArrowRight } from 'lucide-react';
import { MetricCard } from '../components/kpi/MetricCard';
import { ActualVsPredictedChart } from '../components/charts/ActualVsPredictedChart';
import { ProductivityDistributionDonut } from '../components/charts/ProductivityDistributionDonut';
import { AIPredictionEngineCard } from '../components/charts/AIPredictionEngineCard';
import { DepartmentProductivityChart } from '../components/charts/DepartmentProductivityChart';
import { KeyFactorsChart } from '../components/charts/KeyFactorsChart';
import { KeyInsightsPanel } from '../components/charts/KeyInsightsPanel';
import { RecommendedActionsPanel } from '../components/charts/RecommendedActionsPanel';
import { EmployeeTable } from '../components/tables/EmployeeTable';
import { DashboardData, RecommendedActionItem } from '../types';

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

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  loading,
  onOpenUpload,
  onLoadDemo,
  onViewEmployee,
  onViewAllEmployees,
  searchQuery,
  onSearchChange,
  onActionClick,
}) => {
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
      {/* 1. TOP ROW: 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <MetricCard type="total" data={data?.kpis?.total_employees} />
        <MetricCard type="avg" data={data?.kpis?.avg_productivity} />
        <MetricCard type="high" data={data?.kpis?.high_performers} />
        <MetricCard type="risk" data={data?.kpis?.at_risk} />
      </div>

      {/* 2. MAIN ANALYTICS ROW: 3 CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Actual vs Predicted Work Output (6 cols) */}
        <div className="lg:col-span-5">
          <ActualVsPredictedChart 
            data={data?.actual_vs_predicted} 
            hasTemporalData={data?.has_temporal_data}
          />
        </div>

        {/* Productivity Distribution Donut (4 cols) */}
        <div className="lg:col-span-4">
          <ProductivityDistributionDonut 
            data={data?.productivity_distribution} 
            total={data?.distribution_total} 
          />
        </div>

        {/* AI Prediction Engine Card (3 cols) */}
        <div className="lg:col-span-3">
          <AIPredictionEngineCard data={data?.prediction_engine} />
        </div>
      </div>

      {/* 3. SECOND ROW: 4 WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Department-wise Productivity */}
        <DepartmentProductivityChart data={data?.department_productivity} />

        {/* Key Factors Influencing Productivity */}
        <KeyFactorsChart factors={data?.key_factors} />

        {/* Key Insights */}
        <KeyInsightsPanel insights={data?.key_insights} onViewAll={onViewAllEmployees} />

        {/* Recommended Actions */}
        <RecommendedActionsPanel actions={data?.recommended_actions} onActionClick={onActionClick} />
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
    </div>
  );
};
