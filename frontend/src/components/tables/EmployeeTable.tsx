import React from 'react';
import { Search, MoreVertical, ArrowUp, ArrowDown, Eye, Maximize2 } from 'lucide-react';
import { DashboardEmployeeItem } from '../../types';

interface EmployeeTableProps {
  employees?: DashboardEmployeeItem[];
  departments?: string[];
  selectedDepartment?: string;
  onDepartmentChange?: (dept: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onViewEmployee?: (employeeId: string) => void;
  onViewAll?: () => void;
  isFullView?: boolean;
  onMaximize?: () => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  departments = ['All Departments', 'Engineering', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales'],
  selectedDepartment = 'All Departments',
  onDepartmentChange,
  searchQuery = '',
  onSearchChange,
  onViewEmployee,
  onViewAll,
  isFullView = false,
  onMaximize
}) => {
  const defaultEmployees: DashboardEmployeeItem[] = [
    { id: 1, employee_id: 'EMP-1001', employee_name: 'Rahul Sharma', department: 'Engineering', current_productivity: 88, predicted_productivity: 92, change_pct: 4.0, status: 'High', risk_score: 12 },
    { id: 2, employee_id: 'EMP-1002', employee_name: 'Priya Verma', department: 'Marketing', current_productivity: 76, predicted_productivity: 80, change_pct: 4.0, status: 'Medium', risk_score: 28 },
    { id: 3, employee_id: 'EMP-1003', employee_name: 'Arjun Patel', department: 'Finance', current_productivity: 62, predicted_productivity: 58, change_pct: -4.0, status: 'At Risk', risk_score: 68 },
    { id: 4, employee_id: 'EMP-1004', employee_name: 'Sneha Reddy', department: 'HR', current_productivity: 81, predicted_productivity: 85, change_pct: 4.0, status: 'High', risk_score: 15 },
    { id: 5, employee_id: 'EMP-1005', employee_name: 'Vikram Singh', department: 'Operations', current_productivity: 69, predicted_productivity: 72, change_pct: 3.0, status: 'Medium', risk_score: 35 },
  ];

  const items = employees && employees.length > 0 ? employees : defaultEmployees;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-cyan-500/15 text-cyan-700 border-cyan-300',
      'bg-amber-500/15 text-amber-700 border-amber-300',
      'bg-rose-500/15 text-rose-700 border-rose-300',
      'bg-purple-500/15 text-purple-700 border-purple-300',
      'bg-blue-500/15 text-blue-700 border-blue-300',
      'bg-emerald-500/15 text-emerald-700 border-emerald-300'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'High':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            High
          </span>
        );
      case 'At Risk':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            At Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Medium
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            #
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Employee Prediction Details
            </h3>
            <p className="text-[11px] text-slate-400">
              Individual performance forecasts and risk scoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44 transition-all"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange && onDepartmentChange(e.target.value)}
            aria-label="Filter by department"
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {!isFullView && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
            >
              View All
            </button>
          )}

          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors ml-0.5"
              title="Maximize View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-5 w-12 text-center">#</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-center">Current Productivity</th>
              <th className="py-3 px-4 text-center">Predicted Productivity (Next Month)</th>
              <th className="py-3 px-4 text-center">Change</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {items.map((emp, index) => {
              const change = emp.change_pct;
              const isPositive = change >= 0;
              return (
                <tr 
                  key={emp.employee_id}
                  onClick={() => onViewEmployee && onViewEmployee(emp.employee_id)}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5 text-center font-mono text-slate-400 text-[11px]">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${getAvatarBg(emp.employee_name)}`}>
                        {getInitials(emp.employee_name)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {emp.employee_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {emp.employee_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {emp.department}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                    {emp.current_productivity}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {emp.predicted_productivity}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium">
                    <span className={`inline-flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                      {isPositive ? `+${change}%` : `${change}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(emp.status)}
                  </td>
                  <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewEmployee && onViewEmployee(emp.employee_id)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-all flex items-center gap-1 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-3.5 h-3.5" />
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
  );
};
