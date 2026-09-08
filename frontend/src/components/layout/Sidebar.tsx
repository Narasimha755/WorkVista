import React from 'react';
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
  MessageSquare,
  Hexagon
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
  onOpenCopilot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenCopilot }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Command Center', icon: LayoutDashboard },
    { id: 'risk-intelligence' as NavTab, label: 'Multivariate Risk Topology', icon: ShieldAlert },
    { id: 'employees' as NavTab, label: 'Workforce 360° Matrix', icon: Users },
    { id: 'analytics' as NavTab, label: 'Strategic Analytics', icon: BarChart3 },
    { id: 'departments' as NavTab, label: 'Departmental Breakdown', icon: Building2 },
    { id: 'predictions' as NavTab, label: 'Predictive Intelligence', icon: Sparkles },
    { id: 'reports' as NavTab, label: 'Executive Intelligence Reports', icon: FileText },
    { id: 'model-performance' as NavTab, label: 'Neural Drift & Models', icon: Gauge },
    { id: 'data-studio' as NavTab, label: 'Data Studio & Ingestion', icon: Database },
    { id: 'activity' as NavTab, label: 'Enterprise Audit Trail', icon: ActivityIcon },
  ];

  return (
    <aside className="w-16 bg-[#050811] text-slate-400 flex flex-col justify-between shrink-0 min-h-screen border-r border-cyan-500/15 z-40 select-none py-3.5 items-center">
      {/* Top Logo / Hexagon Icon */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => onSelectTab('dashboard')}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] border border-cyan-400/50 hover:scale-105 transition-all group relative"
          title="WorkVista Cognition Command"
        >
          <Hexagon className="w-5 h-5 text-cyan-200 animate-pulse" />
          <span className="absolute left-16 px-2.5 py-1 bg-[#0A1020] border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
            WorkVista Cognition
          </span>
        </button>

        {/* Primary Nav Stack */}
        <nav className="flex flex-col items-center gap-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 hover:border hover:border-cyan-500/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-cyan-300' : ''}`} />
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#00f0ff]" />
                  )}
                </button>

                {/* Floating Tooltip */}
                <span className="absolute left-14 top-1.5 px-2.5 py-1 bg-[#0C1224] border border-cyan-500/30 text-slate-200 text-xs font-semibold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-150 z-50">
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Copilot Launcher, Settings & User Avatar */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-cyan-500/10 w-full px-2">
        {/* WorkVista AI Copilot Button with Pulsing Red Notification Dot */}
        {onOpenCopilot && (
          <div className="relative group">
            <button
              onClick={onOpenCopilot}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-950/40 to-indigo-950/40 border border-pink-500/30 text-pink-300 hover:text-pink-200 hover:border-pink-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.35)] flex items-center justify-center transition-all relative"
              title="Open WorkVista AI Copilot"
            >
              <MessageSquare className="w-4 h-4 text-pink-400" />
              {/* Red notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]" />
            </button>
            <span className="absolute left-14 top-1.5 px-2.5 py-1 bg-[#0C1224] border border-pink-500/30 text-pink-300 text-xs font-semibold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-150 z-50">
              WorkVista AI Copilot (Ctrl+K)
            </span>
          </div>
        )}

        {/* Settings Tab */}
        <div className="relative group">
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              currentTab === 'settings'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 hover:border hover:border-cyan-500/20'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <span className="absolute left-14 top-1.5 px-2.5 py-1 bg-[#0C1224] border border-cyan-500/30 text-slate-200 text-xs font-semibold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-150 z-50">
            System Settings
          </span>
        </div>

        {/* User Profile Avatar with Online Ring */}
        <div className="relative group pt-1">
          <div 
            onClick={() => onSelectTab('settings')}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-900/60 to-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xs font-mono font-bold cursor-pointer hover:border-cyan-400 transition-all relative"
            title="Narasimha (Architect)"
          >
            NA
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#050811] shadow-[0_0_6px_#10b981]" />
          </div>
          <span className="absolute left-14 bottom-1 px-2.5 py-1 bg-[#0C1224] border border-cyan-500/30 text-slate-200 text-xs font-semibold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-150 z-50">
            Narasimha · Administrator
          </span>
        </div>
      </div>
    </aside>
  );
};
