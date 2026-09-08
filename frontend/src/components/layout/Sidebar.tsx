import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  BarChart3, 
  Building2, 
  ShieldAlert,
  FileText, 
  Gauge, 
  Database,
  Activity as ActivityIcon,
  Settings, 
  ChevronRight,
  ChevronLeft,
  Zap,
  HelpCircle,
  Circle
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'employees' 
  | 'predictions' 
  | 'analytics' 
  | 'departments' 
  | 'risk-intelligence'
  | 'reports' 
  | 'model-performance' 
  | 'data-studio'
  | 'activity'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees' as NavTab, label: 'Employees', icon: Users },
    { id: 'predictions' as NavTab, label: 'Predictions', icon: Sparkles },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'departments' as NavTab, label: 'Departments', icon: Building2 },
    { id: 'risk-intelligence' as NavTab, label: 'Risk Intelligence', icon: ShieldAlert },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'model-performance' as NavTab, label: 'Model Performance', icon: Gauge },
    { id: 'data-studio' as NavTab, label: 'Data Studio', icon: Database },
    { id: 'activity' as NavTab, label: 'Activity', icon: ActivityIcon },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-[#0B1120] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800/60 select-none transition-all duration-300`}>
      {/* Brand Header */}
      <div>
        <div className="p-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <Zap className="w-5 h-5 text-white fill-white/20" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
                  WorkVista
                </h1>
                <p className="text-[10px] tracking-wider text-slate-400 font-medium uppercase mt-1 truncate">
                  AI-Powered Workforce Intelligence
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3.5 px-3.5 py-2.5'} rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110 text-white' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-3 space-y-3">
        {/* Promotional Brand Slogan Card */}
        {!collapsed && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950/40 border border-slate-800/80 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-0.5">
              Workforce Intelligence
            </p>
            <p className="text-xs font-medium text-slate-200 leading-snug">
              Smarter People. Stronger Organizations.
            </p>
          </div>
        )}

        {/* System Status & Help */}
        <div className="space-y-1 pt-2 border-t border-slate-800/70 text-xs">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'} py-1 text-slate-400 hover:text-slate-200 cursor-pointer`}>
            {!collapsed ? (
              <>
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Help & Support</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">v2.0</span>
              </>
            ) : (
              <span title="Help & Support">
                <HelpCircle className="w-4 h-4" />
              </span>
            )}
          </div>
          
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'} py-1 text-slate-400`}>
            {!collapsed ? (
              <>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] text-slate-300">All Systems Operational</span>
                </span>
              </>
            ) : (
              <span className="relative flex h-2.5 w-2.5" title="All Systems Operational">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="pt-2 border-t border-slate-800/70">
          <div 
            onClick={() => onSelectTab('settings')}
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group`}
            title="NARASIMHA (HR Analytics)"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                NA
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    NARASIMHA
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    HR Analytics · Administrator
                  </div>
                </div>
              )}
            </div>
            {!collapsed && <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />}
          </div>
        </div>
      </div>
    </aside>
  );
};
