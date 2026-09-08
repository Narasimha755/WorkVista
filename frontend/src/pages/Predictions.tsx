import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Settings2, 
  Play, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

interface PredictionsPageProps {
  onViewEmployees: () => void;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({ onViewEmployees }) => {
  const [modelType, setModelType] = useState<string>('RandomForest');
  const [targetCol, setTargetCol] = useState<string>('productivity_score');
  const [period, setPeriod] = useState<string>('Next Month');
  const [department, setDepartment] = useState<string>('All Departments');
  const [highThreshold, setHighThreshold] = useState<number>(80);
  const [medThreshold, setMedThreshold] = useState<number>(50);
  const [riskThreshold, setRiskThreshold] = useState<number>(50);
  const [departments, setDepartments] = useState<string[]>(['All Departments']);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    api.getDepartments().then((depts) => {
      if (depts && depts.length > 0) {
        setDepartments(['All Departments', ...depts.map(d => d.name)]);
      }
    }).catch(console.error);

    api.getPredictions().then((data) => {
      if (data && data.total > 0) {
        setLastResult({
          records_processed: data.total,
          employees_analyzed: data.total,
          model_used: 'RandomForest',
          target_column: 'productivity_score',
          avg_predicted_score: data.avg_predicted,
          high_performers_count: data.high_performers,
          at_risk_count: data.at_risk,
          execution_time_sec: 0.84,
          timestamp: new Date().toISOString()
        });
      }
    }).catch(console.error);
  }, []);

  const handleRunPrediction = async () => {
    setIsRunning(true);
    try {
      const res = await api.runPrediction({
        model_type: modelType,
        target_column: targetCol,
        prediction_period: period,
        department_filter: department,
        high_perf_threshold: highThreshold,
        medium_perf_threshold: medThreshold,
        risk_threshold: riskThreshold
      });
      setLastResult(res);
      setIsRunning(false);
    } catch (err: any) {
      alert(`Prediction failed: ${err.message}`);
      setIsRunning(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Predictive AI Modeling Studio
          </h2>
          <p className="text-xs text-slate-500">
            Configure target hyperparameters and execute forward-looking workforce forecasts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Settings2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Prediction Parameters & Setup
              </h3>
            </div>

            {/* Model Architecture Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Machine Learning Algorithm
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'RandomForest', name: 'Random Forest', desc: 'Ensemble trees, robust against outliers' },
                  { id: 'GradientBoosting', name: 'Gradient Boosting', desc: 'Sequential boosting for non-linear patterns' },
                  { id: 'LinearRegression', name: 'Linear Ridge', desc: 'Fast interpretable regularized regression' }
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setModelType(m.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      modelType === m.id
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 mb-0.5">{m.name}</div>
                    <p className="text-[10px] text-slate-500 leading-tight">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target & Scope Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Output Metric</label>
                <select
                  value={targetCol}
                  onChange={(e) => setTargetCol(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="productivity_score">Productivity Score (%)</option>
                  <option value="tasks_completed">Tasks Completed Count</option>
                  <option value="deadline_adherence">Deadline Adherence Rate (%)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Forecast Horizon</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Next Month">Next Month (30 Days)</option>
                  <option value="Next Quarter">Next Quarter (90 Days)</option>
                  <option value="Next 6 Months">Next 6 Months (Long-range)</option>
                </select>
              </div>
            </div>

            {/* Department Scope */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Cohort Segmentation</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Threshold Sliders */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-800">
                Performance & Risk Classification Thresholds
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">High Performer Floor:</span>
                    <span className="font-bold text-emerald-600">≥ {highThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="95"
                    value={highThreshold}
                    onChange={(e) => setHighThreshold(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">Medium Performer Lower Bound:</span>
                    <span className="font-bold text-blue-600">{medThreshold}% – {highThreshold - 1}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="70"
                    value={medThreshold}
                    onChange={(e) => setMedThreshold(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">At-Risk Intervention Threshold:</span>
                    <span className="font-bold text-rose-600">Score &lt; {medThreshold}% or Risk ≥ {riskThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="70"
                    value={riskThreshold}
                    onChange={(e) => setRiskThreshold(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunPrediction}
              disabled={isRunning}
              className="w-full py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Neural Inference & Risk Matrices...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Prediction Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Results Summary & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {lastResult ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Prediction Completed</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {lastResult.execution_time_sec}s
                </span>
              </div>

              {/* Stat Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Employees Analyzed</span>
                  <span className="text-xl font-bold text-slate-900">{lastResult.employees_analyzed}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Avg Predicted Score</span>
                  <span className="text-xl font-bold text-blue-600">{lastResult.avg_predicted_score}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-emerald-700 block text-[10px] font-semibold">Predicted High Performers</span>
                  <span className="text-xl font-bold text-emerald-800">{lastResult.high_performers_count}</span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
                  <span className="text-rose-700 block text-[10px] font-semibold">At Risk Personnel</span>
                  <span className="text-xl font-bold text-rose-800">{lastResult.at_risk_count}</span>
                </div>
              </div>

              {/* Execution Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Model Engine:</span>
                  <span className="font-semibold text-slate-900">{lastResult.model_used}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Target Variable:</span>
                  <span className="font-semibold text-slate-900">{lastResult.target_column}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Timestamp:</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {new Date(lastResult.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={onViewEmployees}
                  className="w-full py-2.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  View Filtered Employee Roster
                </button>
                <a
                  href={api.getExportUrl('csv')}
                  className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Prediction Report (CSV)</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 border border-dashed border-slate-300 text-center text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-medium">Ready to execute prediction cycle.</p>
              <p className="text-[11px]">Adjust hyperparameters on the left and click "Execute Prediction Pipeline".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
