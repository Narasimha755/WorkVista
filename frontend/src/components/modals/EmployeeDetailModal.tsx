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
  ShieldAlert
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
import { EmployeeDetail, EmployeeNote, EmployeeTask } from '../../types';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'tasks'>('overview');
  
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

  const fetchEmployeeData = () => {
    if (!employeeId) return;
    setLoading(true);
    Promise.all([
      api.getEmployeeDetail(employeeId),
      api.getEmployeeNotes(employeeId),
      api.getEmployeeTasks(employeeId)
    ])
      .then(([empData, notesData, tasksData]) => {
        setEmployee(empData);
        setNotesList(notesData || []);
        setTasksList(tasksData || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

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
          </div>
        ) : null}

        {/* Modal Footer with Real Export Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Export Dossier:
            </span>
            <a
              href={api.getEmployeeExportUrl(employeeId, 'pdf')}
              download
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-rose-600" />
              <span>PDF Report</span>
            </a>
            <a
              href={api.getEmployeeExportUrl(employeeId, 'csv')}
              download
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </a>
            <a
              href={api.getEmployeeExportUrl(employeeId, 'json')}
              download
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>JSON</span>
            </a>
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
