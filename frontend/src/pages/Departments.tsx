import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  Activity, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Sliders,
  Layers,
  ChevronRight
} from 'lucide-react';
import { DepartmentSummary } from '../types';
import { api } from '../services/api';

interface DepartmentsPageProps {
  onOpenScenarioPlanner?: (dept?: string) => void;
  onViewDepartmentEmployees?: (dept: string) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  onOpenScenarioPlanner,
  onViewDepartmentEmployees,
}) => {
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDepartments = () => {
    setLoading(true);
    api.getDepartments()
      .then((res) => {
        setDepartments(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
        <p className="text-sm font-medium">Aggregating departmental workforce health metrics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Department Intelligence & Capacity Planning
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Workload saturation, predictive velocity, and multi-department rebalancing simulation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenScenarioPlanner && (
            <button
              onClick={() => onOpenScenarioPlanner('All')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-500/25 active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Org Scenario Simulator</span>
            </button>
          )}
          <button
            onClick={loadDepartments}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {departments.map((dept: any) => {
          const deptName = dept.name || dept.department;
          const delta = dept.productivity_gap ?? 0;
          const isUp = delta >= 0;
          const workload = dept.avg_workload ?? 68;
          const capacityStatus = workload >= 78 ? 'Over-Capacity' : workload < 62 ? 'Under-Capacity' : 'Balanced';

          return (
            <div 
              key={dept.id || deptName} 
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 space-y-5 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {deptName}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {dept.employee_count ?? dept.headcount ?? 0} active employees
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 dark:text-white block">
                    {dept.predicted_productivity ?? dept.avg_productivity}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Forecast Run Rate
                  </span>
                </div>
              </div>

              {/* Capacity Status Pill & Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Capacity Utilization
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    capacityStatus === 'Over-Capacity'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : capacityStatus === 'Under-Capacity'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {capacityStatus} ({workload}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      capacityStatus === 'Over-Capacity'
                        ? 'bg-rose-500'
                        : capacityStatus === 'Under-Capacity'
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(100, workload)}%` }} 
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Current Output</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-base">
                    <span>{dept.avg_productivity}%</span>
                    <span className={`text-[11px] flex items-center font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(delta)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Average Workload</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-base">
                    {dept.avg_workload} <span className="text-[11px] font-normal text-slate-400">/ 100</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block mb-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-emerald-600" />
                    High Performers
                  </span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
                    {dept.high_performers_count ?? dept.high_performer_count ?? 0}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60">
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 block mb-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    At-Risk Employees
                  </span>
                  <span className="font-bold text-rose-900 dark:text-rose-200 text-base">
                    {dept.at_risk_count ?? 0}
                  </span>
                </div>
              </div>

              {/* Progress Factors & Simulator Trigger */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-[11px]">Attendance Rate</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.avg_attendance ?? 91}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dept.avg_attendance ?? 91}%` }} />
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1">
                  <span className="text-[11px]">Engagement Score</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.avg_engagement ?? 82}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dept.avg_engagement ?? 82}%` }} />
                </div>

                {/* Scenario Rebalancing Button */}
                {onOpenScenarioPlanner && (
                  <button
                    onClick={() => onOpenScenarioPlanner(deptName)}
                    className="w-full mt-3 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-800 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-500" />
                    <span>Simulate {deptName} Policy</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
