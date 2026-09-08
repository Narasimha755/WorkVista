import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

interface ResilienceDonutCardProps {
  resilienceScore?: number;
  riskScore?: number;
  onMaximize?: () => void;
}

export const ResilienceDonutCard: React.FC<ResilienceDonutCardProps> = ({
  resilienceScore = 82,
  riskScore = 18,
  onMaximize,
}) => {
  // SVG circular arc calculations
  const size = 84;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (resilienceScore / 100) * circumference;

  // Mini risk arc calculation
  const riskArcLength = Math.PI * 18;
  const riskOffset = riskArcLength - (riskScore / 100) * riskArcLength;

  return (
    <div 
      onClick={onMaximize}
      className="bg-[#090E1F]/90 border border-cyan-500/20 hover:border-cyan-400/40 rounded-2xl p-3.5 shadow-lg shadow-black/40 backdrop-blur-md relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 tracking-wide text-[11px] uppercase">
            Systemic Resilience <strong className="text-cyan-400 font-mono">({resilienceScore}%)</strong>
          </span>
        </div>
        <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>Workforce Pulse &bull; Optimal</span>
        </div>
      </div>

      {/* Visual Body: Triple Ring Radial Donut Center-Left + Mini Risk Arc Right */}
      <div className="flex items-center justify-around gap-2 mt-2 pt-1">
        {/* Main Triple Radial Ring */}
        <div className="relative w-22 h-22 flex items-center justify-center">
          <svg className="w-22 h-22 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Outer faint track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Middle decorative neon ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius - 6}
              stroke="rgba(168, 85, 247, 0.25)"
              strokeWidth={1.5}
              fill="transparent"
              strokeDasharray="3 4"
            />
            {/* Glowing progress arc */}
            <defs>
              <linearGradient id="resilienceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#FF2D85" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#resilienceGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.6))' }}
            />
          </svg>

          {/* Central score label */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              {resilienceScore}%
            </span>
          </div>
        </div>

        {/* Mini Speedo Risk Arc */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-16 h-10 flex items-center justify-center">
            <svg className="w-16 h-10" viewBox="0 0 44 24">
              {/* Semi-circle background */}
              <path
                d="M 4 22 A 18 18 0 0 1 40 22"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              {/* Risk gradient arc */}
              <defs>
                <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
              <path
                d="M 4 22 A 18 18 0 0 1 40 22"
                fill="none"
                stroke="url(#riskGrad)"
                strokeWidth="4"
                strokeDasharray={Math.PI * 18}
                strokeDashoffset={riskOffset}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(244, 63, 94, 0.5))' }}
              />
            </svg>
          </div>
          <span className="text-[9px] font-bold font-mono uppercase text-slate-400 tracking-wider">
            Risk: <strong className="text-rose-400">{riskScore}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
