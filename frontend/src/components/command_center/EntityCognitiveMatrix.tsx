import React, { useState } from 'react';
import { Search, Filter, ChevronRight, CheckSquare, Square, Sparkles } from 'lucide-react';
import { Employee } from '../../types';

interface EntityCognitiveMatrixProps {
  employees?: Employee[];
  onViewEmployee?: (id: string) => void;
}

export const EntityCognitiveMatrix: React.FC<EntityCognitiveMatrixProps> = ({
  employees = [],
  onViewEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const filtered = employees.filter(e => {
    const q = searchQuery.toLowerCase();
    const name = (e.full_name || e.employee_name || '').toLowerCase();
    const dept = (e.department || '').toLowerCase();
    const role = (e.role || '').toLowerCase();
    return name.includes(q) || dept.includes(q) || role.includes(q) || e.employee_id.toLowerCase().includes(q);
  }).slice(0, 6); // Top 6 rows as displayed in the command center screenshot

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Generate dynamic 8x3 skill matrix pixel colors based on employee telemetry
  const getSkillMatrixPixels = (emp: Employee) => {
    const seed = (emp.experience || 5) * 13 + (emp.skill_level || 75);
    const colors = ['#00F0FF', '#F59E0B', '#FF2D85', '#3B82F6', '#10B981', '#A855F7'];
    const matrix: string[][] = [];
    for (let row = 0; row < 3; row++) {
      const rowCols: string[] = [];
      for (let col = 0; col < 8; col++) {
        const cIdx = (seed + row * 7 + col * 11) % colors.length;
        rowCols.push(colors[cIdx]);
      }
      matrix.push(rowCols);
    }
    return matrix;
  };

  return (
    <div className="bg-[#090E1F]/90 border border-cyan-500/20 hover:border-cyan-400/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between transition-all">
      {/* Top Header & Search Tools matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-extrabold tracking-wide text-white flex items-center gap-2">
            Entity Cognitive Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Multi-dimensional neural competency grids, trajectory sparklines & risk factor gauges
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            Deep-Level details
          </span>

          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee details..."
              className="pl-8 pr-3 py-1 bg-[#060913] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 w-44"
            />
          </div>

          <button className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800/80">
            <tr>
              <th className="py-2.5 px-2 w-6">
                <Square className="w-3.5 h-3.5 text-slate-600" />
              </th>
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Project / Dept</th>
              <th className="py-2.5 px-3">Skill Matrices</th>
              <th className="py-2.5 px-3">Skills</th>
              <th className="py-2.5 px-3">Predicted Trajectory</th>
              <th className="py-2.5 px-3">Risk Factors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 font-mono">
            {filtered.map((emp) => {
              const isSelected = Boolean(selectedIds[emp.employee_id]);
              const matrix = getSkillMatrixPixels(emp);
              const riskVal = emp.burnout_risk_score || emp.prediction?.risk_score || (emp.risk_level === 'High' ? 68 : 22);
              const isHighRisk = riskVal >= 50;

              return (
                <tr
                  key={emp.employee_id}
                  onClick={() => onViewEmployee && onViewEmployee(emp.employee_id)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="py-2 px-2" onClick={(e) => { e.stopPropagation(); toggleSelect(emp.employee_id); }}>
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                    )}
                  </td>

                  {/* Name & ID */}
                  <td className="py-2 px-3 font-sans">
                    <div className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {emp.full_name || emp.employee_name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {emp.employee_id}
                    </div>
                  </td>

                  {/* Role / Entity */}
                  <td className="py-2 px-3 text-slate-400 font-sans text-xs">
                    {emp.role || 'Specialist'}
                  </td>

                  {/* Project / Dept */}
                  <td className="py-2 px-3 text-slate-300 font-sans text-xs">
                    {emp.department}
                  </td>

                  {/* Skill Matrices (Glowing 8x3 micro pixel matrix) */}
                  <td className="py-2 px-3">
                    <div className="flex flex-col gap-0.5 p-1 rounded bg-[#060A14] border border-slate-800 w-fit">
                      {matrix.map((row, rIdx) => (
                        <div key={rIdx} className="flex gap-0.5">
                          {row.map((color, cIdx) => (
                            <span 
                              key={cIdx} 
                              className="w-1.5 h-1.5 rounded-[1px] transition-all group-hover:brightness-125"
                              style={{ 
                                backgroundColor: color,
                                boxShadow: `0 0 3px ${color}`
                              }} 
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Skills Tag */}
                  <td className="py-2 px-3 text-slate-300 text-xs font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 text-slate-300 text-[10px]">
                      {emp.department}
                    </span>
                  </td>

                  {/* Predicted Trajectory (SVG Sparkline) */}
                  <td className="py-2 px-3">
                    <svg className="w-20 h-5 overflow-visible" viewBox="0 0 80 20">
                      <path
                        d={
                          isHighRisk
                            ? 'M 0 6 Q 20 8, 40 12 T 80 18'
                            : 'M 0 16 Q 20 14, 40 8 T 80 4'
                        }
                        fill="none"
                        stroke={isHighRisk ? '#FF2D85' : '#00F0FF'}
                        strokeWidth="1.6"
                        style={{ filter: `drop-shadow(0 0 4px ${isHighRisk ? '#FF2D85' : '#00F0FF'})` }}
                      />
                      <circle
                        cx="80"
                        cy={isHighRisk ? 18 : 4}
                        r="2"
                        fill={isHighRisk ? '#FF2D85' : '#00F0FF'}
                      />
                    </svg>
                  </td>

                  {/* Risk Factors Dual Mini-Bar Gauges */}
                  <td className="py-2 px-3">
                    <div className="space-y-1 w-24">
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <div className="w-14 bg-slate-800 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHighRisk ? 'bg-rose-500 shadow-[0_0_6px_#FF2D85]' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${Math.min(100, riskVal)}%` }}
                          />
                        </div>
                        <span className={isHighRisk ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {riskVal}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <div className="w-14 bg-slate-800 rounded-full h-1 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${Math.min(100, (emp.workload || 65))}%` }}
                          />
                        </div>
                        <span className="text-amber-400 font-bold">
                          {emp.workload || 65}%
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
