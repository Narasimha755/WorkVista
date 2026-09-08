import React from 'react';
import { Flame, TrendingDown } from 'lucide-react';

interface FrictionWaveformCardProps {
  atRiskCount?: number;
  onMaximize?: () => void;
}

export const FrictionWaveformCard: React.FC<FrictionWaveformCardProps> = ({
  atRiskCount = 18,
  onMaximize,
}) => {
  return (
    <div 
      onClick={onMaximize}
      className="bg-[#090E1F]/90 border border-cyan-500/20 hover:border-cyan-400/40 rounded-2xl p-3.5 shadow-lg shadow-black/40 backdrop-blur-md relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 tracking-wide text-[11px] uppercase">
            Operational Friction <strong className="text-rose-400 font-mono">(At Risk - {atRiskCount})</strong>
          </span>
        </div>
        <div className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-0.5">
          <TrendingDown className="w-3 h-3 text-rose-400" />
          <span>Burnout & Flight Strain</span>
        </div>
      </div>

      {/* Visual Body: Neon EKG Cardiogram Waveform */}
      <div className="mt-2 pt-1 relative h-20 flex items-center justify-center">
        <svg className="w-full h-16 overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ekgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="40%" stopColor="#00F0FF" />
              <stop offset="65%" stopColor="#FF2D85" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
            <filter id="glowEkg" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid Lines */}
          <line x1="0" y1="30" x2="200" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="50" y1="0" x2="50" y2="60" stroke="rgba(255,255,255,0.04)" />
          <line x1="100" y1="0" x2="100" y2="60" stroke="rgba(255,255,255,0.04)" />
          <line x1="150" y1="0" x2="150" y2="60" stroke="rgba(255,255,255,0.04)" />

          {/* EKG Path */}
          <path
            d="M 0 30 L 25 30 L 30 18 L 35 40 L 40 30 L 60 30 L 65 6 L 75 54 L 85 24 L 95 38 L 105 30 L 130 30 L 140 12 L 150 48 L 160 30 L 175 42 L 190 52"
            fill="none"
            stroke="url(#ekgGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowEkg)"
          />

          {/* Glowing Callout Dot at the drop */}
          <circle cx="190" cy="52" r="4.5" fill="#FF2D85" style={{ filter: 'drop-shadow(0 0 6px #FF2D85)' }} />
          <circle cx="190" cy="52" r="2" fill="#FFFFFF" />
        </svg>

        {/* Floating Callout Number */}
        <div className="absolute right-1 bottom-0 bg-rose-950/80 border border-rose-500/60 rounded px-1.5 py-0.5 text-[10px] font-mono font-black text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.6)]">
          {atRiskCount}
        </div>
      </div>

      {/* Axis ticks */}
      <div className="flex justify-between w-full text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-800">
        <span>0</span>
        <span>10</span>
        <span>20</span>
        <span>30</span>
        <span>50</span>
      </div>
    </div>
  );
};
