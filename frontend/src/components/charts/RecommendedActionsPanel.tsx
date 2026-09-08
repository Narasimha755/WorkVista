import React from 'react';
import { 
  Zap, 
  ChevronRight, 
  UserCheck, 
  Scale, 
  GraduationCap, 
  Trophy 
} from 'lucide-react';
import { RecommendedActionItem } from '../../types';

interface RecommendedActionsPanelProps {
  actions?: RecommendedActionItem[];
  onActionClick?: (action: RecommendedActionItem) => void;
}

export const RecommendedActionsPanel: React.FC<RecommendedActionsPanelProps> = ({ 
  actions, 
  onActionClick 
}) => {
  const defaultActions: RecommendedActionItem[] = [
    {
      id: '1',
      title: 'Schedule one-on-one for at-risk employees',
      category: 'Intervention',
      affected_count: 24,
      potential_impact: '24 employees',
      action_label: 'Schedule 1:1',
      urgency: 'high'
    },
    {
      id: '2',
      title: 'Redistribute workload in Operations',
      category: 'Workload',
      affected_count: 36,
      potential_impact: 'Potential +12% productivity',
      action_label: 'Rebalance Tasks',
      urgency: 'medium'
    },
    {
      id: '3',
      title: 'Provide upskilling for Finance team',
      category: 'Training',
      affected_count: 18,
      potential_impact: 'Focus on advanced tools',
      action_label: 'View Courses',
      urgency: 'medium'
    },
    {
      id: '4',
      title: 'Recognize and reward top performers',
      category: 'Retention',
      affected_count: 82,
      potential_impact: '82 employees',
      action_label: 'Reward Staff',
      urgency: 'low'
    }
  ];

  const items = actions && actions.length > 0 ? actions : defaultActions;

  const getIcon = (idx: number) => {
    switch (idx % 4) {
      case 0:
        return <UserCheck className="w-4 h-4 text-rose-500" />;
      case 1:
        return <Scale className="w-4 h-4 text-purple-500" />;
      case 2:
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      default:
        return <Trophy className="w-4 h-4 text-amber-500" />;
    }
  };

  const getIconBg = (idx: number) => {
    switch (idx % 4) {
      case 0:
        return 'bg-rose-50 border-rose-200/60';
      case 1:
        return 'bg-purple-50 border-purple-200/60';
      case 2:
        return 'bg-emerald-50 border-emerald-200/60';
      default:
        return 'bg-amber-50 border-amber-200/60';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center text-purple-600">
            <Zap className="w-3.5 h-3.5 fill-purple-600/30" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Recommended Actions (AI)
          </h3>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-2.5 my-auto overflow-y-auto pr-1">
        {items.slice(0, 4).map((action, idx) => (
          <div 
            key={action.id}
            onClick={() => onActionClick && onActionClick(action)}
            className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs flex items-center justify-between gap-3 cursor-pointer transition-all group bg-white hover:bg-slate-50/60"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${getIconBg(idx)}`}>
                {getIcon(idx)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {action.potential_impact}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
        <span>Continuous reinforcement recommendations</span>
        <span className="text-blue-600 font-medium cursor-pointer hover:underline">Manage Rules</span>
      </div>
    </div>
  );
};
