import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react';
import { WorkforcePulse, ExecutiveAlert } from '../../types';

interface WorkforcePulseBarProps {
  pulse?: WorkforcePulse;
  alerts?: ExecutiveAlert[];
  onOpenCopilot?: (query?: string) => void;
  onOpenScenarioPlanner?: (dept?: string) => void;
  onFilterByDepartment?: (dept: string) => void;
}

export const WorkforcePulseBar: React.FC<WorkforcePulseBarProps> = ({
  pulse,
  alerts = [],
  onOpenCopilot,
  onOpenScenarioPlanner,
  onFilterByDepartment,
}) => {
  const [selectedAlertIdx, setSelectedAlertIdx] = useState<number>(0);

  if (!pulse && (!alerts || alerts.length === 0)) return null;

  const activeAlert = alerts[selectedAlertIdx] || alerts[0];

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 md:p-5 shadow-lg border border-slate-700/60 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Workforce Pulse Gauges */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Pulse Health Index
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl md:text-2xl font-black text-white">
                  {pulse?.health_score ?? 82}
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {pulse?.health_status ?? 'Strong'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Flight Risk Exposure
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg md:text-xl font-black text-rose-300">
                  {pulse?.at_risk_count ?? 18} Staff
                </span>
                <span className="text-[11px] text-slate-400">
                  ({pulse?.at_risk_percentage ?? '3.5%'})
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Predictive Velocity
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg md:text-xl font-black text-emerald-300">
                  {pulse?.productivity_velocity ?? '+2.4%'}
                </span>
                <span className="text-[11px] text-emerald-400/80 font-medium">
                  30-day run rate
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Capacity Saturation
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg md:text-xl font-black text-amber-300">
                  {pulse?.capacity_saturation ?? '81%'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Balanced
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          {onOpenCopilot && (
            <button
              onClick={() => onOpenCopilot('Executive briefing: what are the top workforce risks today?')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Briefing</span>
            </button>
          )}
          {onOpenScenarioPlanner && (
            <button
              onClick={() => onOpenScenarioPlanner('All')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Policy</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Executive Alerts Strip */}
      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Signals:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {alerts.map((alert, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAlertIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg border transition-all text-xs flex items-center gap-1.5 whitespace-nowrap ${
                    selectedAlertIdx === idx
                      ? 'bg-slate-700 text-white border-indigo-400/80 font-bold shadow-xs'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    alert.level === 'critical' ? 'bg-rose-500 animate-ping' : alert.level === 'emerging' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  <span>{alert.title}</span>
                </button>
              ))}
            </div>
          </div>

          {activeAlert && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <span className="text-slate-300 font-medium truncate max-w-xs md:max-w-md">
                {activeAlert.description}
              </span>
              {activeAlert.action_label && (
                <button
                  onClick={() => {
                    if (activeAlert.department && onFilterByDepartment) {
                      onFilterByDepartment(activeAlert.department);
                    } else if (onOpenScenarioPlanner) {
                      onOpenScenarioPlanner(activeAlert.department);
                    }
                  }}
                  className="shrink-0 text-indigo-300 hover:text-indigo-200 font-bold flex items-center gap-0.5"
                >
                  <span>{activeAlert.action_label}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
