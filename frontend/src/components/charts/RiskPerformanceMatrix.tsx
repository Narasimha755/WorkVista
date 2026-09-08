import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ShieldAlert, Maximize2, Search, Download, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { RiskMatrixPoint } from '../../types';

interface RiskPerformanceMatrixProps {
  data?: RiskMatrixPoint[];
  onViewEmployee?: (id: string) => void;
  onMaximize?: () => void;
}

export const RiskPerformanceMatrix: React.FC<RiskPerformanceMatrixProps> = ({
  data = [],
  onViewEmployee,
  onMaximize
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'high_risk' | 'safe_stars' | 'moderate'>('all');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Derive unique departments from real data
  const departments = useMemo(() => {
    const set = new Set<string>();
    data.forEach(p => {
      if (p.department) set.add(p.department);
    });
    return ['All', ...Array.from(set).sort()];
  }, [data]);

  const filteredPoints = useMemo(() => {
    let result = [...data];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.employee_name && p.employee_name.toLowerCase().includes(q)) ||
        (p.employee_id && p.employee_id.toLowerCase().includes(q)) ||
        (p.department && p.department.toLowerCase().includes(q))
      );
    }

    // Department filter
    if (selectedDept !== 'All') {
      result = result.filter(p => p.department === selectedDept);
    }

    // Risk / Performance quadrant filter
    if (filterMode === 'high_risk') {
      result = result.filter(p => p.risk_score >= 50 || p.risk_level === 'High' || p.risk_level === 'Critical');
    } else if (filterMode === 'safe_stars') {
      result = result.filter(p => p.productivity >= 75 && p.risk_score < 40);
    } else if (filterMode === 'moderate') {
      result = result.filter(p => p.risk_score >= 30 && p.risk_score < 50);
    }

    return result;
  }, [data, searchQuery, selectedDept, filterMode]);

  // Zoom domains
  const xDomain = useMemo(() => {
    if (zoomLevel === 2) return [30, 85];
    if (zoomLevel === 1.5) return [20, 95];
    return [0, 100];
  }, [zoomLevel]);

  const yDomain = useMemo(() => {
    if (zoomLevel === 2) return [0, 70];
    if (zoomLevel === 1.5) return [0, 85];
    return [0, 100];
  }, [zoomLevel]);

  const getColor = (level: string, riskScore: number) => {
    if (level === 'Critical' || riskScore >= 75) return '#991B1B';
    if (level === 'High' || riskScore >= 50) return '#EF4444';
    if (level === 'Moderate' || riskScore >= 30) return '#F59E0B';
    return '#10B981';
  };

  const handleExportCsv = () => {
    if (!filteredPoints.length) return;
    const header = ['Employee ID', 'Employee Name', 'Department', 'Productivity', 'Predicted', 'Risk Score', 'Risk Level'];
    const rows = filteredPoints.map(p => [
      p.employee_id,
      `"${p.employee_name}"`,
      `"${p.department}"`,
      p.productivity,
      p.predicted ?? '',
      p.risk_score,
      p.risk_level
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workvista_risk_matrix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt: RiskMatrixPoint = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs z-50 pointer-events-none select-none min-w-[210px]">
          <div className="font-bold text-slate-900 dark:text-white text-sm">{pt.employee_name}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">{pt.department} · {pt.role || 'Staff'} ({pt.employee_id})</div>
          <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 dark:text-slate-400">Current Productivity:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{pt.productivity}%</span>
            </div>
            {pt.predicted !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">Predicted Output:</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{pt.predicted}%</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 dark:text-slate-400">Flight Risk:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{pt.risk_score}% ({pt.risk_level})</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <span>Click dot to open Employee 360 →</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Controls */}
      <div className="space-y-2.5 mb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Risk vs Performance Matrix</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Burnout risk & productivity positioning ({filteredPoints.length} plotted)</p>
            </div>
          </div>

          {/* Top Actions: Zoom, Export, Maximize */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel(prev => (prev < 2 ? prev + 0.5 : 2))}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => (prev > 1 ? prev - 0.5 : 1))}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleExportCsv}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Export matrix points as CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowLegend(prev => !prev)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Toggle legend"
            >
              {showLegend ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            {onMaximize && (
              <button 
                onClick={onMaximize}
                className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-2xs flex items-center justify-center shrink-0 ml-1"
                title="Maximize Risk vs Performance Matrix"
                aria-label="Maximize Risk vs Performance Matrix"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Quick Quadrant Buttons */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              All ({data.length})
            </button>
            <button
              onClick={() => setFilterMode('high_risk')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterMode === 'high_risk'
                  ? 'bg-rose-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setFilterMode('safe_stars')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                filterMode === 'safe_stars'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Stars
            </button>
          </div>

          {/* Department Select & Search Input */}
          <div className="flex items-center gap-1.5">
            {departments.length > 2 && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-[10px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-md px-1.5 py-0.5 outline-none focus:border-indigo-400"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>
                ))}
              </select>
            )}
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-slate-400 absolute left-1.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Find staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-[10px] pl-5 pr-1.5 py-0.5 w-24 sm:w-28 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-md outline-none focus:border-indigo-400 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scatter Matrix Chart */}
      <div className="h-64 w-full relative">
        {filteredPoints.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No employees match this criteria</p>
            <p className="text-[10px] text-slate-400">Adjust the filters or search terms above</p>
            <button
              onClick={() => { setFilterMode('all'); setSelectedDept('All'); setSearchQuery(''); }}
              className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline"
            >
              Reset Matrix Filters
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis 
                type="number" 
                dataKey="productivity" 
                name="Productivity" 
                domain={xDomain} 
                tick={{ fontSize: 10, fill: '#64748B' }}
                label={{ value: 'Productivity Score (%)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94A3B8' }}
              />
              <YAxis 
                type="number" 
                dataKey="risk_score" 
                name="Risk Score" 
                domain={yDomain} 
                tick={{ fontSize: 10, fill: '#64748B' }}
                label={{ value: 'Risk Score (%)', angle: -90, position: 'insideLeft', offset: 20, fontSize: 11, fill: '#94A3B8' }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                isAnimationActive={false}
                cursor={{ strokeDasharray: '3 3', stroke: '#94A3B8' }}
                wrapperStyle={{ pointerEvents: 'none', zIndex: 1000 }}
              />
              <Scatter 
                name="Employees" 
                data={filteredPoints} 
                onClick={(pt) => {
                  if (pt && pt.employee_id && onViewEmployee) {
                    onViewEmployee(pt.employee_id);
                  }
                }}
                className="cursor-pointer"
              >
                {filteredPoints.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.risk_level, entry.risk_score)} 
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer & Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 gap-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Stars (High Prod / Low Risk)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate Risk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> High Flight Risk
          </span>
        </div>
      )}
    </div>
  );
};
