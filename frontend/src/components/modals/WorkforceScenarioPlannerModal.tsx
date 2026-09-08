import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Award, 
  Activity, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Download,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ScenarioSimulationResult } from '../../types';
import { api } from '../../services/api';

interface WorkforceScenarioPlannerModalProps {
  isOpen: boolean;
  initialDepartment?: string;
  onClose: () => void;
  onFilterDepartment?: (dept: string) => void;
}

export const WorkforceScenarioPlannerModal: React.FC<WorkforceScenarioPlannerModalProps> = ({
  isOpen,
  initialDepartment = 'All',
  onClose,
  onFilterDepartment,
}) => {
  const [targetDept, setTargetDept] = useState<string>(initialDepartment);
  const [workloadDelta, setWorkloadDelta] = useState<number>(-10);
  const [trainingUplift, setTrainingUplift] = useState<number>(10);
  const [attendanceDelta, setAttendanceDelta] = useState<number>(5);
  const [engagementDelta, setEngagementDelta] = useState<number>(8);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetDept(initialDepartment || 'All');
      runSimulation();
    }
  }, [isOpen, initialDepartment]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const sim = await api.simulateScenario({
        target_department: targetDept,
        workload_delta_pct: workloadDelta,
        training_uplift_pct: trainingUplift,
        attendance_delta_pct: attendanceDelta,
        engagement_delta_pct: engagementDelta
      });
      setResult(sim);
    } catch (err) {
      console.error('Failed to run scenario simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-run whenever sliders change
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        runSimulation();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [workloadDelta, trainingUplift, attendanceDelta, engagementDelta, targetDept]);

  const handleReset = () => {
    setWorkloadDelta(0);
    setTrainingUplift(0);
    setAttendanceDelta(0);
    setEngagementDelta(0);
    setTargetDept('All');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:to-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Workforce Scenario Planner & Policy Simulator
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Org-Level Simulator
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stress-test policy interventions, workload rebalancing, and skill uplifts across the enterprise.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Levers</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Layout: 2 Columns (Levers Left, Results Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Left Column: Levers Controls (4 cols) */}
          <div className="lg:col-span-4 p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/40">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
                Scope Department
              </label>
              <select
                value={targetDept}
                onChange={(e) => setTargetDept(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="All">Enterprise (All 6 Departments)</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            {/* Lever 1: Workload Rebalancing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Workload Adjustment
                </span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  workloadDelta < 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : workloadDelta > 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {workloadDelta > 0 ? `+${workloadDelta}%` : `${workloadDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="5"
                value={workloadDelta}
                onChange={(e) => setWorkloadDelta(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-400">
                Negative delta reduces task overloading and burnout strain.
              </p>
            </div>

            {/* Lever 2: Training & Upskilling */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Training & Upskilling Uplift
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  +{trainingUplift}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={trainingUplift}
                onChange={(e) => setTrainingUplift(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Directly boosts skill proficiency & output quality.
              </p>
            </div>

            {/* Lever 3: Attendance Adherence */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Attendance Adherence
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  +{attendanceDelta}%
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="15"
                step="2"
                value={attendanceDelta}
                onChange={(e) => setAttendanceDelta(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                Targets absenteeism reduction via flexible scheduling.
              </p>
            </div>

            {/* Lever 4: Engagement & Wellbeing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Engagement & Recognition
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  +{engagementDelta}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="2"
                value={engagementDelta}
                onChange={(e) => setEngagementDelta(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-[11px] text-slate-400">
                Incentives, 1-on-1 coaching, and employee recognition.
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold block mb-1">Live Elastic Engine</span>
              Changes immediately feed into the multi-variable elasticity model calibrated with active estimators.
            </div>
          </div>

          {/* Right Column: Simulation Outcomes (8 cols) */}
          <div className="lg:col-span-8 p-6 space-y-6">
            {result && (
              <>
                {/* 4 Macro Delta Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                      <span>Avg Productivity</span>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {result.simulated_avg_productivity}%
                      </span>
                      <span className={`text-xs font-bold ${
                        result.productivity_delta >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {result.productivity_delta >= 0 ? `+${result.productivity_delta}%` : `${result.productivity_delta}%`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Baseline: {result.baseline_avg_productivity}%
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                      <span>At-Risk Reduction</span>
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        -{result.at_risk_reduction}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Staff
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {result.baseline_at_risk_count} &rarr; {result.simulated_at_risk_count} At Risk
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                      <span>High Performers</span>
                      <Award className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        +{result.high_performer_gain}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Profiles
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Now {result.simulated_high_performers} Top Stars
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                      <span>Health Score</span>
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {result.simulated_health_score}/100
                      </span>
                      <span className="text-xs font-bold text-emerald-500">
                        +{result.health_score_delta}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Baseline: {result.baseline_health_score}/100
                    </div>
                  </div>
                </div>

                {/* Executive Summary Narrative */}
                <div className="p-4 bg-indigo-50/50 dark:bg-slate-850/80 rounded-xl border border-indigo-100 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">
                    Simulated Policy Trajectory:
                  </span>
                  {result.executive_summary}
                </div>

                {/* Department-by-Department Impact Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Departmental Distribution Impact
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Scope: {result.target_scope}
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        <tr>
                          <th className="px-3 py-2">Department</th>
                          <th className="px-3 py-2">Baseline Output</th>
                          <th className="px-3 py-2">Simulated Output</th>
                          <th className="px-3 py-2">Output Shift</th>
                          <th className="px-3 py-2">At Risk Reduction</th>
                          <th className="px-3 py-2 text-right">Capacity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {result.department_impacts.map((d, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-3 py-2 font-bold text-slate-800 dark:text-white">
                              {d.department}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">
                              {d.baseline_output}%
                            </td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {d.simulated_output}%
                            </td>
                            <td className="px-3 py-2">
                              <span className={`font-mono font-bold text-xs ${
                                d.delta_output >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                              }`}>
                                {d.delta_output >= 0 ? `+${d.delta_output}%` : `${d.delta_output}%`}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-semibold text-rose-600 dark:text-rose-400">
                              -{d.at_risk_reduction} ({d.baseline_at_risk} &rarr; {d.simulated_at_risk})
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                d.capacity_status === 'Over-Capacity'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : d.capacity_status === 'Under-Capacity'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}>
                                {d.capacity_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Policy Recommendations */}
                {result.policy_recommendations && result.policy_recommendations.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Policy Recommendations:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {result.policy_recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <span>Target Policy Simulation &bull; Authenticated Admin: <strong>NARASIMHA</strong></span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
