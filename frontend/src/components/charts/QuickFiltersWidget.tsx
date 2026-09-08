import React, { useState } from 'react';
import { Filter, Calendar, Check, ChevronDown, RefreshCw } from 'lucide-react';

interface QuickFiltersWidgetProps {
  onApplyFilters: (filters: { department?: string; riskLevel?: string }) => void;
  selectedDepartment?: string;
  selectedRisk?: string;
}

export const QuickFiltersWidget: React.FC<QuickFiltersWidgetProps> = ({
  onApplyFilters,
  selectedDepartment = 'All Departments',
  selectedRisk = 'All Risk Levels'
}) => {
  const [dept, setDept] = useState(selectedDepartment);
  const [risk, setRisk] = useState(selectedRisk);
  const [isApplying, setIsApplying] = useState(false);

  const departments = ['All Departments', 'Engineering', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales'];
  const riskTiers = ['All Risk Levels', 'Low Risk (<30)', 'Moderate Risk (30-69)', 'High Risk (>=70)'];

  const handleApply = () => {
    setIsApplying(true);
    onApplyFilters({
      department: dept === 'All Departments' ? 'All' : dept,
      riskLevel: risk === 'All Risk Levels' ? 'All' : risk
    });
    setTimeout(() => setIsApplying(false), 300);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-xs font-bold text-slate-900">Quick Filters</h3>
      </div>

      <div className="space-y-2">
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

        {/* Risk Level Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Risk Tier
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
              <span>Sep 2026</span>
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase">Active</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleApply}
        disabled={isApplying}
        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
      >
        {isApplying ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Filtering...</span>
          </>
        ) : (
          <span>Apply Filter View</span>
        )}
      </button>
    </div>
  );
};
