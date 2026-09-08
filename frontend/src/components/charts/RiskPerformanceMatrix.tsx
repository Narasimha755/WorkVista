import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ShieldAlert, Maximize2 } from 'lucide-react';
import { RiskMatrixPoint } from '../../types';

interface RiskPerformanceMatrixProps {
  data?: RiskMatrixPoint[];
  onViewEmployee?: (id: string) => void;
  onMaximize?: () => void;
}

export const RiskPerformanceMatrix: React.FC<RiskPerformanceMatrixProps> = ({
  data = [],
  onViewEmployee,
  onMaximize
}) => {
  const [filterMode, setFilterMode] = React.useState<'all' | 'high_risk' | 'safe_stars'>('all');

  // If no data supplied, generate a realistic distributed sample from workforce
  const points = data.length > 0 ? data : [
    { id: 1, employee_id: 'EMP-1001', employee_name: 'Rahul Sharma', department: 'Engineering', productivity: 88, risk_score: 12, risk_level: 'Low', predicted: 92 },
    { id: 2, employee_id: 'EMP-1002', employee_name: 'Priya Verma', department: 'Marketing', productivity: 76, risk_score: 28, risk_level: 'Moderate', predicted: 80 },
    { id: 3, employee_id: 'EMP-1003', employee_name: 'Arjun Patel', department: 'Finance', productivity: 62, risk_score: 72, risk_level: 'High', predicted: 58 },
    { id: 4, employee_id: 'EMP-1004', employee_name: 'Sneha Reddy', department: 'HR', productivity: 81, risk_score: 18, risk_level: 'Low', predicted: 85 },
    { id: 5, employee_id: 'EMP-1005', employee_name: 'Vikram Singh', department: 'Operations', productivity: 69, risk_score: 38, risk_level: 'Moderate', predicted: 72 },
    { id: 6, employee_id: 'EMP-1006', employee_name: 'Ananya Roy', department: 'Sales', productivity: 55, risk_score: 82, risk_level: 'Critical', predicted: 50 },
  ];

  const filteredPoints = React.useMemo(() => {
    if (filterMode === 'high_risk') {
      return points.filter(p => p.risk_score >= 50 || p.risk_level === 'High' || p.risk_level === 'Critical');
    }
    if (filterMode === 'safe_stars') {
      return points.filter(p => p.productivity >= 75 && p.risk_score < 40);
    }
    return points;
  }, [points, filterMode]);

  const getColor = (level: string, riskScore: number) => {
    if (level === 'Critical' || riskScore >= 75) return '#991B1B'; // dark crimson
    if (level === 'High' || riskScore >= 50) return '#EF4444'; // red
    if (level === 'Moderate' || riskScore >= 30) return '#F59E0B'; // amber/orange
    return '#10B981'; // emerald green
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt: RiskMatrixPoint = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-200 text-xs z-50">
          <div className="font-bold text-slate-900">{pt.employee_name}</div>
          <div className="text-[11px] text-slate-500 mb-1">{pt.department} · {pt.role || 'Staff'}</div>
          <div className="space-y-0.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Productivity:</span>
              <span className="font-bold text-blue-600">{pt.productivity}%</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Risk Score:</span>
              <span className="font-bold text-rose-600">{pt.risk_score}% ({pt.risk_level})</span>
            </div>
            {pt.predicted !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Predicted:</span>
                <span className="font-semibold text-purple-600">{pt.predicted}%</span>
              </div>
            )}
          </div>
          <div className="mt-1.5 text-[10px] text-blue-600 font-semibold cursor-pointer">
            Click dot to open Employee 360 →
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">Risk vs Performance Matrix</h3>
            <p className="text-[11px] text-slate-400">Employee positioning by burnout risk & productivity</p>
          </div>
        </div>

        {/* Quadrant Filters, Legend & Maximize */}
        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold text-slate-600">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Staff ({points.length})
            </button>
            <button
              onClick={() => setFilterMode('high_risk')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterMode === 'high_risk'
                  ? 'bg-rose-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setFilterMode('safe_stars')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterMode === 'safe_stars'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Safe Stars
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-medium text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Low</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Med</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>High</span>
          </div>

          {onMaximize && (
            <button 
              onClick={onMaximize}
              className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all shadow-2xs flex items-center justify-center shrink-0"
              title="Maximize Risk vs Performance Matrix"
              aria-label="Maximize Risk vs Performance Matrix"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scatter Matrix Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis 
              type="number" 
              dataKey="productivity" 
              name="Productivity" 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#64748B' }}
              label={{ value: 'Productivity Score (%)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94A3B8' }}
            />
            <YAxis 
              type="number" 
              dataKey="risk_score" 
              name="Risk Score" 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#64748B' }}
              label={{ value: 'Risk Score (%)', angle: -90, position: 'insideLeft', offset: 20, fontSize: 11, fill: '#94A3B8' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              name="Employees" 
              data={filteredPoints} 
              onClick={(pt) => {
                if (pt && pt.employee_id && onViewEmployee) {
                  onViewEmployee(pt.employee_id);
                }
              }}
              className="cursor-pointer"
            >
              {filteredPoints.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.risk_level, entry.risk_score)} 
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  className="hover:scale-150 transition-all origin-center cursor-pointer shadow-sm"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
        <span>Lower right quadrant: High Productivity / Low Risk (Safe)</span>
        <span>Upper left quadrant: Low Productivity / High Risk (At Risk)</span>
      </div>
    </div>
  );
};
