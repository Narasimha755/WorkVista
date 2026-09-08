import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import { Building2, Maximize2 } from 'lucide-react';
import { DepartmentProductivityItem } from '../../types';

interface DepartmentPerformanceBarsProps {
  data?: DepartmentProductivityItem[];
  onMaximize?: () => void;
}

export const DepartmentPerformanceBars: React.FC<DepartmentPerformanceBarsProps> = ({
  data = [],
  onMaximize
}) => {
  // Default values matching mockup if not loaded
  const defaultDepts = [
    { department: 'Engineering', actual: 88, predicted: 92 },
    { department: 'Marketing', actual: 76, predicted: 81 },
    { department: 'Finance', actual: 70, predicted: 74 },
    { department: 'HR', actual: 68, predicted: 72 },
    { department: 'Operations', actual: 65, predicted: 69 },
    { department: 'Sales', actual: 72, predicted: 78 }
  ];

  const chartData = data && data.length > 0 ? data : defaultDepts;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const act = payload.find((p: any) => p.dataKey === 'actual')?.value;
      const pred = payload.find((p: any) => p.dataKey === 'predicted')?.value;
      const delta = pred && act ? Number((pred - act).toFixed(1)) : 0;

      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-200 text-xs z-50">
          <div className="font-bold text-slate-800 mb-1.5">{label} Department</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="text-slate-600">Actual Output:</span>
              <span className="font-bold text-slate-900">{act}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <span className="text-slate-600">Predicted Output:</span>
              <span className="font-bold text-purple-700">{pred}%</span>
            </div>
            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Growth Forecast:</span>
              <span className={`font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {delta >= 0 ? `+${delta}%` : `${delta}%`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Performance</h3>
            <p className="text-[11px] text-slate-400">Actual vs Predicted productivity benchmark</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
              <span>Actual</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
              <span>Predicted</span>
            </span>
          </div>

          {onMaximize && (
            <button 
              onClick={onMaximize}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Maximize chart"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bar Chart with labels on bars */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis 
              dataKey="department" 
              tickLine={false} 
              axisLine={{ stroke: '#E2E8F0' }} 
              tick={{ fontSize: 10, fill: '#64748B' }} 
            />
            <YAxis 
              domain={[0, 100]} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: '#64748B' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="actual" fill="#3B82F6" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="actual" position="top" fill="#1E293B" fontSize={10} fontWeight="bold" />
            </Bar>
            <Bar dataKey="predicted" fill="#A855F7" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="predicted" position="top" fill="#6B21A8" fontSize={10} fontWeight="bold" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
        <span>Cross-departmental comparative performance index</span>
        <span>Target benchmark: 80%</span>
      </div>
    </div>
  );
};
