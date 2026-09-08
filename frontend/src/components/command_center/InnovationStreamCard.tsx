import React from 'react';
import { Sparkles } from 'lucide-react';

interface InnovationStreamCardProps {
  score?: number;
  onMaximize?: () => void;
}

export const InnovationStreamCard: React.FC<InnovationStreamCardProps> = ({
  score = 120,
  onMaximize,
}) => {
  return (
    <div 
      onClick={onMaximize}
      className="bg-[#090E1F]/90 border border-cyan-500/20 hover:border-cyan-400/40 rounded-2xl p-3.5 shadow-lg shadow-black/40 backdrop-blur-md relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 tracking-wide text-[11px] uppercase">
            Predicted Innovation Index <strong className="text-cyan-400 font-mono">({score})</strong>
          </span>
        </div>
        <div className="text-[10px] text-purple-400 font-semibold flex items-center gap-1 mt-0.5">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Confidence Stream Graph</span>
        </div>
      </div>

      {/* Visual Body: Sinuous Multi-layer Streamgraph */}
      <div className="mt-2 pt-1 relative h-20 flex items-center justify-center">
        <svg className="w-full h-16 overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
          <defs>
            <linearGradient id="streamGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.4)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.05)" />
            </linearGradient>
            <linearGradient id="streamPink" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.4)" />
              <stop offset="100%" stopColor="rgba(244, 63, 94, 0.05)" />
            </linearGradient>
            <linearGradient id="streamCyan" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 240, 255, 0.45)" />
              <stop offset="100%" stopColor="rgba(0, 240, 255, 0.05)" />
            </linearGradient>
          </defs>

          {/* Top Layer (Gold) */}
          <path
            d="M 0 35 Q 35 15, 70 30 T 140 18 T 200 5 L 200 60 L 0 60 Z"
            fill="url(#streamGold)"
          />
          <path
            d="M 0 35 Q 35 15, 70 30 T 140 18 T 200 5"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 4px #F59E0B)' }}
          />

          {/* Middle Layer (Magenta/Pink) */}
          <path
            d="M 0 42 Q 40 25, 80 40 T 150 28 T 200 16 L 200 60 L 0 60 Z"
            fill="url(#streamPink)"
          />
          <path
            d="M 0 42 Q 40 25, 80 40 T 150 28 T 200 16"
            fill="none"
            stroke="#FF2D85"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 4px #FF2D85)' }}
          />

          {/* Front Layer (Cyan) */}
          <path
            d="M 0 48 Q 45 32, 90 46 T 160 36 T 200 25 L 200 60 L 0 60 Z"
            fill="url(#streamCyan)"
          />
          <path
            d="M 0 48 Q 45 32, 90 46 T 160 36 T 200 25"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="1.8"
            style={{ filter: 'drop-shadow(0 0 5px #00F0FF)' }}
          />
        </svg>
      </div>

      {/* Axis ticks */}
      <div className="flex justify-between w-full text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-800">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
        <span>250</span>
        <span>300</span>
      </div>
    </div>
  );
};
