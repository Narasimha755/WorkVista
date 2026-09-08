import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, Maximize2, Download, Info, ZoomIn, ZoomOut, RotateCcw, Calendar } from 'lucide-react';
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
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [showNotice, setShowNotice] = useState<boolean>(!hasTemporalData);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 50..100, 2 = 65..95

  const isTemporal = hasTemporalData;
  const chartData = data;

  const yDomain = useMemo(() => {
    if (zoomLevel === 2) return [65, 95];
    return [50, 100];
  }, [zoomLevel]);

  const handleTimeframeClick = (tf: 'daily' | 'weekly' | 'monthly' | 'quarterly') => {
    setSelectedTimeframe(tf);
    if (!isTemporal) {
      setShowNotice(true);
    }
  };

  const handleExportCsv = () => {
    if (!chartData.length) return;
    const headers = 'Cohort,Actual Output (%),Predicted Output (%),Forecast Delta (%),Employee Count\n';
    const rows = chartData.map(d => 
      `"${d.label}",${d.actual},${d.predicted},${d.delta ?? Number((d.predicted - d.actual).toFixed(1))},${d.count ?? 'N/A'}`
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
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs z-50 pointer-events-none select-none min-w-[180px]">
          <div className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
            <span>{label}</span>
            {itemData?.count !== undefined && (
              <span className="text-[10px] text-slate-400 font-normal">
                {itemData.count} staff
              </span>
            )}
          </div>
          <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            {(seriesVisibility === 'all' || seriesVisibility === 'actual') && act !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Actual Output:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{act}%</span>
              </div>
            )}
            {(seriesVisibility === 'all' || seriesVisibility === 'predicted') && pred !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  AI Forecast:
                </span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{pred}%</span>
              </div>
            )}
            {seriesVisibility === 'all' && act !== undefined && pred !== undefined && (
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Forecast Delta:</span>
                <span className={`font-bold ${delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
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
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Controls */}
      <div className="space-y-3 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
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

            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Actual Baseline</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>AI Forecast</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-[10px] text-slate-400">
                {isTemporal ? 'Longitudinal' : `By ${cohortGrouping.charAt(0).toUpperCase() + cohortGrouping.slice(1)}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
            {/* Timeframe selector */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
              {(['daily', 'weekly', 'monthly', 'quarterly'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeClick(tf)}
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {tf.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>

            {/* Series Visibility Toggles */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setSeriesVisibility('all')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                  seriesVisibility === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSeriesVisibility('actual')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                  seriesVisibility === 'actual'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-blue-700'
                }`}
              >
                Actual
              </button>
              <button
                onClick={() => setSeriesVisibility('predicted')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                  seriesVisibility === 'predicted'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-purple-700'
                }`}
              >
                Predicted
              </button>
            </div>

            {/* Chart Type Toggle (Bar vs Area) */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setChartType('bar')}
                className={`p-1 rounded-md transition-all ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Bar Comparison"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-1 rounded-md transition-all ${
                  chartType === 'area'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Continuous Area"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Toggle */}
            <button
              onClick={() => setZoomLevel(prev => (prev === 1 ? 2 : 1))}
              className={`p-1.5 rounded-lg border transition-all ${
                zoomLevel === 2
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 text-blue-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
              title={zoomLevel === 2 ? 'Reset Zoom' : 'Zoom into variance'}
            >
              {zoomLevel === 2 ? <RotateCcw className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-2xs flex items-center justify-center shrink-0"
              title="Export Cohort Data to CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Maximize */}
            {onMaximize && (
              <button
                onClick={onMaximize}
                className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-2xs flex items-center justify-center shrink-0"
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
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Cohort:
            </span>
            {(['department', 'experience', 'workload', 'attendance'] as const).map(c => (
              <button
                key={c}
                onClick={() => onCohortChange(c)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                  cohortGrouping === c
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Honest Notice Banner */}
        {(!isTemporal && showNotice) && (
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl p-2.5 text-[11px] flex items-start gap-2 animate-fadeIn">
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
      <div className="h-60 w-full relative">
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No cohort data available</p>
            <p className="text-[10px] text-slate-400">Load demo records or adjust the active filter selection</p>
          </div>
        ) : (
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
                  domain={yDomain} 
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
                  domain={yDomain} 
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
        )}
      </div>

      {/* Footer Details */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span>
          {isTemporal ? 'Dual longitudinal curve' : `Cross-sectional ${cohortGrouping} cohort calibration`}
        </span>
        <span>Model Forecast Horizon: Next Cycle</span>
      </div>
    </div>
  );
};
