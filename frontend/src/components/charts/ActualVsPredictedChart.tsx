import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ActualVsPredictedSeries } from '../../types';

interface ActualVsPredictedChartProps {
  data?: ActualVsPredictedSeries[];
  hasTemporalData?: boolean;
}

export const ActualVsPredictedChart: React.FC<ActualVsPredictedChartProps> = ({ data, hasTemporalData = false }) => {
  const chartData = data && data.length > 0 ? data : [];

  const isCrossSectional = !hasTemporalData;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {isCrossSectional ? 'Actual vs Predicted Output by Cohort' : 'Longitudinal Actual vs Predicted Output'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isCrossSectional 
              ? 'Departmental comparison across active workforce records' 
              : 'Sequential historical trend and model forecast'}
          </p>
        </div>

        {/* Informational Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600">
          <span>{isCrossSectional ? 'Cross-Sectional Snapshot' : 'Longitudinal Series'}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[220px]">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <p>No evaluation data points available.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
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
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800 space-y-1.5">
                        <p className="font-semibold text-slate-300">{label}</p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-blue-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Current Actual:
                          </span>
                          <span className="font-bold">{payload[0]?.value}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-purple-400">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            Predicted:
                          </span>
                          <span className="font-bold">{payload[1]?.value}%</span>
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
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="text-slate-600 font-medium">Actual Baseline Output</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <span className="text-slate-600 font-medium">Model Forecasted Output</span>
        </div>
      </div>
    </div>
  );
};
