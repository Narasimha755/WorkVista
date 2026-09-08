import React from 'react';
import { Activity } from 'lucide-react';

interface StrategicAlignmentChartProps {
  onMaximize?: () => void;
}

export const StrategicAlignmentChart: React.FC<StrategicAlignmentChartProps> = ({
  onMaximize,
}) => {
  return (
    <div 
      onClick={onMaximize}
      className="bg-[#090E1F]/90 border border-cyan-500/20 hover:border-cyan-400/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all group"
    >
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header matching image */}
      <div>
        <h3 className="text-base font-extrabold tracking-wide text-white">
          Strategic Alignment Index
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Dynamic harmonic synchrony across operating cycles
        </p>
      </div>

      {/* Visual Body: Sinuous Multi-Harmonic Waves with Y-Axis */}
      <div className="flex items-center gap-2 mt-3 h-[180px]">
        {/* Y-Axis scale */}
        <div className="flex flex-col justify-between h-full text-[9px] font-mono text-slate-500 py-2 shrink-0">
          <span>100</span>
          <span>50</span>
          <span>0</span>
          <span>-50</span>
          <span>-100</span>
        </div>

        {/* SVG Harmonic Waves */}
        <div className="flex-1 h-full relative flex items-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 240 120" preserveAspectRatio="none">
            {/* Center zero line */}
            <line x1="0" y1="60" x2="240" y2="60" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

            {/* Wave 1: Cyan Harmonic */}
            <path
              d="M 0 60 C 40 20, 80 100, 120 40 C 160 -10, 200 110, 240 60"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="1.8"
              style={{ filter: 'drop-shadow(0 0 6px #00F0FF)' }}
            />

            {/* Wave 2: Gold/Amber Harmonic with filled glow area */}
            <path
              d="M 0 60 C 50 110, 90 20, 140 100 C 180 130, 210 10, 240 60"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.0"
              style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }}
            />

            {/* Wave 3: Magenta Harmonic */}
            <path
              d="M 0 60 C 30 80, 70 30, 110 85 C 150 120, 190 20, 240 60"
              fill="none"
              stroke="#FF2D85"
              strokeWidth="1.6"
              style={{ filter: 'drop-shadow(0 0 5px #FF2D85)' }}
            />

            {/* Wave 4: Purple Harmonic */}
            <path
              d="M 0 60 C 60 40, 100 80, 160 50 C 190 30, 220 70, 240 60"
              fill="none"
              stroke="#A855F7"
              strokeWidth="1.4"
              style={{ filter: 'drop-shadow(0 0 4px #A855F7)' }}
            />
          </svg>
        </div>
      </div>

      {/* Time X-Axis matching image */}
      <div className="flex justify-between w-full text-[9px] font-mono text-slate-500 pt-1.5 border-t border-slate-800">
        <span>10:00</span>
        <span>11:00</span>
        <span>13:00</span>
        <span>15:00</span>
        <span>17:00</span>
        <span>18:00</span>
        <span>19:00</span>
      </div>
    </div>
  );
};
