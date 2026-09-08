import React, { useState, useEffect } from 'react';
import { 
  Activity as ActivityIcon, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  RefreshCw,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLogItem } from '../types';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs(100);
      setLogs(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionCategories = ['All', 'MODEL_RETRAINED', 'DATASET_UPLOADED', 'SETTINGS_UPDATED', 'REPORT_GENERATED', 'BULK_REVIEW_ASSIGNED', 'EMPLOYEE_NOTE_ADDED'];

  const filteredLogs = logs.filter(l => {
    if (selectedAction !== 'All' && !l.action.includes(selectedAction)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.user.toLowerCase().includes(q);
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('MODEL')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">ML Engine</span>;
    }
    if (action.includes('DATASET') || action.includes('UPLOAD')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Data Ops</span>;
    }
    if (action.includes('SETTINGS')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Governance</span>;
    }
    if (action.includes('REVIEW') || action.includes('NOTE') || action.includes('FLAG')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">HR Action</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Audit</span>;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-1">
            Governance & Compliance
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ActivityIcon className="w-6 h-6 text-blue-600" />
            <span>Platform Activity & Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of system modifications, dataset transformations, model runs, and HR decisions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit details or actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56 sm:w-64"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            {actionCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Action Categories' : cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Logged User: <span className="font-bold text-slate-900">NARASIMHA</span> (HR Administrator)
        </div>
      </div>

      {/* Activity Timeline / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Historical Activity Stream ({filteredLogs.length} events)</h3>
          <span className="text-xs text-slate-400">Strictly auditable records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Event Category</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-6">Event Details</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {log.action}
                  </td>
                  <td className="py-3 px-6 text-slate-600 leading-relaxed font-sans max-w-md">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>{log.user || 'NARASIMHA'}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {typeof log.created_at === 'string' ? log.created_at : 'Just now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
