import React, { useEffect, useRef } from 'react';
import { Sparkles, ChevronDown, ArrowRight, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ExecutiveAlert } from '../../types';

interface CognitiveInsightMeshProps {
  alerts?: ExecutiveAlert[];
  onTriggerAction?: (actionType?: string, dept?: string) => void;
  onOpenCopilot?: (query: string) => void;
  onOpenScenarioPlanner?: (dept: string) => void;
}

export const CognitiveInsightMesh: React.FC<CognitiveInsightMeshProps> = ({
  alerts = [],
  onTriggerAction,
  onOpenCopilot,
  onOpenScenarioPlanner,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated neural synaptic filaments canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const nodes = [
      { x: 0.18, y: 0.25, color: '#00F0FF' },
      { x: 0.72, y: 0.22, color: '#FF2D85' },
      { x: 0.45, y: 0.52, color: '#A855F7' },
      { x: 0.22, y: 0.78, color: '#00F0FF' },
      { x: 0.82, y: 0.68, color: '#F59E0B' },
      { x: 0.52, y: 0.85, color: '#10B981' },
    ];

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      time += 0.015;

      // Draw bezier synaptic connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const x1 = n1.x * w;
          const y1 = n1.y * h;
          const x2 = n2.x * w;
          const y2 = n2.y * h;

          const cx = (x1 + x2) / 2 + Math.sin(time + i) * 18;
          const cy = (y1 + y2) / 2 + Math.cos(time + j) * 18;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cx, cy, x2, y2);

          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
          grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.45)');
          grad.addColorStop(1, 'rgba(255, 45, 133, 0.35)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Traveling pulse photon
          const t = (Math.sin(time * 2 + i * 1.5) + 1) / 2;
          const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
          const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="bg-[#090E1F]/90 border border-cyan-500/20 hover:border-cyan-400/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between transition-all">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header matching image */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div>
          <h3 className="text-base font-extrabold tracking-wide text-white flex items-center gap-2">
            Cognitive Insight Mesh
          </h3>
          <p className="text-xs text-slate-400">
            Key insight streams and recommended autonomous actions
          </p>
        </div>

        {/* Quick filter dropdown */}
        <button className="px-3 py-1.5 rounded-full font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-slate-500 text-xs flex items-center gap-1.5 transition-all">
          <span>Quick filter</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Interactive Synapse Network Canvas & Floating Insight Badges */}
      <div className="relative mt-3 h-[280px] w-full overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={450}
          height={280}
          className="w-full h-full object-cover"
        />

        {/* Floating Node 1: Top Left */}
        <div 
          onClick={() => onOpenScenarioPlanner && onOpenScenarioPlanner('Operations')}
          className="absolute top-3 left-4 max-w-[190px] p-2 rounded-xl bg-[#0B1528]/85 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:scale-105 transition-all cursor-pointer z-20 group"
        >
          <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-cyan-400">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Capacity Action</span>
          </div>
          <p className="text-[10px] text-slate-200 line-clamp-2 mt-0.5 leading-tight">
            Rebalance Operations workload to mitigate overload strain.
          </p>
        </div>

        {/* Floating Node 2: Top Right (Recommended autonomous actions) */}
        <div 
          onClick={() => onOpenScenarioPlanner && onOpenScenarioPlanner('All')}
          className="absolute top-4 right-4 max-w-[200px] p-2 rounded-xl bg-[#1D0D24]/85 border border-pink-400/60 shadow-[0_0_12px_rgba(255,45,133,0.3)] hover:scale-105 transition-all cursor-pointer z-20 group"
        >
          <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-pink-400">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>Autonomous Rec</span>
          </div>
          <p className="text-[10px] text-slate-200 line-clamp-2 mt-0.5 leading-tight">
            Recommended autonomous actions: 1-on-1 coaching for at-risk talent.
          </p>
        </div>

        {/* Floating Node 3: Center Mid (Data increment) */}
        <div 
          onClick={() => onOpenCopilot && onOpenCopilot('What are the strongest productivity drivers across the org?')}
          className="absolute top-1/2 left-3 -translate-y-1/2 max-w-[180px] p-2 rounded-xl bg-[#141228]/85 border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.3)] hover:scale-105 transition-all cursor-pointer z-20 group"
        >
          <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-purple-400">
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
            <span>Driver Alignment</span>
          </div>
          <p className="text-[10px] text-slate-200 line-clamp-2 mt-0.5 leading-tight">
            Attendance adherence and skill mastery driving 74% output gain.
          </p>
        </div>

        {/* Floating Node 4: Center Right (Recommended critical) */}
        <div 
          onClick={() => onOpenCopilot && onOpenCopilot('Who are the highest flight risk employees?')}
          className="absolute top-1/2 right-3 -translate-y-1/2 max-w-[190px] p-2 rounded-xl bg-[#221008]/85 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)] hover:scale-105 transition-all cursor-pointer z-20 group"
        >
          <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-amber-400">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Flight Risk Alert</span>
          </div>
          <p className="text-[10px] text-slate-200 line-clamp-2 mt-0.5 leading-tight">
            Deploy retention protocols for flagged engineering specialists.
          </p>
        </div>

        {/* Floating Node 5: Bottom Center */}
        <div 
          onClick={() => onOpenScenarioPlanner && onOpenScenarioPlanner('Engineering')}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 max-w-[210px] p-2 rounded-xl bg-[#081822]/85 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:scale-105 transition-all cursor-pointer z-20 group text-center"
        >
          <p className="text-[10px] font-semibold text-cyan-200">
            Data streams: recommended autonomous policy execution
          </p>
        </div>
      </div>
    </div>
  );
};
