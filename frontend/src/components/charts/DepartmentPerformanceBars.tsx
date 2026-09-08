import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ReferenceLine } from 'recharts';
import { Building2, Maximize2, Download, ArrowUpDown, GitCompare } from 'lucide-react';
import { DepartmentProductivityItem } from '../../types';

interface DepartmentPerformanceBarsProps {
  data?: DepartmentProductivityItem[];
  onMaximize?: () => void;
  onSelectDepartment?: (dept: string) => void;
}

export const DepartmentPerformanceBars: React.FC<DepartmentPerformanceBarsProps> = ({
  data = [],
  onMaximize,
  onSelectDepartment
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'top' | 'growth'>('all');
  const [showOrgAvg, setShowOrgAvg] = useState<boolean>(false);

  // Compute organization average from real data
  const orgAverage = useMemo(() => {
    if (!data.length) return 75;
    const total = data.reduce((acc, d) => acc + (d.actual || 0), 0);
    return Number((total / data.length).toFixed(1));
  }, [data]);

  const chartData = useMemo(() => {
    const list = [...data];
    if (filterMode === 'top') {
      return list.sort((a, b) => b.actual - a.actual);
    }
    if (filterMode === 'growth') {
      return list.sort((a, b) => (b.predicted - b.actual) - (a.predicted - a.actual));
    }
    return list;
  }, [data, filterMode]);

  const handleExportCsv = () => {
    if (!chartData.length) return;
    const header = ['Department', 'Actual Output (%)', 'Predicted Output (%)', 'Delta (%)'];
    const rows = chartData.map(d => [
      `"${d.department}"`,
      d.actual,
      d.predicted,
      Number((d.predicted - d.actual).toFixed(1))
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workvista_department_performance_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const act = payload.find((p: any) => p.dataKey === 'actual')?.value;
      const pred = payload.find((p: any) => p.dataKey === 'predicted')?.value;
      const delta = pred !== undefined && act !== undefined ? Number((pred - act).toFixed(1)) : 0;
      const vsOrg = act !== undefined ? Number((act - orgAverage).toFixed(1)) : 0;

      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs z-50 pointer-events-none select-none min-w-[200px]">
          <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{label} Department</div>
          <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Actual Output:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{act}%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                Predicted Output:
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{pred}%</span>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Projected Growth:</span>
              <span className={`font-bold ${delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {delta >= 0 ? `+${delta}%` : `${delta}%`}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400">
              <span>vs Org Benchmark ({orgAverage}%):</span>
              <span className={`font-semibold ${vsOrg >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {vsOrg >= 0 ? `+${vsOrg}%` : `${vsOrg}%`}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
            <span>Click bar to drill down →</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="space-y-2.5 mb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Department Performance</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Actual vs Predicted benchmark ({chartData.length} depts)</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Compare Toggle */}
            <button
              onClick={() => setShowOrgAvg(prev => !prev)}
              className={`p-1 rounded transition-colors ${
                showOrgAvg 
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={showOrgAvg ? 'Hide organization baseline' : 'Show organization baseline'}
            >
              <GitCompare className="w-3.5 h-3.5" />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Export departments as CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {onMaximize && (
              <button 
                onClick={onMaximize}
                className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-2xs flex items-center justify-center shrink-0 ml-1"
                title="Maximize Department Performance"
                aria-label="Maximize Department Performance"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* In-Card Sorting Filters & Legend */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('top')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterMode === 'top'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setFilterMode('growth')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterMode === 'growth'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Growth
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-blue-600" /> Actual
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-purple-600" /> Predicted
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64 w-full relative">
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No department data available</p>
            <p className="text-[10px] text-slate-400">Upload a dataset or clear active filters</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }} 
              barGap={3}
              onClick={(state) => {
                if (state && state.activeLabel && onSelectDepartment) {
                  onSelectDepartment(String(state.activeLabel));
                }
              }}
              className={onSelectDepartment ? 'cursor-pointer' : ''}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis 
                dataKey="department" 
                tickLine={false} 
                axisLine={{ stroke: '#E2E8F0' }} 
                tick={{ fontSize: 10, fill: '#64748B' }} 
              />
              <YAxis 
                domain={[0, 105]} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              {showOrgAvg && (
                <ReferenceLine 
                  y={orgAverage} 
                  stroke="#10B981" 
                  strokeDasharray="4 4" 
                  label={{ value: `Org Avg (${orgAverage}%)`, position: 'insideTopRight', fill: '#10B981', fontSize: 10 }}
                />
              )}
              <Bar dataKey="actual" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="actual" position="top" fill="#1E293B" fontSize={10} fontWeight="bold" />
              </Bar>
              <Bar dataKey="predicted" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="predicted" position="top" fill="#6B21A8" fontSize={10} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span>Organization benchmark: {orgAverage}%</span>
        <span>Target SLA: ≥ 80%</span>
      </div>
    </div>
  );
};
