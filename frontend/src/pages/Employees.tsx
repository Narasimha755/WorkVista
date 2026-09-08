import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Eye, 
  Columns,
  RefreshCw 
} from 'lucide-react';
import { Employee, EmployeeListResponse } from '../types';
import { api } from '../services/api';

interface EmployeesPageProps {
  onViewEmployee: (id: string) => void;
  globalSearch?: string;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ 
  onViewEmployee, 
  globalSearch = '' 
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>(globalSearch);
  const [department, setDepartment] = useState<string>('All Departments');
  const [status, setStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [departmentsList, setDepartmentsList] = useState<string[]>(['All Departments']);

  const loadData = () => {
    setLoading(true);
    api.getEmployees({
      page,
      page_size: pageSize,
      search,
      department,
      status,
      sort_by: sortBy,
      sort_dir: sortDir
    })
    .then((res: EmployeeListResponse) => {
      setEmployees(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    // Fetch unique departments
    api.getDepartments().then((depts) => {
      if (depts && depts.length > 0) {
        setDepartmentsList(['All Departments', ...depts.map(d => d.name)]);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    loadData();
  }, [page, pageSize, department, status, sortBy, sortDir]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const getStatusBadge = (statusStr?: string) => {
    switch (statusStr) {
      case 'High':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">High</span>;
      case 'At Risk':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">At Risk</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Medium</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Workforce Directory & Predictions
          </h2>
          <p className="text-xs text-slate-500">
            {total} employees identified across operational cohorts
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => api.triggerExportCsv({ department, status, search })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => api.triggerExportCsv({ department, status, search })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Dataset</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
            />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            aria-label="Filter directory by department"
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {departmentsList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            aria-label="Filter directory by status"
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="High">High Performers</option>
            <option value="Medium">Medium Performers</option>
            <option value="At Risk">At Risk</option>
          </select>
        </div>

        <button 
          onClick={loadData}
          title="Reload table"
          className="p-2 text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('employee_name')}>
                  <div className="flex items-center gap-1.5">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('department')}>
                  <div className="flex items-center gap-1.5">
                    <span>Department</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center cursor-pointer" onClick={() => handleSort('productivity_score')}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Current Output</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Predicted Output</th>
                <th className="py-3 px-4 text-center">Change</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Risk Index</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading workforce records...</span>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No employees found matching the specified filters.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const pred = emp.prediction;
                  const change = pred ? pred.change_pct : 0;
                  const isPos = change >= 0;
                  return (
                    <tr 
                      key={emp.employee_id}
                      onClick={() => onViewEmployee(emp.employee_id)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500 text-[11px]">
                        {emp.employee_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {emp.employee_name}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {emp.department}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {emp.role}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                        {emp.productivity_score}%
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {pred ? `${pred.predicted_productivity}%` : `${emp.productivity_score}%`}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium">
                        <span className={isPos ? 'text-emerald-600' : 'text-rose-600'}>
                          {isPos ? `+${change}%` : `${change}%`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(pred?.status)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className={pred && pred.risk_score >= 50 ? 'text-rose-600' : 'text-slate-600'}>
                          {pred ? pred.risk_score : 20}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onViewEmployee(emp.employee_id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-all flex items-center gap-1 ml-auto hover:border-blue-300 hover:text-blue-600"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/40">
          <div>
            Showing <span className="font-semibold text-slate-800">{Math.min(total, (page - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(total, page * pageSize)}</span> of{' '}
            <span className="font-semibold text-slate-800">{total}</span> employees
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
