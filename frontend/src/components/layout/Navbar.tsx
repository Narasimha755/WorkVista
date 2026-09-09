import React, { useState, useEffect } from 'react';
import { Search, Calendar, Download, UploadCloud, Sparkles, RefreshCw, ChevronDown, Moon, Sun, ShieldCheck, Sliders, GitCompare } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { api } from '../../services/api';

interface NavbarProps {
  onOpenUpload: () => void;
  onLoadDemo: () => void;
  onExport: () => void;
  onRefresh: () => void;
  onOpenSearch?: () => void;
  onOpenCopilot?: () => void;
  onOpenScenarioPlanner?: () => void;
  onOpenCompare?: () => void;
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
  onOpenCopilot,
  onOpenScenarioPlanner,
  onOpenCompare,
  onNavigateToTab,
  isRefreshing,
  isLoadingDemo,
  searchQuery,
  onSearchChange,
}) => {
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('01 Sep 2026 – 30 Sep 2026');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const ranges = [
    '01 Sep 2026 – 30 Sep 2026',
    '01 Aug 2026 – 31 Aug 2026',
    'Q3 2026 (Jul – Sep)',
    'Year-to-Date (2026)'
  ];

  return (
    <header className="px-5 py-2.5 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 shadow-2xs text-slate-800 dark:text-slate-200 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 max-w-[1720px] mx-auto">
        {/* Left: Global Command / Search Input */}
        <div className="flex-1 max-w-md">
          <div 
            onClick={onOpenSearch}
            className="relative flex items-center bg-slate-100 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl px-3.5 py-1.5 cursor-pointer transition-colors group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-cyan-400 mr-2.5 shrink-0 transition-colors" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ask WorkVista anything... (Ctrl + K)"
              className="w-full text-xs bg-transparent border-none outline-none text-slate-900 dark:text-slate-200 placeholder-slate-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl shadow-2xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dateRangeOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-40 py-1 animate-in fade-in zoom-in-95">
                {ranges.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedRange(r);
                      setDateRangeOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                      selectedRange === r ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dataset Badge: Enterprise Dataset · 520 employees */}
          <div 
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-xs cursor-pointer transition-colors"
            title="Active calibrated dataset: 520 employees (Click to refresh baseline)"
          >
            <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <div className="leading-tight text-left">
              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Enterprise Dataset</div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400">520 employees</div>
            </div>
          </div>

          {/* Model Status Pill: Online */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-[#090E1A] border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </div>

          {/* Notifications Center with badge */}
          <NotificationDropdown onNavigateToTab={onNavigateToTab} />

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#090E1A] rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Circular User Avatar "N" */}
          <div 
            onClick={() => onNavigateToTab && onNavigateToTab('settings')}
            className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-all shadow-xs shrink-0"
            title="NARASIMHA (Administrator)"
          >
            N
          </div>
        </div>
      </div>
    </header>
  );
};
