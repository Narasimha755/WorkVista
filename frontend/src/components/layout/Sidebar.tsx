import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  BarChart3, 
  Building2, 
  FileText, 
  Gauge, 
  Settings, 
  ChevronRight,
  Zap
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'employees' 
  | 'predictions' 
  | 'analytics' 
  | 'departments' 
  | 'reports' 
  | 'model-performance' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees' as NavTab, label: 'Employees', icon: Users },
    { id: 'predictions' as NavTab, label: 'Predictions', icon: Sparkles },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'departments' as NavTab, label: 'Departments', icon: Building2 },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'model-performance' as NavTab, label: 'Model Performance', icon: Gauge },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B1120] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800/60 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap className="w-5 h-5 text-white fill-white/20" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                WorkVista
              </h1>
              <p className="text-[10px] tracking-wider text-slate-400 font-medium uppercase">
                Predict · Plan · Perform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="px-3 space-y-1 mt-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-4 space-y-4">
        {/* Promotional Brand Slogan Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950/40 border border-slate-800/80 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
            Workforce AI
          </p>
          <p className="text-xs font-medium text-slate-200 leading-snug">
            Smarter People Decisions, Stronger Tomorrow
          </p>
        </div>

        {/* User Profile */}
        <div className="pt-2 border-t border-slate-800/70">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xs font-bold">
                NA
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                  NARASIMHA
                </div>
                <div className="text-[11px] text-slate-400">
                  HR Analytics
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </div>
        </div>
      </div>
    </aside>
  );
};
