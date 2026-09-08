import React, { useEffect, useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  CalendarPlus, 
  FileText, 
  RefreshCw,
  Plus,
  Check,
  ShieldAlert,
  Sliders,
  Activity,
  Flame,
  Zap,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from 'recharts';
import { EmployeeDetail, EmployeeNote, EmployeeTask, EmployeeDigitalTwinData } from '../../types';
import { api } from '../../services/api';

interface EmployeeDetailModalProps {
  employeeId: string | null;
  onClose: () => void;
  onRetrainSuccess?: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employeeId,
  onClose,
}) => {
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'tasks' | 'digital_twin'>('overview');
  
  // Real Notes State
  const [notesList, setNotesList] = useState<EmployeeNote[]>([]);
  const [noteContent, setNoteContent] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);

  // Real Tasks State
  const [tasksList, setTasksList] = useState<EmployeeTask[]>([]);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('Performance Review');
  const [taskDueDate, setTaskDueDate] = useState<string>('');
  const [isSavingTask, setIsSavingTask] = useState<boolean>(false);

  // Digital Twin & What-If State
  const [digitalTwin, setDigitalTwin] = useState<EmployeeDigitalTwinData | null>(null);
  const [interventionWorkload, setInterventionWorkload] = useState<number>(-10);
  const [interventionHours, setInterventionHours] = useState<number>(-3);
  const [interventionAttendance, setInterventionAttendance] = useState<number>(5);
  const [interventionEngagement, setInterventionEngagement] = useState<number>(6);
  const [interventionSkill, setInterventionSkill] = useState<number>(8);
  const [simulatedTwinOutcome, setSimulatedTwinOutcome] = useState<any>(null);

  const fetchEmployeeData = () => {
    if (!employeeId) return;
    setLoading(true);
    Promise.all([
      api.getEmployeeDetail(employeeId),
      api.getEmployeeNotes(employeeId),
      api.getEmployeeTasks(employeeId),
      api.getEmployeeDigitalTwin(employeeId)
    ])
      .then(([empData, notesData, tasksData, twinData]) => {
        setEmployee(empData);
        setNotesList(notesData || []);
        setTasksList(tasksData || []);
        setDigitalTwin(twinData || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const runInterventionSimulation = async () => {
    if (!employeeId) return;
    try {
      const outcome = await api.simulateEmployeeIntervention(employeeId, {
        workload_delta: interventionWorkload,
        hours_delta: interventionHours,
        attendance_delta: interventionAttendance,
        engagement_delta: interventionEngagement,
        skill_delta: interventionSkill
      });
      setSimulatedTwinOutcome(outcome);
    } catch (err) {
      console.error('Failed to simulate intervention:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'digital_twin' && employeeId) {
      runInterventionSimulation();
    }
  }, [activeTab, interventionWorkload, interventionHours, interventionAttendance, interventionEngagement, interventionSkill, employeeId]);

  useEffect(() => {
    fetchEmployeeData();
  }, [employeeId]);

  if (!employeeId) return null;

  const handleAddNote = async () => {
    if (!noteContent.trim() || !employeeId) return;
    setIsSavingNote(true);
    try {
      const newNote = await api.addEmployeeNote(employeeId, noteContent.trim());
      setNotesList([newNote, ...notesList]);
      setNoteContent('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !employeeId) return;
    setIsSavingTask(true);
    try {
      const newTask = await api.createEmployeeTask(employeeId, {
        title: taskTitle.trim(),
        task_type: taskType,
        due_date: taskDueDate || 'Next Cycle'
      });
      setTasksList([newTask, ...tasksList]);
      setTaskTitle('');
      setTaskDueDate('');
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: EmployeeTask) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const updated = await api.updateEmployeeTask(employeeId, task.id, { status: nextStatus });
      setTasksList(tasksList.map(t => t.id === task.id ? updated : t));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Progression bars for baseline vs current vs predicted
  const progressionData = employee ? [
    { stage: 'Baseline Cycle', value: employee.previous_productivity, color: '#94A3B8' },
    { stage: 'Current Output', value: employee.productivity_score, color: '#3B82F6' },
    { stage: 'AI Predicted', value: employee.predicted_productivity, color: '#8B5CF6' }
  ] : [];

  const riskLevel = employee?.risk_level || (employee?.risk_score && employee.risk_score >= 70 ? 'High' : (employee?.risk_score && employee.risk_score >= 30 ? 'Moderate' : 'Low'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              {employee ? employee.employee_name.slice(0, 2).toUpperCase() : 'EM'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {employee?.employee_name || 'Loading Profile...'}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  {employee?.employee_id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {employee?.role} · <span className="font-semibold text-slate-700">{employee?.department}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>HR Notes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600">
              {notesList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Review Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600">
              {tasksList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('digital_twin')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'digital_twin'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Digital Twin & What-If</span>
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-sm font-medium">Loading employee intelligence profile...</p>
          </div>
        ) : employee ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {activeTab === 'overview' && (
              <>
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">Current Output</span>
                    <span className="text-xl font-bold text-slate-900">{employee.productivity_score}%</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80">
                    <span className="text-[11px] font-medium text-blue-600 block mb-1">Forecasted Score</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-blue-700">{employee.predicted_productivity}%</span>
                      <span className={`text-[11px] font-semibold ${employee.prediction_change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {employee.prediction_change_pct >= 0 ? `+${employee.prediction_change_pct}%` : `${employee.prediction_change_pct}%`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">Performance Status</span>
                    <span className="text-lg font-bold text-slate-800">
                      {employee.status || (employee.productivity_score >= 80 ? 'High' : (employee.productivity_score >= 50 ? 'Medium' : 'Low'))}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">Risk Tier (Score)</span>
                    <span className={`text-lg font-bold ${riskLevel === 'High' ? 'text-rose-600' : (riskLevel === 'Moderate' ? 'text-amber-600' : 'text-emerald-600')}`}>
                      {riskLevel} ({employee.risk_score})
                    </span>
                  </div>
                </div>

                {/* AI Explanation Box */}
                <div className="p-4.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-purple-50/30 border border-indigo-200/70">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                      Predictive Explanation & Diagnostic
                    </h4>
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                    {employee.ai_explanation}
                  </p>
                </div>

                {/* Cycle Comparison Bar Chart (Truthful Output Progression) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 tracking-tight">
                        Productivity Progression Across Evaluation Cycles
                      </h4>
                      <p className="text-[10px] text-slate-400">Baseline review vs current observation vs machine learning forecast</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Confidence: {employee.prediction_confidence}%
                    </span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs">
                                  <p className="font-semibold text-slate-300">{label}</p>
                                  <p className="text-white font-bold text-sm">{payload[0].value}%</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {progressionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Operational Vectors & Contributing Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contributing Factors */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800">
                      Primary Predictive Drivers
                    </h4>
                    <div className="space-y-2">
                      {employee.key_factors.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div>
                            <div className="font-semibold text-slate-800">{f.factor}</div>
                            <div className="text-[10px] text-slate-400">{f.description}</div>
                          </div>
                          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${f.direction === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {f.direction === 'positive' ? `+${f.impact_pct}%` : `-${f.impact_pct}%`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workforce Attributes */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800">
                      Observed Attributes
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2 rounded-xl bg-slate-50">
                        <span className="text-slate-400 text-[10px] block">Attendance</span>
                        <span className="font-bold text-slate-800">{employee.attendance}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50">
                        <span className="text-slate-400 text-[10px] block">Workload</span>
                        <span className="font-bold text-slate-800">{employee.workload} / 100</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50">
                        <span className="text-slate-400 text-[10px] block">Engagement</span>
                        <span className="font-bold text-slate-800">{employee.engagement}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50">
                        <span className="text-slate-400 text-[10px] block">Skill Level</span>
                        <span className="font-bold text-slate-800">{employee.skill_level}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50">
                        <span className="text-slate-400 text-[10px] block">Experience</span>
                        <span className="font-bold text-slate-800">{employee.experience} yrs</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50">
                        <span className="text-slate-400 text-[10px] block">Completed Tasks</span>
                        <span className="font-bold text-slate-800">{employee.tasks_completed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: Real Database-Backed HR Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Add Operational Note</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write an HR observation or follow-up note..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={isSavingNote || !noteContent.trim()}
                      className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
                    >
                      {isSavingNote ? 'Saving...' : 'Add Note'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 px-1">Note History</h4>
                  {notesList.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 bg-white rounded-xl border border-slate-100 text-center">
                      No notes recorded yet for this employee.
                    </p>
                  ) : (
                    notesList.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-blue-600">{n.author}</span>
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Real Database-Backed Review Tasks */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Assign New Performance Task</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Task Title (e.g. 1-on-1 Workload Sync)"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Performance Review">Performance Review</option>
                      <option value="Workload Balancing">Workload Balancing</option>
                      <option value="Mentorship & Coaching">Mentorship & Coaching</option>
                      <option value="Skill Training">Skill Training</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Due Date (e.g. Next Sprint)"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <button
                    onClick={handleCreateTask}
                    disabled={isSavingTask || !taskTitle.trim()}
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isSavingTask ? 'Creating...' : 'Assign Review Task'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 px-1">Assigned Tasks</h4>
                  {tasksList.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 bg-white rounded-xl border border-slate-100 text-center">
                      No active review tasks assigned to this employee.
                    </p>
                  ) : (
                    tasksList.map((t) => (
                      <div 
                        key={t.id} 
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          t.status === 'Completed' 
                            ? 'bg-slate-50/80 border-slate-200 text-slate-400' 
                            : 'bg-white border-slate-200/90 text-slate-800 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleTaskStatus(t)}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                              t.status === 'Completed'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-slate-400 bg-white'
                            }`}
                          >
                            {t.status === 'Completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <p className={`text-xs font-semibold ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {t.title}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {t.task_type} · Due: {t.due_date || 'Ongoing'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'digital_twin' && (
              <div className="space-y-6">
                {/* 1. Trajectory Forecast Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        Predictive Digital Twin Trajectory (30 & 90 Days)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Multi-horizon forecast calibrated with calibrated model weights and behavioral drag factors.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Trajectory: {digitalTwin?.predicted_state?.trajectory_status || 'Stable'}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Confidence: {digitalTwin?.predicted_state?.confidence_score || 91.5}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] font-medium text-slate-500 block mb-1">Current Output</span>
                      <span className="text-xl font-bold text-slate-900">{digitalTwin?.current_state?.productivity ?? employee.productivity_score}%</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">Live Ground Truth</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/80">
                      <span className="text-[11px] font-medium text-indigo-600 block mb-1">30-Day Forecast</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold text-indigo-900">
                          {digitalTwin?.predicted_state?.day_30_forecast ?? employee.predicted_productivity}%
                        </span>
                      </div>
                      <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Short-Horizon Run Rate</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80">
                      <span className="text-[11px] font-medium text-blue-600 block mb-1">90-Day Forecast</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold text-blue-900">
                          {digitalTwin?.predicted_state?.day_90_forecast ?? employee.predicted_productivity}%
                        </span>
                      </div>
                      <div className="text-[10px] text-blue-600 font-medium mt-0.5">Quarterly Equilibrium</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] font-medium text-slate-500 block mb-1">Risk Trajectory</span>
                      <span className={`text-base font-bold ${
                        (digitalTwin?.predicted_state?.risk_trajectory === 'Increasing') ? 'text-rose-600' : 'text-slate-800'
                      }`}>
                        {digitalTwin?.predicted_state?.risk_trajectory || 'Stable'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">Telemetry Drift</div>
                    </div>
                  </div>
                </div>

                {/* 2. Behavioral Pressure Indicators */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Behavioral Pressure Indicators
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {digitalTwin?.pressure_signals?.map((sig, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {sig.signal}
                        </div>
                        <div className="text-lg font-black text-slate-900 mt-1">
                          {sig.value}
                        </div>
                        <span className={`mt-1.5 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          sig.severity === 'high'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : sig.severity === 'medium'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {sig.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. AI Explainability Waterfall */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    Feature Attribution Waterfall (Drivers vs. Drag Factors)
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                    {digitalTwin?.explainability_waterfall?.map((feat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              feat.type === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />
                            <span className="font-bold text-slate-800">{feat.feature}</span>
                            <span className="text-[11px] text-slate-400">({feat.evidence})</span>
                          </div>
                          <span className={`font-mono font-bold text-xs ${
                            feat.type === 'positive' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {feat.impact_pct >= 0 ? `+${feat.impact_pct}%` : `${feat.impact_pct}%`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${feat.type === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, Math.abs(feat.impact_pct) * 10)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. In-Profile What-If Intervention Simulator */}
                <div className="p-5 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 rounded-2xl border border-indigo-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-indigo-600" />
                        In-Profile What-If Intervention Simulator
                      </h4>
                      <p className="text-[11px] text-indigo-900/70">
                        Adjust work conditions to simulate real-time flight risk mitigation and output gain.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setInterventionWorkload(0);
                        setInterventionHours(0);
                        setInterventionAttendance(0);
                        setInterventionEngagement(0);
                        setInterventionSkill(0);
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Reset Levers
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Workload */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Workload Delta</span>
                        <span className="font-bold text-indigo-700 font-mono">
                          {interventionWorkload > 0 ? `+${interventionWorkload}%` : `${interventionWorkload}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        step="5"
                        value={interventionWorkload}
                        onChange={(e) => setInterventionWorkload(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Hours */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Weekly Hours Delta</span>
                        <span className="font-bold text-indigo-700 font-mono">
                          {interventionHours > 0 ? `+${interventionHours}h` : `${interventionHours}h`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="1"
                        value={interventionHours}
                        onChange={(e) => setInterventionHours(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Skill */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">Upskilling Training</span>
                        <span className="font-bold text-indigo-700 font-mono">
                          +{interventionSkill}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="2"
                        value={interventionSkill}
                        onChange={(e) => setInterventionSkill(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Simulated Outcome Banner */}
                  {simulatedTwinOutcome && (
                    <div className="p-3.5 bg-white rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Simulated Output</span>
                          <span className="text-lg font-black text-indigo-900">
                            {simulatedTwinOutcome.simulated_productivity}%
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 ml-1">
                            ({simulatedTwinOutcome.productivity_delta >= 0 ? '+' : ''}{simulatedTwinOutcome.productivity_delta}%)
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Flight Risk Exposure</span>
                          <span className="text-lg font-black text-rose-600">
                            {simulatedTwinOutcome.simulated_flight_risk}%
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 ml-1">
                            ({simulatedTwinOutcome.risk_delta}%)
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Projected Tier</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {simulatedTwinOutcome.simulated_status}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium">
                        Live intervention model calibrated by <strong>NARASIMHA</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Footer with Real Export Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Export Dossier:
            </span>
            <button
              onClick={() => api.triggerExportEmployeeDossier(employeeId, 'pdf')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-rose-600" />
              <span>PDF Report</span>
            </button>
            <button
              onClick={() => api.triggerExportEmployeeDossier(employeeId, 'csv')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => api.triggerExportEmployeeDossier(employeeId, 'json')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
