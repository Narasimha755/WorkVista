import React from 'react';
import { Award, Layers } from 'lucide-react';

interface IsometricMatrixCardProps {
  highPerformersCount?: number;
  totalEmployees?: number;
  onMaximize?: () => void;
}

export const IsometricMatrixCard: React.FC<IsometricMatrixCardProps> = ({
  highPerformersCount = 235,
  totalEmployees = 520,
  onMaximize,
}) => {
  const highRatio = Math.round((highPerformersCount / (totalEmployees || 1)) * 100);

  // Clustered 3D columns configuration
  const columns = [
    { height: 28, color: 'from-cyan-500 to-cyan-300', shadow: 'rgba(0,240,255,0.4)' },
    { height: 42, color: 'from-blue-600 to-indigo-400', shadow: 'rgba(59,130,246,0.4)' },
    { height: 35, color: 'from-purple-500 to-pink-400', shadow: 'rgba(168,85,247,0.4)' },
    { height: 58, color: 'from-amber-400 to-yellow-300', shadow: 'rgba(245,158,11,0.4)' },
    { height: 48, color: 'from-pink-500 to-rose-400', shadow: 'rgba(244,63,94,0.4)' },
    { height: 65, color: 'from-cyan-400 to-emerald-300', shadow: 'rgba(16,185,129,0.4)' },
    { height: 38, color: 'from-indigo-500 to-blue-400', shadow: 'rgba(99,102,241,0.4)' },
  ];

  return (
    <div 
      onClick={onMaximize}
      className="bg-[#090E1F]/90 border border-cyan-500/20 hover:border-cyan-400/40 rounded-2xl p-3.5 shadow-lg shadow-black/40 backdrop-blur-md relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 tracking-wide text-[11px] uppercase">
            Cognitive Contribution <strong className="text-amber-400 font-mono">({highPerformersCount})</strong>
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
          <Layers className="w-3 h-3 text-amber-400" />
          <span>Integrated Sub-metrics ({highRatio}%)</span>
        </div>
      </div>

      {/* Visual Body: Clustered 3D Bars Left + Sub-metric Legend Right */}
      <div className="flex items-end justify-between gap-3 mt-2 pt-1">
        {/* 3D Tiered Bars */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex items-end gap-1.5 h-16 px-1">
            {columns.map((col, idx) => (
              <div 
                key={idx} 
                className="flex-1 flex flex-col items-center justify-end h-full group-hover:scale-y-105 transition-transform origin-bottom"
              >
                {/* 3D Bar top bevel */}
                <div 
                  className={`w-full rounded-t-sm bg-gradient-to-t ${col.color}`}
                  style={{ 
                    height: `${col.height}%`,
                    boxShadow: `0 0 10px ${col.shadow}` 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Bottom scale ticks */}
          <div className="flex justify-between w-full text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-800">
            <span>3</span>
            <span>6</span>
            <span>12</span>
            <span>18</span>
            <span>24</span>
          </div>
        </div>

        {/* Legend */}
        <div className="text-[9px] space-y-1 font-mono text-slate-400 pl-1 border-l border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Ascending <strong className="text-slate-200">55%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span>Continuous <strong className="text-slate-200">58%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Complexes <strong className="text-slate-200">58%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Confidence <strong className="text-slate-200">92%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
