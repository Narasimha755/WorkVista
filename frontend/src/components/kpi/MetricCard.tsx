import React from 'react';
import { 
  Users, 
  BarChart2, 
  TrendingUp, 
  AlertCircle, 
  TrendingDown, 
  ArrowUp, 
  ArrowDown, 
  Maximize2 
} from 'lucide-react';
import { KPICardData } from '../../types';

export type MetricType = 'total' | 'avg' | 'high' | 'risk' | 'improvement' | 'decline';

interface MetricCardProps {
  type: MetricType;
  data?: KPICardData;
  onClick?: () => void;
  onMaximize?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ type, data, onClick, onMaximize }) => {
  const configs = {
    total: {
      title: 'Total Employees',
      icon: Users,
      iconBg: 'bg-blue-100 text-blue-600',
      sparkColor: '#3B82F6',
      defaultSpark: [480, 492, 505, 512, 520]
    },
    avg: {
      title: 'Avg. Productivity',
      icon: BarChart2,
      iconBg: 'bg-emerald-100 text-emerald-600',
      sparkColor: '#10B981',
      defaultSpark: [76, 76.8, 77.5, 78.2, 78.9]
    },
    high: {
      title: 'High Performers',
      icon: TrendingUp,
      iconBg: 'bg-purple-100 text-purple-600',
      sparkColor: '#8B5CF6',
      defaultSpark: [195, 204, 212, 218, 220]
    },
    risk: {
      title: 'At Risk',
      icon: AlertCircle,
      iconBg: 'bg-rose-100 text-rose-600',
      sparkColor: '#EF4444',
      defaultSpark: [38, 41, 42, 43, 44]
    },
    improvement: {
      title: 'Predicted Improvement',
      icon: TrendingUp,
      iconBg: 'bg-amber-100 text-amber-600',
      sparkColor: '#F59E0B',
      defaultSpark: [95, 102, 108, 110, 112]
    },
    decline: {
      title: 'Predicted Decline',
      icon: TrendingDown,
      iconBg: 'bg-teal-100 text-teal-600',
      sparkColor: '#0D9488',
      defaultSpark: [45, 42, 40, 38, 36]
    }
  };

  const config = configs[type] || configs.total;
  const Icon = config.icon;

  const displayVal = data?.display_value ?? (type === 'avg' ? '78.9%' : type === 'total' ? '520' : '0');
  const changePct = data?.change_pct ?? 0;
  const trend = data?.trend ?? 'up';
  const subtitle = data?.subtitle ?? (trend === 'up' ? 'vs last month' : 'vs baseline');

  const sparkValues = data?.sparkline && data.sparkline.length > 2 ? data.sparkline : config.defaultSpark;
  const minVal = Math.min(...sparkValues);
  const maxVal = Math.max(...sparkValues) || 1;
  const range = maxVal - minVal || 1;
  const sparkPoints = sparkValues.map((v, i) => {
    const x = (i / (sparkValues.length - 1)) * 50;
    const y = 20 - ((v - minVal) / range) * 16;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 relative flex flex-col justify-between cursor-pointer group"
    >
      {/* Top row: Icon + Title + Maximize */}
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {onMaximize && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded transition-opacity"
            title="Maximize card"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Metric Title & Value */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 mb-0.5">
          {config.title}
        </p>
        <div className="flex items-baseline justify-between gap-1">
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
            {displayVal}
          </h3>
          {/* Mini Sparkline SVG */}
          <svg className="w-12 h-6 overflow-visible shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 50 20">
            <polyline
              fill="none"
              stroke={config.sparkColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkPoints}
            />
          </svg>
        </div>
      </div>

      {/* Subtitle & Trend */}
      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
        {trend === 'up' && (
          <span className="flex items-center gap-0.5 font-bold text-emerald-600">
            <ArrowUp className="w-3 h-3" />
            <span>{changePct > 0 ? `${changePct}%` : '4.2%'}</span>
          </span>
        )}
        {trend === 'down' && (
          <span className="flex items-center gap-0.5 font-bold text-rose-600">
            <ArrowDown className="w-3 h-3" />
            <span>{changePct > 0 ? `${changePct}%` : '20.0%'}</span>
          </span>
        )}
        {trend === 'neutral' && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-0.5 shrink-0" />
        )}
        <span className="text-slate-400 truncate">
          {subtitle}
        </span>
      </div>
    </div>
  );
};
