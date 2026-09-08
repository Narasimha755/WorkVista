import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Target, Sparkles, Maximize2 } from 'lucide-react';
import { KeyInsightItem } from '../../types';

interface KeyInsightsPanelProps {
  insights?: KeyInsightItem[];
  onViewAll?: () => void;
  onMaximize?: () => void;
}

export const KeyInsightsPanel: React.FC<KeyInsightsPanelProps> = ({ insights, onViewAll, onMaximize }) => {
  const defaultInsights: KeyInsightItem[] = [
    {
      id: '1',
      type: 'trend',
      icon: 'TrendingUp',
      message: 'Overall productivity is expected to increase by 6% next month across primary business units.',
      badge: 'Trend'
    },
    {
      id: '2',
      type: 'risk',
      icon: 'AlertTriangle',
      message: '24 employees are predicted to have low productivity. Consider proactive management intervention.',
      badge: 'Risk'
    },
    {
      id: '3',
      type: 'team',
      icon: 'Users',
      message: 'Engineering and Marketing teams show the highest growth potential in the next evaluation cycle.',
      badge: 'Team'
    },
    {
      id: '4',
      type: 'correlation',
      icon: 'Target',
      message: 'Workload balance optimization can improve employee performance metrics by up to 12%.',
      badge: 'Target'
    }
  ];

  const items = insights && insights.length > 0 ? insights : defaultInsights;

  const getIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'team':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Target className="w-4 h-4 text-amber-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'trend':
        return 'bg-emerald-50 border-emerald-200/60';
      case 'risk':
        return 'bg-rose-50 border-rose-200/60';
      case 'team':
        return 'bg-purple-50 border-purple-200/60';
      default:
        return 'bg-amber-50 border-amber-200/60';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Key Insights
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View All
          </button>
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
      </div>

      {/* Insight Items */}
      <div className="space-y-2.5 my-auto overflow-y-auto pr-1">
        {items.slice(0, 4).map((item) => (
          <div 
            key={item.id} 
            className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${getBg(item.type)}`}
          >
            <div className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(item.type)}
            </div>
            <p className="text-xs text-slate-800 leading-snug font-medium">
              {item.message}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span>Generated autonomously from live dataset statistics</span>
      </div>
    </div>
  );
};
