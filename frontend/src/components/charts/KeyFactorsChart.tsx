import React from 'react';
import { Maximize2 } from 'lucide-react';
import { KeyFactorItem } from '../../types';

interface KeyFactorsChartProps {
  factors?: KeyFactorItem[];
  onMaximize?: () => void;
}

export const KeyFactorsChart: React.FC<KeyFactorsChartProps> = ({ factors, onMaximize }) => {
  const defaultFactors: KeyFactorItem[] = [
    { name: 'Workload Balance', importance_pct: 32, color: '#10B981' },
    { name: 'Skill Proficiency', importance_pct: 24, color: '#3B82F6' },
    { name: 'Attendance', importance_pct: 18, color: '#8B5CF6' },
    { name: 'Engagement Score', importance_pct: 15, color: '#F59E0B' },
    { name: 'Project Complexity', importance_pct: 11, color: '#EF4444' }
  ];

  const factorList = factors && factors.length > 0 ? factors : defaultFactors;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-[360px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-0.5">
            Key Factors Influencing Productivity
          </h3>
          <p className="text-[11px] text-slate-400">
            Ranked feature weights derived from machine learning estimator
          </p>
        </div>
        {onMaximize && (
          <button
            onClick={onMaximize}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Maximize View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Horizontal Factor Bars */}
      <div className="space-y-3.5 my-auto">
        {factorList.slice(0, 5).map((f) => (
          <div key={f.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {f.name}
              </span>
              <span className="font-bold text-slate-900">
                {f.importance_pct}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ 
                  width: `${Math.min(100, Math.max(5, f.importance_pct * 2.5))}%`,
                  backgroundColor: f.color || '#3B82F6' 
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
        <span>Global Shapley feature attribution</span>
        <span className="text-slate-500 font-medium">Sorted descending</span>
      </div>
    </div>
  );
};
