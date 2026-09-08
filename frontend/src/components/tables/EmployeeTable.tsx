import React, { useState } from 'react';
import { 
  Search, 
  MoreVertical, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Maximize2, 
  Download, 
  CheckSquare, 
  Square, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  FileText,
  Flag,
  Share2
} from 'lucide-react';
import { DashboardEmployeeItem } from '../../types';
import { api } from '../../services/api';

interface EmployeeTableProps {
  employees?: DashboardEmployeeItem[];
  totalCount?: number;
  departments?: string[];
  selectedDepartment?: string;
  onDepartmentChange?: (dept: string) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onViewEmployee?: (employeeId: string) => void;
  onViewAll?: () => void;
  isFullView?: boolean;
  onMaximize?: () => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  totalCount = 520,
  departments = ['All Departments', 'Engineering', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales'],
  selectedDepartment = 'All Departments',
  onDepartmentChange,
  selectedStatus = 'All Status',
  onStatusChange,
  searchQuery = '',
  onSearchChange,
  onViewEmployee,
  onViewAll,
  isFullView = false,
  onMaximize
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const defaultEmployees: DashboardEmployeeItem[] = [
    { id: 1, employee_id: 'EMP-1001', employee_name: 'Rahul Sharma', department: 'Engineering', role: 'Software Engineer', current_productivity: 88, predicted_productivity: 92, change_pct: 4.0, status: 'High', risk_score: 12, confidence_score: 91, last_updated: '15 Sep 2026' },
    { id: 2, employee_id: 'EMP-1002', employee_name: 'Priya Verma', department: 'Marketing', role: 'Marketing Manager', current_productivity: 76, predicted_productivity: 80, change_pct: 4.0, status: 'Medium', risk_score: 28, confidence_score: 87, last_updated: '15 Sep 2026' },
    { id: 3, employee_id: 'EMP-1003', employee_name: 'Arjun Patel', department: 'Finance', role: 'Financial Analyst', current_productivity: 62, predicted_productivity: 58, change_pct: -4.0, status: 'At Risk', risk_score: 72, confidence_score: 83, last_updated: '15 Sep 2026' },
    { id: 4, employee_id: 'EMP-1004', employee_name: 'Sneha Reddy', department: 'HR', role: 'HR Specialist', current_productivity: 81, predicted_productivity: 85, change_pct: 4.0, status: 'High', risk_score: 18, confidence_score: 89, last_updated: '15 Sep 2026' },
    { id: 5, employee_id: 'EMP-1005', employee_name: 'Vikram Singh', department: 'Operations', role: 'Operations Manager', current_productivity: 69, predicted_productivity: 72, change_pct: 3.0, status: 'Medium', risk_score: 38, confidence_score: 85, last_updated: '15 Sep 2026' },
  ];

  const items = employees && employees.length > 0 ? employees : defaultEmployees;

  // Pagination slice
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = items.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(items.length / pageSize) || 1;

  const handleSelectAll = () => {
    if (selectedIds.length === visibleItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleItems.map(e => e.employee_id));
    }
  };

  const handleToggleSelect = (empId: string) => {
    if (selectedIds.includes(empId)) {
      setSelectedIds(selectedIds.filter(id => id !== empId));
    } else {
      setSelectedIds([...selectedIds, empId]);
    }
  };

  const handleBulkReview = () => {
    if (selectedIds.length === 0) return;
    api.bulkAssignReview(selectedIds, 'Quarterly Performance Evaluation');
    setFeedbackMsg(`Assigned review task to ${selectedIds.length} employees`);
    setSelectedIds([]);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    const selectedEmps = items.filter(e => selectedIds.includes(e.employee_id));
    const csvContent = 'Employee ID,Name,Department,Productivity,Predicted,Change,Risk Score\n' +
      selectedEmps.map(e => `${e.employee_id},"${e.employee_name}","${e.department}",${e.current_productivity},${e.predicted_productivity},${e.change_pct},${e.risk_score}`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `selected_${selectedIds.length}_employees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedbackMsg(`Exported ${selectedIds.length} employee records to CSV`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleBulkFlag = () => {
    if (selectedIds.length === 0) return;
    api.bulkFlagEmployees(selectedIds, 'Review requested by HR');
    setFeedbackMsg(`Flagged ${selectedIds.length} employees for management attention`);
    setSelectedIds([]);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">Critical</span>;
    }
    if (score >= 50) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">High</span>;
    }
    if (score >= 30) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Moderate</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Low</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 pb-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Employee Predictions
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time individual performance forecasts and risk assessments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-44 sm:w-52 transition-all"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange && onDepartmentChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All Status">All Status</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="At Risk">At Risk</option>
          </select>

          {/* Export Table */}
          <button
            onClick={() => api.exportEmployeesCsv({ department: selectedDepartment, status: selectedStatus, search: searchQuery })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>Export</span>
          </button>

          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all shadow-2xs flex items-center justify-center shrink-0 ml-1"
              title="Maximize Employee Register"
              aria-label="Maximize Employee Register"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Selection Notification Bar */}
      {selectedIds.length > 0 && (
        <div className="px-5 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>{selectedIds.length} employee{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkReview}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-700 font-semibold rounded-lg border border-blue-200 shadow-2xs transition-colors"
            >
              <UserCheck className="w-3 h-3" />
              <span>Assign Review</span>
            </button>
            <button
              onClick={handleBulkExport}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Export Selected</span>
            </button>
            <button
              onClick={handleBulkFlag}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 font-semibold rounded-lg border border-rose-200 shadow-2xs transition-colors"
            >
              <Flag className="w-3 h-3" />
              <span>Flag Employees</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="px-5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold border-b border-emerald-100 flex items-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={visibleItems.length > 0 && selectedIds.length === visibleItems.length}
                  onChange={handleSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4 text-center">Current Productivity</th>
              <th className="py-3 px-4 text-center">Predicted Productivity</th>
              <th className="py-3 px-4 text-center">Change</th>
              <th className="py-3 px-4 text-center">Risk Score</th>
              <th className="py-3 px-4 text-center">Risk Level</th>
              <th className="py-3 px-4 text-center">Confidence</th>
              <th className="py-3 px-4 text-center">Last Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {visibleItems.map((emp, index) => {
              const isSelected = selectedIds.includes(emp.employee_id);
              const change = emp.change_pct;
              const isPositive = change >= 0;

              return (
                <tr 
                  key={emp.employee_id}
                  onClick={() => onViewEmployee && onViewEmployee(emp.employee_id)}
                  className={`hover:bg-blue-50/30 transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/40' : ''}`}
                >
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(emp.employee_id)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                    {startIndex + index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
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
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {emp.department}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {emp.role || 'Specialist'}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">
                    {emp.current_productivity}%
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-purple-700">
                    {emp.predicted_productivity}%
                  </td>
                  <td className="py-3 px-4 text-center font-medium">
                    <span className={`inline-flex items-center gap-0.5 font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {isPositive ? `+${change}%` : `${change}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                    {emp.risk_score}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getRiskBadge(emp.risk_score)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600">
                    {emp.confidence_score || 90}%
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] text-slate-400">
                    {emp.last_updated || '15 Sep 2026'}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => onViewEmployee && onViewEmployee(emp.employee_id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Employee 360"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:px-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing {items.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, items.length)} of {items.length} employees
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
