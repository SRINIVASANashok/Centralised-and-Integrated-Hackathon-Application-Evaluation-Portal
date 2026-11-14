import React, { useState, useEffect } from 'react';
import {
  Users,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  FileText,
  Eye,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  BookOpen,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import {
  fetchFacultyDashboard,
  fetchSIHTeacherSubmissions,
  reviewSIHSubmission,
} from '../services/api';
import { AuthenticatedUser } from '../types/auth';
import { SIHSubmission, SIHTeacherOverviewStats } from '../types/sih';
import { SIHPdfViewerModal } from '../components/SIHPdfViewerModal';

interface FacultyDashboardProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  onNavigateToFacultyRegister?: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  user,
  onLogout,
  onNavigateToFacultyRegister,
}) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<SIHSubmission[]>([]);
  const [stats, setStats] = useState<SIHTeacherOverviewStats>({
    total_assigned: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Modals
  const [selectedSubForView, setSelectedSubForView] = useState<SIHSubmission | null>(null);
  const [approveConfirmSub, setApproveConfirmSub] = useState<SIHSubmission | null>(null);
  const [approveFeedback, setApproveFeedback] = useState('');

  const [rejectConfirmSub, setRejectConfirmSub] = useState<SIHSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const loadTeacherData = async () => {
    setLoading(true);
    const [facProfileRes, teacherSubRes] = await Promise.all([
      fetchFacultyDashboard(),
      fetchSIHTeacherSubmissions(),
    ]);

    if (facProfileRes.success) setProfileData(facProfileRes.data);
    if (teacherSubRes.success) {
      setSubmissions(teacherSubRes.submissions || []);
      if (teacherSubRes.stats) setStats(teacherSubRes.stats);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  const faculty = profileData || {
    name: user.name,
    email: user.email,
    faculty_id: user.faculty?.faculty_id || 'SRM-FAC-CSE-014',
    department: user.faculty?.department || 'Department of Computer Science and Engineering',
    designation: user.faculty?.designation || 'Professor & Head of Department',
  };

  const handleConfirmApproval = async () => {
    if (!approveConfirmSub) return;
    setActionLoading(true);
    setStatusMessage(null);

    const res = await reviewSIHSubmission({
      submission_id: approveConfirmSub.id,
      decision: 'APPROVED',
      feedback: approveFeedback.trim() || undefined,
    });

    setActionLoading(false);

    if (res.success && res.submission) {
      setStatusMessage({ type: 'success', text: `Proposal "${approveConfirmSub.idea_title}" has been APPROVED successfully.` });
      setApproveConfirmSub(null);
      setApproveFeedback('');
      if (selectedSubForView?.id === approveConfirmSub.id) {
        setSelectedSubForView(null);
      }
      await loadTeacherData();
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to approve submission.' });
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectConfirmSub) return;
    if (!rejectionReason.trim()) {
      setRejectionError('Rejection reason is mandatory. Please state technical and presentation deficiencies.');
      return;
    }

    setActionLoading(true);
    setStatusMessage(null);
    setRejectionError(null);

    const res = await reviewSIHSubmission({
      submission_id: rejectConfirmSub.id,
      decision: 'REJECTED',
      rejection_reason: rejectionReason.trim(),
    });

    setActionLoading(false);

    if (res.success && res.submission) {
      setStatusMessage({ type: 'success', text: `Proposal "${rejectConfirmSub.idea_title}" was REJECTED. Feedback transmitted to student.` });
      setRejectConfirmSub(null);
      setRejectionReason('');
      if (selectedSubForView?.id === rejectConfirmSub.id) {
        setSelectedSubForView(null);
      }
      await loadTeacherData();
    } else {
      setRejectionError(res.error || 'Failed to record rejection.');
    }
  };

  // Filtered List
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.idea_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.register_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.problem_statement_id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return sub.status === 'ASSIGNED_TO_TEACHER' || sub.status === 'UNDER_REVIEW';
    if (statusFilter === 'APPROVED') return sub.status === 'APPROVED';
    if (statusFilter === 'REJECTED') return sub.status === 'REJECTED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-300 rounded">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 rounded">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            PENDING REVIEW
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 text-[#002147] animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Querying Faculty Assigned Submissions from Institutional Store...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-[#ef233c] uppercase tracking-widest font-mono">
              SRM IST Tiruchirappalli · SIH Internal Evaluation Committee
            </span>
            <span className="text-zinc-600">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Verified Faculty Evaluator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-manrope font-bold text-white tracking-tight">
            Welcome, {faculty.name}
          </h1>
          <p className="text-xs text-zinc-300 mt-1 font-normal">
            Faculty ID: <span className="font-mono font-bold text-[#ef233c]">{faculty.faculty_id}</span> · {faculty.designation} · {faculty.department}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToFacultyRegister && (
            <button
              onClick={onNavigateToFacultyRegister}
              className="shiny-cta px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              title="Register a new academic faculty member"
            >
              <UserPlus className="w-4 h-4 text-[#ef233c]" />
              <span className="font-manrope font-bold text-xs uppercase tracking-wider text-white">REGISTER FACULTY</span>
            </button>
          )}

          <a
            href="/api/sih/template-pdf"
            download="SRMIST_SIH_Idea_Template_YUVA_MegaThon.pdf"
            className="px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700/80 hover:border-[#ef233c] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#ef233c]" />
            <span>SIH Rubric Template</span>
          </a>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-500/40 hover:border-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4 text-[#ef233c]" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Faculty Onboarding Action Banner */}
      {onNavigateToFacultyRegister && (
        <div className="rounded-2xl bg-zinc-950/90 border border-zinc-700/80 backdrop-blur-2xl text-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-950/60 border border-[#ef233c]/40 rounded-xl text-[#ef233c] shrink-0 shadow-md">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#ef233c] tracking-widest font-mono">
                  Academic Staff Management
                </span>
              </div>
              <h3 className="font-manrope font-bold text-sm sm:text-base tracking-wide text-white mt-0.5">
                Faculty & Teacher Registration Gateway
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed font-normal">
                Add and onboard academic teachers and researchers to the institutional portal with their Name, Designation, FET ID, Email, Phone, and Research Area. Generates a one-time activation link for password setup.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToFacultyRegister}
            className="shiny-cta whitespace-nowrap px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md"
          >
            <span className="font-manrope font-bold text-xs uppercase tracking-wider text-white">REGISTER NEW FACULTY</span>
            <ArrowRight className="w-4 h-4 text-[#ef233c]" />
          </button>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border backdrop-blur-md ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* METRIC COUNTERS: Total Assigned, Pending Review, Approved, Rejected */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950/85 p-5 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-manrope">
            Total Assigned
          </span>
          <div className="text-2xl font-manrope font-bold text-white mt-1">
            {stats.total_assigned}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Allocated student ideas</span>
        </div>

        <div className="bg-zinc-950/85 p-5 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block font-manrope">
            Pending Review
          </span>
          <div className="text-2xl font-manrope font-bold text-amber-400 mt-1">
            {stats.pending_review}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Awaiting evaluation</span>
        </div>

        <div className="bg-zinc-950/85 p-5 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-manrope">
            Approved Ideas
          </span>
          <div className="text-2xl font-manrope font-bold text-emerald-400 mt-1">
            {stats.approved}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Selected for shortlist</span>
        </div>

        <div className="bg-zinc-950/85 p-5 rounded-2xl border border-zinc-700/80 shadow-xl backdrop-blur-xl text-white">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block font-manrope">
            Rejected Ideas
          </span>
          <div className="text-2xl font-manrope font-bold text-rose-400 mt-1">
            {stats.rejected}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Sent for revision</span>
        </div>
      </div>

      {/* ASSIGNED IDEAS TABLE & REVIEW SECTION */}
      <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
        <div className="bg-zinc-950/90 px-6 py-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base font-manrope font-bold text-white">
              Assigned Ideas for Evaluation
            </h2>
            <p className="text-xs text-zinc-300 mt-0.5">
              Strictly showing submissions assigned specifically to your faculty account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search ideas, students, PS ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs border border-zinc-700/80 rounded-xl focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 w-56 bg-zinc-900/90 text-white placeholder-zinc-500 font-medium"
              />
            </div>

            {/* Filter Buttons */}
            <div className="inline-flex rounded-xl border border-zinc-700/80 p-1 bg-zinc-900 text-xs">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-[#ef233c] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            <BookOpen className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="font-semibold text-white">No submissions matching current criteria.</p>
            <p className="mt-1 text-zinc-400">
              Submissions will appear here once allocated by the SIH Hackathon Administrator.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-bold font-mono">
                <tr>
                  <th className="px-5 py-3.5">Student & Team</th>
                  <th className="px-4 py-3.5">Department & Year</th>
                  <th className="px-4 py-3.5">Idea Title & Problem Statement</th>
                  <th className="px-4 py-3.5">Submission Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{sub.student_name}</div>
                      <div className="font-mono text-[11px] text-[#ef233c]">{sub.register_number}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Team: <strong className="text-zinc-200">{sub.team_name}</strong> ({sub.team_id})
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-zinc-200">{sub.department}</div>
                      <div className="text-[11px] text-zinc-400">{sub.section} · {sub.year}</div>
                    </td>

                    <td className="px-4 py-4 max-w-xs">
                      <div className="font-manrope font-bold text-white line-clamp-1">{sub.idea_title}</div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        <span className="text-[#ef233c]">{sub.problem_statement_id}:</span> <span className="text-zinc-300 font-sans">{sub.problem_statement_title}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{sub.theme} ({sub.category})</div>
                    </td>

                    <td className="px-4 py-4 text-zinc-400 font-mono text-[11px]">
                      {new Date(sub.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-4">
                      {getStatusBadge(sub.status)}
                    </td>

                    <td className="px-4 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSubForView(sub)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl font-semibold text-[11px] transition-all cursor-pointer border border-zinc-700/80 shadow-sm"
                        title="View PDF directly in browser"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#ef233c]" />
                        <span>View PDF</span>
                      </button>

                      {sub.status !== 'APPROVED' && (
                        <div className="inline-flex items-center gap-1.5 ml-2">
                          <button
                            type="button"
                            onClick={() => {
                              setApproveConfirmSub(sub);
                              setApproveFeedback('');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectConfirmSub(sub);
                              setRejectionReason('');
                              setRejectionError(null);
                            }}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/60 text-rose-400 border border-rose-500/40 hover:border-rose-400 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Embedded PDF Viewer Modal */}
      <SIHPdfViewerModal
        isOpen={Boolean(selectedSubForView)}
        onClose={() => setSelectedSubForView(null)}
        submission={selectedSubForView}
        reviewerRole="TEACHER"
        onApprove={(id) => {
          const s = submissions.find((item) => item.id === id);
          if (s) {
            setApproveConfirmSub(s);
            setApproveFeedback('');
          }
        }}
        onReject={(id) => {
          const s = submissions.find((item) => item.id === id);
          if (s) {
            setRejectConfirmSub(s);
            setRejectionReason('');
            setRejectionError(null);
          }
        }}
      />

      {/* APPROVAL CONFIRMATION DIALOG */}
      {approveConfirmSub && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="login-card-noir rounded-2xl shadow-2xl border border-zinc-700/80 bg-zinc-950 text-white w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="bg-zinc-900/90 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-manrope font-bold text-base text-white">
                  Confirm Idea Approval
                </h3>
              </div>
              <button
                onClick={() => setApproveConfirmSub(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-emerald-200">
                <p className="font-semibold text-sm mb-1 text-white">{approveConfirmSub.idea_title}</p>
                <p className="text-zinc-300">
                  Team: <strong className="text-white">{approveConfirmSub.team_name}</strong> · Lead: {approveConfirmSub.student_name} ({approveConfirmSub.register_number})
                </p>
              </div>

              <p className="text-zinc-300 leading-relaxed">
                By approving, you verify that this idea conforms to SIH criteria, possesses technical feasibility, and complies with the 6-slide structure. This idea will be added to the Admin <strong className="text-white">"Approved Ideas"</strong> section for final hackathon selection.
              </p>

              <div>
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1 font-manrope">
                  Optional Recommendation Comments / Feedback:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Excellent architectural breakdown. Recommend advancing to national round."
                  value={approveFeedback}
                  onChange={(e) => setApproveFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-xl bg-zinc-900 text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApproveConfirmSub(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold cursor-pointer border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmApproval}
                  className="shiny-cta px-5 py-2 rounded-xl text-white font-manrope font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {actionLoading ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON DIALOG (MANDATORY REASON) */}
      {rejectConfirmSub && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="login-card-noir rounded-2xl shadow-2xl border border-zinc-700/80 bg-zinc-950 text-white w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="bg-zinc-900/90 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-manrope font-bold text-base text-white">
                  Reject Submission with Required Reason
                </h3>
              </div>
              <button
                onClick={() => setRejectConfirmSub(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-rose-200">
                <p className="font-semibold text-sm mb-1 text-white">{rejectConfirmSub.idea_title}</p>
                <p className="text-zinc-300">
                  Team: <strong className="text-white">{rejectConfirmSub.team_name}</strong> · Lead: {rejectConfirmSub.student_name} ({rejectConfirmSub.register_number})
                </p>
              </div>

              {rejectionError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 font-medium">
                  {rejectionError}
                </div>
              )}

              <div>
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1 font-manrope">
                  Rejection Reason <span className="text-[#ef233c]">* (Mandatory)</span>:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Specify deficiencies clearly (e.g. Missing technical feasibility diagram; slide limit exceeded; inadequate offline architecture for rural deployment)."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-700/80 rounded-xl bg-zinc-900 text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  This explanation will be immediately visible on the student's dashboard to guide their resubmission.
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectConfirmSub(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold cursor-pointer border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmRejection}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {actionLoading ? 'Recording Rejection...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
