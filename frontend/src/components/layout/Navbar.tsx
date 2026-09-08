import React from 'react';
import { Search, Calendar, Download, UploadCloud, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onLoadDemo: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isLoadingDemo?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  onLoadDemo,
  onExport,
  onRefresh,
  isRefreshing,
  isLoadingDemo,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="px-8 pt-7 pb-4 bg-white border-b border-slate-200/80">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Title Area */}
        <div>
          <div className="text-[11px] font-bold tracking-widest text-blue-600 uppercase mb-1">
            Workforce Analytics
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Workforce Productivity Prediction
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {typeof window !== 'undefined' && window.location.hostname.includes('github.io')
                ? 'Interactive Cloud Engine (520 Profiles)'
                : 'FastAPI ML Engine Connected'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Leverage AI to predict, monitor and improve employee performance.
          </p>
        </div>

        {/* Right Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employees, departments..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56 lg:w-64 transition-all"
            />
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 cursor-pointer transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>01 Sep 2026 – 30 Sep 2026</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Load Demo Data Button */}
          <button
            onClick={onLoadDemo}
            disabled={isLoadingDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingDemo ? 'animate-spin' : 'text-blue-600'}`} />
            <span>{isLoadingDemo ? 'Processing...' : 'Load Demo Data'}</span>
          </button>

          {/* Upload Dataset Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload Dataset</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#0F172A] hover:bg-slate-800 rounded-xl transition-all shadow-sm shadow-slate-900/10 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-200" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Inspirational Quote Banner */}
      <div className="flex justify-end mt-2">
        <p className="text-[11px] italic text-slate-400 font-light">
          "Data empowers people. Predictions create possibilities."
        </p>
      </div>
    </header>
  );
};
