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

  const hasHistoricalSpark = Boolean(data?.sparkline && data.sparkline.length >= 3);
  const sparkValues = hasHistoricalSpark ? data!.sparkline : [];
  let sparkPoints = '';
  if (hasHistoricalSpark) {
    const minVal = Math.min(...sparkValues);
    const maxVal = Math.max(...sparkValues) || 1;
    const range = maxVal - minVal || 1;
    sparkPoints = sparkValues.map((v, i) => {
      const x = (i / (sparkValues.length - 1)) * 50;
      const y = 20 - ((v - minVal) / range) * 16;
      return `${x},${y}`;
    }).join(' ');
  }

  // Sanitize subtitle
  const cleanSubtitle = subtitle.replace(/^\d+(\.\d+)?%\s*/, '');

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 relative flex flex-col justify-between cursor-pointer group"
    >
      {/* Top row: Icon + Title + Maximize */}
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
          <Icon className="w-4 h-4" />
        </div>
        {onMaximize && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            title={`Maximize ${config.title} deep analytics`}
            aria-label={`Maximize ${config.title}`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Metric Title & Value */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
          {config.title}
        </p>
        <div className="flex items-baseline justify-between gap-1">
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            {displayVal}
          </h3>
          {/* Sparkline SVG or No Comparison text */}
          {hasHistoricalSpark ? (
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
          ) : (
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700/60">
              Snapshot
            </span>
          )}
        </div>
      </div>

      {/* Subtitle & Trend */}
      <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
        {trend === 'up' && changePct > 0 ? (
          <span className="inline-flex items-center gap-0.5 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 px-1.5 py-0.5 rounded text-[10px] shrink-0">
            <ArrowUp className="w-2.5 h-2.5" />
            <span>{changePct}%</span>
          </span>
        ) : trend === 'down' && changePct > 0 ? (
          <span className="inline-flex items-center gap-0.5 font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/60 px-1.5 py-0.5 rounded text-[10px] shrink-0">
            <ArrowDown className="w-2.5 h-2.5" />
            <span>{changePct}%</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Active</span>
          </span>
        )}
        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium truncate text-right">
          {cleanSubtitle || 'No historical comparison'}
        </span>
      </div>
    </div>
  );
};
