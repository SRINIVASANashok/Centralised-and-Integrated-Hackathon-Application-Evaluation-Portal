import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  LogOut,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  FileText,
  Eye,
  Download,
  CheckSquare,
  Square,
  UserCheck,
  UserPlus,
  ArrowUpDown,
  Archive,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Mail,
  BarChart3,
  KeyRound,
  Shield,
  Zap,
} from 'lucide-react';
import {
  fetchAdminDashboard,
  fetchAdminUsers,
  fetchAuditLogs,
  fetchSIHAdminOverview,
  fetchSIHAdminSubmissions,
  fetchSIHAdminTeachers,
  assignSIHSubmissions,
  fetchSIHApprovedSubmissions,
  exportSIHApprovedZip,
  fetchFacultyAllocation,
} from '../services/api';
import { AuthenticatedUser, SecurityAuditLog } from '../types/auth';
import {
  SIHSubmission,
  SIHAdminOverviewStats,
  SIHTeacherSummary,
} from '../types/sih';
import { SIHPdfViewerModal } from '../components/SIHPdfViewerModal';

interface AdminDashboardProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  onOpenTestBench: () => void;
  onOpenEmailInbox: () => void;
  onOpenBenchmark: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onOpenTestBench,
  onOpenEmailInbox,
  onOpenBenchmark,
}) => {
  const [activeTab, setActiveTab] = useState<'SUBMISSIONS' | 'APPROVED' | 'TEACHERS' | 'USERS' | 'LOGS'>('SUBMISSIONS');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // SIH Data
  const [sihStats, setSihStats] = useState<SIHAdminOverviewStats>({
    total_students: 0,
    total_submissions: 0,
    pending_submissions: 0,
    assigned_submissions: 0,
    under_review: 0,
    approved_ideas: 0,
    rejected_ideas: 0,
  });
  const [submissions, setSubmissions] = useState<SIHSubmission[]>([]);
  const [teachers, setTeachers] = useState<SIHTeacherSummary[]>([]);
  const [facultyAllocations, setFacultyAllocations] = useState<any[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<SIHSubmission[]>([]);

  // Users & Audit Logs
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);

  // Selected Submission for PDF Viewer Modal
  const [inspectSubmission, setInspectSubmission] = useState<SIHSubmission | null>(null);

  // Filters for All Submissions
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [teacherFilter, setTeacherFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');

  // Multi-Selection for Teacher Assignment
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [targetTeacherId, setTargetTeacherId] = useState<string>('');
  const [confirmAssignModal, setConfirmAssignModal] = useState<{
    teacher: SIHTeacherSummary;
    count: number;
    submissionIds: string[];
  } | null>(null);

  // Selection for Approved Ideas Final Selection & Export
  const [selectedApprovedIds, setSelectedApprovedIds] = useState<string[]>([]);
  const [approvedSearchQuery, setApprovedSearchQuery] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, subsRes, teachersRes, approvedRes, usersRes, logsRes, allocRes] = await Promise.all([
        fetchSIHAdminOverview(),
        fetchSIHAdminSubmissions(),
        fetchSIHAdminTeachers(),
        fetchSIHApprovedSubmissions(),
        fetchAdminUsers(),
        fetchAuditLogs(),
        fetchFacultyAllocation(),
      ]);

      if (statsRes.success && statsRes.stats) setSihStats(statsRes.stats);
      if (subsRes.success) setSubmissions(subsRes.submissions || []);
      if (teachersRes.success) {
        setTeachers(teachersRes.teachers || []);
        if (teachersRes.teachers && teachersRes.teachers.length > 0 && !targetTeacherId) {
          setTargetTeacherId(teachersRes.teachers[0].id);
        }
      }
      if (allocRes.success) setFacultyAllocations(allocRes.data || []);
      if (approvedRes.success) setApprovedSubmissions(approvedRes.submissions || []);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (logsRes.success) setAuditLogs(logsRes.logs || []);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter Submissions
  const filteredSubmissions = submissions.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.idea_title.toLowerCase().includes(q) ||
      s.student_name.toLowerCase().includes(q) ||
      s.register_number.toLowerCase().includes(q) ||
      s.team_name.toLowerCase().includes(q) ||
      s.team_id.toLowerCase().includes(q) ||
      s.problem_statement_id.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (departmentFilter !== 'ALL' && s.department !== departmentFilter) return false;
    if (yearFilter !== 'ALL' && s.year !== yearFilter) return false;
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (teacherFilter !== 'ALL') {
      if (teacherFilter === 'UNASSIGNED') {
        if (s.assigned_teacher_id) return false;
      } else if (s.assigned_teacher_id !== teacherFilter) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortOrder === 'DESC' ? timeB - timeA : timeA - timeB;
  });

  // Unique departments for filter
  const departments = Array.from(new Set(submissions.map((s) => s.department))).filter(Boolean);

  // Checkbox management for Submissions allocation
  const handleToggleSelectSubmission = (id: string) => {
    setSelectedSubIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllSubmissions = () => {
    if (selectedSubIds.length === filteredSubmissions.length) {
      setSelectedSubIds([]);
    } else {
      setSelectedSubIds(filteredSubmissions.map((s) => s.id));
    }
  };

  const initiateAssignment = () => {
    if (selectedSubIds.length === 0) {
      setToastMessage({ type: 'error', text: 'Please select at least one submission to allocate.' });
      return;
    }
    const teacher = teachers.find((t) => t.id === targetTeacherId);
    if (!teacher) {
      setToastMessage({ type: 'error', text: 'Please select a faculty evaluator.' });
      return;
    }
    setConfirmAssignModal({
      teacher,
      count: selectedSubIds.length,
      submissionIds: selectedSubIds,
    });
  };

  const handleConfirmAssignment = async () => {
    if (!confirmAssignModal) return;
    setActionLoading(true);
    setToastMessage(null);

    const res = await assignSIHSubmissions(
      confirmAssignModal.submissionIds,
      confirmAssignModal.teacher.id
    );

    setActionLoading(false);

    if (res.success) {
      setToastMessage({
        type: 'success',
        text: `Allocated ${confirmAssignModal.count} submission(s) to ${confirmAssignModal.teacher.name}.`,
      });
      setSelectedSubIds([]);
      setConfirmAssignModal(null);
      await loadAllData();
    } else {
      setToastMessage({ type: 'error', text: res.error || 'Failed to complete assignment.' });
    }
  };

  // Approved Ideas Management
  const filteredApproved = approvedSubmissions.filter((s) => {
    const q = approvedSearchQuery.toLowerCase();
    return (
      s.idea_title.toLowerCase().includes(q) ||
      s.student_name.toLowerCase().includes(q) ||
      s.register_number.toLowerCase().includes(q) ||
      s.team_name.toLowerCase().includes(q) ||
      s.team_id.toLowerCase().includes(q) ||
      s.problem_statement_id.toLowerCase().includes(q)
    );
  });

  const handleToggleApprovedSelect = (id: string) => {
    setSelectedApprovedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllApproved = () => {
    if (selectedApprovedIds.length === filteredApproved.length) {
      setSelectedApprovedIds([]);
    } else {
      setSelectedApprovedIds(filteredApproved.map((s) => s.id));
    }
  };

  // Export Approved to CSV
  const handleExportApprovedCSV = () => {
    const exportTargets = selectedApprovedIds.length > 0
      ? approvedSubmissions.filter((s) => selectedApprovedIds.includes(s.id))
      : approvedSubmissions;

    if (exportTargets.length === 0) {
      setToastMessage({ type: 'error', text: 'No approved submissions available to export.' });
      return;
    }

    const headers = [
      'Team ID',
      'Team Name',
      'Idea Title',
      'Problem Statement ID',
      'Problem Statement Title',
      'Theme',
      'Category',
      'Lead Student Name',
      'Register Number',
      'Department',
      'Section',
      'Year',
      'Student Email',
      'Phone Number',
      'Approved By Faculty',
      'Approval Date',
      'Reviewer Feedback',
    ];

    const csvRows = [headers.join(',')];

    for (const sub of exportTargets) {
      const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
      const row = [
        escape(sub.team_id),
        escape(sub.team_name),
        escape(sub.idea_title),
        escape(sub.problem_statement_id),
        escape(sub.problem_statement_title),
        escape(sub.theme),
        escape(sub.category),
        escape(sub.student_name),
        escape(sub.register_number),
        escape(sub.department),
        escape(sub.section),
        escape(sub.year),
        escape(sub.student_email),
        escape(sub.student_phone),
        escape(sub.reviewed_by_teacher_name || sub.assigned_teacher_name),
        escape(sub.reviewed_at ? new Date(sub.reviewed_at).toLocaleString() : ''),
        escape(sub.review_feedback || ''),
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `SRMIST_SIH_Approved_Ideas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage({
      type: 'success',
      text: `Exported ${exportTargets.length} approved ideas to official CSV roster.`,
    });
  };

  // Export Approved to ZIP
  const handleExportApprovedZIP = async () => {
    const targetIds = selectedApprovedIds.length > 0
      ? selectedApprovedIds
      : approvedSubmissions.map((s) => s.id);

    if (targetIds.length === 0) {
      setToastMessage({ type: 'error', text: 'No approved submissions available for ZIP package.' });
      return;
    }

    setActionLoading(true);
    setToastMessage(null);

    const zipBlob = await exportSIHApprovedZip(targetIds);
    setActionLoading(false);

    if (zipBlob) {
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SRMIST_SIH_Approved_Presentations_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setToastMessage({
        type: 'success',
        text: `Downloaded ${targetIds.length} approved presentation PDFs in official ZIP archive.`,
      });
    } else {
      setToastMessage({ type: 'error', text: 'Failed to generate ZIP archive.' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-300 rounded">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            REJECTED
          </span>
        );
      case 'ASSIGNED_TO_TEACHER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-300 rounded">
            <Clock className="w-3 h-3 text-blue-600" />
            ASSIGNED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-300 rounded">
            <Clock className="w-3 h-3 text-indigo-600" />
            UNDER REVIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 rounded">
            <Clock className="w-3 h-3 text-amber-600" />
            PENDING ALLOCATION
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 text-[#002147] animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Synchronizing SIH Internal Hackathon Submissions & Metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Header */}
      <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-[#ef233c] uppercase tracking-widest font-mono">
              SRM IST Tiruchirappalli · Central Administration Console
            </span>
            <span className="text-zinc-600">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-500/40">
              <ShieldAlert className="w-3 h-3 text-[#ef233c]" />
              Administrative Authority Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-manrope font-bold text-white tracking-tight">
            Welcome, Administrator
          </h1>
          <p className="text-xs text-zinc-300 mt-1 font-normal">
            Institutional Gateway: <strong className="font-mono text-[#ef233c]">{user.username || 'ADMIN@SRM01'}</strong> · Real-Time SIH Workflow Controller
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenEmailInbox}
            className="px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700/80 hover:border-amber-500 transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-amber-500" />
            <span>Campus Outbox</span>
          </button>
          <button
            onClick={onOpenBenchmark}
            className="px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700/80 hover:border-red-500 transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-[#ef233c]" />
            <span>Benchmark Suite</span>
          </button>
          <button
            onClick={onOpenTestBench}
            className="px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700/80 hover:border-[#ef233c] transition-all cursor-pointer shadow-sm"
          >
            Run Security Tests
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-500/40 hover:border-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4 text-[#ef233c]" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border backdrop-blur-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* SECTION 3: A. REAL DATABASE OVERVIEW METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-zinc-950/85 p-4 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-manrope">Total Students</span>
          <div className="text-xl font-manrope font-bold text-white mt-1">{sihStats.total_students}</div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Enrolled portal users</span>
        </div>

        <div className="bg-zinc-950/85 p-4 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-manrope">Total Submissions</span>
          <div className="text-xl font-manrope font-bold text-white mt-1">{sihStats.total_submissions}</div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Idea proposals received</span>
        </div>

        <div className="bg-zinc-950/85 p-4 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block font-manrope">Pending Allocation</span>
          <div className="text-xl font-manrope font-bold text-amber-400 mt-1">{sihStats.pending_submissions}</div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Awaiting teacher assignment</span>
        </div>

        <div className="bg-zinc-950/85 p-4 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block font-manrope">Assigned Ideas</span>
          <div className="text-xl font-manrope font-bold text-sky-400 mt-1">{sihStats.assigned_submissions}</div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Allocated to evaluators</span>
        </div>

        <div className="bg-zinc-950/85 p-4 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block font-manrope">Under Review</span>
          <div className="text-xl font-manrope font-bold text-purple-400 mt-1">{sihStats.under_review}</div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">In active faculty review</span>
        </div>

        <div className="bg-zinc-950/85 p-4 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-manrope">Approved Ideas</span>
          <div className="text-xl font-manrope font-bold text-emerald-400 mt-1">{sihStats.approved_ideas}</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Recommended shortlist</span>
        </div>

        <div className="bg-zinc-950/85 p-4 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block font-manrope">Rejected Ideas</span>
          <div className="text-xl font-manrope font-bold text-rose-400 mt-1">{sihStats.rejected_ideas}</div>
          <span className="text-[10px] text-rose-400 mt-0.5 block">Feedback issued</span>
        </div>
      </div>

      {/* Verified Credentials Section */}
      <div className="login-card-noir group relative overflow-hidden p-6 border border-zinc-700/80 bg-zinc-950/85 hover:border-zinc-600 transition-all rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-white font-manrope tracking-wider uppercase flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#ef233c]" />
              <span>Verified Credentials & Instant Sign In</span>
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500 text-emerald-400 font-mono font-bold">
              ONE-CLICK READY
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 text-zinc-200">
            {/* Admin */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-rose-400 font-bold block text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> ADMIN SPOC
                </span>
                <span className="text-white font-bold block select-all font-mono text-xs">ADMIN@SRM01</span>
                <span className="text-zinc-400 font-medium text-[11px] block select-all font-mono">Pass: Admin@srmisttrchy</span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-[#ef233c]/20 hover:bg-[#ef233c]/30 border border-[#ef233c]/40 text-[#ef233c] font-bold font-manrope text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="1-Click Direct Login"
              >
                <Zap className="w-3 h-3 text-[#ef233c]" />
                <span>Auto-Fill Active</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-zinc-800 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('SUBMISSIONS')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'SUBMISSIONS'
              ? 'border-[#ef233c] text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-[#ef233c]" />
          <span>All Student Submissions ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'APPROVED'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Approved Ideas ({approvedSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEACHERS')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'TEACHERS'
              ? 'border-[#ef233c] text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#ef233c]" />
          <span>Faculty Evaluators ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'border-[#ef233c] text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'LOGS'
              ? 'border-[#ef233c] text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL STUDENT SUBMISSIONS & TEACHER ASSIGNMENT */}
      {activeTab === 'SUBMISSIONS' && (
        <div className="space-y-6">
          {/* BULK ALLOCATION BAR */}
          <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/90 backdrop-blur-2xl text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-[#ef233c]/50 flex items-center justify-center text-[#ef233c] shadow-md">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#ef233c] uppercase tracking-widest block font-mono">
                  Institutional Allocation Engine
                </span>
                <span className="text-xs font-semibold text-white">
                  Selected <strong className="text-[#ef233c]">{selectedSubIds.length}</strong> of {filteredSubmissions.length} submissions for assignment
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-300">Assign to:</span>
                <select
                  value={targetTeacherId}
                  onChange={(e) => setTargetTeacherId(e.target.value)}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:border-[#ef233c]"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                      {t.name} ({t.department.slice(0, 18)}... · {t.pending_count} pending)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={initiateAssignment}
                disabled={selectedSubIds.length === 0}
                className="shiny-cta px-4 py-2 rounded-xl text-white font-manrope font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Assign Selected
              </button>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-white">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by student, reg no, idea title, team ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-zinc-700/80 rounded-xl bg-zinc-900/90 text-white placeholder-zinc-500 focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 border border-zinc-700/80 rounded-xl text-zinc-200 bg-zinc-900/90 focus:border-[#ef233c] focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d} className="bg-zinc-900 text-white">
                  {d}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-1.5 border border-zinc-700/80 rounded-xl text-zinc-200 bg-zinc-900/90 focus:border-[#ef233c] focus:outline-none"
            >
              <option value="ALL" className="bg-zinc-900 text-white">All Academic Years</option>
              <option value="1st Year" className="bg-zinc-900 text-white">1st Year</option>
              <option value="2nd Year" className="bg-zinc-900 text-white">2nd Year</option>
              <option value="3rd Year" className="bg-zinc-900 text-white">3rd Year</option>
              <option value="4th Year" className="bg-zinc-900 text-white">4th Year</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-zinc-700/80 rounded-xl text-zinc-200 bg-zinc-900/90 focus:border-[#ef233c] focus:outline-none"
            >
              <option value="ALL" className="bg-zinc-900 text-white">All Statuses</option>
              <option value="SUBMITTED" className="bg-zinc-900 text-white">SUBMITTED (Pending Allocation)</option>
              <option value="ASSIGNED_TO_TEACHER" className="bg-zinc-900 text-white">ASSIGNED TO TEACHER</option>
              <option value="UNDER_REVIEW" className="bg-zinc-900 text-white">UNDER REVIEW</option>
              <option value="APPROVED" className="bg-zinc-900 text-white">APPROVED</option>
              <option value="REJECTED" className="bg-zinc-900 text-white">REJECTED</option>
            </select>

            {/* Teacher Filter */}
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="px-3 py-1.5 border border-zinc-700/80 rounded-xl text-zinc-200 bg-zinc-900/90 focus:border-[#ef233c] focus:outline-none"
            >
              <option value="ALL" className="bg-zinc-900 text-white">All Evaluators</option>
              <option value="UNASSIGNED" className="bg-zinc-900 text-white">Unassigned Only</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-zinc-700/80 rounded-xl text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#ef233c]" />
              <span>{sortOrder === 'DESC' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>

          {/* Submissions Table */}
          <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3.5 w-10">
                      <button
                        type="button"
                        onClick={handleSelectAllSubmissions}
                        className="text-zinc-400 hover:text-white cursor-pointer"
                        title="Select All"
                      >
                        {selectedSubIds.length > 0 && selectedSubIds.length === filteredSubmissions.length ? (
                          <CheckSquare className="w-4 h-4 text-[#ef233c]" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3.5">Student Details</th>
                    <th className="px-4 py-3.5">Idea & Problem Statement</th>
                    <th className="px-4 py-3.5">Team Info</th>
                    <th className="px-4 py-3.5">Submission Date</th>
                    <th className="px-4 py-3.5">Current Status</th>
                    <th className="px-4 py-3.5">Assigned Teacher</th>
                    <th className="px-4 py-3.5 text-right">PDF & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-zinc-400">
                        No submissions matched the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const isSelected = selectedSubIds.includes(sub.id);
                      return (
                        <tr
                          key={sub.id}
                          className={`hover:bg-zinc-900/50 transition-colors ${
                            isSelected ? 'bg-red-950/30' : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectSubmission(sub.id)}
                              className="cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#ef233c]" />
                              ) : (
                                <Square className="w-4 h-4 text-zinc-600" />
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-bold text-white">{sub.student_name}</div>
                            <div className="font-mono text-[11px] text-[#ef233c]">{sub.register_number}</div>
                            <div className="text-[11px] text-zinc-300">
                              {sub.department} ({sub.section} · {sub.year})
                            </div>
                            <div className="text-[10px] font-mono text-zinc-400 truncate max-w-[180px]">
                              {sub.student_email}
                            </div>
                          </td>

                          <td className="px-4 py-4 max-w-xs">
                            <div className="font-manrope font-bold text-white line-clamp-1">
                              {sub.idea_title}
                            </div>
                            <div className="text-[11px] text-zinc-300 mt-0.5">
                              <span className="font-mono font-bold text-[#ef233c]">{sub.problem_statement_id}:</span> {sub.problem_statement_title}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {sub.theme} · {sub.category}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-semibold text-white">{sub.team_name}</div>
                            <div className="font-mono text-[10px] text-zinc-400">{sub.team_id}</div>
                          </td>

                          <td className="px-4 py-4 font-mono text-[11px] text-zinc-300">
                            {new Date(sub.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="px-4 py-4">
                            {getStatusBadge(sub.status)}
                          </td>

                          <td className="px-4 py-4">
                            {sub.assigned_teacher_name ? (
                              <div>
                                <span className="font-semibold text-white block">{sub.assigned_teacher_name}</span>
                                <span className="text-[10px] text-zinc-400 block">{sub.assigned_teacher_dept}</span>
                              </div>
                            ) : (
                              <span className="text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-500/40">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setInspectSubmission(sub)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl font-semibold text-[11px] border border-zinc-700/80 transition-colors cursor-pointer"
                              title="Inspect embedded PDF"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#ef233c]" />
                              <span>View PDF</span>
                            </button>

                            <a
                              href={`/api/sih/submissions/${sub.id}/pdf`}
                              download={sub.pdf_filename}
                              className="inline-flex items-center p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl border border-zinc-700/80 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECTION 11 & 12. APPROVED IDEAS & FINAL SELECTION & EXPORT */}
      {activeTab === 'APPROVED' && (
        <div className="space-y-6">
          <div className="login-card-noir rounded-2xl border border-emerald-500/40 bg-zinc-950/90 backdrop-blur-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl text-white">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1 font-mono">
                Final Selection & Shortlist Roster
              </span>
              <h2 className="text-xl font-manrope font-bold text-white">
                SIH Committee Approved Ideas ({approvedSubmissions.length})
              </h2>
              <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                Contains only submissions approved by evaluating faculty members. Select ideas to generate official CSV rosters and export presentations for national Smart India Hackathon submission.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportApprovedCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-emerald-500/40 transition-colors cursor-pointer shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export to CSV / Excel</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExportApprovedZIP}
                className="shiny-cta px-4 py-2 rounded-xl text-white font-manrope font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  <span>{actionLoading ? 'Archiving...' : 'Download ZIP Archive'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Search & Selection Counter */}
          <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAllApproved}
                className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white font-semibold cursor-pointer"
              >
                {selectedApprovedIds.length > 0 && selectedApprovedIds.length === filteredApproved.length ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-600" />
                )}
                <span>Select All ({filteredApproved.length})</span>
              </button>

              <span className="text-zinc-600">·</span>

              <span className="font-semibold text-zinc-200">
                Selected <strong className="text-emerald-400">{selectedApprovedIds.length}</strong> of {approvedSubmissions.length} Approved Ideas
              </span>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search approved ideas or teams..."
                value={approvedSearchQuery}
                onChange={(e) => setApprovedSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-zinc-700/80 rounded-xl bg-zinc-900/90 text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Approved Submissions Table */}
          <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3.5 w-10">Select</th>
                    <th className="px-4 py-3.5">Student & Department</th>
                    <th className="px-4 py-3.5">Idea Title</th>
                    <th className="px-4 py-3.5">Team & PS Details</th>
                    <th className="px-4 py-3.5">Approved By</th>
                    <th className="px-4 py-3.5">Approval Date</th>
                    <th className="px-4 py-3.5 text-right">PDF Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredApproved.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                        No approved ideas found.
                      </td>
                    </tr>
                  ) : (
                    filteredApproved.map((sub) => {
                      const isSelected = selectedApprovedIds.includes(sub.id);
                      return (
                        <tr
                          key={sub.id}
                          className={`hover:bg-zinc-900/50 transition-colors ${
                            isSelected ? 'bg-emerald-950/30' : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleApprovedSelect(sub.id)}
                              className="cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-zinc-600" />
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-bold text-white">{sub.student_name}</div>
                            <div className="font-mono text-[11px] text-[#ef233c]">{sub.register_number}</div>
                            <div className="text-[11px] text-zinc-300">
                              {sub.department} · {sub.section} ({sub.year})
                            </div>
                          </td>

                          <td className="px-4 py-4 max-w-xs">
                            <div className="font-manrope font-bold text-white">{sub.idea_title}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">{sub.theme}</div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-semibold text-white">{sub.team_name}</div>
                            <div className="font-mono text-[10px] text-zinc-400">{sub.team_id}</div>
                            <div className="text-[11px] text-zinc-300 mt-0.5">
                              PS: <strong className="font-mono text-[#ef233c]">{sub.problem_statement_id}</strong>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-semibold text-emerald-400">
                              {sub.reviewed_by_teacher_name || sub.assigned_teacher_name}
                            </div>
                            <div className="text-[10px] text-zinc-400">Faculty Reviewer</div>
                          </td>

                          <td className="px-4 py-4 font-mono text-[11px] text-zinc-300">
                            {sub.reviewed_at
                              ? new Date(sub.reviewed_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                          </td>

                          <td className="px-4 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setInspectSubmission(sub)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl font-semibold text-[11px] border border-zinc-700/80 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#ef233c]" />
                              <span>View PDF</span>
                            </button>

                            <a
                              href={`/api/sih/submissions/${sub.id}/pdf`}
                              download={sub.pdf_filename}
                              className="inline-flex items-center p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl border border-zinc-700/80 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECTION 5. FACULTY EVALUATOR ALLOCATION TABLE */}
      {activeTab === 'TEACHERS' && (
        <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
          <div className="bg-zinc-900/90 px-6 py-4 border-b border-zinc-800">
            <h2 className="text-base font-manrope font-bold text-white">
              Available Faculty Evaluators
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Workload and assignment distribution across verified institutional faculty accounts.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Evaluator</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Research Areas</th>
                  <th className="px-4 py-3.5">Allocated Teams</th>
                  <th className="px-4 py-3.5">Available Slots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {facultyAllocations.map((fac, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-white">{fac.name}</td>
                    <td className="px-4 py-4 text-zinc-300">{fac.department}</td>
                    <td className="px-4 py-4 text-zinc-400">
                      {fac.research_areas.join(', ')}
                    </td>
                    <td className="px-4 py-4 font-bold text-white">
                      {fac.allocated_count} / 10
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-bold px-2 py-0.5 rounded-lg border ${
                        fac.available_slots > 0 
                          ? 'text-emerald-300 bg-emerald-950/50 border-emerald-500/40' 
                          : 'text-rose-300 bg-rose-950/50 border-rose-500/40'
                      }`}>
                        {fac.available_slots} slots
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS DIRECTORY */}
      {activeTab === 'USERS' && (
        <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
          <div className="bg-zinc-900/90 px-6 py-4 border-b border-zinc-800">
            <h2 className="text-base font-manrope font-bold text-white">
              SRM Institutional Accounts
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Identifier</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/50">
                    <td className="px-5 py-3 font-semibold text-white">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-zinc-300">{u.email}</td>
                    <td className="px-4 py-3 font-bold text-[#ef233c]">{u.role}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">
                      {u.student_info?.register_number || u.faculty_info?.faculty_id || 'SRM-ADMIN'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-emerald-950/50 text-emerald-300 rounded font-semibold text-[10px] border border-emerald-500/40">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
          <div className="bg-zinc-900/90 px-6 py-4 border-b border-zinc-800">
            <h2 className="text-base font-manrope font-bold text-white">
              Institutional Security & Workflow Audit Logs
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {auditLogs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/50">
                    <td className="px-5 py-3 font-mono text-zinc-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{log.event_type}</td>
                    <td className="px-4 py-3 font-mono text-zinc-300">{log.email_or_identifier}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.status === 'SUCCESS' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/50 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG FOR BULK/SINGLE TEACHER ASSIGNMENT */}
      {confirmAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="login-card-noir rounded-2xl shadow-2xl border border-zinc-700/80 bg-zinc-950 text-white w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="bg-zinc-900/90 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
              <h3 className="font-manrope font-bold text-base text-white">
                Confirm Faculty Assignment
              </h3>
              <button
                onClick={() => setConfirmAssignModal(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-zinc-300 leading-relaxed text-sm">
                You are about to assign <strong className="text-[#ef233c] font-bold">{confirmAssignModal.count}</strong> submission(s) to evaluator{' '}
                <strong className="text-white font-bold">{confirmAssignModal.teacher.name}</strong> ({confirmAssignModal.teacher.department}). Continue?
              </p>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-[11px] text-zinc-300">
                Status of all selected ideas will transition to <strong className="text-[#ef233c]">ASSIGNED TO TEACHER</strong>, and appear immediately in the evaluator's dashboard.
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmAssignModal(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold cursor-pointer border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmAssignment}
                  className="shiny-cta px-5 py-2 rounded-xl text-white font-manrope font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMBEDDED PDF INSPECTOR MODAL */}
      <SIHPdfViewerModal
        isOpen={Boolean(inspectSubmission)}
        onClose={() => setInspectSubmission(null)}
        submission={inspectSubmission}
        reviewerRole="ADMIN"
      />
    </div>
  );
};
