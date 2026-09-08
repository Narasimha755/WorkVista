import React, { useEffect, useRef } from 'react';
import { TrendingUp, Globe } from 'lucide-react';

interface HolographicGlobeCardProps {
  totalCount?: number;
  velocityPct?: number;
  onMaximize?: () => void;
}

export const HolographicGlobeCard: React.FC<HolographicGlobeCardProps> = ({
  totalCount = 520,
  velocityPct = 4.8,
  onMaximize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Revolving Particle Globe Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    const radius = 32;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Generate points on a sphere
    const points: { phi: number; theta: number }[] = [];
    const numPoints = 120;
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      points.push({ phi, theta });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rotation += 0.015;

      // Glow backdrop
      const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius + 10);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      grad.addColorStop(0.8, 'rgba(244, 63, 94, 0.1)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw latitude / longitude wire rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.4, rotation * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Project points
      points.forEach((pt) => {
        const rotTheta = pt.theta + rotation;
        const x = radius * Math.sin(pt.phi) * Math.cos(rotTheta);
        const y = radius * Math.sin(pt.phi) * Math.sin(rotTheta);
        const z = radius * Math.cos(pt.phi);

        // Perspective projection
        const scale = 1 + z / (radius * 2.5);
        const projX = centerX + x;
        const projY = centerY + z * 0.9;

        const alpha = Math.max(0.15, (z + radius) / (radius * 2));
        ctx.fillStyle = z > 0 ? `rgba(0, 240, 255, ${alpha})` : `rgba(244, 63, 94, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(0.8, 1.4 * scale), 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Ascending bar stream heights
  const bars = [12, 18, 24, 32, 42, 54, 68, 85, 105, 128, 155, 185];

  return (
    <div 
      onClick={onMaximize}
      className="bg-[#090E1F]/90 border border-cyan-500/20 hover:border-cyan-400/40 rounded-2xl p-3.5 shadow-lg shadow-black/40 backdrop-blur-md relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 tracking-wide text-[11px] uppercase flex items-center gap-1.5">
            Dynamic Talent Velocity <strong className="text-cyan-400 font-mono">({totalCount})</strong>
          </span>
        </div>
        <div className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 mt-0.5">
          <TrendingUp className="w-3 h-3 text-cyan-400" />
          <span>Ascending (+{velocityPct}%)</span>
        </div>
      </div>

      {/* Visual Body: Globe Left + Ascending Bars Right */}
      <div className="flex items-end justify-between gap-2 mt-2 pt-1">
        {/* Revolving Globe Canvas */}
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <canvas ref={canvasRef} width={80} height={80} className="w-20 h-20" />
        </div>

        {/* Ascending Glow Bars */}
        <div className="flex-1 flex flex-col justify-end items-end pb-1">
          <div className="text-[10px] font-mono font-black text-cyan-300 pr-1 mb-1">
            {totalCount}
          </div>
          <div className="flex items-end gap-1 w-full justify-end h-16">
            {bars.map((h, i) => (
              <div 
                key={i} 
                className="w-1.5 rounded-t-sm transition-all duration-300 bg-gradient-to-t from-cyan-900/60 via-cyan-500 to-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                style={{ height: `${(h / 190) * 100}%` }}
              />
            ))}
          </div>
          {/* Axis labels */}
          <div className="flex justify-between w-full text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-800">
            <span>0</span>
            <span>100</span>
            <span>300</span>
            <span>500</span>
            <span>{totalCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
