import React from 'react';
import { Sparkles, TrendingUp, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';

interface ExecutiveSummaryBannerProps {
  summaryText?: string;
  avgProductivity?: number;
  highPerformersPct?: number;
  atRiskCount?: number;
  onExploreRisk?: () => void;
}

export const ExecutiveSummaryBanner: React.FC<ExecutiveSummaryBannerProps> = ({
  summaryText,
  avgProductivity = 78.9,
  highPerformersPct = 42.3,
  atRiskCount = 44,
  onExploreRisk
}) => {
  const text = summaryText || `Workforce productivity is stable with ${avgProductivity}% average output. 72.4% of employees are predicted to maintain or improve performance. Engineering leads organizational velocity.`;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border border-blue-100 shadow-2xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                Executive Synthesis
              </span>
              <span className="text-[11px] text-slate-400">
                Machine Learning Workforce Assessment
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 mt-1 leading-relaxed max-w-4xl">
              {text}
            </p>
          </div>
        </div>

        {onExploreRisk && atRiskCount > 0 && (
          <button
            onClick={onExploreRisk}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs self-start sm:self-center"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Triage {atRiskCount} At-Risk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
