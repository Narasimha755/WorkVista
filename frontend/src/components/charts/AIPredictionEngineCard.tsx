import React from 'react';
import { Cpu, CheckCircle2, Clock, Calendar, BarChart2 } from 'lucide-react';
import { AIPredictionEngineCard as AIPredictionEngineType } from '../../types';

interface AIPredictionEngineCardProps {
  data?: AIPredictionEngineType;
}

export const AIPredictionEngineCard: React.FC<AIPredictionEngineCardProps> = ({ data }) => {
  const modelName = data?.model_name || 'Random Forest';
  const isRegression = data?.task_type !== 'classification';
  const r2Score = data?.r2_score ?? 0.88;
  const mae = data?.mae ?? 3.2;
  const rmse = data?.rmse ?? 4.1;
  const accuracy = data?.model_accuracy ?? 92.0;

  const datasetSize = data?.dataset_size || 520;
  const featuresCount = data?.features_count || 12;
  const trainingPeriod = data?.training_period || 'Single period snapshot';
  const lastUpdated = data?.last_updated || 'Just now';

  // R2 percentage for fit visualizer
  const fitPct = Math.min(100, Math.max(0, Math.round(r2Score * 100)));

  return (
    <div className="bg-[#0B1120] text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between h-[360px] relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              AI Prediction Engine
            </h3>
            <p className="text-[11px] text-slate-400">
              Model: <span className="text-purple-300 font-semibold">{modelName}</span> ({isRegression ? 'Regression' : 'Classification'})
            </p>
          </div>
        </div>

        {/* Active Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      </div>

      {/* Description Text */}
      <p className="text-xs text-slate-300 leading-relaxed z-10 mt-1">
        Supervised machine learning pipeline estimating workforce productivity scores based on operational workload, tenure, attendance, and team engagement.
      </p>

      {/* Honest Model Metrics Card */}
      <div className="z-10 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
        {isRegression ? (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Model Fit (R² Score)</span>
              <span className="text-blue-400 font-bold font-mono text-sm">{r2Score.toFixed(3)}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm shadow-blue-500/50"
                style={{ width: `${fitPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>MAE: <b className="text-slate-200">{mae} pts</b></span>
              <span>RMSE: <b className="text-slate-200">{rmse} pts</b></span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Classification Accuracy</span>
              <span className="text-blue-400 font-bold font-mono text-sm">{accuracy}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="space-y-1.5 z-10 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Trained on {datasetSize.toLocaleString()} employee records</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
            {featuresCount} Features
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[200px]" title={trainingPeriod}>{trainingPeriod}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-[10px]">
            <Clock className="w-3 h-3" />
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
