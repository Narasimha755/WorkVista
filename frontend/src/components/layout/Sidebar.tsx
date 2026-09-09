import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Sparkles, 
  ShieldAlert, 
  BarChart2, 
  FileText, 
  Database, 
  BrainCircuit, 
  Settings,
  UserPlus,
  Briefcase
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
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'workforce' as NavTab, label: 'Workforce Hub', icon: Users },
    { id: 'candidates' as NavTab, label: 'Candidates', icon: UserPlus },
    { id: 'employees' as NavTab, label: 'Employees', icon: Briefcase },
    { id: 'departments' as NavTab, label: 'Departments', icon: Building2 },
    { id: 'predictions' as NavTab, label: 'Predictions', icon: Sparkles },
    { id: 'risk-intelligence' as NavTab, label: 'Risk', icon: ShieldAlert },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart2 },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'data-studio' as NavTab, label: 'Data Studio', icon: Database },
  ];

  return (
    <aside className="w-[215px] bg-white dark:bg-[#090E1A] text-slate-700 dark:text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-200 dark:border-slate-800/80 select-none z-30 font-sans transition-colors">
      <div>
        {/* Brand Header */}
        <div className="p-4 pb-5">
          <div className="flex items-center gap-2.5">
            {/* Modern "W" Icon Logo matching reference */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
              <svg 
                className="w-5 h-5 text-white" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 6l4.5 12 4-9 4 9 5.5-12" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                WorkVista
              </h1>
              <p className="text-[9px] tracking-tight text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                AI-Powered Workforce Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-blue-50 dark:bg-[#13233D] text-blue-600 dark:text-white font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Slim cyan/blue vertical highlight for active item */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 dark:bg-cyan-400 rounded-r-full shadow-[0_0_8px_#3b82f6] dark:shadow-[0_0_8px_#00e5ff]" />
                )}
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* AI Copilot Nav Button */}
          <button
            onClick={() => {
              if (onOpenCopilot) onOpenCopilot();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all duration-150 group"
          >
            <BrainCircuit className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors" />
            <span className="truncate">AI Copilot</span>
          </button>
        </nav>
      </div>

      {/* Footer Area: Settings & Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
        {/* Settings button */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'settings'
              ? 'bg-blue-50 dark:bg-[#13233D] text-blue-600 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Settings</span>
        </button>

        {/* Profile Section: Avatar "N" + NARASIMHA / Administrator */}
        <div 
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-600/30 border border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
            N
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
              NARASIMHA
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Administrator
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
