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
  Search,
  Sliders,
  GitCompare,
  Layers,
  Brain
} from 'lucide-react';
import { HolographicGlobeCard } from '../components/command_center/HolographicGlobeCard';
import { ResilienceDonutCard } from '../components/command_center/ResilienceDonutCard';
import { IsometricMatrixCard } from '../components/command_center/IsometricMatrixCard';
import { FrictionWaveformCard } from '../components/command_center/FrictionWaveformCard';
import { InnovationStreamCard } from '../components/command_center/InnovationStreamCard';
import { RiskTopologyTerrain } from '../components/command_center/RiskTopologyTerrain';
import { CognitiveInsightMesh } from '../components/command_center/CognitiveInsightMesh';
import { EntityCognitiveMatrix } from '../components/command_center/EntityCognitiveMatrix';
import { StrategicAlignmentChart } from '../components/command_center/StrategicAlignmentChart';
import { CardMaximizeModal } from '../components/modals/CardMaximizeModal';
import { MetricCard } from '../components/kpi/MetricCard';
import { EmployeeTable } from '../components/tables/EmployeeTable';
import { ProductivityTrendChart } from '../components/charts/ProductivityTrendChart';
import { WorkforceHealthGauge } from '../components/charts/WorkforceHealthGauge';
import { ProductivityDistributionDonut } from '../components/charts/ProductivityDistributionDonut';
import { DepartmentPerformanceBars } from '../components/charts/DepartmentPerformanceBars';
import { RiskPerformanceMatrix } from '../components/charts/RiskPerformanceMatrix';
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
  onOpenCopilot,
  onOpenScenarioPlanner,
  onOpenCompare,
}) => {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [matrixEmployees, setMatrixEmployees] = useState<Employee[]>([]);
  const [nlQuery, setNlQuery] = useState<string>('');

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

  useEffect(() => {
    api.getEmployees({ page_size: 25 })
      .then(res => {
        if (res?.items) setMatrixEmployees(res.items);
      })
      .catch(err => console.error('Failed to load matrix employees:', err));
  }, []);

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

  const handleResetFilters = () => {
    setSelectedDepartment('All Departments');
    setSelectedStatus('All');
    setSelectedRisk('All');
    setSelectedExperience('All');
    setCohortGrouping('department');
    applyFilters('All Departments', 'All', 'All', 'All', 'department');
  };

  const handleNlQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nlQuery.trim() && onOpenCopilot) {
      onOpenCopilot(nlQuery.trim());
    }
  };

  const hasActiveFilters = 
    selectedDepartment !== 'All Departments' || 
    selectedStatus !== 'All' || 
    (selectedRisk !== 'All' && selectedRisk !== 'All Risk Levels') ||
    selectedExperience !== 'All';

  // Loading skeleton
  if (loading && !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto bg-[#070C18] min-h-screen text-slate-400">
        <div className="h-12 bg-slate-850 rounded-2xl w-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-850 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 h-80 bg-slate-850 rounded-3xl border border-slate-800" />
          <div className="lg:col-span-4 h-80 bg-slate-850 rounded-3xl border border-slate-800" />
        </div>
      </div>
    );
  }

  // Empty state if no data is loaded
  if (!data?.has_data) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center space-y-5 bg-[#070C18] rounded-3xl border border-cyan-500/20 text-white my-12">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/30">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">No Dataset Currently Calibrated</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Ingest an employee performance telemetry file or boot the 520-employee enterprise neural baseline.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Neural Baseline (520 Staff)</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-slate-400" />
            <span>Upload Telemetry File</span>
          </button>
        </div>
      </div>
    );
  }

  const kpis = data.kpis;

  return (
    <div className="min-h-screen bg-[#070C18] text-white p-5 md:p-7 space-y-5 max-w-[1720px] mx-auto font-sans relative selection:bg-cyan-500 selection:text-slate-900">
      {/* Background radial ambient lighting */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[400px] bg-pink-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 left-1/3 w-[500px] h-[300px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Intelligent Enterprise Command Center matching reference */}
      {/* ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-1 border-b border-cyan-500/15 relative z-10">
        {/* Brand Left */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] border border-cyan-400/40">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-black tracking-widest text-cyan-400">
              WorkVista Cognition Command
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Intelligent Enterprise Command Center
            </h1>
            <p className="text-[11px] text-slate-400">
              Enterprise Neural Overview (v3.2) &bull; Real-Time Cognitive Analytics & Risk Topology
            </p>
          </div>
        </div>

        {/* Center-Right: Natural Language Query box & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Integrated Natural Language Query Bar matching reference */}
          <form onSubmit={handleNlQuerySubmit} className="relative flex items-center w-full sm:w-80 md:w-96">
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="Natural Language Query for quick needed..."
              className="w-full pl-4 pr-10 py-2 bg-[#0C1224]/90 border border-cyan-500/30 hover:border-cyan-400/60 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-400 shadow-[0_0_12px_rgba(0,240,255,0.1)] outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Execute Copilot inquiry"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* AI Model Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0C1224] border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{data.active_model_name || 'Random Forest v1.2'}</span>
          </div>

          {/* Quick Scenario Simulator Trigger */}
          {onOpenScenarioPlanner && (
            <button
              onClick={() => onOpenScenarioPlanner('All')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all shadow-[0_0_8px_rgba(245,158,11,0.2)] active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Policy</span>
            </button>
          )}

          {/* Side-by-side Compare Trigger */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold transition-all shadow-[0_0_8px_rgba(59,130,246,0.2)] active:scale-95"
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-400" />
              <span>Compare</span>
            </button>
          )}

          {/* Export telemetry */}
          <button
            onClick={() => api.triggerExportCsv()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Active Filter Indicators Pill */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-xs animate-fadeIn">
          <span className="text-cyan-400 font-semibold flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Active Filter Scope:
          </span>
          {selectedDepartment !== 'All Departments' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0A1020] border border-cyan-500/40 text-cyan-300 font-mono text-[11px] rounded-lg">
              Dept: <strong className="text-white">{selectedDepartment}</strong>
              <button onClick={() => handleDepartmentFilterChange('All Departments')} className="hover:text-white font-bold ml-0.5">✕</button>
            </span>
          )}
          {selectedStatus !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0A1020] border border-cyan-500/40 text-cyan-300 font-mono text-[11px] rounded-lg">
              Performance: <strong className="text-white">{selectedStatus}</strong>
              <button onClick={() => handleStatusFilterChange('All')} className="hover:text-white font-bold ml-0.5">✕</button>
            </span>
          )}
          {selectedRisk !== 'All' && selectedRisk !== 'All Risk Levels' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0A1020] border border-rose-500/40 text-rose-300 font-mono text-[11px] rounded-lg">
              Flight Risk: <strong className="text-white">{selectedRisk}</strong>
              <button onClick={() => handleRiskFilterChange('All')} className="hover:text-white font-bold ml-0.5">✕</button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="ml-auto text-cyan-400 hover:text-cyan-300 font-bold text-[11px] underline underline-offset-2 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ROW 1: 5 FUTURISTIC COMMAND CARDS matching reference image */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10">
        {/* Card 1: Dynamic Talent Velocity (Revolving 3D Globe + Ascending Bars) */}
        <HolographicGlobeCard
          totalCount={kpis?.total_employees?.value || 520}
          velocityPct={kpis?.predicted_improvement?.change_pct || 4.8}
          onMaximize={() => setMaximizedCard('kpi_total')}
        />

        {/* Card 2: Systemic Resilience (Triple Ring Radial Donut + Risk Arc) */}
        <ResilienceDonutCard
          resilienceScore={data.workforce_health?.score || 82}
          riskScore={Math.round(((kpis?.at_risk?.value || 18) / (kpis?.total_employees?.value || 520)) * 100) || 18}
          onMaximize={() => setMaximizedCard('health_score')}
        />

        {/* Card 3: Cognitive Contribution (3D Isometric Clustered Bars + Legend) */}
        <IsometricMatrixCard
          highPerformersCount={kpis?.high_performers?.value || 235}
          totalEmployees={kpis?.total_employees?.value || 520}
          onMaximize={() => setMaximizedCard('kpi_high')}
        />

        {/* Card 4: Operational Friction (Neon EKG Cardiogram Waveform) */}
        <FrictionWaveformCard
          atRiskCount={kpis?.at_risk?.value || 18}
          onMaximize={() => setMaximizedCard('kpi_risk')}
        />

        {/* Card 5: Predicted Innovation Index (Confidence Streamgraph) */}
        <InnovationStreamCard
          score={120}
          onMaximize={() => setMaximizedCard('actual_vs_predicted')}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. ROW 2: CENTERPIECE SIGNATURE VISUALIZATIONS (60% / 40% Split) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* Left: Enterprise Risk Topology (3D Wireframe Terrain) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <RiskTopologyTerrain
            onSelectDepartment={handleDepartmentFilterChange}
            onOpenScenarioPlanner={onOpenScenarioPlanner}
          />
        </div>

        {/* Right: Cognitive Insight Mesh (Neural Synapse Mesh & Autonomous Actions) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <CognitiveInsightMesh
            alerts={data.executive_alerts}
            onOpenCopilot={onOpenCopilot}
            onOpenScenarioPlanner={onOpenScenarioPlanner}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ROW 3: BOTTOM PANELS (Entity Cognitive Matrix & Strategic Alignment) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* Left: Entity Cognitive Matrix (Table with 8x3 Pixel Skill Matrix & Trajectory) */}
        <div className="lg:col-span-8 xl:col-span-9">
          <EntityCognitiveMatrix
            employees={matrixEmployees}
            onViewEmployee={onViewEmployee}
          />
        </div>

        {/* Right: Strategic Alignment Index (Harmonic Wave Curves across Timeline) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <StrategicAlignmentChart
            onMaximize={() => setMaximizedCard('distribution')}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CARD MAXIMIZE MODAL (Retains full deep-dive functionality) */}
      {/* ========================================================================= */}
      {maximizedCard && (
        <CardMaximizeModal
          isOpen={true}
          title={
            maximizedCard === 'kpi_total' ? 'Talent Velocity & Headcount Telemetry' :
            maximizedCard === 'health_score' ? 'Systemic Resilience & Workforce Health Deep Dive' :
            maximizedCard === 'kpi_high' ? 'Cognitive Contribution & High Performer Cohort' :
            maximizedCard === 'kpi_risk' ? 'Operational Friction & Flight Risk Matrix' :
            maximizedCard === 'actual_vs_predicted' ? 'Actual vs Predicted Velocity Model' :
            maximizedCard === 'distribution' ? 'Performance Distribution Analysis' :
            maximizedCard === 'department' ? 'Departmental Performance & Capacity' :
            'Enterprise Intelligence Deep Dive'
          }
          onClose={() => setMaximizedCard(null)}
        >
          {maximizedCard === 'health_score' && (
            <WorkforceHealthGauge
              data={data?.workforce_health}
            />
          )}

          {maximizedCard === 'actual_vs_predicted' && (
            <ProductivityTrendChart
              data={data?.actual_vs_predicted || []}
              cohortGrouping={cohortGrouping}
              onCohortChange={(c) => applyFilters(selectedDepartment, selectedStatus, selectedRisk, selectedExperience, c)}
            />
          )}

          {maximizedCard === 'distribution' && (
            <ProductivityDistributionDonut
              data={data?.productivity_distribution || []}
              total={data?.distribution_total || kpis?.total_employees?.value || 520}
            />
          )}

          {maximizedCard === 'kpi_risk' && (
            <RiskPerformanceMatrix
              data={data?.risk_matrix || []}
              onViewEmployee={onViewEmployee}
            />
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
