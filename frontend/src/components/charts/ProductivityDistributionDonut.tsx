import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Maximize2 } from 'lucide-react';
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
  const defaultData: ProductivityDistributionItem[] = [
    { name: 'High (>= 80%)', count: 82, percentage: 32, color: '#10B981' },
    { name: 'Medium (50-79%)', count: 136, percentage: 53, color: '#3B82F6' },
    { name: 'Low (< 50%)', count: 38, percentage: 15, color: '#EF4444' }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;
  const totalCount = totalEmployees || total || chartData.reduce((acc, item) => acc + item.count, 0) || 520;

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
                innerRadius={50}
                outerRadius={70}
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
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
              {totalCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-0.5">
              Employees
            </span>
          </div>
        </div>

        {/* Right Legend Items */}
        <div className="flex-1 space-y-2.5 pl-1">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs py-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: item.color }} 
                />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-[11px] truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {item.count} staff
                  </div>
                </div>
              </div>
              <span className="font-bold text-slate-800 text-xs shrink-0 ml-2">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Horizon: <span className="font-semibold text-slate-600">Next 30 Days</span></span>
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Customize</span>
      </div>
    </div>
  );
};
