import React from 'react';
import { Filter, RotateCcw, Search, X, Check, SlidersHorizontal, Sparkles, Building2, UserCheck, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GlobalFilterState } from '../../types';

interface GlobalFilterBarProps {
  filters: GlobalFilterState;
  onChange: (updated: Partial<GlobalFilterState>) => void;
  onReset: () => void;
  availableDepartments?: string[];
  availableRoles?: string[];
  totalRecordsCount?: number;
  filteredRecordsCount?: number;
}

const DEPARTMENTS_DEFAULT = ['All', 'Engineering', 'Sales', 'Product', 'Marketing', 'Operations', 'Finance', 'HR'];
const ROLES_DEFAULT = ['All', 'Senior Engineer', 'Frontend Dev', 'Backend Engineer', 'Product Manager', 'Data Scientist', 'Sales Lead', 'HR Specialist', 'Operations Analyst'];
const PERFORMANCE_OPTIONS = [
  { value: 'All', label: 'All Performance' },
  { value: 'High', label: 'High (>= 80%)' },
  { value: 'Medium', label: 'Medium (50-79%)' },
  { value: 'Low', label: 'Low (< 50%)' },
];
const RISK_OPTIONS = [
  { value: 'All', label: 'All Risk Tiers' },
  { value: 'High', label: 'Critical Risk (>= 70%)' },
  { value: 'Medium', label: 'Emerging Risk (30-69%)' },
  { value: 'Low', label: 'Stable (< 30%)' },
];
const COHORT_OPTIONS = [
  { value: 'All', label: 'All Experience' },
  { value: '0-2', label: '0-2 yrs (Junior)' },
  { value: '3-5', label: '3-5 yrs (Mid-level)' },
  { value: '6-8', label: '6-8 yrs (Senior)' },
  { value: '9+', label: '9+ yrs (Staff/Lead)' },
];
const DATE_RANGES = [
  { value: 'All', label: 'All Time' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'ytd', label: 'Year to Date' },
];

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  availableDepartments = DEPARTMENTS_DEFAULT,
  availableRoles = ROLES_DEFAULT,
  totalRecordsCount,
  filteredRecordsCount,
}) => {
  const activeFilterCount = [
    filters.department !== 'All',
    filters.role !== 'All',
    filters.performance_status !== 'All',
    filters.risk_level !== 'All',
    filters.experience_cohort !== 'All',
    filters.date_range !== 'All',
    Boolean(filters.search.trim()),
  ].filter(Boolean).length;

  const handlePreset = (preset: 'all' | 'critical' | 'high_perf' | 'engineering') => {
    switch (preset) {
      case 'all':
        onReset();
        break;
      case 'critical':
        onChange({
          department: 'All',
          role: 'All',
          performance_status: 'All',
          risk_level: 'High',
          experience_cohort: 'All',
          search: '',
        });
        break;
      case 'high_perf':
        onChange({
          department: 'All',
          role: 'All',
          performance_status: 'High',
          risk_level: 'Low',
          experience_cohort: 'All',
          search: '',
        });
        break;
      case 'engineering':
        onChange({
          department: 'Engineering',
          role: 'All',
          performance_status: 'All',
          risk_level: 'All',
          experience_cohort: 'All',
          search: '',
        });
        break;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs transition-colors space-y-3">
      {/* Top row: Presets, search, status, and clear */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Cross-Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePreset('all')}
              className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all ${
                activeFilterCount === 0
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              All Workforce
            </button>
            <button
              onClick={() => handlePreset('critical')}
              className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all flex items-center gap-1 ${
                filters.risk_level === 'High'
                  ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>Critical Risk</span>
            </button>
            <button
              onClick={() => handlePreset('high_perf')}
              className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all flex items-center gap-1 ${
                filters.performance_status === 'High'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>High Performers</span>
            </button>
            <button
              onClick={() => handlePreset('engineering')}
              className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all hidden md:flex items-center gap-1 ${
                filters.department === 'Engineering'
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <Building2 className="w-3 h-3 text-purple-500" />
              <span>Engineering</span>
            </button>
          </div>
        </div>

        {/* Search and Counts */}
        <div className="flex items-center gap-2 flex-1 max-w-sm justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, ID, role..."
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => onChange({ search: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {totalRecordsCount !== undefined && filteredRecordsCount !== undefined && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block font-medium">
              <span className="text-slate-900 dark:text-slate-100 font-bold">{filteredRecordsCount}</span> / {totalRecordsCount}
            </div>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl font-medium transition-colors flex items-center gap-1"
              title="Reset all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selectors Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        {/* Department */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => onChange({ department: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
          >
            {availableDepartments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>

        {/* Role */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Job Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => onChange({ role: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
          >
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r === 'All' ? 'All Roles' : r}
              </option>
            ))}
          </select>
        </div>

        {/* Performance */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Performance Status
          </label>
          <select
            value={filters.performance_status}
            onChange={(e) => onChange({ performance_status: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
          >
            {PERFORMANCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Risk Tier
          </label>
          <select
            value={filters.risk_level}
            onChange={(e) => onChange({ risk_level: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
          >
            {RISK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Cohort */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Experience Cohort
          </label>
          <select
            value={filters.experience_cohort}
            onChange={(e) => onChange({ experience_cohort: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
          >
            {COHORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            Time Window
          </label>
          <select
            value={filters.date_range}
            onChange={(e) => onChange({ date_range: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
          >
            {DATE_RANGES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mr-1">Active:</span>
          {filters.department !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Dept: {filters.department}
              <button onClick={() => onChange({ department: 'All' })} className="hover:text-blue-900 dark:hover:text-blue-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.role !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Role: {filters.role}
              <button onClick={() => onChange({ role: 'All' })} className="hover:text-purple-900 dark:hover:text-purple-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.performance_status !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Perf: {filters.performance_status}
              <button onClick={() => onChange({ performance_status: 'All' })} className="hover:text-emerald-900 dark:hover:text-emerald-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.risk_level !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Risk: {filters.risk_level}
              <button onClick={() => onChange({ risk_level: 'All' })} className="hover:text-rose-900 dark:hover:text-rose-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.experience_cohort !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Cohort: {filters.experience_cohort}
              <button onClick={() => onChange({ experience_cohort: 'All' })} className="hover:text-amber-900 dark:hover:text-amber-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.date_range !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Window: {filters.date_range}
              <button onClick={() => onChange({ date_range: 'All' })} className="hover:text-slate-900 dark:hover:text-slate-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              "{filters.search}"
              <button onClick={() => onChange({ search: '' })} className="hover:text-slate-900 dark:hover:text-slate-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
