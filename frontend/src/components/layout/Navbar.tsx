import React, { useState } from 'react';
import { Search, Calendar, Download, UploadCloud, Sparkles, RefreshCw, ChevronDown } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  onOpenUpload: () => void;
  onLoadDemo: () => void;
  onExport: () => void;
  onRefresh: () => void;
  onOpenSearch?: () => void;
  onNavigateToTab?: (tab: string) => void;
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
  onOpenSearch,
  onNavigateToTab,
  isRefreshing,
  isLoadingDemo,
  searchQuery,
  onSearchChange,
}) => {
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('01 Sep 2026 – 30 Sep 2026');

  const ranges = [
    '01 Sep 2026 – 30 Sep 2026',
    '01 Aug 2026 – 31 Aug 2026',
    'Q3 2026 (Jul – Sep)',
    'Year-to-Date (2026)'
  ];

  return (
    <header className="px-6 py-3.5 bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Global Search Input with Ctrl+K shortcut */}
        <div className="flex-1 max-w-md">
          <div 
            onClick={onOpenSearch}
            className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:border-blue-400 hover:bg-slate-50/80 transition-colors group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 mr-2 shrink-0 transition-colors" />
            <input
              type="text"
              readOnly
              placeholder="Search employees, departments, reports..."
              className="w-full text-xs bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 cursor-pointer"
            />
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
                Ctrl
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dateRangeOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1 animate-in fade-in zoom-in-95">
                {ranges.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedRange(r);
                      setDateRangeOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                      selectedRange === r ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <NotificationDropdown onNavigateToTab={onNavigateToTab} />

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Platform Analytics"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Load Demo Data Button */}
          <button
            onClick={onLoadDemo}
            disabled={isLoadingDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
            title="Reset to 520 realistic employee profiles"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingDemo ? 'animate-spin' : 'text-blue-600'}`} />
            <span className="hidden sm:inline">{isLoadingDemo ? 'Processing...' : 'Demo Data'}</span>
          </button>

          {/* Upload Dataset Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* User Profile Pill */}
          <div 
            onClick={() => onNavigateToTab && onNavigateToTab('settings')}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
            title="NARASIMHA (HR Analytics)"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              NA
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">NARASIMHA</div>
              <div className="text-[10px] text-slate-500 leading-tight">HR Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
