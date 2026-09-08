import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  History, 
  ShieldCheck, 
  Database,
  Trash2
} from 'lucide-react';
import { SystemSettings, AuditLogItem } from '../types';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    high_perf_threshold: 80,
    medium_perf_threshold: 50,
    risk_threshold: 50,
    default_model: 'RandomForest',
    test_split: 0.2,
    random_seed: 42,
    default_date_range: 'Last 30 Days',
    default_department: 'All Departments',
    data_retention_days: 365,
    auto_retrain_enabled: true
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getSettings(), api.getAuditLogs()])
      .then(([s, logs]) => {
        setSettings(s);
        setAuditLogs(logs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.medium_perf_threshold >= settings.high_perf_threshold) {
      alert('Validation Error: Medium performance floor must be strictly lower than High performance threshold.');
      return;
    }
    if (settings.risk_threshold < 0 || settings.risk_threshold > 100) {
      alert('Validation Error: Risk alarm threshold must be between 0 and 100.');
      return;
    }
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
      alert('Settings updated successfully!');
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Platform Settings & Governance
        </h2>
        <p className="text-xs text-slate-500">
          Threshold configuration, default inference models, and operational audit trail
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            {/* Prediction Thresholds */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Prediction & Classification Thresholds
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">High Performer (≥ %)</label>
                  <input
                    type="number"
                    min="60"
                    max="99"
                    value={settings.high_perf_threshold}
                    onChange={(e) => setSettings({ ...settings, high_perf_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Medium Floor (≥ %)</label>
                  <input
                    type="number"
                    min="30"
                    max="70"
                    value={settings.medium_perf_threshold}
                    onChange={(e) => setSettings({ ...settings, medium_perf_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Risk Alarm (≥ index)</label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={settings.risk_threshold}
                    onChange={(e) => setSettings({ ...settings, risk_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Model Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-purple-600" />
                Default Machine Learning Configurations
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Default Model</label>
                  <select
                    value={settings.default_model}
                    onChange={(e) => setSettings({ ...settings, default_model: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="RandomForest">Random Forest</option>
                    <option value="GradientBoosting">Gradient Boosting</option>
                    <option value="LinearRegression">Linear Regression</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Test Split Ratio</label>
                  <select
                    value={settings.test_split}
                    onChange={(e) => setSettings({ ...settings, test_split: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="0.15">15% Holdout</option>
                    <option value="0.2">20% Holdout (Standard)</option>
                    <option value="0.3">30% Holdout</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Random State Seed</label>
                  <input
                    type="number"
                    value={settings.random_seed}
                    onChange={(e) => setSettings({ ...settings, random_seed: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Dashboard & Data Governance */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Data Retention & Automation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Retention Horizon (Days)</label>
                  <input
                    type="number"
                    value={settings.data_retention_days}
                    onChange={(e) => setSettings({ ...settings, data_retention_days: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mt-auto">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Auto-Retrain on Upload</span>
                    <span className="text-[11px] text-slate-400">Trigger model training upon new CSV</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.auto_retrain_enabled}
                    onChange={(e) => setSettings({ ...settings, auto_retrain_enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Configurations...' : 'Save Configuration Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Audit Trail Log (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <History className="w-4 h-4 text-blue-600" />
              Operational Audit Trail
            </h3>

            {loading ? (
              <p className="text-xs text-slate-400">Loading audit history...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400">No activity logged yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600 text-[11px]">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {log.details}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      By: {log.user}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
