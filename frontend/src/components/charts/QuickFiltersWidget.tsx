import React, { useState, useEffect } from 'react';
import { Filter, Calendar, ChevronDown, RefreshCw, RotateCcw } from 'lucide-react';

interface QuickFiltersWidgetProps {
  onApplyFilters: (filters: { department?: string; riskLevel?: string; status?: string }) => void;
  onResetFilters?: () => void;
  selectedDepartment?: string;
  selectedRisk?: string;
  selectedStatus?: string;
}

export const QuickFiltersWidget: React.FC<QuickFiltersWidgetProps> = ({
  onApplyFilters,
  onResetFilters,
  selectedDepartment = 'All Departments',
  selectedRisk = 'All Risk Levels',
  selectedStatus = 'All'
}) => {
  const [dept, setDept] = useState(selectedDepartment);
  const [risk, setRisk] = useState(selectedRisk);
  const [status, setStatus] = useState(selectedStatus);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setDept(selectedDepartment);
  }, [selectedDepartment]);

  useEffect(() => {
    setRisk(selectedRisk);
  }, [selectedRisk]);

  useEffect(() => {
    setStatus(selectedStatus);
  }, [selectedStatus]);

  const departments = ['All Departments', 'Engineering', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales'];
  const riskTiers = ['All Risk Levels', 'Low Risk (<30)', 'Moderate Risk (30-69)', 'High Risk (>=70)'];
  const performanceTiers = [
    { label: 'All Performance', value: 'All' },
    { label: 'High (>= 80%)', value: 'High' },
    { label: 'Medium (50-79%)', value: 'Medium' },
    { label: 'Low (< 50%)', value: 'Low' }
  ];

  const handleApply = () => {
    setIsApplying(true);
    let normalizedRisk = 'All';
    if (risk.includes('High')) normalizedRisk = 'High';
    else if (risk.includes('Moderate')) normalizedRisk = 'Moderate';
    else if (risk.includes('Low')) normalizedRisk = 'Low';

    onApplyFilters({
      department: dept === 'All Departments' ? 'All' : dept,
      riskLevel: normalizedRisk,
      status: status
    });
    setTimeout(() => setIsApplying(false), 300);
  };

  const handleReset = () => {
    setDept('All Departments');
    setRisk('All Risk Levels');
    setStatus('All');
    if (onResetFilters) {
      onResetFilters();
    } else {
      onApplyFilters({ department: 'All', riskLevel: 'All', status: 'All' });
    }
  };

  const isFiltered = dept !== 'All Departments' || risk !== 'All Risk Levels' || status !== 'All';

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Synchronized Filters</h3>
        </div>
        {isFiltered && (
          <button
            onClick={handleReset}
            className="text-[11px] text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {/* Department Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Department Scope
          </label>
          <div className="relative">
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Performance Tier Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Performance Tier
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {performanceTiers.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Risk Level Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Flight Risk Tier
          </label>
          <div className="relative">
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {riskTiers.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Date Selector Readout */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Evaluation Period
          </label>
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Current Cycle</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Live AI</span>
          </div>
        </div>
      </div>

      <div className="pt-1 flex gap-2">
        <button
          onClick={handleApply}
          disabled={isApplying}
          className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
        >
          {isApplying ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <span>Apply Filters</span>
          )}
        </button>
        {isFiltered && (
          <button
            onClick={handleReset}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            title="Clear All Filters"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
