import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, Maximize2 } from 'lucide-react';
import { ProductivityDistributionItem } from '../../types';

interface ProductivityDistributionDonutProps {
  data?: ProductivityDistributionItem[];
  total?: number;
  totalEmployees?: number;
  onMaximize?: () => void;
}

export const ProductivityDistributionDonut: React.FC<ProductivityDistributionDonutProps> = ({ 
  data, 
  total,
  totalEmployees,
  onMaximize
}) => {
  const [metricView, setMetricView] = useState<'count' | 'percentage'>('count');

  const defaultData: ProductivityDistributionItem[] = [
    { name: 'High (≥ 80%)', count: 235, percentage: 45.2, color: '#10B981' },
    { name: 'Medium (50-79%)', count: 285, percentage: 54.8, color: '#3B82F6' },
    { name: 'Low (< 50%)', count: 0, percentage: 0.0, color: '#EF4444' }
  ];

  const chartData = (data && data.length > 0 ? data : defaultData).map(item => {
    // Normalize names for clean compact display
    let shortName = 'Medium';
    let range = '50-79%';
    if (item.name.toLowerCase().includes('high') || item.color === '#10B981') {
      shortName = 'High';
      range = '≥ 80%';
    } else if (item.name.toLowerCase().includes('low') || item.color === '#EF4444') {
      shortName = 'Low';
      range = '< 50%';
    }
    return {
      ...item,
      shortName,
      range
    };
  });

  const totalCount = totalEmployees || total || chartData.reduce((acc, item) => acc + item.count, 0) || 520;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      {/* Header with in-card filter */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              Productivity Distribution
            </h3>
            <p className="text-[11px] text-slate-400">Predicted performance tiers</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setMetricView('count')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                metricView === 'count'
                  ? 'bg-purple-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => setMetricView('percentage')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                metricView === 'percentage'
                  ? 'bg-purple-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Share %
            </button>
          </div>
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-all"
              title="Maximize Productivity Distribution"
              aria-label="Maximize Productivity Distribution"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Donut Chart Centered */}
      <div className="relative w-36 h-36 mx-auto my-1 flex items-center justify-center shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="shortName"
              innerRadius={45}
              outerRadius={63}
              paddingAngle={4}
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#FFFFFF" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-800 z-50">
                      <p className="font-bold text-white">{item.shortName} Tier ({item.range})</p>
                      <p className="text-slate-300 mt-0.5">
                        {item.count} Staff ({item.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Absolute Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
            {totalCount}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
            Employees
          </span>
        </div>
      </div>

      {/* 3-Tier Grid Tiles (Immune to Horizontal Overflow) */}
      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100">
        {chartData.map((tier) => {
          const isHigh = tier.shortName === 'High';
          const isMed = tier.shortName === 'Medium';
          const bgClass = isHigh ? 'bg-emerald-50/60 border-emerald-100' : isMed ? 'bg-blue-50/60 border-blue-100' : 'bg-slate-50 border-slate-200/70';
          const textClass = isHigh ? 'text-emerald-700' : isMed ? 'text-blue-700' : 'text-slate-600';

          return (
            <div 
              key={tier.shortName} 
              className={`rounded-xl p-2 text-center border ${bgClass} transition-all`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                <span className="text-[10px] font-bold text-slate-700">{tier.shortName}</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 leading-tight">
                {metricView === 'count' ? `${tier.count}` : `${tier.percentage}%`}
              </div>
              <div className={`text-[10px] font-semibold ${textClass} mt-0.5`}>
                {metricView === 'count' ? `${tier.percentage}%` : `${tier.count} staff`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span>Horizon: <span className="font-semibold text-slate-600">30-Day Projection</span></span>
        <span className="text-purple-600 font-semibold">Distribution Model</span>
      </div>
    </div>
  );
};
