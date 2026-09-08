import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitCompare, 
  Users, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { EmployeeDetail, DepartmentSummary, Employee } from '../../types';
import { api } from '../../services/api';

interface UniversalCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewEmployee?: (id: string) => void;
}

export const UniversalCompareModal: React.FC<UniversalCompareModalProps> = ({
  isOpen,
  onClose,
  onViewEmployee,
}) => {
  const [compareType, setCompareType] = useState<'employees' | 'departments'>('employees');
  
  // Employee compare state
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [empIdA, setEmpIdA] = useState<string>('');
  const [empIdB, setEmpIdB] = useState<string>('');
  const [empA, setEmpA] = useState<EmployeeDetail | null>(null);
  const [empB, setEmpB] = useState<EmployeeDetail | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);

  // Department compare state
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [deptNameA, setDeptNameA] = useState<string>('Engineering');
  const [deptNameB, setDeptNameB] = useState<string>('Operations');

  useEffect(() => {
    if (isOpen) {
      loadInitialOptions();
    }
  }, [isOpen]);

  const loadInitialOptions = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.getEmployees({ page_size: 100 }),
        api.getDepartments()
      ]);
      const list = empRes.items || [];
      setAllEmployees(list);
      setDepartments(deptRes || []);

      if (list.length >= 2) {
        const first = list[0].employee_id;
        const second = list[1].employee_id;
        setEmpIdA(first);
        setEmpIdB(second);
        loadEmployeeDetails(first, second);
      }

      if (deptRes && deptRes.length >= 2) {
        setDeptNameA(deptRes[0].name);
        setDeptNameB(deptRes[1].name);
      }
    } catch (err) {
      console.error('Failed to load compare options:', err);
    }
  };

  const loadEmployeeDetails = async (idA: string, idB: string) => {
    setLoadingEmployees(true);
    try {
      const [resA, resB] = await Promise.all([
        api.getEmployeeDetail(idA),
        api.getEmployeeDetail(idB)
      ]);
      setEmpA(resA);
      setEmpB(resB);
    } catch (err) {
      console.error('Failed to load employee details for compare:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSelectEmpA = (id: string) => {
    setEmpIdA(id);
    if (empIdB) loadEmployeeDetails(id, empIdB);
  };

  const handleSelectEmpB = (id: string) => {
    setEmpIdB(id);
    if (empIdA) loadEmployeeDetails(empIdA, id);
  };

  if (!isOpen) return null;

  const currentDeptA = departments.find(d => d.name === deptNameA);
  const currentDeptB = departments.find(d => d.name === deptNameB);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:to-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Universal Compare & Benchmarking
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Side-by-Side Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct head-to-head comparison of employee performance profiles or departmental telemetry.
              </p>
            </div>
          </div>

          {/* Toggle Type */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setCompareType('employees')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  compareType === 'employees'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Employee vs Employee
              </button>
              <button
                onClick={() => setCompareType('departments')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  compareType === 'departments'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Dept vs Dept
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {compareType === 'employees' && (
            <div className="space-y-6">
              {/* Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Profile A
                  </label>
                  <select
                    value={empIdA}
                    onChange={(e) => handleSelectEmpA(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {allEmployees.map((e) => (
                      <option key={e.employee_id} value={e.employee_id}>
                        {e.employee_id} — {e.full_name || e.employee_name} ({e.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Profile B
                  </label>
                  <select
                    value={empIdB}
                    onChange={(e) => handleSelectEmpB(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {allEmployees.map((e) => (
                      <option key={e.employee_id} value={e.employee_id}>
                        {e.employee_id} — {e.full_name || e.employee_name} ({e.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side-by-Side Cards */}
              {empA && empB && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card A */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          {empA.employee_id}
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                          {empA.full_name || empA.employee_name}
                        </h4>
                        <div className="text-xs text-slate-500">
                          {empA.role || 'Specialist'} &bull; {empA.department}
                        </div>
                      </div>
                      {onViewEmployee && (
                        <button
                          onClick={() => {
                            onViewEmployee(empA.employee_id);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-lg hover:bg-blue-100"
                        >
                          View 360°
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Productivity</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {empA.productivity_score}%
                        </div>
                        <div className="text-[10px] text-emerald-500 font-bold">
                          Pred: {empA.predicted_productivity}%
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Flight Risk</div>
                        <div className={`text-xl font-black mt-1 ${
                          (empA.risk_score || 0) >= 50 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
                        }`}>
                          {empA.risk_score ?? 25}%
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">
                          {empA.risk_level || 'Low'}
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Workload</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {empA.workload}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {empA.working_hours} hrs/wk
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Attendance</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {empA.attendance}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Skill: {empA.skill_level}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card B */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {empB.employee_id}
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                          {empB.full_name || empB.employee_name}
                        </h4>
                        <div className="text-xs text-slate-500">
                          {empB.role || 'Specialist'} &bull; {empB.department}
                        </div>
                      </div>
                      {onViewEmployee && (
                        <button
                          onClick={() => {
                            onViewEmployee(empB.employee_id);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100"
                        >
                          View 360°
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Productivity</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {empB.productivity_score}%
                        </div>
                        <div className="text-[10px] text-emerald-500 font-bold">
                          Pred: {empB.predicted_productivity}%
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Flight Risk</div>
                        <div className={`text-xl font-black mt-1 ${
                          (empB.risk_score || 0) >= 50 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
                        }`}>
                          {empB.risk_score ?? 25}%
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">
                          {empB.risk_level || 'Low'}
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Workload</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {empB.workload}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {empB.working_hours} hrs/wk
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Attendance</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {empB.attendance}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Skill: {empB.skill_level}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delta Summary */}
              {empA && empB && (
                <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold block text-slate-900 dark:text-white">Comparative Differential:</span>
                    <span>
                      Productivity Delta: <strong className="font-mono">{Number((empA.productivity_score - empB.productivity_score).toFixed(1))}%</strong> &bull; 
                      Risk Delta: <strong className="font-mono">{Number(((empA.risk_score || 25) - (empB.risk_score || 25)).toFixed(1))}%</strong> &bull; 
                      Workload Gap: <strong className="font-mono">{(empA.workload || 0) - (empB.workload || 0)}%</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {compareType === 'departments' && (
            <div className="space-y-6">
              {/* Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Department A
                  </label>
                  <select
                    value={deptNameA}
                    onChange={(e) => setDeptNameA(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {departments.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.employee_count} Staff)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Department B
                  </label>
                  <select
                    value={deptNameB}
                    onChange={(e) => setDeptNameB(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {departments.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.employee_count} Staff)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side-by-Side Dept Cards */}
              {currentDeptA && currentDeptB && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dept A Card */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">
                        {currentDeptA.name}
                      </h4>
                      <div className="text-xs text-slate-500">
                        {currentDeptA.employee_count} Team Members &bull; Budget Allocation 100%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Productivity</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {currentDeptA.avg_productivity}%
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">High Performers</div>
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                          {currentDeptA.high_performers_count} Staff
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">At-Risk Count</div>
                        <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                          {currentDeptA.at_risk_count} Profiles
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Workload</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {currentDeptA.avg_workload}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dept B Card */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">
                        {currentDeptB.name}
                      </h4>
                      <div className="text-xs text-slate-500">
                        {currentDeptB.employee_count} Team Members &bull; Budget Allocation 100%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Productivity</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {currentDeptB.avg_productivity}%
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">High Performers</div>
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                          {currentDeptB.high_performers_count} Staff
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">At-Risk Count</div>
                        <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                          {currentDeptB.at_risk_count} Profiles
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Workload</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                          {currentDeptB.avg_workload}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>Benchmarking Sandbox &bull; NARASIMHA HR Intelligence</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
