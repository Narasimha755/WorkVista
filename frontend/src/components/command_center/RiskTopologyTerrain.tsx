import React, { useEffect, useRef, useState } from 'react';
import { Layers, ChevronDown, Filter } from 'lucide-react';

interface RiskTopologyTerrainProps {
  onSelectDepartment?: (dept: string) => void;
  onOpenScenarioPlanner?: (dept: string) => void;
}

export const RiskTopologyTerrain: React.FC<RiskTopologyTerrainProps> = ({
  onSelectDepartment,
  onOpenScenarioPlanner,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState<'critical' | 'optimal' | 'all'>('critical');

  // Interactive 3D Wireframe Terrain Projection on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const cols = 36;
    const rows = 26;

    // Peak centers: Peak 1 (Engineering: hot critical), Peak 2 (Operations: warm high), Peak 3 (Sales: calm)
    const peak1 = { x: 11, y: 13, h: 58, sigma: 3.8 }; // Engineering Hot Zone
    const peak2 = { x: 23, y: 11, h: 44, sigma: 4.5 }; // Operations/Corporate Warm Peak
    const peak3 = { x: 28, y: 18, h: 22, sigma: 3.5 }; // Sales valley

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      // Ambient background glow
      const bgGrad = ctx.createRadialGradient(width * 0.35, height * 0.45, 10, width * 0.35, height * 0.5, width * 0.5);
      bgGrad.addColorStop(0, 'rgba(255, 45, 133, 0.12)');
      bgGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.05)');
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 3D Isometric / Perspective Grid Projection
      const gridPoints: { x: number; y: number; z: number; projX: number; projY: number }[][] = [];

      const xSpacing = width * 1.05 / cols;
      const ySpacing = height * 0.65 / rows;
      const xOffset = width * 0.08;
      const yOffset = height * 0.28;

      // Generate heights and 3D projected coords
      for (let r = 0; r < rows; r++) {
        gridPoints[r] = [];
        for (let c = 0; c < cols; c++) {
          // Distance to peaks
          const d1 = Math.hypot(c - peak1.x, r - peak1.y);
          const d2 = Math.hypot(c - peak2.x, r - peak2.y);
          const d3 = Math.hypot(c - peak3.x, r - peak3.y);

          // Gaussian peaks + gentle undulating sine wave
          const z1 = peak1.h * Math.exp(-(d1 * d1) / (2 * peak1.sigma * peak1.sigma));
          const z2 = peak2.h * Math.exp(-(d2 * d2) / (2 * peak2.sigma * peak2.sigma));
          const z3 = peak3.h * Math.exp(-(d3 * d3) / (2 * peak3.sigma * peak3.sigma));
          const wave = Math.sin(c * 0.35 + time) * 3 + Math.cos(r * 0.4 + time * 0.8) * 2;

          let z = z1 + z2 + z3 + wave;

          // 3D Oblique / Perspective mapping
          // Skew x based on row, project y down with z elevated
          const projX = xOffset + (c - r * 0.45) * xSpacing + (width * 0.25);
          const projY = yOffset + r * ySpacing - z * 1.5;

          gridPoints[r][c] = { x: c, y: r, z, projX, projY };
        }
      }

      // Draw wireframe mesh rows (transverse lines)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const pt1 = gridPoints[r][c];
          const pt2 = gridPoints[r][c + 1];

          ctx.beginPath();
          ctx.moveTo(pt1.projX, pt1.projY);
          ctx.lineTo(pt2.projX, pt2.projY);

          // Color based on elevation (z)
          const maxZ = Math.max(pt1.z, pt2.z);
          if (maxZ > 36) {
            ctx.strokeStyle = `rgba(255, 45, 133, ${Math.min(1, 0.4 + (maxZ - 36) / 25)})`;
            ctx.lineWidth = 1.3;
          } else if (maxZ > 20) {
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.3 + (maxZ - 20) / 30})`;
            ctx.lineWidth = 1.0;
          } else {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
            ctx.lineWidth = 0.8;
          }
          ctx.stroke();
        }
      }

      // Draw wireframe mesh columns (longitudinal lines)
      for (let c = 0; c < cols; c += 2) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const pt = gridPoints[r][c];
          if (r === 0) {
            ctx.moveTo(pt.projX, pt.projY);
          } else {
            ctx.lineTo(pt.projX, pt.projY);
          }
        }
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.16)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="bg-[#090E1F]/90 border border-cyan-500/20 hover:border-cyan-400/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between transition-all">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -left-16 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header & Controls matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <h3 className="text-base font-extrabold tracking-wide text-white flex items-center gap-2">
            Enterprise Risk Topology
          </h3>
          <p className="text-xs text-slate-400">
            Visualizes 1000 risk terrain map &bull; Elevation models department flight strain
          </p>
        </div>

        {/* Filter Badges matching image */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setActiveZoneFilter('critical')}
            className={`px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${
              activeZoneFilter === 'critical'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>Critical Anomalies</span>
          </button>

          <button
            onClick={() => setActiveZoneFilter('optimal')}
            className="px-3 py-1.5 rounded-full font-semibold bg-slate-800/80 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 flex items-center gap-1.5 transition-all"
          >
            <span>Optimal Zones</span>
            <ChevronDown className="w-3 h-3 text-cyan-400" />
          </button>

          <button
            onClick={() => setActiveZoneFilter('all')}
            className="px-3 py-1.5 rounded-full font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-slate-500 flex items-center gap-1.5 transition-all"
          >
            <span>Cool Zones</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Canvas Topography Surface */}
      <div className="relative mt-3 h-[280px] w-full flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={720}
          height={280}
          className="w-full h-full object-cover"
        />

        {/* Floating 3D Department Peak Badges matching image */}
        <div 
          onClick={() => onSelectDepartment && onSelectDepartment('Engineering')}
          className="absolute top-12 left-[36%] -translate-x-1/2 bg-[#12081C]/90 border border-pink-500/70 text-pink-300 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_12px_rgba(255,45,133,0.6)] cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5 z-20"
        >
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          <span>Engineering</span>
        </div>

        <div 
          onClick={() => onSelectDepartment && onSelectDepartment('Operations')}
          className="absolute top-18 left-[64%] -translate-x-1/2 bg-[#1C1208]/90 border border-amber-500/70 text-amber-300 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.6)] cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5 z-20"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Operations</span>
        </div>

        <div 
          onClick={() => onSelectDepartment && onSelectDepartment('Sales')}
          className="absolute bottom-16 right-[26%] bg-[#081822]/90 border border-cyan-500/70 text-cyan-300 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5 z-20"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Sales</span>
        </div>

        <div 
          onClick={() => onSelectDepartment && onSelectDepartment('Finance')}
          className="absolute top-28 left-[18%] bg-[#081224]/80 border border-indigo-500/60 text-indigo-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer hover:scale-105 transition-all z-20"
        >
          <span>Finance</span>
        </div>
      </div>

      {/* Bottom Legend matching image */}
      <div className="flex items-center gap-5 text-xs text-slate-400 pt-2 border-t border-slate-800/80 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
          <span className="text-slate-300 font-semibold text-[11px]">
            Hot-zones: <strong className="text-rose-400">Critical Anomalies</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
          <span className="text-slate-300 font-semibold text-[11px]">
            Cool-zones: <strong className="text-cyan-400">Optimal Zones</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
