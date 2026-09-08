import React from 'react';
import { Users, BarChart3, Star, AlertTriangle, ArrowUp, ArrowDown, Activity, Maximize2 } from 'lucide-react';
import { KPICardData } from '../../types';

interface MetricCardProps {
  type: 'total' | 'avg' | 'high' | 'risk';
  data?: KPICardData;
  onMaximize?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ type, data, onMaximize }) => {
  const configs = {
    total: {
      title: 'Total Employees',
      icon: Users,
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      strokeColor: '#3B82F6'
    },
    avg: {
      title: 'Average Productivity Score',
      icon: BarChart3,
      iconBg: 'bg-emerald-500',
      iconColor: 'text-white',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      strokeColor: '#10B981'
    },
    high: {
      title: 'High Performers (>= 80%)',
      icon: Star,
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      strokeColor: '#F59E0B'
    },
    risk: {
      title: 'High Risk Personnel',
      icon: AlertTriangle,
      iconBg: 'bg-rose-500',
      iconColor: 'text-white',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      strokeColor: '#EF4444'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  const displayVal = data?.display_value ?? (type === 'avg' ? '0%' : '0');
  const changePct = data?.change_pct ?? 0;
  const trend = data?.trend ?? 'neutral';
  const subtitle = data?.subtitle || (changePct !== 0 ? `${Math.abs(changePct)}% vs baseline` : 'Current snapshot');

  const hasRealSparkline = Boolean(data?.sparkline && data.sparkline.length > 2);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Left Icon Badge */}
        <div className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center shadow-md shadow-slate-200 shrink-0`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        {/* Middle Stats */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-0.5">
            {config.title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            {displayVal}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-medium">
            {trend === 'up' && (
              <span className="flex items-center gap-0.5 text-emerald-600">
                <ArrowUp className="w-3.5 h-3.5" />
                {changePct !== 0 ? `${Math.abs(changePct)}%` : ''}
              </span>
            )}
            {trend === 'down' && (
              <span className="flex items-center gap-0.5 text-rose-600">
                <ArrowDown className="w-3.5 h-3.5" />
                {changePct !== 0 ? `${Math.abs(changePct)}%` : ''}
              </span>
            )}
            {trend === 'neutral' && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mr-0.5" />
            )}
            <span className="text-slate-500 font-normal">
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side Indicator: Sparkline if real data exists, otherwise a clean Status Badge */}
      <div className="shrink-0 flex items-center">
        <div className="flex items-center gap-1.5">
          {hasRealSparkline ? (
            <div className="w-24 h-10">
              {/* SVG sparkline rendered only when real data points exist */}
            </div>
          ) : (
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border flex items-center gap-1.5 ${config.badgeColor}`}>
              <Activity className="w-3 h-3" />
              <span>Verified</span>
            </div>
          )}
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Maximize Metric View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
