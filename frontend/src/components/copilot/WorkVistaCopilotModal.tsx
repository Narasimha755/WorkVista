import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Search, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Layers, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { CopilotQueryResponse } from '../../types';
import { api } from '../../services/api';

interface WorkVistaCopilotModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onViewEmployee?: (id: string) => void;
}

export const WorkVistaCopilotModal: React.FC<WorkVistaCopilotModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onViewEmployee,
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<CopilotQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedPrompts = [
    'Who are the 10 highest-risk employees?',
    'Show stars at risk with high performance',
    'Compare Engineering vs Operations',
    'Which department has highest workload?',
    'What are the strongest productivity drivers?',
    'Show employees predicted to decline'
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (initialQuery) {
        setQuery(initialQuery);
        handleExecute(initialQuery);
      }
    } else {
      setQuery('');
      setResponse(null);
      setError(null);
    }
  }, [isOpen, initialQuery]);

  const handleExecute = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.queryCopilot(queryText.trim());
      setResponse(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to query WorkVista Copilot');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecute(query);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:to-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  WorkVista AI Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Decision Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ask anything in natural language about risk, performance, capacity & drivers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Who are the highest risk employees? or Compare Engineering vs Sales..."
              className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Ask</span>
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-500">
            <span className="shrink-0 font-medium text-[11px] text-slate-400">Suggested:</span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(p);
                  handleExecute(p);
                }}
                className="shrink-0 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </form>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Synthesizing workforce telemetry & ML inference...
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Parsing intent, querying employee state space, and generating action pathways.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !response && !error && (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Ready for Workforce Inquiry
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Type a question above or choose a suggested inquiry to analyze flight risk, compare departments, inspect productivity bottlenecks, and evaluate intervention scenarios.
              </p>
            </div>
          )}

          {!loading && response && (
            <div className="space-y-5 animate-fadeIn">
              {/* Intent & Headline */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">
                    Intent: {response.intent.replace(/_/g, ' ')}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {response.headline}
                  </h4>
                </div>
              </div>

              {/* Key Metrics Cards */}
              {response.key_metrics && response.key_metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {response.key_metrics.map((m, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {m.label}
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {m.value}
                      </div>
                      {m.status && (
                        <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {m.status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Analytical Answer Markdown */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-850/60 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white text-xs mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Analytical Synthesis:
                </div>
                <div className="whitespace-pre-line">
                  {response.answer_markdown}
                </div>
              </div>

              {/* Supporting Records Table */}
              {response.supporting_records && response.supporting_records.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Identified Cohort ({response.supporting_records.length} Profiles)
                    </span>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                        <tr>
                          <th className="px-3 py-2">ID</th>
                          <th className="px-3 py-2">Name / Role</th>
                          <th className="px-3 py-2">Dept</th>
                          <th className="px-3 py-2">Prod</th>
                          <th className="px-3 py-2">Risk</th>
                          <th className="px-3 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {response.supporting_records.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-3 py-2 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {r.employee_id}
                            </td>
                            <td className="px-3 py-2">
                              <div className="font-bold text-slate-800 dark:text-white">
                                {r.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {r.role || 'Specialist'}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                              {r.department}
                            </td>
                            <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">
                              {r.productivity}%
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.risk_level === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {r.risk_score}% {r.risk_level}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              {onViewEmployee && (
                                <button
                                  onClick={() => {
                                    onViewEmployee(r.employee_id);
                                    onClose();
                                  }}
                                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold"
                                >
                                  <span>360°</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Suggested Followups */}
              {response.suggested_followups && response.suggested_followups.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Recommended Follow-up Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {response.suggested_followups.map((f, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(f);
                          handleExecute(f);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className="w-3 h-3 text-indigo-500" />
                        <span>{f}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>WorkVista Decision AI Engine &bull; Authenticated HR Admin: <strong>NARASIMHA</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
