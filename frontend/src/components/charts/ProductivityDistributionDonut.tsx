import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Maximize2 } from 'lucide-react';
import { ProductivityDistributionItem } from '../../types';

interface ProductivityDistributionDonutProps {
  data?: ProductivityDistributionItem[];
  total?: number;
  onMaximize?: () => void;
}

export const ProductivityDistributionDonut: React.FC<ProductivityDistributionDonutProps> = ({ 
  data, 
  total = 256,
  onMaximize
}) => {
  const defaultData: ProductivityDistributionItem[] = [
    { name: 'High (>= 80%)', count: 82, percentage: 32, color: '#10B981' },
    { name: 'Medium (50-79%)', count: 136, percentage: 53, color: '#3B82F6' },
    { name: 'Low (< 50%)', count: 38, percentage: 15, color: '#EF4444' }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;
  const totalCount = total || chartData.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Productivity Distribution (Predicted)
          </h3>
        </div>
        {onMaximize && (
          <button
            onClick={onMaximize}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Maximize View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Area: Donut Chart with Center Text & Right Legend */}
      <div className="flex items-center justify-between flex-1 gap-4">
        {/* Donut with Center Text */}
        <div className="relative w-44 h-44 shrink-0 mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as ProductivityDistributionItem;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-800">
                        <p className="font-semibold text-slate-300">{item.name}</p>
                        <p className="font-bold text-white mt-1">
                          {item.count} Employees ({item.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {totalCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Employees
            </span>
          </div>
        </div>

        {/* Right Legend Items */}
        <div className="flex-1 space-y-3 pl-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: item.color }} 
                />
                <div>
                  <div className="font-semibold text-slate-800">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {item.count} employees
                  </div>
                </div>
              </div>
              <span className="font-bold text-slate-700 text-sm">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
        <span>Forecast Horizon: Next 30 Days</span>
        <span className="text-blue-600 font-medium cursor-pointer hover:underline">Customize Thresholds</span>
      </div>
    </div>
  );
};
