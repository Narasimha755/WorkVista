import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  TrendingUp, 
  FileText, 
  Settings,
  LogOut,
  Building2,
  Sparkles,
  BarChart2,
  Database,
  BrainCircuit,
  ChevronDown,
  UserPlus
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'workforce'
  | 'candidates'
  | 'employees' 
  | 'departments' 
  | 'predictions' 
  | 'risk-intelligence' 
  | 'analytics' 
  | 'reports' 
  | 'model-performance'
  | 'data-studio' 
  | 'activity' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCopilot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenCopilot }) => {
  const [showMoreModules, setShowMoreModules] = useState(false);

  const primaryNavItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Home },
    { id: 'employees' as NavTab, label: 'Employees', icon: Users },
    { id: 'predictions' as NavTab, label: 'Predictions', icon: TrendingUp },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const secondaryNavItems = [
    { id: 'workforce' as NavTab, label: 'Workforce Hub', icon: Users },
    { id: 'candidates' as NavTab, label: 'Candidates', icon: UserPlus },
    { id: 'departments' as NavTab, label: 'Departments', icon: Building2 },
    { id: 'analytics' as NavTab, label: 'Deep Analytics', icon: BarChart2 },
    { id: 'data-studio' as NavTab, label: 'Data Studio', icon: Database },
  ];

  return (
    <aside className="w-[230px] bg-white dark:bg-[#090E1A] text-slate-700 dark:text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-100 dark:border-slate-800/80 select-none z-30 font-sans transition-colors">
      <div>
        {/* Brand Header matching Reference Image */}
        <div className="p-5 pb-6">
          <div className="flex items-center gap-3">
            {/* 3 People Icon Logo in Blue */}
            <div className="w-10 h-10 rounded-xl bg-[#1E6BFF] flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 text-white">
              <Users className="w-5 h-5 fill-white/20" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                WorkPredict
              </h1>
              <p className="text-[10px] tracking-tight text-slate-400 dark:text-slate-400 font-medium truncate mt-0.5">
                Employee Productivity Analytics
              </p>
            </div>
          </div>
        </div>

        {/* Primary Navigation matching Reference Image */}
        <nav className="px-3.5 space-y-1.5">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1E6BFF] text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* AI Copilot shortcut */}
          <button
            onClick={() => {
              if (onOpenCopilot) onOpenCopilot();
            }}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-[#1E6BFF] hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-all duration-150 group"
          >
            <BrainCircuit className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-[#1E6BFF] transition-colors" />
            <span className="truncate">AI Copilot</span>
          </button>

          {/* Optional Extended Modules dropdown */}
          <div className="pt-2">
            <button
              onClick={() => setShowMoreModules(!showMoreModules)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span>More Modules</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreModules ? 'rotate-180' : ''}`} />
            </button>
            {showMoreModules && (
              <div className="mt-1 space-y-1 pl-2 border-l border-slate-100 dark:border-slate-800 animate-in fade-in">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-[#13233D] text-[#1E6BFF] font-semibold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer Area: Profile (Einstein Yathipathi) + Log out */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
        {/* Profile Card */}
        <div 
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-3 px-1 py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-200 dark:border-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden shadow-2xs">
            <span className="font-semibold text-xs tracking-tight">EY</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
              Einstein Yathipathi
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
              HR Analytics
            </div>
          </div>
        </div>

        {/* Log out Button matching reference */}
        <button
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-2.5 px-1 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
