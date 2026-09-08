import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import { ReportItem } from '../types';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>('Executive Summary');
  const [reportTitle, setReportTitle] = useState<string>('');

  const loadReports = () => {
    setLoading(true);
    api.getReports()
      .then((res) => {
        setReports(res);
        if (res.length > 0) {
          setSelectedReport(res[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const title = reportTitle || `${reportType} — ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      const newReport = await api.generateReport({
        title,
        report_type: reportType,
        format: 'PDF'
      });
      setReports([newReport, ...reports]);
      setSelectedReport(newReport);
      setReportTitle('');
      alert(`Report "${newReport.title}" generated successfully!`);
    } catch (err: any) {
      alert(`Report generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Workforce Intelligence Reports
          </h2>
          <p className="text-xs text-slate-500">
            Exportable executive summaries, cohort risk assessments, and model audits
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Generator Panel & List (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Generator Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Generate New Report
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Report Template</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Executive Summary">Executive Summary</option>
                  <option value="Employee Risk Report">Employee Risk Report</option>
                  <option value="Department Performance Report">Department Performance Report</option>
                  <option value="Prediction Report">Prediction Report</option>
                  <option value="Model Performance Report">Model Performance Report</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Custom Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Strategic Talent Overview"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Insights...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Past Reports List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Generated Reports Archive
            </h3>

            {loading ? (
              <p className="text-xs text-slate-400">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-xs text-slate-400">No reports generated yet. Click Generate above.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedReport?.id === r.id
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">{r.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono shrink-0">
                        {r.format}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{r.report_type}</span>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive Report Document View (8 cols) */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
              {/* Report Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                    {selectedReport.report_type}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                    {selectedReport.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Generated on {new Date(selectedReport.created_at).toLocaleString()}</span>
                  </p>
                </div>

                {/* Download Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => api.triggerExportReportPdf(selectedReport.id, selectedReport)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-500/20"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Download Executive PDF</span>
                  </button>
                  <button
                    onClick={() => api.triggerExportCsv()}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Executive Summary Block */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Executive Briefing & Strategic Context
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {selectedReport.summary}
                </p>
              </div>

              {/* KPIs Snapshot */}
              {selectedReport.kpis && Object.keys(selectedReport.kpis).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Core Metrics Snapshot
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {Object.entries(selectedReport.kpis).map(([k, v]) => (
                      <div key={k} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-400 block text-[10px]">{k}</span>
                        <span className="text-lg font-black text-slate-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Findings List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Analytical Findings
                </h4>
                <div className="space-y-2">
                  {selectedReport.key_findings.map((f, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs text-emerald-950 font-medium">
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Recommended Strategic Interventions
                </h4>
                <div className="space-y-2">
                  {selectedReport.recommendations.map((r, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100 text-xs text-purple-950 font-medium">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-12 border border-dashed border-slate-300 text-center text-slate-400">
              Select or generate a report to preview the executive dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
