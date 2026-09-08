import React from 'react';
import { ShieldCheck, HeartPulse, Activity, Users, Clock, AlertTriangle, Maximize2 } from 'lucide-react';
import { WorkforceHealthData } from '../../types';

interface WorkforceHealthGaugeProps {
  data?: WorkforceHealthData;
  onMaximize?: () => void;
}

export const WorkforceHealthGauge: React.FC<WorkforceHealthGaugeProps> = ({ data, onMaximize }) => {
  const score = data?.score ?? 82;
  const status = data?.status ?? 'Healthy';
  const breakdown = data?.breakdown ?? {
    productivity: 78,
    engagement: 84,
    attendance: 91,
    workload_balance: 76,
    risk_level_pct: 18,
    risk_level_label: 'Low'
  };

  // Semi-circle gauge calculation (radius 80, stroke 14)
  const radius = 75;
  const circumference = Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const getStatusColor = (st: string) => {
    switch (st.toLowerCase()) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'healthy': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'watch': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getGaugeStroke = (sc: number) => {
    if (sc >= 80) return '#10B981'; // emerald
    if (sc >= 65) return '#3B82F6'; // blue
    if (sc >= 50) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">Workforce Health Score</h3>
            <p className="text-[11px] text-slate-400">Holistic vitality & operational balance</p>
          </div>
        </div>
        {onMaximize && (
          <button 
            onClick={onMaximize}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Maximize card"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Circular Gauge Meter */}
      <div className="flex flex-col items-center justify-center my-2 relative">
        <div className="relative w-48 h-26 flex items-end justify-center overflow-hidden">
          <svg className="w-48 h-48 -rotate-90 transform origin-center" viewBox="0 0 190 190">
            {/* Background Arc */}
            <circle
              cx="95"
              cy="95"
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
            {/* Value Arc */}
            <circle
              cx="95"
              cy="95"
              r={radius}
              fill="none"
              stroke={getGaugeStroke(score)}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Score Readout */}
          <div className="absolute bottom-1 flex flex-col items-center text-center">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {score}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1 ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        </div>

        {/* 0 and 100 Scale labels */}
        <div className="w-48 flex justify-between px-2 text-[10px] font-semibold text-slate-400 -mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="space-y-2 pt-2 border-t border-slate-100 mt-2">
        {/* Productivity */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Productivity</span>
          </span>
          <span className="font-bold text-slate-800">{breakdown.productivity}%</span>
        </div>

        {/* Engagement */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span>Engagement</span>
          </span>
          <span className="font-bold text-slate-800">{breakdown.engagement}%</span>
        </div>

        {/* Attendance */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            <span>Attendance</span>
          </span>
          <span className="font-bold text-slate-800">{breakdown.attendance}%</span>
        </div>

        {/* Workload Balance */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <span>Workload Balance</span>
          </span>
          <span className="font-bold text-slate-800">{breakdown.workload_balance}%</span>
        </div>

        {/* Risk Level */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>Risk Level</span>
          </span>
          <span className="font-bold text-slate-800">
            {breakdown.risk_level_pct}% ({breakdown.risk_level_label})
          </span>
        </div>
      </div>
    </div>
  );
};
