import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  Grid3X3,
  AlertTriangle,
  BatteryCharging,
  Search,
  Filter,
  Download,
  Eye,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  BarChart3,
  Clock,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Employee, Department, JobRole } from '../types';

interface WorkforceProps {
  onViewEmployee: (id: string) => void;
  globalSearch?: string;
}

export const Workforce: React.FC<WorkforceProps> = ({ onViewEmployee, globalSearch = '' }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'teams' | 'roles' | 'ninebox' | 'risk' | 'capacity'>('directory');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(globalSearch);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Sorting
  const [sortField, setSortField] = useState<string>('productivity_score');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [empRes, deptRes, rolesRes] = await Promise.all([
          api.getEmployees({ page: 1, page_size: 500 }),
          api.getDepartments(),
          api.getJobRoles()
        ]);
        setEmployees(empRes.items || []);
        setDepartments(deptRes || []);
        setRoles(rolesRes || []);
      } catch (err) {
        console.error('Error fetching workforce data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (deptFilter !== 'All' && e.department !== deptFilter) return false;
      if (statusFilter !== 'All') {
        const perf = e.performance_rating || (e.productivity_score >= 80 ? 'High' : e.productivity_score < 50 ? 'Low' : 'Medium');
        if (statusFilter === 'High' && perf !== 'High') return false;
        if (statusFilter === 'Medium' && perf !== 'Medium') return false;
        if (statusFilter === 'Low' && perf !== 'Low') return false;
        if (statusFilter === 'At Risk' && (e.prediction?.risk_score || 0) < 60) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = e.employee_name?.toLowerCase().includes(q);
        const matchId = e.employee_id?.toLowerCase().includes(q);
        const matchDept = e.department?.toLowerCase().includes(q);
        const matchRole = e.role?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDept && !matchRole) return false;
      }
      return true;
    });
  }, [employees, deptFilter, statusFilter, search]);

  // Sorted employees
  const sortedEmployees = useMemo(() => {
    const arr = [...filteredEmployees];
    arr.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
    return arr;
  }, [filteredEmployees, sortField, sortAsc]);

  // Paginated employees for directory
  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [sortedEmployees, page, pageSize]);

  const totalPages = Math.ceil(sortedEmployees.length / pageSize) || 1;

  // 9-Box Matrix Categorization
  // Performance: Low (<60), Medium (60-79), High (>=80)
  // Potential: Based on prediction trajectory or engagement: Low (<60), Medium (60-79), High (>=80)
  const nineBoxGroups = useMemo(() => {
    const grid: Record<string, Employee[]> = {
      'high-high': [], // Star (High Perf, High Pot)
      'high-med': [], // High Performer (High Perf, Med Pot)
      'high-low': [], // Solid Professional (High Perf, Low Pot)
      'med-high': [], // High Potential (Med Perf, High Pot)
      'med-med': [], // Core Contributor (Med Perf, Med Pot)
      'med-low': [], // Effective Contributor (Med Perf, Low Pot)
      'low-high': [], // Enigma / Inconsistent (Low Perf, High Pot)
      'low-med': [], // Dilemma (Low Perf, Med Pot)
      'low-low': [] // Risk / Underperformer (Low Perf, Low Pot)
    };

    filteredEmployees.forEach((e) => {
      const perf = e.productivity_score >= 80 ? 'high' : e.productivity_score >= 60 ? 'med' : 'low';
      const potScore = e.prediction?.predicted_productivity ?? e.engagement ?? 70;
      const pot = potScore >= 80 ? 'high' : potScore >= 60 ? 'med' : 'low';
      const key = `${perf}-${pot}`;
      if (grid[key]) grid[key].push(e);
    });

    return grid;
  }, [filteredEmployees]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Role', 'Productivity', 'Predicted', 'Tenure', 'Risk Score'];
    const rows = sortedEmployees.map((e) => [
      e.employee_id,
      `"${e.employee_name}"`,
      `"${e.department}"`,
      `"${e.role}"`,
      e.productivity_score,
      e.prediction?.predicted_productivity ?? 'N/A',
      e.experience,
      e.prediction?.risk_score ?? 'N/A'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `workvista_workforce_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Workforce Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Workforce Intelligence Hub
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                520 Active Records Synchronized
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Organization & Talent Command Center</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Complete workforce directory, departmental benchmarks, roles architecture, interactive 9-Box talent matrix, retention risks, and capacity utilization.
            </p>
          </div>

          {/* Export Action */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster (CSV)</span>
          </button>
        </div>

        {/* 4 Overview Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Active Staff</div>
            <div className="text-xl font-bold text-white mt-1">{employees.length}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Departments</div>
            <div className="text-xl font-bold text-blue-400 mt-1">{departments.length} Teams</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">High Performers</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {employees.filter((e) => (e.productivity_score || 0) >= 80).length} Staff
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Flight Risk Alert</div>
            <div className="text-xl font-bold text-rose-400 mt-1">
              {employees.filter((e) => (e.prediction?.risk_score || 0) >= 60).length} Staff
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Employees Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'teams'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Teams & Departments</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'roles'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Roles Architecture</span>
            </button>
            <button
              onClick={() => setActiveTab('ninebox')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ninebox'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>9-Box Talent Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'risk'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Risk & Retention</span>
            </button>
            <button
              onClick={() => setActiveTab('capacity')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'capacity'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>Capacity & Workload</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sub-filters bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Scope:</span>
          </div>

          {/* Dept */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="py-1 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-1 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="All">All Performance Levels</option>
            <option value="High">High Performers (&ge; 80%)</option>
            <option value="Medium">Medium Performers</option>
            <option value="Low">Low Performers (&lt; 50%)</option>
            <option value="At Risk">At Risk Only</option>
          </select>

          <div className="ml-auto text-[11px] text-slate-400">
            Showing <span className="font-bold text-slate-700 dark:text-slate-300">{filteredEmployees.length}</span> of {employees.length} employees
          </div>
        </div>
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSortField('employee_name');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      Employee <ArrowUpDown className="w-3 h-3 inline ml-1" />
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSortField('department');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      Department <ArrowUpDown className="w-3 h-3 inline ml-1" />
                    </th>
                    <th className="py-3 px-4">Role</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSortField('experience');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      Tenure <ArrowUpDown className="w-3 h-3 inline ml-1" />
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSortField('productivity_score');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      Productivity <ArrowUpDown className="w-3 h-3 inline ml-1" />
                    </th>
                    <th className="py-3 px-4">Forecast</th>
                    <th className="py-3 px-4">Flight Risk</th>
                    <th className="py-3 px-4 text-right">360 View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedEmployees.map((e) => {
                    const risk = e.prediction?.risk_score ?? 25;
                    const isCritical = risk >= 60;
                    return (
                      <tr
                        key={e.employee_id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => onViewEmployee(e.employee_id)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{e.employee_name}</div>
                          <div className="text-[10px] text-slate-400">{e.employee_id}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold">{e.department}</td>
                        <td className="py-3 px-4">{e.role}</td>
                        <td className="py-3 px-4">{e.experience} yrs</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {e.productivity_score}%
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">
                          {e.prediction?.predicted_productivity ? `${e.prediction.predicted_productivity}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCritical
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}
                          >
                            {risk}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onViewEmployee(e.employee_id);
                            }}
                            className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg font-medium inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Dossier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div>
                Page <span className="font-bold text-slate-800 dark:text-slate-200">{page}</span> of {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg disabled:opacity-40 font-bold"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg disabled:opacity-40 font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAMS & DEPARTMENTS */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => {
            const teamEmps = employees.filter((e) => e.department === d.name);
            const highPerf = teamEmps.filter((e) => (e.productivity_score || 0) >= 80).length;
            const atRisk = teamEmps.filter((e) => (e.prediction?.risk_score || 0) >= 60).length;
            return (
              <div
                key={d.name}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-blue-400 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{d.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{teamEmps.length} Active Staff Members</p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold">
                    {d.avg_productivity.toFixed(1)}% Output
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Star Contributors:</span>
                    <span className="font-bold text-emerald-600">{highPerf} staff</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Flight Risk Exposure:</span>
                    <span className="font-bold text-rose-600">{atRisk} staff</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg Predicted Next Q:</span>
                    <span className="font-bold text-blue-600">
                      {d.predicted_productivity ? `${d.predicted_productivity.toFixed(1)}%` : `${(d.avg_productivity * 1.02).toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDeptFilter(d.name);
                    setActiveTab('directory');
                  }}
                  className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Filter Roster by {d.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: ROLES ARCHITECTURE */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                    {r.department}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{r.title}</h4>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  ${(r.min_salary / 1000).toFixed(0)}k - ${(r.max_salary / 1000).toFixed(0)}k
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{r.description}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {(r.required_skills || []).map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-medium">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: 9-BOX TALENT MATRIX */}
      {activeTab === 'ninebox' && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Grid3X3 className="w-4 h-4 text-blue-600" />
              <span>9-Box Talent Succession Grid (Performance vs. Potential)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Strategic talent management framework plotting verified operational output against machine-forecasted growth potential.
            </p>
          </div>

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Row 1: High Potential */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-purple-900 dark:text-purple-200">Enigma / Rough Diamond</div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400">Low Perf • High Pot</div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {nineBoxGroups['low-high'].length}
                </span>
                <span className="text-xs text-purple-600 ml-1">Staff</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-blue-900 dark:text-blue-200">High Potential Talent</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400">Med Perf • High Pot</div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {nineBoxGroups['med-high'].length}
                </span>
                <span className="text-xs text-blue-600 ml-1">Staff</span>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Star Performers</span>
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">High Perf • High Pot</div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {nineBoxGroups['high-high'].length}
                </span>
                <span className="text-xs text-emerald-600 ml-1">Staff</span>
              </div>
            </div>

            {/* Row 2: Medium Potential */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">Dilemma</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400">Low Perf • Med Pot</div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {nineBoxGroups['low-med'].length}
                </span>
                <span className="text-xs text-amber-600 ml-1">Staff</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-200">Core Contributor</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Med Perf • Med Pot</div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {nineBoxGroups['med-med'].length}
                </span>
                <span className="text-xs text-slate-500 ml-1">Staff</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-blue-900 dark:text-blue-200">High Performer</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400">High Perf • Med Pot</div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {nineBoxGroups['high-med'].length}
                </span>
                <span className="text-xs text-blue-600 ml-1">Staff</span>
              </div>
            </div>

            {/* Row 3: Low Potential */}
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-rose-900 dark:text-rose-200">Underperformer / Risk</div>
                <div className="text-[10px] text-rose-600 dark:text-rose-400">Low Perf • Low Pot</div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                  {nineBoxGroups['low-low'].length}
                </span>
                <span className="text-xs text-rose-600 ml-1">Staff</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-200">Effective Professional</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Med Perf • Low Pot</div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {nineBoxGroups['med-low'].length}
                </span>
                <span className="text-xs text-slate-500 ml-1">Staff</span>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Solid Specialist</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">High Perf • Low Pot</div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {nineBoxGroups['high-low'].length}
                </span>
                <span className="text-xs text-emerald-600 ml-1">Staff</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RISK & RETENTION */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Flight Risk Priority Queue</span>
              </h3>
              <p className="text-xs text-slate-500">
                Identified personnel with flight risk score &ge; 60% requiring immediate retention intervention.
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto pt-2">
                {employees
                  .filter((e) => (e.prediction?.risk_score || 0) >= 60)
                  .map((e) => (
                    <div
                      key={e.employee_id}
                      onClick={() => onViewEmployee(e.employee_id)}
                      className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center justify-between cursor-pointer hover:border-rose-400"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{e.employee_name}</div>
                        <div className="text-[10px] text-slate-500">
                          {e.department} • {e.role}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {e.prediction?.risk_score}% Risk
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Prod: {e.productivity_score}%</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Risk Mitigating Policies</span>
              </h3>
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Workload Rebalancing</div>
                  <div className="text-slate-500 mt-1">
                    Reduces attrition risk by an estimated 24% for employees exceeding 48 hours/week.
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Mid-Cycle Compensation Alignment</div>
                  <div className="text-slate-500 mt-1">
                    Targeted for top quartile contributors in Engineering with tenure &gt; 3 years.
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Direct Manager 1-on-1 Check-ins</div>
                  <div className="text-slate-500 mt-1">
                    Automated calendar invitations dispatched by WorkVista for high-burnout cohorts.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CAPACITY & WORKLOAD */}
      {activeTab === 'capacity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => {
            const teamEmps = employees.filter((e) => e.department === d.name);
            const avgHours =
              teamEmps.reduce((acc, e) => acc + (e.working_hours || 40), 0) / (teamEmps.length || 1);
            const utilization = Math.min(100, Math.round((avgHours / 40) * 88));
            const isOver = utilization >= 90;

            return (
              <div
                key={d.name}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{d.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOver
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isOver ? 'Over-Capacity' : 'Balanced'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Utilization Rate:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{utilization}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-blue-600'}`}
                      style={{ width: `${utilization}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Avg Hours: {avgHours.toFixed(1)} hrs/wk</span>
                  <span>Headcount: {teamEmps.length} staff</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
