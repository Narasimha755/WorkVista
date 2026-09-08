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
  ArrowDown
} from 'lucide-react';
import { DepartmentSummary } from '../types';
import { api } from '../services/api';

export const DepartmentsPage: React.FC = () => {
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
    <div className="p-8 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Department Performance & Capacity
          </h2>
          <p className="text-xs text-slate-500">
            Cohort breakdown, workload distribution, and predicted performance velocity
          </p>
        </div>
        <button
          onClick={loadDepartments}
          className="p-2 text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const delta = dept.productivity_gap;
          const isUp = delta >= 0;

          return (
            <div 
              key={dept.id} 
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 space-y-5 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {dept.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {dept.employee_count} active employees
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 block">
                    {dept.predicted_productivity}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Forecast
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Current Productivity</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-base">
                    <span>{dept.avg_productivity}%</span>
                    <span className={`text-[11px] flex items-center font-semibold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(delta)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Average Workload</span>
                  <span className="font-bold text-slate-800 text-base">
                    {dept.avg_workload} <span className="text-[11px] font-normal text-slate-400">/ 100</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 block mb-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-emerald-600" />
                    High Performers
                  </span>
                  <span className="font-bold text-emerald-900 text-base">
                    {dept.high_performers_count}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <span className="text-[10px] text-rose-700 block mb-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    At-Risk Employees
                  </span>
                  <span className="font-bold text-rose-900 text-base">
                    {dept.at_risk_count}
                  </span>
                </div>
              </div>

              {/* Progress Factors */}
              <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px]">Attendance Rate</span>
                  <span className="font-semibold text-slate-800">{dept.avg_attendance}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dept.avg_attendance}%` }} />
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span className="text-[11px]">Engagement Score</span>
                  <span className="font-semibold text-slate-800">{dept.avg_engagement}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dept.avg_engagement}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
