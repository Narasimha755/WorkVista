import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  FileText,
  Upload,
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  DollarSign,
  AlertCircle,
  BarChart2,
  X,
  Plus,
  Download,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Candidate, CandidateStage, JobRole, InterviewItem } from '../types';

const STAGES: CandidateStage[] = ['New', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired'];

export const Candidates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'table' | 'roles' | 'analytics'>('pipeline');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [minMatch, setMinMatch] = useState(0);

  // Selected candidate for 360 drawer
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals
  const [isUploadResumeOpen, setIsUploadResumeOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false);

  // Convert confirmation
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convertSuccessMsg, setConvertSuccessMsg] = useState<string | null>(null);

  // New Role Form State
  const [newRole, setNewRole] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote, US',
    min_experience: 2,
    max_experience: 6,
    education: "Bachelor's Degree",
    min_salary: 95000,
    max_salary: 135000,
    employment_type: 'Full-time',
    description: 'Key engineering role responsible for building scalable enterprise features.',
    required_skills: 'React, TypeScript, Python',
    preferred_skills: 'FastAPI, Docker, SQL'
  });

  // Schedule Interview Form State
  const [newInterview, setNewInterview] = useState({
    candidate_id: '',
    role_id: 1,
    scheduled_time: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    interview_type: 'Technical Interview',
    interviewer: 'NARASIMHA'
  });

  // Note text for candidate drawer
  const [newNoteText, setNewNoteText] = useState('');

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [candRes, rolesRes, intRes] = await Promise.all([
        api.getCandidates({ page_size: 100 }),
        api.getJobRoles(),
        api.getInterviews()
      ]);
      setCandidates(candRes.items || []);
      setRoles(rolesRes || []);
      setInterviews(intRes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load recruitment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (deptFilter !== 'All' && c.department !== deptFilter) return false;
      if (roleFilter !== 'All' && c.role_title !== roleFilter) return false;
      if (minMatch > 0 && (c.match_score || 0) < minMatch) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchRole = c.role_title?.toLowerCase().includes(q);
        const matchSkills = c.skills?.some((s) => s.toLowerCase().includes(q));
        const matchEmail = c.email?.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchSkills && !matchEmail) return false;
      }
      return true;
    });
  }, [candidates, deptFilter, roleFilter, minMatch, search]);

  // Derived departments
  const departments = useMemo(() => {
    const s = new Set<string>();
    candidates.forEach((c) => {
      if (c.department) s.add(c.department);
    });
    roles.forEach((r) => {
      if (r.department) s.add(r.department);
    });
    return ['All', ...Array.from(s).sort()];
  }, [candidates, roles]);

  // Stage change handler
  const handleStageChange = async (candidateId: string, nextStage: CandidateStage) => {
    try {
      await api.updateCandidateStage(candidateId, nextStage);
      setCandidates((prev) =>
        prev.map((c) => (c.candidate_id === candidateId ? { ...c, status: nextStage } : c))
      );
      if (selectedCandidate && selectedCandidate.candidate_id === candidateId) {
        setSelectedCandidate((prev) => (prev ? { ...prev, status: nextStage } : null));
      }
    } catch (err: any) {
      alert(`Stage update failed: ${err.message}`);
    }
  };

  // Convert to employee handler
  const handleConvertCandidate = async (candidate: Candidate) => {
    if (!window.confirm(`Convert candidate ${candidate.name} into an active employee in Workforce?`)) {
      return;
    }
    setConvertingId(candidate.candidate_id);
    try {
      const res = await api.convertCandidateToEmployee(candidate.candidate_id, {
        department: candidate.department,
        role: candidate.role_title,
        experience: candidate.experience
      });
      setConvertSuccessMsg(`Success! ${candidate.name} is now an active employee (${res.employee_id}).`);
      setTimeout(() => setConvertSuccessMsg(null), 6000);
      await loadData();
      if (selectedCandidate?.candidate_id === candidate.candidate_id) {
        setSelectedCandidate((prev) => (prev ? { ...prev, status: 'Hired', converted_employee_id: res.employee_id } : null));
      }
    } catch (err: any) {
      alert(`Conversion failed: ${err.message}`);
    } finally {
      setConvertingId(null);
    }
  };

  // Add Note handler
  const handleAddNote = async () => {
    if (!selectedCandidate || !newNoteText.trim()) return;
    try {
      const note = await api.addCandidateNote(selectedCandidate.candidate_id, newNoteText);
      setSelectedCandidate((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          notes: [note, ...(prev.notes || [])]
        };
      });
      setNewNoteText('');
    } catch (err: any) {
      alert(`Failed to add note: ${err.message}`);
    }
  };

  // Create Job Role handler
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newRole.title,
        department: newRole.department,
        location: newRole.location,
        min_experience: Number(newRole.min_experience),
        max_experience: Number(newRole.max_experience),
        education: newRole.education,
        min_salary: Number(newRole.min_salary),
        max_salary: Number(newRole.max_salary),
        employment_type: newRole.employment_type,
        description: newRole.description,
        required_skills: newRole.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
        preferred_skills: newRole.preferred_skills.split(',').map((s) => s.trim()).filter(Boolean),
        status: 'Active'
      };
      await api.createJobRole(payload);
      setIsAddRoleOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Failed to create job role: ${err.message}`);
    }
  };

  // Schedule Interview handler
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    try {
      await api.scheduleInterview({
        candidate_id: selectedCandidate.candidate_id,
        role_id: selectedCandidate.role_id ?? 1,
        scheduled_time: newInterview.scheduled_time,
        interview_type: newInterview.interview_type,
        interviewer: 'NARASIMHA'
      });
      setIsScheduleInterviewOpen(false);
      // Auto move to Interview stage if currently prior
      if (selectedCandidate.status === 'New' || selectedCandidate.status === 'Screening' || selectedCandidate.status === 'Shortlisted') {
        await handleStageChange(selectedCandidate.candidate_id, 'Interview');
      }
      await loadData();
    } catch (err: any) {
      alert(`Failed to schedule interview: ${err.message}`);
    }
  };

  // Handle Resume Upload file selection
  const handleResumeFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadCandidateResume(file);
      const parsed = res.parsed_data;
      // Auto-create candidate from parsed resume
      await api.createCandidate({
        name: parsed.name || file.name.replace(/\.[^/.]+$/, ''),
        email: parsed.email || 'candidate@example.com',
        phone: parsed.phone || '(555) 012-3456',
        location: parsed.location || 'San Francisco, CA',
        role_title: parsed.role || 'Software Engineer',
        department: 'Engineering',
        experience: parsed.experience || 3.0,
        skills: parsed.skills || ['React', 'TypeScript', 'Python'],
        education: parsed.education || "Bachelor's Degree",
        expected_salary: 115000,
        availability: 'Immediate',
        notice_period: '2 weeks',
        source: 'Resume Ingestion',
        resume_text: parsed.resume_text
      });
      setIsUploadResumeOpen(false);
      await loadData();
      alert(`Resume parsed and candidate "${parsed.name || file.name}" added to pipeline!`);
    } catch (err: any) {
      alert(`Failed to parse resume: ${err.message}`);
    }
  };

  // Export Candidates CSV
  const handleExportCSV = () => {
    const headers = ['Candidate ID', 'Name', 'Email', 'Role', 'Department', 'Stage', 'Match Score', 'Experience', 'Education'];
    const rows = filteredCandidates.map((c) => [
      c.candidate_id,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.role_title}"`,
      `"${c.department}"`,
      c.status,
      c.match_score,
      c.experience,
      `"${c.education}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `workvista_candidates_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Talent Acquisition & Intelligence
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                AI Match Score Engine Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Candidate Intelligence & Hiring Pipeline</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              End-to-end recruitment management with AI skill-compatibility scoring, automated resume ingestion, interactive interview scheduling, and seamless workforce conversion.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsUploadResumeOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Ingest Resume</span>
            </button>
            <button
              onClick={() => setIsAddRoleOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job Role</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
              title="Export Candidates CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Applicants</div>
            <div className="text-xl font-bold text-white mt-1">{candidates.length}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Pipeline</div>
            <div className="text-xl font-bold text-blue-400 mt-1">
              {candidates.filter((c) => c.status !== 'Hired' && c.status !== 'Rejected').length}
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Interviewing</div>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              {candidates.filter((c) => c.status === 'Interview').length}
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Offers & Hired</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {candidates.filter((c) => c.status === 'Offer' || c.status === 'Hired').length}
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Avg AI Match Score</div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {(candidates.reduce((acc, c) => acc + (c.match_score || 0), 0) / (candidates.length || 1)).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Success Toast */}
      {convertSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold">{convertSuccessMsg}</span>
          </div>
          <button onClick={() => setConvertSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs & Search Filter Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'pipeline'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Pipeline (Kanban)</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Candidate Roster</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'roles'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Job Roles ({roles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Recruitment Funnel</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate, role, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sub-filters bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Filter By:</span>
          </div>

          {/* Dept */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          {/* Role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="All">All Job Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.title}>
                {r.title}
              </option>
            ))}
          </select>

          {/* Min Match Slider */}
          <div className="flex items-center gap-2 pl-2">
            <span className="text-slate-500 text-[11px]">Min AI Match: {minMatch}%</span>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-24 accent-blue-600"
            />
          </div>

          <div className="ml-auto text-[11px] text-slate-400">
            Showing <span className="font-bold text-slate-700 dark:text-slate-300">{filteredCandidates.length}</span> of {candidates.length} candidates
          </div>
        </div>
      </div>

      {/* VIEW 1: PIPELINE / KANBAN BOARD */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter((c) => c.status === stage);
            return (
              <div key={stage} className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{stage}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                      {stageCandidates.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-0.5">
                  {stageCandidates.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">No candidates in {stage}</div>
                  ) : (
                    stageCandidates.map((c) => {
                      const matchPct = c.match_score || 75;
                      const matchColor =
                        matchPct >= 85
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200'
                          : matchPct >= 70
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200';

                      return (
                        <div
                          key={c.candidate_id}
                          onClick={() => {
                            setSelectedCandidate(c);
                            setIsDrawerOpen(true);
                          }}
                          className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                {c.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.role_title}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${matchColor}`}>
                              {matchPct}% Match
                            </span>
                          </div>

                          {/* Details */}
                          <div className="text-[11px] text-slate-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{c.location || 'Remote'}</span>
                              <span className="mx-1">•</span>
                              <span>{c.experience} yrs</span>
                            </div>
                          </div>

                          {/* Top Skills Tags */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(c.skills || []).slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              >
                                {s}
                              </span>
                            ))}
                            {(c.skills || []).length > 3 && (
                              <span className="text-[9px] text-slate-400">+{c.skills.length - 3}</span>
                            )}
                          </div>

                          {/* Action footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                            {/* Convert if Offer/Hired */}
                            {c.status === 'Offer' || c.status === 'Hired' ? (
                              c.converted_employee_id ? (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{c.converted_employee_id}</span>
                                </span>
                              ) : (
                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    handleConvertCandidate(c);
                                  }}
                                  disabled={convertingId === c.candidate_id}
                                  className="text-[10px] px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-colors flex items-center gap-1"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Convert</span>
                                </button>
                              )
                            ) : (
                              <div className="text-[10px] text-slate-400">
                                {c.notes?.length ? `${c.notes.length} notes` : 'No notes'}
                              </div>
                            )}

                            {/* Stage step buttons */}
                            <div className="flex items-center gap-1 ml-auto">
                              {stage !== 'New' && (
                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    const prevIdx = STAGES.indexOf(stage) - 1;
                                    if (prevIdx >= 0) handleStageChange(c.candidate_id, STAGES[prevIdx]);
                                  }}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700"
                                  title="Move to previous stage"
                                >
                                  &larr;
                                </button>
                              )}
                              {stage !== 'Hired' && (
                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    const nextIdx = STAGES.indexOf(stage) + 1;
                                    if (nextIdx < STAGES.length) handleStageChange(c.candidate_id, STAGES[nextIdx]);
                                  }}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600 font-bold"
                                  title="Advance to next stage"
                                >
                                  &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: CANDIDATE TABLE */}
      {activeTab === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Status / Conversion</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCandidates.map((c) => (
                  <tr
                    key={c.candidate_id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedCandidate(c);
                      setIsDrawerOpen(true);
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{c.role_title}</td>
                    <td className="py-3 px-4">{c.department}</td>
                    <td className="py-3 px-4">{c.experience} yrs</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-bold text-[11px]">
                        {c.match_score}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.converted_employee_id ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active ({c.converted_employee_id})</span>
                        </span>
                      ) : c.status === 'Offer' || c.status === 'Hired' ? (
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleConvertCandidate(c);
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                        >
                          Convert to Employee
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">In Pipeline</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedCandidate(c);
                          setIsDrawerOpen(true);
                        }}
                        className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-lg font-medium inline-flex items-center gap-1"
                      >
                        <span>360</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: JOB ROLES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {r.department}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{r.title}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{r.location}</span>
                    <span>•</span>
                    <span>{r.employment_type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">
                    {r.candidate_count || 0} Candidates
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{r.description}</p>

              {/* Skills */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Required Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {(r.required_skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Compensation & Experience */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    ${(r.min_salary / 1000).toFixed(0)}k - ${(r.max_salary / 1000).toFixed(0)}k
                  </span>
                </div>
                <div>
                  <span>Exp: {r.min_experience}-{r.max_experience} yrs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 4: RECRUITMENT ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sourcing Channels */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Candidate Sourcing Channels</span>
              </h3>
              <div className="space-y-3 pt-2">
                {[
                  { channel: 'Direct / Resume Upload', count: 8, pct: '44%' },
                  { channel: 'LinkedIn Talent Ingestion', count: 5, pct: '28%' },
                  { channel: 'Employee Referrals', count: 3, pct: '17%' },
                  { channel: 'Recruitment Agency', count: 2, pct: '11%' }
                ].map((s) => (
                  <div key={s.channel} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{s.channel}</span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{s.count} candidates ({s.pct})</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: s.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Velocity & Time-to-hire */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Hiring Velocity & Stage Funnel</span>
              </h3>
              <div className="space-y-3 pt-2">
                {STAGES.map((stg) => {
                  const count = candidates.filter((c) => c.status === stg).length;
                  const pct = ((count / (candidates.length || 1)) * 100).toFixed(0);
                  return (
                    <div key={stg} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{stg}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="w-12 text-right font-bold text-slate-900 dark:text-slate-100">{count} ({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE 360 DRAWER */}
      {isDrawerOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedCandidate.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {selectedCandidate.match_score}% AI Match
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedCandidate.role_title} • {selectedCandidate.department}
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Stage Stepper */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Hiring Stage</div>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map((stg) => {
                    const isCurrent = selectedCandidate.status === stg;
                    return (
                      <button
                        key={stg}
                        onClick={() => handleStageChange(selectedCandidate.candidate_id, stg)}
                        className={`px-3 py-1 text-xs rounded-xl font-bold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {stg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversion Action */}
              {selectedCandidate.converted_employee_id ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Active Workforce Member</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Successfully converted with ID: {selectedCandidate.converted_employee_id}
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-100">Ready for Conversion?</div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400">
                      Transfer record to live workforce and assign official employee ID
                    </div>
                  </div>
                  <button
                    onClick={() => handleConvertCandidate(selectedCandidate)}
                    disabled={convertingId === selectedCandidate.candidate_id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Convert to Employee</span>
                  </button>
                </div>
              )}

              {/* AI Match Compatibility Engine Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Match Compatibility Breakdown</span>
                  </div>
                  <span className="text-xs font-extrabold text-blue-600">{selectedCandidate.match_score}%</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Skills Match</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedCandidate.match_breakdown?.skills_match_pct ?? 82}%
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Experience Match</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedCandidate.match_breakdown?.experience_match_pct ?? 90}%
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Education Match</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedCandidate.match_breakdown?.education_match_pct ?? 95}%
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Location Match</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedCandidate.match_breakdown?.location_match_pct ?? 85}%
                    </div>
                  </div>
                </div>

                {/* Matched vs Missing Skills */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Candidate Skills:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedCandidate.skills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400">Email:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedCandidate.email}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400">Phone:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedCandidate.phone}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400">Education:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedCandidate.education}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400">Expected Salary:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    ${selectedCandidate.expected_salary?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Interviews & Scheduling */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Scheduled Interviews
                  </h4>
                  <button
                    onClick={() => {
                      setNewInterview((prev) => ({ ...prev, candidate_id: selectedCandidate.candidate_id }));
                      setIsScheduleInterviewOpen(true);
                    }}
                    className="px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>
                </div>

                {interviews.filter((i) => i.candidate_id === selectedCandidate.candidate_id).length === 0 ? (
                  <p className="text-xs text-slate-400">No interviews scheduled yet.</p>
                ) : (
                  <div className="space-y-2">
                    {interviews
                      .filter((i) => i.candidate_id === selectedCandidate.candidate_id)
                      .map((int) => (
                        <div
                          key={int.id}
                          className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{int.interview_type}</div>
                            <div className="text-[11px] text-slate-400">
                              {int.scheduled_time} • Lead: {int.interviewer}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                            {int.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Evaluator Notes Thread */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Evaluator Notes & Feedback
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add interview feedback or notes as NARASIMHA..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedCandidate.notes || []).map((n) => (
                    <div
                      key={n.id}
                      className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-blue-600">{n.author}</span>
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESUME UPLOAD MODAL */}
      {isUploadResumeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Ingest Candidate Resume</span>
              </h3>
              <button onClick={() => setIsUploadResumeOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Upload a resume in PDF, DOCX, or TXT format. WorkVista's parser extracts name, experience, education, and skills to compute AI match scores automatically.
            </p>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-blue-600 mx-auto" />
              <div>
                <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all inline-block shadow-xs">
                  Choose Resume File
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-400">Supported formats: .pdf, .docx, .txt (max 10MB)</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {isAddRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Create New Job Role</span>
              </h3>
              <button onClick={() => setIsAddRoleOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={newRole.title}
                  onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
                  placeholder="e.g. Lead Machine Learning Engineer"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={newRole.department}
                    onChange={(e) => setNewRole({ ...newRole, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {departments.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newRole.location}
                    onChange={(e) => setNewRole({ ...newRole, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={newRole.required_skills}
                  onChange={(e) => setNewRole({ ...newRole, required_skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Min Salary ($)</label>
                  <input
                    type="number"
                    value={newRole.min_salary}
                    onChange={(e) => setNewRole({ ...newRole, min_salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    value={newRole.max_salary}
                    onChange={(e) => setNewRole({ ...newRole, max_salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoleOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {isScheduleInterviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Schedule Candidate Interview</span>
              </h3>
              <button onClick={() => setIsScheduleInterviewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Interview Type</label>
                <select
                  value={newInterview.interview_type}
                  onChange={(e) => setNewInterview({ ...newInterview, interview_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Initial Screening">Initial Screening</option>
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="System Design">System Design</option>
                  <option value="Executive / Culture Fit">Executive / Culture Fit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newInterview.scheduled_time}
                  onChange={(e) => setNewInterview({ ...newInterview, scheduled_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lead Interviewer</label>
                <input
                  type="text"
                  disabled
                  value="NARASIMHA (Administrator)"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleInterviewOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
