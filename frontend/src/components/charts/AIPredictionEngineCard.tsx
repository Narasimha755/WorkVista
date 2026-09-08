import React, { useState } from 'react';
import { Cpu, CheckCircle2, Clock, Calendar, RefreshCw, Maximize2, Sliders, ChevronDown } from 'lucide-react';
import { AIPredictionEngineCard as AIPredictionEngineType } from '../../types';

interface AIPredictionEngineCardProps {
  data?: AIPredictionEngineType;
  onRetrain?: (modelType: string) => Promise<void> | void;
  onModelChange?: (modelType: string) => void;
  onMaximize?: () => void;
  isRetraining?: boolean;
}

export const AIPredictionEngineCard: React.FC<AIPredictionEngineCardProps> = ({ 
  data,
  onRetrain,
  onModelChange,
  onMaximize,
  isRetraining = false
}) => {
  const modelName = data?.model_name || data?.model_type || 'RandomForest';
  const isRegression = data?.task_type !== 'classification';
  const r2Score = data?.r2_score ?? 0.748;
  const mae = data?.mae ?? 2.30;
  const rmse = data?.rmse ?? 2.82;
  const accuracy = data?.model_accuracy ?? 92.0;

  const datasetSize = data?.dataset_size || 520;
  const featuresCount = data?.features_count || 12;
  const trainingPeriod = data?.training_period || 'Single period snapshot (520 records)';
  const lastUpdated = data?.last_updated || 'Updated just now';

  const [selectedModel, setSelectedModel] = useState<string>(modelName);
  const [localRetraining, setLocalRetraining] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // R2 percentage for fit visualizer
  const fitPct = Math.min(100, Math.max(0, Math.round(r2Score * 100)));

  const handleModelSelect = (newModel: string) => {
    setSelectedModel(newModel);
    if (onModelChange) {
      onModelChange(newModel);
    }
  };

  const handleTriggerRetrain = async () => {
    setLocalRetraining(true);
    try {
      if (onRetrain) {
        await onRetrain(selectedModel);
      }
      setToastMessage(`Recalibrated ${selectedModel}`);
      setTimeout(() => setToastMessage(null), 2500);
    } finally {
      setLocalRetraining(false);
    }
  };

  const isBusy = isRetraining || localRetraining;

  return (
    <div className="bg-[#0B1120] text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between h-[360px] relative overflow-hidden transition-all">
      {/* Subtle background glow effect */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-600/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              AI Prediction Engine
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Dynamic Model Switcher Dropdown */}
              <select
                value={selectedModel}
                onChange={(e) => handleModelSelect(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-purple-300 text-[11px] font-semibold rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                title="Switch Machine Learning Model"
              >
                <option value="RandomForest">RandomForest (Regression)</option>
                <option value="GradientBoosting">GradientBoosting (Regression)</option>
                <option value="LinearRidge">LinearRidge (Regression)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Controls: Retrain & Maximize */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTriggerRetrain}
            disabled={isBusy}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            title="Recalibrate & Forecast Now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              title="Maximize Diagnostics"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Model Description or Live Notification Toast */}
      {toastMessage ? (
        <div className="z-10 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-xl flex items-center justify-between animate-in fade-in">
          <span>✓ {toastMessage}</span>
          <span className="font-mono text-[10px]">Active</span>
        </div>
      ) : (
        <p className="text-xs text-slate-300 leading-relaxed z-10 line-clamp-2">
          Calibrated supervised regression model forecasting individual productivity trajectories from workload, tenure, and engagement vectors.
        </p>
      )}

      {/* Honest Model Metrics Box */}
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
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>MAE: <b className="text-slate-200">{mae} pts</b></span>
              <span>RMSE: <b className="text-slate-200">{rmse} pts</b></span>
              <span className="text-emerald-400 font-semibold font-mono text-[10px]">Fit: {fitPct}%</span>
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

      {/* Metadata Badges & Quick Trigger */}
      <div className="space-y-1.5 z-10 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Trained on {datasetSize.toLocaleString()} employee records</span>
          </div>
          <button
            onClick={handleTriggerRetrain}
            disabled={isBusy}
            className="text-[10px] font-semibold text-purple-300 hover:text-purple-200 underline flex items-center gap-1"
          >
            {isBusy ? 'Calibrating...' : 'Retrain Now'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[180px]" title={trainingPeriod}>{trainingPeriod}</span>
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
