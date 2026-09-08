import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Maximize2 as MaximizeIcon, BarChart2, TrendingUp, Layers } from 'lucide-react';
import { ActualVsPredictedSeries } from '../../types';

interface ExtendedActualVsPredictedSeries extends ActualVsPredictedSeries {
  count?: number;
  delta?: number;
}

interface ActualVsPredictedChartProps {
  data?: ExtendedActualVsPredictedSeries[];
  hasTemporalData?: boolean;
  cohortGrouping?: 'department' | 'experience' | 'workload' | 'attendance';
  onCohortChange?: (cohort: 'department' | 'experience' | 'workload' | 'attendance') => void;
  onMaximize?: () => void;
}

export const ActualVsPredictedChart: React.FC<ActualVsPredictedChartProps> = ({ 
  data, 
  hasTemporalData = false,
  cohortGrouping = 'department',
  onCohortChange,
  onMaximize 
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const chartData = data && data.length > 0 ? data : [];
  const isCrossSectional = !hasTemporalData;

  const getCohortLabel = () => {
    switch (cohortGrouping) {
      case 'experience': return 'Experience Cohorts';
      case 'workload': return 'Workload Cohorts';
      case 'attendance': return 'Attendance Cohorts';
      default: return 'Department Cohorts';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-[360px] relative transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Actual vs Predicted Output ({getCohortLabel()})
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isCrossSectional 
              ? 'Model baseline vs forecasted productivity across active segments' 
              : 'Sequential historical trend and model forecast'}
          </p>
        </div>

        {/* Toolbar: Cohort Selector, View Type, and Maximize */}
        <div className="flex items-center gap-1.5">
          {/* Cohort Selector */}
          {onCohortChange && (
            <select
              value={cohortGrouping}
              onChange={(e) => onCohortChange(e.target.value as any)}
              className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title="Select Cohort Grouping"
            >
              <option value="department">By Department</option>
              <option value="experience">By Experience</option>
              <option value="workload">By Workload</option>
              <option value="attendance">By Attendance</option>
            </select>
          )}

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setChartType('area')}
              className={`p-1 rounded text-xs transition-colors ${chartType === 'area' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Area Spline Chart"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1 rounded text-xs transition-colors ${chartType === 'bar' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grouped Bar Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1 rounded text-xs transition-colors ${chartType === 'line' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Comparison Line Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Maximize Button */}
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors ml-0.5"
              title="Maximize View"
            >
              <MaximizeIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[220px]">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <p>No evaluation data points available for this cohort.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const cur = payload[0]?.value as number;
                      const pred = payload[1]?.value as number;
                      const delta = Number((pred - cur).toFixed(1));
                      const count = (payload[0]?.payload as any)?.count;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800 space-y-1.5">
                          <p className="font-semibold text-slate-300 flex items-center justify-between gap-4">
                            <span>{label}</span>
                            {count !== undefined && <span className="text-[10px] text-slate-400">({count} employees)</span>}
                          </p>
                          <div className="flex items-center justify-between gap-4 text-blue-400">
                            <span>Actual Output:</span>
                            <span className="font-bold text-white">{cur}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-purple-400">
                            <span>Predicted Output:</span>
                            <span className="font-bold text-white">{pred}%</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 flex items-center justify-between gap-4 text-[11px]">
                            <span className="text-slate-400">Variance:</span>
                            <span className={delta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {delta >= 0 ? `+${delta}%` : `${delta}%`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="actual" name="Actual Baseline" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="predicted" name="Predicted Forecast" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const cur = payload[0]?.value as number;
                      const pred = payload[1]?.value as number;
                      const delta = Number((pred - cur).toFixed(1));
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800 space-y-1.5">
                          <p className="font-semibold text-slate-300">{label}</p>
                          <div className="flex items-center justify-between gap-4 text-blue-400">
                            <span>Actual Output:</span>
                            <span className="font-bold text-white">{cur}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-purple-400">
                            <span>Predicted Output:</span>
                            <span className="font-bold text-white">{pred}%</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 flex items-center justify-between gap-4 text-[11px]">
                            <span className="text-slate-400">Variance:</span>
                            <span className={delta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {delta >= 0 ? `+${delta}%` : `${delta}%`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="actual" name="Actual Baseline" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="predicted" name="Predicted Forecast" stroke="#8B5CF6" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4, fill: '#8B5CF6' }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const cur = payload[0]?.value as number;
                      const pred = payload[1]?.value as number;
                      const delta = Number((pred - cur).toFixed(1));
                      const count = (payload[0]?.payload as any)?.count;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800 space-y-1.5">
                          <p className="font-semibold text-slate-300 flex items-center justify-between gap-4">
                            <span>{label}</span>
                            {count !== undefined && <span className="text-[10px] text-slate-400">({count} employees)</span>}
                          </p>
                          <div className="flex items-center justify-between gap-4 text-blue-400">
                            <span>Actual Output:</span>
                            <span className="font-bold text-white">{cur}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-purple-400">
                            <span>Predicted Output:</span>
                            <span className="font-bold text-white">{pred}%</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 flex items-center justify-between gap-4 text-[11px]">
                            <span className="text-slate-400">Variance:</span>
                            <span className={delta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {delta >= 0 ? `+${delta}%` : `${delta}%`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Current Actual Output"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#actualGrad)"
                  dot={{ r: 3.5, fill: '#3B82F6', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5, fill: '#3B82F6' }}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted Output"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#predictedGrad)"
                  dot={{ r: 3.5, fill: '#8B5CF6', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5, fill: '#8B5CF6' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-6 pt-2.5 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="text-slate-600 font-medium">Actual Baseline</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <span className="text-slate-600 font-medium">Model Forecast</span>
        </div>
      </div>
    </div>
  );
};
