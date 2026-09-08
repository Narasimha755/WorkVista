import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  BarChart3, 
  Activity, 
  Gauge, 
  Sliders, 
  HelpCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ModelPerformanceData } from '../types';
import { api } from '../services/api';

export const ModelPerformancePage: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [selectedAlgo, setSelectedAlgo] = useState<string>('RandomForest');

  const loadModelData = () => {
    setLoading(true);
    api.getModelPerformance()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadModelData();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      await api.retrainModel({
        model_type: selectedAlgo,
        test_size: 0.2,
        target_column: 'productivity_score'
      });
      loadModelData();
      alert(`Successfully retrained model using ${selectedAlgo}!`);
    } catch (err: any) {
      alert(`Retraining error: ${err.message}`);
    } finally {
      setIsRetraining(false);
    }
  };

  if (loading || !data || !data.has_model) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
        <p className="text-sm font-medium">Inspecting active neural and ensemble model weights...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Model Performance & Validation Metrics
          </h2>
          <p className="text-xs text-slate-500">
            Continuous model diagnostics, residual distribution, and feature attribution
          </p>
        </div>

        {/* Retrain Action */}
        <div className="flex items-center gap-3">
          <select
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="RandomForest">Random Forest Regressor</option>
            <option value="GradientBoosting">Gradient Boosting Regressor</option>
            <option value="LinearRegression">Linear Ridge Model</option>
          </select>
          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Retraining Model...' : 'Retrain Model'}</span>
          </button>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">R² Goodness of Fit</span>
          <span className="text-2xl font-black text-blue-600">{data.r2_score ?? 0.88}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Mean Absolute Error (MAE)</span>
          <span className="text-2xl font-black text-slate-900">{data.mae ?? 3.4} pts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Root Mean Squared (RMSE)</span>
          <span className="text-2xl font-black text-slate-900">{data.rmse ?? 4.8}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Model Accuracy</span>
          <span className="text-2xl font-black text-emerald-600">{data.accuracy}%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Training Sample Size</span>
          <span className="text-2xl font-black text-slate-900">{data.dataset_size}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Feature Dimension</span>
          <span className="text-2xl font-black text-purple-600">{data.features_count}</span>
        </div>
      </div>

      {/* Row 2: Charts (Parity Plot & Residuals Histogram) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actual vs Predicted Parity Plot */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Actual vs Predicted Parity Scatter (Test Holdout)
            </h3>
            <span className="text-[11px] text-slate-400">Ideal parity along diagonal</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="actual" name="Actual Productivity" unit="%" domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="predicted" name="Predicted Productivity" unit="%" domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1">
                          <p className="font-bold">{d.employee_id}</p>
                          <p className="text-slate-300">Actual: <span className="text-white font-bold">{d.actual}%</span></p>
                          <p className="text-slate-300">Predicted: <span className="text-blue-400 font-bold">{d.predicted}%</span></p>
                          <p className="text-slate-300">Residual: <span className="text-amber-400 font-mono">{(d.actual - d.predicted).toFixed(1)}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Holdout Predictions" data={data.actual_vs_predicted_scatter} fill="#4F46E5" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Residuals Distribution Histogram */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Residual Error Distribution Histogram
            </h3>
            <span className="text-[11px] text-slate-400">Zero-centered normal expectation</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.residuals_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded-xl text-xs">
                          <p className="font-bold">{payload[0].payload.range} pts</p>
                          <p className="text-blue-400">{payload[0].value} predictions</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" name="Frequency" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Feature Importances Table & Bar Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Ranked Feature Attribution & Weight Coefficients
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.feature_importances?.map((f) => (
            <div key={f.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{f.name}</span>
                <span className="font-extrabold text-blue-600">{f.importance_pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ width: `${Math.min(100, f.importance_pct * 3)}%`, backgroundColor: f.color }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
