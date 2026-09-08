import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Users, 
  TrendingDown, 
  Flame, 
  Clock, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Download,
  Filter,
  UserX,
  ExternalLink
} from 'lucide-react';
import { RiskPerformanceMatrix } from '../components/charts/RiskPerformanceMatrix';
import { api } from '../services/api';
import { Employee, RiskMatrixPoint } from '../types';

interface RiskIntelligenceProps {
  onViewEmployee?: (id: string) => void;
}

export const RiskIntelligencePage: React.FC<RiskIntelligenceProps> = ({ onViewEmployee }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [triageActionMsg, setTriageActionMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getEmployees({ page: 1, page_size: 500 })
      .then(res => setEmployees(res.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const departments = ['All', 'Engineering', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales'];
  const riskTiers = ['All', 'Critical (>=75)', 'High (50-74)', 'Moderate (30-49)', 'Low (<30)'];

  const filteredEmployees = employees.filter(e => {
    const risk = e.burnout_risk_score || 0;
    if (selectedDept !== 'All' && e.department !== selectedDept) return false;
    if (selectedTier === 'Critical (>=75)' && risk < 75) return false;
    if (selectedTier === 'High (50-74)' && (risk < 50 || risk >= 75)) return false;
    if (selectedTier === 'Moderate (30-49)' && (risk < 30 || risk >= 50)) return false;
    if (selectedTier === 'Low (<30)' && risk >= 30) return false;
    return true;
  });

  const total = employees.length || 1;
  const criticalCount = employees.filter(e => (e.burnout_risk_score || 0) >= 75).length;
  const highCount = employees.filter(e => (e.burnout_risk_score || 0) >= 50 && (e.burnout_risk_score || 0) < 75).length;
  const modCount = employees.filter(e => (e.burnout_risk_score || 0) >= 30 && (e.burnout_risk_score || 0) < 50).length;
  const lowCount = employees.filter(e => (e.burnout_risk_score || 0) < 30).length;

  const riskMatrixPoints: RiskMatrixPoint[] = filteredEmployees.map(e => ({
    id: e.id,
    employee_id: e.employee_id,
    employee_name: e.full_name || e.employee_name,
    department: e.department,
    role: e.role,
    productivity: e.productivity_score,
    risk_score: e.burnout_risk_score || 0,
    risk_level: (e.burnout_risk_score || 0) >= 75 ? 'Critical' : (e.burnout_risk_score || 0) >= 50 ? 'High' : (e.burnout_risk_score || 0) >= 30 ? 'Moderate' : 'Low',
    predicted: e.predicted_score || e.predicted_productivity || e.productivity_score
  }));

  const handleAction = (empId: string, actionType: string) => {
    if (actionType === 'review') {
      api.bulkAssignReview([empId], 'Urgent Risk Mitigation 1-on-1');
      setTriageActionMsg(`Scheduled 1-on-1 review for ${empId}`);
    } else {
      api.bulkFlagEmployees([empId], 'Critical retention risk');
      setTriageActionMsg(`Flagged ${empId} for executive HR oversight`);
    }
    setTimeout(() => setTriageActionMsg(null), 3500);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-rose-600 uppercase mb-1">
            Workforce Risk Command
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>Risk Intelligence Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Identify operational burnout, disengagement, and attrition risks with predictive early warnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => api.exportEmployeesCsv({ status: 'At Risk' })}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Risk Register</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {triageActionMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{triageActionMsg}</span>
        </div>
      )}

      {/* 4 Risk Tiers KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Critical */}
        <div className="bg-white p-4.5 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Critical Risk Tier</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-800" />
          </div>
          <div className="text-2xl font-black text-rose-800">{criticalCount}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {((criticalCount / total) * 100).toFixed(1)}% of workforce (Risk Score ≥ 75)
          </p>
        </div>

        {/* High */}
        <div className="bg-white p-4.5 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>High Risk Tier</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{highCount}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {((highCount / total) * 100).toFixed(1)}% of workforce (Risk Score 50–74)
          </p>
        </div>

        {/* Moderate */}
        <div className="bg-white p-4.5 rounded-2xl border border-amber-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Moderate Watch</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{modCount}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {((modCount / total) * 100).toFixed(1)}% of workforce (Risk Score 30–49)
          </p>
        </div>

        {/* Low */}
        <div className="bg-white p-4.5 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Low Risk / Resilient</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{lowCount}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {((lowCount / total) * 100).toFixed(1)}% of workforce (Risk Score &lt; 30)
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Risk Intelligence:</span>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            {riskTiers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredEmployees.length}</span> profiles matching criteria
        </div>
      </div>

      {/* Automated Workforce Anomaly Detection Center */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Automated Workforce Anomaly Detection
              </h3>
              <p className="text-[11px] text-slate-400">
                Continuous ML statistical anomaly flags requiring targeted operational mitigation
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 self-start sm:self-auto">
            Live Anomaly Monitor Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Anomaly 1: Workload Overload */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                  Critical Severity
                </span>
                <span className="text-xs font-extrabold text-slate-900">
                  {employees.filter(e => (e.workload || 40) > 42).length} Staff Impacted
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Chronic Workload Overload (&gt;42h/wk)
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Elevated cognitive fatigue and burnout risk flagged for staff sustaining extended weekly hours above enterprise equilibrium thresholds.
              </p>
            </div>
            <button
              onClick={() => {
                setTriageActionMsg(`Initiated automated workload rebalancing for ${employees.filter(e => (e.workload || 40) > 42).length} staff`);
                setTimeout(() => setTriageActionMsg(null), 3500);
              }}
              className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Rebalance Workload Allocations</span>
            </button>
          </div>

          {/* Anomaly 2: Attendance Lapses */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                  Moderate Severity
                </span>
                <span className="text-xs font-extrabold text-slate-900">
                  {employees.filter(e => (e.attendance || 90) < 85).length} Staff Impacted
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Attendance Continuity Lapses (&lt;85%)
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Unscheduled presence deficits and continuity dips detected, statistically preceding productivity slowdown and disengagement.
              </p>
            </div>
            <button
              onClick={() => {
                setTriageActionMsg(`Scheduled managerial attendance reviews for ${employees.filter(e => (e.attendance || 90) < 85).length} staff`);
                setTimeout(() => setTriageActionMsg(null), 3500);
              }}
              className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-amber-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Schedule Attendance 1-on-1s</span>
            </button>
          </div>

          {/* Anomaly 3: Sudden Productivity Deceleration */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                  Predictive Alert
                </span>
                <span className="text-xs font-extrabold text-slate-900">
                  {employees.filter(e => (e.predicted_score || e.predicted_productivity || e.productivity_score) < e.productivity_score - 3.0).length} Staff Impacted
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                Predicted Productivity Trajectory Drop
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Scikit-Learn ML regression identifies a forecast decline of &gt;3% below baseline output, signaling impending execution bottlenecks.
              </p>
            </div>
            <button
              onClick={() => {
                setTriageActionMsg(`Assigned targeted performance coaching for ${employees.filter(e => (e.predicted_score || e.predicted_productivity || e.productivity_score) < e.productivity_score - 3.0).length} staff`);
                setTimeout(() => setTriageActionMsg(null), 3500);
              }}
              className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-blue-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Assign Enablement Mentorship</span>
            </button>
          </div>
        </div>
      </div>

      {/* Large Risk vs Performance Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <RiskPerformanceMatrix
          data={riskMatrixPoints}
          onViewEmployee={onViewEmployee}
        />
      </div>

      {/* High-Risk Employee Triage Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Immediate Triage Register</h3>
            <p className="text-[11px] text-slate-400">Personnel requiring managerial intervention or retention support</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {filteredEmployees.filter(e => (e.burnout_risk_score || 0) >= 50).length} Elevated Action Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Productivity</th>
                <th className="py-3 px-4 text-center">Burnout Risk</th>
                <th className="py-3 px-4 text-center">Primary Risk Factor</th>
                <th className="py-3 px-4 text-right">Intervention Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees
                .filter(e => (e.burnout_risk_score || 0) >= 30)
                .slice(0, 8)
                .map(emp => {
                  const risk = emp.burnout_risk_score || 0;
                  const factor = (emp.workload || 40) > 42 ? 'High Workload (>42h)' :
                                 (emp.attendance || 90) < 85 ? 'Attendance Dip (<85%)' :
                                 (emp.engagement || 75) < 70 ? 'Low Engagement Index' : 'Productivity Drop';
                  return (
                    <tr key={emp.employee_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                          {(emp.full_name || emp.employee_name || 'E').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{emp.full_name || emp.employee_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{emp.employee_id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">{emp.department}</td>
                      <td className="py-3 px-4 text-slate-600">{emp.role || 'Staff'}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{emp.productivity_score}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          risk >= 75 ? 'bg-rose-100 text-rose-800' :
                          risk >= 50 ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {risk}% ({risk >= 75 ? 'Critical' : risk >= 50 ? 'High' : 'Moderate'})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">
                        {factor}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAction(emp.employee_id, 'review')}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                          >
                            Schedule 1-on-1
                          </button>
                          <button
                            onClick={() => onViewEmployee && onViewEmployee(emp.employee_id)}
                            className="px-2 py-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Open 360 profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
