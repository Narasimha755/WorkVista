import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Maximize2 } from 'lucide-react';
import { DepartmentProductivityItem } from '../../types';

interface DepartmentProductivityChartProps {
  data?: DepartmentProductivityItem[];
  onMaximize?: () => void;
}

export const DepartmentProductivityChart: React.FC<DepartmentProductivityChartProps> = ({ data, onMaximize }) => {
  const defaultData: DepartmentProductivityItem[] = [
    { department: 'Engineering', actual: 82, predicted: 88 },
    { department: 'Marketing', actual: 68, predicted: 74 },
    { department: 'Finance', actual: 71, predicted: 76 },
    { department: 'HR', actual: 65, predicted: 72 },
    { department: 'Operations', actual: 62, predicted: 68 },
    { department: 'Sales', actual: 78, predicted: 84 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Department-wise Productivity
          </h3>
        </div>

        {/* Legend & Maximize */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span className="text-slate-600 font-medium">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-purple-500" />
            <span className="text-slate-600 font-medium">Predicted</span>
          </div>
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors ml-1"
              title="Maximize View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grouped Bar Chart */}
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="department" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 11 }} 
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
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800 space-y-1">
                      <p className="font-semibold text-slate-300">{label}</p>
                      <div className="flex items-center justify-between gap-3 text-blue-400">
                        <span>Actual:</span>
                        <span className="font-bold">{payload[0]?.value}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-purple-400">
                        <span>Predicted:</span>
                        <span className="font-bold">{payload[1]?.value}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="actual" 
              name="Actual" 
              fill="#3B82F6" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={22}
            />
            <Bar 
              dataKey="predicted" 
              name="Predicted" 
              fill="#8B5CF6" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
        <span>Dynamic cohort segmentation from uploaded records</span>
        <span className="text-slate-500 font-medium">Y-axis: Productivity Score (%)</span>
      </div>
    </div>
  );
};
