import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { RefreshCw, TrendingUp, Grid, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAnalytics = () => {
    setLoading(true);
    api.getAnalytics()
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
    loadAnalytics();
  }, []);

  if (loading || !data || !data.has_data) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
        <p className="text-sm font-medium">Computing multi-dimensional workforce analytics...</p>
      </div>
    );
  }

  const hasTemporal = Boolean(data.has_temporal_data && data.productivity_trends && data.productivity_trends.length > 0);

  // Extract unique column headers from heatmap
  const heatmapCols: string[] = Array.from(
    new Set((data.heatmap || []).map((h: any) => h.cohort || h.month))
  );

  return (
    <div className="p-8 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Workforce Deep Analytics Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Cross-sectional correlations, risk profiling, and departmental cohort matrices
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="p-2 text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          title="Refresh analytics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Row 1: Longitudinal Trends or Honest Notice */}
      {hasTemporal ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Departmental Productivity Trajectories (Temporal Series)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Normalized Index (0–100)</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.productivity_trends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis domain={[30, 100]} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-300 mb-1">{label}</p>
                          {payload.map((p: any) => (
                            <div key={p.dataKey} className="flex items-center justify-between gap-3">
                              <span style={{ color: p.color }}>{p.dataKey}:</span>
                              <span className="font-bold">{p.value}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="Overall" stroke="#0F172A" strokeWidth={3} dot={{ r: 3 }} />
                {Object.keys(data.productivity_trends[0] || {})
                  .filter(k => k !== 'month' && k !== 'Overall')
                  .map((dept, i) => {
                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
                    return (
                      <Line
                        key={dept}
                        type="monotone"
                        dataKey={dept}
                        stroke={colors[i % colors.length]}
                        strokeWidth={1.8}
                        dot={false}
                      />
                    );
                  })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-200/80 flex items-start gap-3.5 text-xs text-blue-900">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-blue-950 mb-0.5">
              Cross-Sectional Dataset Notice &bull; Zero Fabricated Trends
            </h4>
            <p className="text-blue-800 leading-relaxed">
              The currently uploaded dataset represents a cross-sectional snapshot without longitudinal date stamps. To maintain complete analytical honesty, multi-month curves are not fabricated. All metrics below evaluate authentic feature interactions, cross-department cohorts, and quantitative risk tiers.
            </p>
          </div>
        </div>
      )}

      {/* Row 2: 3 Scatter Plots (Workload vs Prod, Attendance vs Prod, Experience vs Prod) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Workload vs Productivity */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Workload Index vs Productivity
            </h4>
            <p className="text-[10px] text-slate-400">Diminishing returns and burnout penalties observed above 80 workload</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="x" name="Workload" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="y" name="Productivity" unit="%" domain={[20, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <ZAxis range={[25, 25]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-slate-200">{d.name} ({d.department})</p>
                          <p className="text-slate-300">Workload: <span className="text-white font-bold">{d.x}</span></p>
                          <p className="text-slate-300">Productivity: <span className="text-blue-400 font-bold">{d.y}%</span></p>
                          <p className="text-slate-300">Risk Score: <span className="text-rose-400 font-bold">{d.risk_score}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Employees" data={data.workload_vs_productivity} fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance vs Productivity */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Attendance Rate vs Productivity
            </h4>
            <p className="text-[10px] text-slate-400">Direct linear correlation between attendance consistency and output</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="x" name="Attendance" unit="%" domain={[50, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="y" name="Productivity" unit="%" domain={[20, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <ZAxis range={[25, 25]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-slate-200">{d.name} ({d.department})</p>
                          <p className="text-slate-300">Attendance: <span className="text-white font-bold">{d.x}%</span></p>
                          <p className="text-slate-300">Productivity: <span className="text-emerald-400 font-bold">{d.y}%</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Employees" data={data.attendance_vs_productivity} fill="#10B981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experience vs Productivity */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Experience & Tenure vs Productivity
            </h4>
            <p className="text-[10px] text-slate-400">Tenure-driven skill compounding across senior staff cohorts</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="x" name="Experience" unit=" yrs" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="y" name="Productivity" unit="%" domain={[20, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                <ZAxis range={[25, 25]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-slate-200">{d.name} ({d.department})</p>
                          <p className="text-slate-300">Tenure: <span className="text-white font-bold">{d.x} yrs</span></p>
                          <p className="text-slate-300">Productivity: <span className="text-purple-400 font-bold">{d.y}%</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Employees" data={data.experience_vs_productivity} fill="#8B5CF6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Department × Cohort Heatmap & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Heatmap (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-purple-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {hasTemporal ? 'Department × Temporal Matrix Heatmap' : 'Department × Experience Cohort Productivity Heatmap'}
              </h3>
              <p className="text-[10px] text-slate-400">
                Calculated directly from active workforce observation averages
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-3 text-left">Department</th>
                  {heatmapCols.map((col) => (
                    <th key={col} className="py-2.5 px-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(data.department_comparisons || []).map((dept: any) => (
                  <tr key={dept.department}>
                    <td className="py-3 px-3 text-left font-semibold text-slate-800">
                      {dept.department}
                    </td>
                    {heatmapCols.map((col) => {
                      const cell = (data.heatmap || []).find(
                        (c: any) => c.department === dept.department && (c.cohort === col || c.month === col)
                      );
                      const val = cell ? cell.value : dept.avg_productivity;
                      
                      let bg = 'bg-blue-100 text-blue-900';
                      if (val >= 80) bg = 'bg-emerald-500 text-white font-bold';
                      else if (val >= 70) bg = 'bg-emerald-100 text-emerald-950 font-semibold';
                      else if (val >= 60) bg = 'bg-blue-100 text-blue-950 font-medium';
                      else if (val >= 50) bg = 'bg-amber-100 text-amber-950 font-medium';
                      else bg = 'bg-rose-200 text-rose-950 font-bold';

                      return (
                        <td key={col} className="py-2 px-2">
                          <div className={`py-1.5 px-2 rounded-xl text-xs transition-transform hover:scale-105 ${bg}`}>
                            {val}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quantitative Workforce Risk Tiers
              </h3>
              <p className="text-[10px] text-slate-400">Decoupled from productivity output</p>
            </div>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(data.risk_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {(data.risk_distribution || []).map((tier: any) => (
              <div key={tier.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="text-slate-600 font-medium">{tier.name}</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{tier.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
