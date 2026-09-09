import React from 'react';
import { 
  Home, 
  Users, 
  TrendingUp, 
  BarChart2,
  Building2,
  FileText, 
  Settings,
  ChevronRight,
  BrainCircuit
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
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Home },
    { id: 'employees' as NavTab, label: 'Employees', icon: Users },
    { id: 'predictions' as NavTab, label: 'Predictions', icon: TrendingUp },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart2 },
    { id: 'departments' as NavTab, label: 'Departments', icon: Building2 },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[225px] bg-[#0B1120] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800/80 select-none z-30 font-sans relative overflow-hidden">
      
      {/* Top Branding & Navigation */}
      <div>
        {/* Brand Header matching Reference Image */}
        <div className="p-5 pb-6">
          <div className="flex items-center gap-3">
            {/* WorkVista 3 Vertical Gradient Bar Icon */}
            <div className="flex items-end gap-1 h-6">
              <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-t from-blue-600 to-indigo-400" />
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-t from-indigo-600 to-purple-400" />
              <span className="w-1.5 h-4.5 rounded-full bg-gradient-to-t from-purple-600 to-pink-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                WorkVista
              </h1>
              <p className="text-[10px] tracking-tight text-slate-400 font-medium truncate mt-0.5">
                Predict • Plan • Perform
              </p>
            </div>
          </div>
        </div>

        {/* Primary Navigation matching Reference Image */}
        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#3832A0] text-white font-semibold shadow-sm shadow-indigo-900/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* AI Copilot shortcut */}
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-800/40 transition-all duration-150"
            >
              <BrainCircuit className="w-4 h-4 shrink-0 text-slate-500" />
              <span className="truncate">AI Copilot</span>
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Area: Ambient Waves + Motivational Quote + Profile */}
      <div className="relative pt-6">
        {/* Subtle decorative wave lines matching reference */}
        <div className="px-5 py-3 relative z-10">
          <p className="text-xs font-semibold text-slate-200 leading-snug tracking-tight">
            Smarter<br />
            People Decisions<br />
            Stronger Tomorrow
          </p>
        </div>

        {/* Ambient background wave effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden select-none">
          <svg className="w-full h-full object-cover" viewBox="0 0 200 120" preserveAspectRatio="none" fill="none">
            <path d="M0,60 C50,10 150,90 200,40 L200,120 L0,120 Z" fill="#3B82F6" />
            <path d="M0,80 C60,40 140,110 200,60 L200,120 L0,120 Z" fill="#6366F1" />
          </svg>
        </div>

        {/* Profile Section: Einstein Yathipathi */}
        <div className="p-3 border-t border-slate-800/80 relative z-10">
          <div 
            onClick={() => onSelectTab('settings')}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                EY
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white leading-tight truncate">
                  Einstein Yathipathi
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  HR Analytics
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
};
