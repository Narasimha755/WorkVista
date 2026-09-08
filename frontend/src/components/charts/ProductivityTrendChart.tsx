import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';
import { TrendingUp, BarChart3, Maximize2, Download, Info } from 'lucide-react';
import { ActualVsPredictedSeries } from '../../types';

interface ProductivityTrendChartProps {
  data?: ActualVsPredictedSeries[];
  hasTemporalData?: boolean;
  temporalMessage?: string;
  onMaximize?: () => void;
  cohortGrouping?: 'department' | 'experience' | 'workload' | 'attendance';
  onCohortChange?: (cohort: 'department' | 'experience' | 'workload' | 'attendance') => void;
}

export const ProductivityTrendChart: React.FC<ProductivityTrendChartProps> = ({
  data = [],
  hasTemporalData = false,
  temporalMessage,
  onMaximize,
  cohortGrouping = 'department',
  onCohortChange
}) => {
  const [seriesVisibility, setSeriesVisibility] = useState<'all' | 'actual' | 'predicted'>('all');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [showNotice, setShowNotice] = useState(false);

  // If there's real temporal data (e.g. timestamps in dataset), use area chart as default
  const isTemporal = hasTemporalData;

  const chartData = data && data.length > 0 ? data : [
    { label: 'Engineering', actual: 81.2, predicted: 84.5, count: 120, delta: 3.3 },
    { label: 'Finance', actual: 76.5, predicted: 79.1, count: 65, delta: 2.6 },
    { label: 'HR', actual: 78.0, predicted: 80.2, count: 45, delta: 2.2 },
    { label: 'Marketing', actual: 75.8, predicted: 78.4, count: 80, delta: 2.6 },
    { label: 'Operations', actual: 79.4, predicted: 82.0, count: 110, delta: 2.6 },
    { label: 'Sales', actual: 77.1, predicted: 81.0, count: 100, delta: 3.9 }
  ];

  const handleExportCsv = () => {
    const headers = 'Cohort,Actual Output (%),Predicted Output (%),Forecast Delta (%),Employee Count\n';
    const rows = chartData.map(d => 
      `"${d.label}",${d.actual},${d.predicted},${d.delta ?? (d.predicted - d.actual).toFixed(1)},${d.count ?? 'N/A'}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `workvista_actual_vs_predicted_${cohortGrouping}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const act = payload.find((p: any) => p.dataKey === 'actual')?.value;
      const pred = payload.find((p: any) => p.dataKey === 'predicted')?.value;
      const delta = pred && act ? Number((pred - act).toFixed(1)) : 0;
      const itemData = chartData.find(d => d.label === label);

      return (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200 text-xs z-50 pointer-events-none select-none min-w-[170px]">
          <div className="font-bold text-slate-800 mb-1.5 flex items-center justify-between">
            <span>{label}</span>
            {itemData?.count !== undefined && (
              <span className="text-[10px] text-slate-400 font-normal">
                {itemData.count} staff
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {(seriesVisibility === 'all' || seriesVisibility === 'actual') && act !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Actual Output:
                </span>
                <span className="font-bold text-slate-900">{act}%</span>
              </div>
            )}
            {(seriesVisibility === 'all' || seriesVisibility === 'predicted') && pred !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  AI Forecast:
                </span>
                <span className="font-bold text-purple-700">{pred}%</span>
              </div>
            )}
            {seriesVisibility === 'all' && act !== undefined && pred !== undefined && (
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Forecast Delta:</span>
                <span className={`font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {delta >= 0 ? `+${delta}%` : `${delta}%`}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Controls */}
      <div className="space-y-3 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {isTemporal ? 'Productivity Trend: Actual vs Predicted' : 'Current vs Predicted Productivity'}
              </h3>
              {!isTemporal && (
                <button
                  onClick={() => setShowNotice(!showNotice)}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                  title="Dataset temporal note"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Actual Baseline</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>AI Forecast</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] text-slate-400">
                {isTemporal ? 'Longitudinal' : `By ${cohortGrouping.charAt(0).toUpperCase() + cohortGrouping.slice(1)}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
            {/* Series Visibility Toggles */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => setSeriesVisibility('all')}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  seriesVisibility === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSeriesVisibility('actual')}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  seriesVisibility === 'actual'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-blue-700'
                }`}
              >
                Actual
              </button>
              <button
                onClick={() => setSeriesVisibility('predicted')}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  seriesVisibility === 'predicted'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-purple-700'
                }`}
              >
                Predicted
              </button>
            </div>

            {/* Chart Type Toggle (Bar vs Area) */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => setChartType('bar')}
                className={`p-1 rounded-md transition-all ${
                  chartType === 'bar'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Bar Comparison"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-1 rounded-md transition-all ${
                  chartType === 'area'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Continuous Area"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all shadow-2xs flex items-center justify-center shrink-0"
              title="Export Cohort Data to CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Maximize */}
            {onMaximize && (
              <button
                onClick={onMaximize}
                className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all shadow-2xs flex items-center justify-center shrink-0"
                title="Maximize Chart"
                aria-label="Maximize Chart"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cohort Selector (when non-temporal) */}
        {!isTemporal && onCohortChange && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Cohort:
            </span>
            {(['department', 'experience', 'workload', 'attendance'] as const).map(c => (
              <button
                key={c}
                onClick={() => onCohortChange(c)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                  cohortGrouping === c
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Honest Notice Banner */}
        {(!isTemporal && (showNotice || temporalMessage)) && (
          <div className="bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-[11px] flex items-start gap-2 animate-fadeIn">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Honest Data Architecture:</span>{' '}
              {temporalMessage || 'Historical observations are not available in this dataset. Displaying cross-sectional workforce metrics across cohorts.'}
            </div>
            <button 
              onClick={() => setShowNotice(false)} 
              className="text-amber-500 hover:text-amber-800 text-[11px] font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis 
                dataKey="label" 
                tickLine={false} 
                axisLine={{ stroke: '#E2E8F0' }} 
                tick={{ fontSize: 10, fill: '#64748B' }} 
              />
              <YAxis 
                domain={[50, 100]} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: '#F8FAFC' }}
                wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }}
              />
              {(seriesVisibility === 'all' || seriesVisibility === 'actual') && (
                <Bar 
                  dataKey="actual" 
                  name="Actual Output" 
                  fill="#2563EB" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                  isAnimationActive={false}
                />
              )}
              {(seriesVisibility === 'all' || seriesVisibility === 'predicted') && (
                <Bar 
                  dataKey="predicted" 
                  name="AI Forecast" 
                  fill="#7C3AED" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                  isAnimationActive={false}
                />
              )}
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendActualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="trendPredGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis 
                dataKey="label" 
                tickLine={false} 
                axisLine={{ stroke: '#E2E8F0' }} 
                tick={{ fontSize: 10, fill: '#64748B' }} 
              />
              <YAxis 
                domain={[50, 100]} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }}
              />
              {(seriesVisibility === 'all' || seriesVisibility === 'actual') && (
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#2563EB" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#trendActualGrad)" 
                  dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5.5, fill: '#1D4ED8', stroke: '#FFFFFF', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              )}
              {(seriesVisibility === 'all' || seriesVisibility === 'predicted') && (
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#7C3AED" 
                  strokeWidth={2.5} 
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#trendPredGrad)" 
                  dot={{ r: 3.5, fill: '#7C3AED', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5.5, fill: '#6D28D9', stroke: '#FFFFFF', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Details */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
        <span>
          {isTemporal ? 'Dual longitudinal curve' : `Cross-sectional ${cohortGrouping} cohort calibration`}
        </span>
        <span>Model Forecast Horizon: Next Cycle</span>
      </div>
    </div>
  );
};
