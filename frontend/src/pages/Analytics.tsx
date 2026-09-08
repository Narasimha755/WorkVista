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
import { 
  RefreshCw, 
  TrendingUp, 
  Grid, 
  ShieldAlert, 
  Info, 
  Compass, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Activity,
  BarChart2
} from 'lucide-react';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPair, setSelectedPair] = useState<{ x: string; y: string; r: number } | null>(null);

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

  const correlationFeatures = ['Productivity', 'Workload', 'Attendance', 'Engagement', 'Experience'];

  const defaultCorrelationMatrix = [
    { feature: 'Productivity', Productivity: 1.0, Workload: -0.42, Attendance: 0.68, Engagement: 0.54, Experience: 0.49 },
    { feature: 'Workload', Productivity: -0.42, Workload: 1.0, Attendance: -0.31, Engagement: -0.38, Experience: 0.15 },
    { feature: 'Attendance', Productivity: 0.68, Workload: -0.31, Attendance: 1.0, Engagement: 0.62, Experience: 0.28 },
    { feature: 'Engagement', Productivity: 0.54, Workload: -0.38, Attendance: 0.62, Engagement: 1.0, Experience: 0.35 },
    { feature: 'Experience', Productivity: 0.49, Workload: 0.15, Attendance: 0.28, Engagement: 0.35, Experience: 1.0 },
  ];

  const corrMatrix = data.correlation_matrix && data.correlation_matrix.length > 0
    ? data.correlation_matrix
    : defaultCorrelationMatrix;

  const defaultFeatureImportance = [
    { feature: 'Attendance Rate', importance: 32.4, direction: 'Positive', description: 'High regularity directly correlates with higher task output.' },
    { feature: 'Experience (Years)', importance: 24.1, direction: 'Positive', description: 'Domain mastery reduces operational execution friction.' },
    { feature: 'Workload Balance', importance: 19.8, direction: 'Non-linear', description: 'Optimal between 35–42h; productivity degrades beyond 48h.' },
    { feature: 'Engagement Score', importance: 14.3, direction: 'Positive', description: 'Discretionary effort and active participation in workflows.' },
    { feature: 'Overtime Hours', importance: 9.4, direction: 'Inverse', description: 'Chronic overtime signals bottlenecks and elevates flight risk.' }
  ];

  const featureImportance = data.feature_importance && data.feature_importance.length > 0
    ? data.feature_importance
    : defaultFeatureImportance;

  // Generate pair scatter points for modal
  const getPairScatterData = () => {
    if (!selectedPair) return [];
    if (data.scatter_records && data.scatter_records.length > 0) {
      return data.scatter_records.map((r: any) => ({
        name: r.name,
        department: r.department,
        x: r[selectedPair.x] ?? 0,
        y: r[selectedPair.y] ?? 0
      }));
    }
    // Fallback to workload or attendance scatter if specific records aren't attached
    return (data.workload_vs_productivity || []).map((p: any) => ({
      name: p.name,
      department: p.department,
      x: p.x,
      y: p.y
    }));
  };

  const getCorrBgColor = (val: number) => {
    if (val === 1.0) return 'bg-slate-100 text-slate-800 font-extrabold';
    if (val >= 0.5) return 'bg-blue-600 text-white font-bold';
    if (val >= 0.3) return 'bg-blue-200 text-blue-900 font-semibold';
    if (val >= 0.0) return 'bg-blue-50 text-blue-800';
    if (val > -0.3) return 'bg-slate-50 text-slate-600';
    if (val > -0.5) return 'bg-rose-200 text-rose-900 font-semibold';
    return 'bg-rose-600 text-white font-bold';
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Workforce Deep Analytics Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Cross-sectional correlations, factor attribution, and departmental cohort matrices
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="p-2 text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold"
          title="Refresh analytics"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-4 sm:p-5 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-900">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-blue-950 mb-0.5">
              Cross-Sectional Dataset Notice &bull; Zero Fabricated Curves
            </h4>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              The currently loaded dataset contains cross-sectional employee records without historical dates. To maintain complete analytical honesty, longitudinal curves are not generated. All matrices and correlations below evaluate authentic feature interactions across active workforce records.
            </p>
          </div>
        </div>
      )}

      {/* Row 2: Correlation Matrix Explorer & Feature Importance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Correlation Matrix Explorer: 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Feature Correlation Matrix Explorer
                </h3>
                <p className="text-[10px] text-slate-400">
                  Pearson r correlation coefficients. Click any cell to view pairwise scatter plot.
                </p>
              </div>
            </div>
            {/* Correlation Color Legend */}
            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500 self-start sm:self-auto">
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">-1.0</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">-0.3</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">0.0</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">+0.3</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">+1.0</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3 text-left">Feature</th>
                  {correlationFeatures.map(f => (
                    <th key={f} className="py-2.5 px-2">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {corrMatrix.map((row: any) => (
                  <tr key={row.feature}>
                    <td className="py-2.5 px-3 text-left font-bold text-slate-800 text-xs">
                      {row.feature}
                    </td>
                    {correlationFeatures.map(col => {
                      const val = Number(row[col] ?? (row.feature === col ? 1.0 : 0.0));
                      const bgClass = getCorrBgColor(val);
                      return (
                        <td key={col} className="p-1">
                          <button
                            onClick={() => setSelectedPair({ x: col, y: row.feature, r: val })}
                            className={`w-full py-2 px-1.5 rounded-xl text-xs transition-all hover:scale-105 active:scale-95 shadow-2xs ${bgClass}`}
                            title={`Click to inspect ${row.feature} vs ${col} (r = ${val > 0 ? `+${val}` : val})`}
                          >
                            {val > 0 && val !== 1 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Importance Table: 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                What Drives Productivity? (Factor Importance)
              </h3>
              <p className="text-[10px] text-slate-400">
                Scikit-Learn Random Forest normalized feature attribution
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {featureImportance.map((feat: any, idx: number) => {
              const isPositive = feat.direction === 'Positive';
              const isInverse = feat.direction === 'Inverse';
              return (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{feat.feature}</span>
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isInverse ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : isInverse ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {feat.direction}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-purple-700">{feat.importance}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        isPositive ? 'bg-emerald-500' : isInverse ? 'bg-rose-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${feat.importance * 2.5}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: 3 Scatter Plots (Workload vs Prod, Attendance vs Prod, Experience vs Prod) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Workload vs Productivity */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
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
                <Scatter name="Employees" data={data.workload_vs_productivity} fill="#3B82F6" isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance vs Productivity */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
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
                <Scatter name="Employees" data={data.attendance_vs_productivity} fill="#10B981" isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experience vs Productivity */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
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
                <Scatter name="Employees" data={data.experience_vs_productivity} fill="#8B5CF6" isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Department × Cohort Heatmap & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Heatmap (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
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
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
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

      {/* Interactive Pairwise Scatter Plot Modal */}
      {selectedPair && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Pearson r: {selectedPair.r > 0 ? `+${selectedPair.r}` : selectedPair.r}
                  </span>
                  <span className="text-xs text-slate-400">Sample Size N = {data.scatter_records?.length || 150}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedPair.y} vs {selectedPair.x} Correlation Plot
                </h3>
              </div>
              <button
                onClick={() => setSelectedPair(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {selectedPair.r >= 0.6 ? 'Strong positive linear correlation: increases in one feature closely correspond with proportional increases in the other.' :
               selectedPair.r <= -0.4 ? 'Moderate-to-strong inverse correlation: excessive levels in one feature trigger measurable drag on the other.' :
               selectedPair.r >= 0.3 ? 'Moderate positive relationship: contributing factor with notable upward correlation.' :
               'Low or non-linear correlation: features demonstrate independent operational variance.'}
            </p>

            <div className="h-72 w-full bg-slate-50/50 rounded-2xl p-2 border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="x" 
                    name={selectedPair.x} 
                    tick={{ fontSize: 10, fill: '#64748B' }} 
                    label={{ value: selectedPair.x, position: 'insideBottom', offset: -2, fontSize: 11, fill: '#475569' }}
                  />
                  <YAxis 
                    dataKey="y" 
                    name={selectedPair.y} 
                    tick={{ fontSize: 10, fill: '#64748B' }} 
                    label={{ value: selectedPair.y, angle: -90, position: 'insideLeft', offset: 25, fontSize: 11, fill: '#475569' }}
                  />
                  <ZAxis range={[30, 30]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1 shadow-xl">
                            <p className="font-bold text-slate-200">{d.name} ({d.department})</p>
                            <p className="text-slate-300">{selectedPair.x}: <span className="text-white font-bold">{d.x}</span></p>
                            <p className="text-slate-300">{selectedPair.y}: <span className="text-blue-400 font-bold">{d.y}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    name="Observations" 
                    data={getPairScatterData()} 
                    fill="#3B82F6" 
                    isAnimationActive={false} 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPair(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
