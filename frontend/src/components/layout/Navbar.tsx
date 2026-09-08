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

  const isDark = true;

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const ranges = [
    '01 Sep 2026 – 30 Sep 2026',
    '01 Aug 2026 – 31 Aug 2026',
    'Q3 2026 (Jul – Sep)',
    'Year-to-Date (2026)'
  ];

  return (
    <header className="px-6 py-3 bg-[#070C18]/95 backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-30 shadow-lg text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Global Search Input with Ctrl+K shortcut */}
        <div className="flex-1 max-w-md">
          <div 
            onClick={onOpenSearch}
            className="relative flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/80 transition-colors group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 mr-2 shrink-0 transition-colors" />
            <input
              type="text"
              readOnly
              placeholder="Search employees, departments, reports..."
              className="w-full text-xs bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 cursor-pointer"
            />
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-2xs">
                Ctrl
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-2xs">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Runtime Mode Badge */}
          {api.runtimeMode === 'DEMO_SANDBOX' ? (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-semibold shadow-2xs"
              title="Running Presentation Demo Sandbox with local browser store (zero network errors)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Demo Sandbox</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold shadow-2xs"
              title="Connected to active backend FastAPI ML services"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>API Connected</span>
            </div>
          )}

          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dateRangeOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-40 py-1 animate-in fade-in zoom-in-95">
                {ranges.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedRange(r);
                      setDateRangeOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                      selectedRange === r ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cyber Status Indicator */}
          <div 
            className="p-2 text-cyan-400 bg-cyan-950/40 rounded-xl border border-cyan-500/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
            title="Permanent High-Tech Command Cyber Theme"
          >
            <Moon className="w-4 h-4 text-cyan-400" />
          </div>

          {/* Notifications Center */}
          <NotificationDropdown onNavigateToTab={onNavigateToTab} />

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Platform Analytics"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Load Demo Data Button */}
          <button
            onClick={onLoadDemo}
            disabled={isLoadingDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
            title="Reset to 520 realistic employee profiles"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingDemo ? 'animate-spin' : 'text-blue-600 dark:text-blue-400'}`} />
            <span className="hidden sm:inline">{isLoadingDemo ? 'Processing...' : 'Demo Data'}</span>
          </button>

          {/* AI Copilot Button */}
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 rounded-xl transition-all shadow-2xs"
              title="WorkVista AI Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>
          )}

          {/* Scenario Simulator Button */}
          {onOpenScenarioPlanner && (
            <button
              onClick={onOpenScenarioPlanner}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/80 rounded-xl transition-all shadow-2xs"
              title="Workforce Policy Scenario Planner"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden lg:inline">Simulator</span>
            </button>
          )}

          {/* Compare Button */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 rounded-xl transition-all shadow-2xs"
              title="Universal Side-by-Side Benchmarking"
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden lg:inline">Compare</span>
            </button>
          )}

          {/* Upload Dataset Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* User Profile Pill */}
          <div 
            onClick={() => onNavigateToTab && onNavigateToTab('settings')}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-colors"
            title="NARASIMHA (HR Analytics)"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              NA
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">NARASIMHA</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">HR Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
