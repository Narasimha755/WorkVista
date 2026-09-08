import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Building2, FileText, LayoutDashboard, ShieldAlert, Database, Activity, Gauge, Settings, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Employee } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmployee: (id: string) => void;
  onSelectTab: (tab: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectEmployee,
  onSelectTab
}) => {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      api.getEmployees({ page: 1, page_size: 100 })
        .then(res => setEmployees(res.items))
        .catch(console.error);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const pages = [
    { id: 'dashboard', name: 'Workforce Intelligence Dashboard', icon: LayoutDashboard, category: 'Pages' },
    { id: 'risk-intelligence', name: 'Risk Intelligence Command Center', icon: ShieldAlert, category: 'Pages' },
    { id: 'employees', name: 'Employee Directory & Roster', icon: Users, category: 'Pages' },
    { id: 'predictions', name: 'Predictive Modeling Center', icon: Gauge, category: 'Pages' },
    { id: 'departments', name: 'Departmental Analytics', icon: Building2, category: 'Pages' },
    { id: 'data-studio', name: 'Data Studio & Quality Profiler', icon: Database, category: 'Pages' },
    { id: 'reports', name: 'Executive Report Center', icon: FileText, category: 'Pages' },
    { id: 'activity', name: 'Activity & Audit Log', icon: Activity, category: 'Pages' },
    { id: 'settings', name: 'System Settings & Thresholds', icon: Settings, category: 'Pages' },
  ];

  const matchedPages = pages.filter(p => !q || p.name.toLowerCase().includes(q));

  const matchedEmployees = employees.filter(e => 
    !q || 
    e.employee_name?.toLowerCase().includes(q) ||
    e.full_name?.toLowerCase().includes(q) ||
    e.employee_id?.toLowerCase().includes(q) ||
    e.department?.toLowerCase().includes(q) ||
    e.role?.toLowerCase().includes(q)
  ).slice(0, 6);

  const departments = ['Engineering', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales'];
  const matchedDepts = departments.filter(d => !q || d.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search employees, departments, reports, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            ESC
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 divide-y divide-slate-100">
          {/* Quick Pages */}
          <div>
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation & Workspaces
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
              {matchedPages.slice(0, 4).map(page => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSelectTab(page.id);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <span className="text-xs font-semibold truncate">{page.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employees */}
          {matchedEmployees.length > 0 && (
            <div className="pt-3">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Employees ({matchedEmployees.length})</span>
                <span className="text-[10px] text-slate-400 font-normal">Click to view 360 profile</span>
              </div>
              <div className="space-y-1 mt-1">
                {matchedEmployees.map(emp => (
                  <button
                    key={emp.employee_id}
                    onClick={() => {
                      onSelectEmployee(emp.employee_id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {(emp.full_name || emp.employee_name || 'E').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {emp.full_name || emp.employee_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {emp.department} · {emp.role} · ID: {emp.employee_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800">{emp.productivity_score}%</span>
                        <div className="text-[10px] text-slate-400">Score</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {matchedDepts.length > 0 && (
            <div className="pt-3">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Departments
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1 px-2">
                {matchedDepts.map(dept => (
                  <button
                    key={dept}
                    onClick={() => {
                      onSelectTab('departments');
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors"
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <span>Powered by WorkVista Intelligent Search</span>
        </div>
      </div>
    </div>
  );
};
