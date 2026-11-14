import React, { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Upload,
  FileText,
  Eye,
  RefreshCw,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  History,
  AlertTriangle,
  Award,
  Calendar,
  Lightbulb,
} from 'lucide-react';
import {
  fetchStudentDashboard,
  fetchSIHInfo,
  fetchMySIHSubmission,
  submitSIHIdea,
} from '../services/api';
import { AuthenticatedUser } from '../types/auth';
import { SIHHackathonInfo, SIHSubmission } from '../types/sih';
import { SIHPdfViewerModal } from '../components/SIHPdfViewerModal';
import { SIHTemplateModal } from '../components/SIHTemplateModal';

interface StudentDashboardProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  onOpenTimeline: () => void;
  onOpenProblems: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, onOpenTimeline, onOpenProblems }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [sihInfo, setSihInfo] = useState<SIHHackathonInfo | null>(null);
  const [submission, setSubmission] = useState<SIHSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Modals
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    idea_title: '',
    problem_statement_id: '',
    problem_statement_title: '',
    theme: 'Agriculture, FoodTech & Rural Development',
    category: 'Software' as 'Software' | 'Hardware' | 'Both',
    team_id: '',
    team_name: '',
    team_members: '',
    one_line_pitch: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [profileRes, infoRes, subRes] = await Promise.all([
      fetchStudentDashboard(),
      fetchSIHInfo(),
      fetchMySIHSubmission(),
    ]);

    if (profileRes.success) setDashboardData(profileRes.data);
    if (infoRes.success && infoRes.info) setSihInfo(infoRes.info);
    if (subRes.success) setSubmission(subRes.submission || null);

    // Auto-prefill team lead name in form
    const leadName = profileRes.data?.name || user.name;
    const defaultTeamId = `SRM-SIH-2026-${(profileRes.data?.register_number || '0000').slice(-4)}`;
    setFormData((prev) => ({
      ...prev,
      team_id: prev.team_id || defaultTeamId,
      team_members: prev.team_members || `${leadName} (Lead)`,
    }));

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const student = dashboardData || {
    name: user.name,
    email: user.email,
    register_number: user.student?.register_number || 'RA2411003010042',
    department: user.student?.department || 'Computer Science and Engineering',
    section: user.student?.section || 'Section A',
    year: user.student?.year || '2nd Year',
    phone: user.phone || '+91 98765 43210',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      setFileBase64('');
      return;
    }

    // Strict validation: Only PDF accepted
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setFileError('Invalid file type! Only PDF files are supported. PPT, PPTX, DOC, DOCX, ZIP and images are not accepted.');
      setSelectedFile(null);
      setFileBase64('');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setFileError('File size exceeds the 20MB institutional limit. Please compress your PDF before uploading.');
      setSelectedFile(null);
      setFileBase64('');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!formData.idea_title.trim() || !formData.problem_statement_id.trim() || !formData.problem_statement_title.trim() || !formData.team_id.trim() || !formData.team_name.trim()) {
      setSubmitError('Please complete all required fields (Idea Title, PS ID, PS Title, Team ID, Team Name).');
      return;
    }

    if (!selectedFile || !fileBase64) {
      setSubmitError('Please attach your completed SIH idea PPT saved as a PDF file.');
      return;
    }

    setSubmitting(true);
    const res = await submitSIHIdea({
      ...formData,
      pdf_filename: selectedFile.name,
      pdf_data_base64: fileBase64,
    });

    setSubmitting(false);

    if (res.success && res.submission) {
      setSubmission(res.submission);
      setSubmitSuccess(res.message || 'SIH Idea submitted successfully!');
      setIsResubmitting(false);
      setSelectedFile(null);
      setFileBase64('');
    } else {
      setSubmitError(res.error || 'Submission failed. Please check inputs and retry.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-300 rounded-md">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            REJECTED
          </span>
        );
      case 'ASSIGNED_TO_TEACHER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-300 rounded-md">
            <Clock className="w-4 h-4 text-blue-600" />
            ASSIGNED TO TEACHER
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-300 rounded-md">
            <Clock className="w-4 h-4 text-indigo-600" />
            UNDER REVIEW
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 rounded-md">
            <Clock className="w-4 h-4 text-amber-600" />
            SUBMITTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 rounded-md">
            NOT SUBMITTED
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 text-[#002147] animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading Verified Student & SIH Hackathon Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-[#ef233c] uppercase tracking-widest font-mono">
              SRM IST Tiruchirappalli · Student Hackathon Portal
            </span>
            <span className="text-zinc-600">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Verified Student Account
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-manrope font-bold text-white tracking-tight">
            Welcome, {student.name}
          </h1>
          <p className="text-xs text-zinc-300 mt-1 font-normal">
            Register No: <span className="font-mono font-bold text-[#ef233c]">{student.register_number}</span> · Department: <span className="font-semibold text-zinc-200">{student.department}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTimeline}
            className="px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700/80 hover:border-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Roadmap & Rubrics</span>
          </button>
          <button
            onClick={onOpenProblems}
            className="px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700/80 hover:border-violet-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Lightbulb className="w-4 h-4 text-violet-400" />
            <span>Problem Statements</span>
          </button>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700/80 hover:border-[#ef233c] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-[#ef233c]" />
            <span>View Template Pointers</span>
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

      {/* SECTION 1: A. STUDENT DETAILS */}
      <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
        <div className="bg-zinc-950/90 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#ef233c]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-manrope">
              1. Student Details (Institutional Database Record)
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 italic">
            Auto-linked from existing verified student profile
          </span>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 text-xs">
          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Full Name</span>
            <span className="font-bold text-white mt-1 block truncate">{student.name}</span>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Register Number</span>
            <span className="font-mono font-bold text-[#ef233c] mt-1 block">{student.register_number}</span>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 sm:col-span-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Department</span>
            <span className="font-semibold text-zinc-200 mt-1 block truncate">{student.department}</span>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Section</span>
            <span className="font-semibold text-zinc-200 mt-1 block">{student.section}</span>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Year of Study</span>
            <span className="font-semibold text-zinc-200 mt-1 block">{student.year}</span>
          </div>

          <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800 lg:col-span-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Phone Number</span>
            <span className="font-mono text-zinc-200 mt-1 block truncate">{student.phone}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: B. SIH INTERNAL HACKATHON & C. IDEA PPT TEMPLATE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Hackathon Overview Card */}
        <div className="md:col-span-7 login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl p-6 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-[#ef233c] uppercase tracking-widest bg-red-950/60 px-2.5 py-0.5 rounded-full border border-[#ef233c]/40 font-mono">
                Official Screening Round
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-[11px] font-semibold text-zinc-300">YUVA Mega-Thon 2026</span>
            </div>

            <h3 className="text-xl font-manrope font-bold text-white mb-2">
              {sihInfo?.title || 'SRM IST SIH Internal Hackathon 2026 – YUVA Mega-Thon'}
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4 font-normal">
              The internal hackathon is the official institutional evaluation gateway organized by SRMIST Tiruchirappalli Student Chapter (ACM, IET, IEEE STB60221343 & StarTech). All student teams aiming to qualify for Smart India Hackathon 2026 must submit their idea proposal in the standardized institutional presentation format.
            </p>

            <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-4 mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5 font-manrope">
                <ShieldCheck className="w-4 h-4 text-[#ef233c]" />
                Mandatory Submission Instructions & Rules:
              </h4>
              <ul className="text-xs text-zinc-300 space-y-1.5 font-normal">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef233c] mt-1.5 shrink-0" />
                  <span><strong className="text-white">Slide Limit:</strong> Maximum 6 slides including the title slide (or up to 12 slides following the YUVA Mega-Thon pointer schema).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef233c] mt-1.5 shrink-0" />
                  <span><strong className="text-white">Clarity:</strong> Avoid long paragraphs; prefer concise bullet points, architectural diagrams, and clear figures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef233c] mt-1.5 shrink-0" />
                  <span><strong className="text-white">Template Compliance:</strong> The provided template must be used without altering required pointers and flow.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span className="text-rose-300 font-semibold">
                    <strong className="text-rose-200">Strict PDF Format:</strong> Only PDF files are supported. PPT, PPTX, DOC, DOCX, ZIP and images are rejected.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800 pt-3 font-mono">
            <span>Deadline: <strong className="text-[#ef233c]">{sihInfo?.registration_deadline || 'October 15, 2026'}</strong></span>
            <span>Evaluation: <strong className="text-white">{sihInfo?.evaluation_deadline || 'October 25, 2026'}</strong></span>
          </div>
        </div>

        {/* Idea PPT Template Card */}
        <div className="md:col-span-5 rounded-2xl border border-zinc-700/80 bg-zinc-950/90 backdrop-blur-2xl shadow-xl p-6 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef233c]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-[#ef233c]/50 flex items-center justify-center text-[#ef233c] mb-4 shadow-md">
              <Download className="w-5 h-5" />
            </div>

            <span className="text-[10px] font-bold text-[#ef233c] uppercase tracking-widest block mb-1 font-mono">
              Official Reference Document
            </span>
            <h3 className="text-lg font-manrope font-bold text-white mb-2">
              SIH Idea PPT Template
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4 font-normal">
              Download the official institutional idea presentation template containing all required pointers:
            </p>

            <ul className="text-xs text-zinc-300 space-y-2 mb-6 font-normal">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>Title / Problem Statement details</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>Idea / Proposed Solution & Architecture</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>Technical Approach & Tech Stack</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>Feasibility, Viability & Implementation Plan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>Impact, Benefits & Research References</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 relative z-10">
            <a
              href="/api/sih/template-pdf"
              download="SRMIST_SIH_Idea_Template_YUVA_MegaThon.pdf"
              className="shiny-cta w-full text-center flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-manrope font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download SIH Idea PPT Template</span>
            </a>

            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700/80 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#ef233c]" />
              <span>Inspect 12-Slide Specification</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: STUDENT SUBMISSION STATUS */}
      {submission && (
        <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
          <div className="bg-zinc-950/90 px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#ef233c] uppercase tracking-widest font-mono">
                  Submission Status Tracker
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs font-mono font-semibold text-zinc-300">
                  Version {submission.submission_version || 1}
                </span>
              </div>
              <h3 className="text-lg font-manrope font-bold text-white mt-0.5">
                {submission.idea_title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(submission.status)}
              {submission.history && submission.history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-all cursor-pointer shadow-sm"
                >
                  <History className="w-3.5 h-3.5 text-[#ef233c]" />
                  <span>History ({submission.history.length})</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Submission Date</span>
                <span className="font-semibold text-white mt-1 block">
                  {new Date(submission.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Team Identity</span>
                <span className="font-bold text-white mt-1 block">{submission.team_name}</span>
                <span className="font-mono text-[10px] text-[#ef233c]">{submission.team_id}</span>
              </div>

              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Problem Statement</span>
                <span className="font-mono font-bold text-[#ef233c] mt-1 block">{submission.problem_statement_id}</span>
                <span className="text-[11px] text-zinc-300 truncate block">{submission.problem_statement_title}</span>
              </div>

              <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Assigned Evaluator</span>
                <span className="font-semibold text-white mt-1 block">
                  {submission.assigned_teacher_name || 'Pending Faculty Allocation'}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {submission.assigned_teacher_dept || 'Institutional Committee'}
                </span>
              </div>
            </div>

            {/* Rejection Notification & Reason */}
            {submission.status === 'REJECTED' && submission.rejection_reason && (
              <div className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs space-y-2 backdrop-blur-md">
                <div className="flex items-center gap-2 text-rose-300 font-bold uppercase tracking-wider font-manrope">
                  <AlertCircle className="w-4 h-4 text-[#ef233c]" />
                  <span>Evaluation Committee Review Decision: REJECTED</span>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-lg border border-rose-500/30 text-rose-200 font-medium leading-relaxed">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold mb-1">Reason for Rejection:</span>
                  {submission.rejection_reason}
                </div>
                {submission.reviewed_by_teacher_name && (
                  <p className="text-[11px] text-zinc-400">
                    Evaluated by: <strong className="text-white">{submission.reviewed_by_teacher_name}</strong> on{' '}
                    {submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleDateString() : 'N/A'}
                  </p>
                )}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResubmitting(true);
                      setFormData({
                        idea_title: submission.idea_title,
                        problem_statement_id: submission.problem_statement_id,
                        problem_statement_title: submission.problem_statement_title,
                        theme: submission.theme,
                        category: submission.category,
                        team_id: submission.team_id,
                        team_name: submission.team_name,
                        team_members: submission.team_members || '',
                        one_line_pitch: submission.one_line_pitch || '',
                      });
                    }}
                    className="px-4 py-2.5 bg-[#ef233c] hover:bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resubmit Revised Idea (Version {(submission.submission_version || 1) + 1})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Approval Notification */}
            {submission.status === 'APPROVED' && (
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs space-y-2 backdrop-blur-md">
                <div className="flex items-center gap-2 text-emerald-300 font-bold uppercase tracking-wider font-manrope">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Idea Proposal APPROVED for Smart India Hackathon Shortlist</span>
                </div>
                {submission.review_feedback && (
                  <p className="text-emerald-200 bg-zinc-900/90 p-3 rounded-lg border border-emerald-500/30">
                    {submission.review_feedback}
                  </p>
                )}
                {submission.reviewed_by_teacher_name && (
                  <p className="text-[11px] text-zinc-300">
                    Evaluated and Recommended by: <strong className="text-white">{submission.reviewed_by_teacher_name}</strong>
                  </p>
                )}
              </div>
            )}

            {/* PDF File Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <FileText className="w-4 h-4 text-[#ef233c]" />
                <span>Uploaded Document: <strong className="font-mono text-white">{submission.pdf_filename}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-all cursor-pointer shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-[#ef233c]" />
                  <span>Inspect PDF Presentation</span>
                </button>

                <a
                  href={`/api/sih/submissions/${submission.id}/pdf`}
                  download={submission.pdf_filename}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#ef233c]" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: D. SUBMIT IDEA (Show form if no submission, or if resubmitting rejected idea) */}
      {(!submission || isResubmitting) && (
        <div className="login-card-noir rounded-2xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
          <div className="bg-zinc-950/90 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#ef233c]" />
              <h2 className="text-base font-manrope font-bold text-white">
                {isResubmitting ? 'Resubmit Revised Idea Presentation' : 'Submit Idea Presentation'}
              </h2>
            </div>
            {isResubmitting && (
              <button
                type="button"
                onClick={() => setIsResubmitting(false)}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Cancel Resubmission
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitIdea} className="p-6 sm:p-8 space-y-6">
            {submitError && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5 backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Idea Title */}
              <div className="md:col-span-2">
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1.5 font-manrope">
                  Idea Title <span className="text-[#ef233c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AgriVision: Autonomous Drone Pest Detection"
                  value={formData.idea_title}
                  onChange={(e) => setFormData({ ...formData, idea_title: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                />
              </div>

              {/* Problem Statement ID */}
              <div>
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1.5 font-manrope">
                  Problem Statement ID <span className="text-[#ef233c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SIH1604"
                  value={formData.problem_statement_id}
                  onChange={(e) => setFormData({ ...formData, problem_statement_id: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-mono font-medium transition-all shadow-inner"
                />
              </div>

              {/* Problem Statement Title */}
              <div>
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1.5 font-manrope">
                  Problem Statement Title <span className="text-[#ef233c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Driven Crop Surveillance and Real-Time Pathology"
                  value={formData.problem_statement_title}
                  onChange={(e) => setFormData({ ...formData, problem_statement_title: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                />
              </div>

              {/* Theme */}
              <div>
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1.5 font-manrope">
                  Theme <span className="text-[#ef233c]">*</span>
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner cursor-pointer"
                >
                  <option value="Smart Education & Learning" className="bg-zinc-900 text-white">Smart Education & Learning</option>
                  <option value="Agriculture, FoodTech & Rural Development" className="bg-zinc-900 text-white">Agriculture, FoodTech & Rural Development</option>
                  <option value="Clean & Green Technology & Renewable Energy" className="bg-zinc-900 text-white">Clean & Green Technology & Renewable Energy</option>
                  <option value="Healthcare & Biomedical Devices" className="bg-zinc-900 text-white">Healthcare & Biomedical Devices</option>
                  <option value="Smart Automation, Robotics & Mobility" className="bg-zinc-900 text-white">Smart Automation, Robotics & Mobility</option>
                  <option value="Cybersecurity, Cryptography & Blockchain" className="bg-zinc-900 text-white">Cybersecurity, Cryptography & Blockchain</option>
                  <option value="Disaster Management & Resilient Infrastructure" className="bg-zinc-900 text-white">Disaster Management & Resilient Infrastructure</option>
                  <option value="Open Innovation (Software & Hardware)" className="bg-zinc-900 text-white">Open Innovation (Software & Hardware)</option>
                </select>
              </div>

              {/* PS Category */}
              <div>
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1.5 font-manrope">
                  PS Category <span className="text-[#ef233c]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Software', 'Hardware', 'Both'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`py-2.5 px-3 text-center rounded-xl font-semibold text-xs cursor-pointer transition-all border ${
                        formData.category === cat
                          ? 'bg-[#ef233c] text-white border-[#ef233c] shadow-md'
                          : 'bg-zinc-900/90 text-zinc-300 border-zinc-700/80 hover:bg-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team ID */}
              <div>
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1.5 font-manrope">
                  Team ID <span className="text-[#ef233c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SRM-SIH-2026-042"
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-mono font-medium transition-all shadow-inner"
                />
              </div>

              {/* Team Name */}
              <div>
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1.5 font-manrope">
                  Team Name <span className="text-[#ef233c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AgriBots SRM"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                />
              </div>

              {/* Team Members */}
              <div className="md:col-span-2">
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1.5 font-manrope">
                  Team Members (Names & Roles)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aaditya Narayanan (Lead), S. Harish, M. Swetha, K. Rohith, T. Ananya, P. Rajesh"
                  value={formData.team_members}
                  onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                />
              </div>

              {/* One-Line Pitch */}
              <div className="md:col-span-2">
                <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-1.5 font-manrope">
                  One-Line Pitch (Elevator Summary)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous multispectral drone surveillance detecting crop pathogens with 98% accuracy."
                  value={formData.one_line_pitch}
                  onChange={(e) => setFormData({ ...formData, one_line_pitch: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                />
              </div>
            </div>

            {/* PDF Upload Component */}
            <div className="pt-2">
              <label className="block font-bold text-zinc-200 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between font-manrope">
                <span>Upload SIH Idea Presentation (PDF Only) <span className="text-[#ef233c]">*</span></span>
                <span className="text-zinc-400 font-normal normal-case">Strictly PDF (Max 20MB)</span>
              </label>

              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                fileError
                  ? 'border-rose-500/80 bg-rose-950/30'
                  : selectedFile
                  ? 'border-emerald-500/80 bg-emerald-950/30'
                  : 'border-zinc-700 hover:border-[#ef233c] bg-zinc-900/60'
              }`}>
                <input
                  type="file"
                  id="pdf-upload-input"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{selectedFile.name}</p>
                      <p className="text-zinc-400 text-xs mt-0.5 font-mono">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Valid Institutional PDF Document
                      </p>
                    </div>
                    <label
                      htmlFor="pdf-upload-input"
                      className="text-xs text-[#ef233c] font-semibold underline hover:text-red-400 cursor-pointer mt-1"
                    >
                      Change selected PDF
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-[#ef233c] flex items-center justify-center border border-zinc-700">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        Select completed SIH Idea presentation PDF
                      </p>
                      <p className="text-zinc-400 text-xs mt-0.5">
                        Please save your PPT slides as PDF before uploading.
                      </p>
                    </div>
                    <label
                      htmlFor="pdf-upload-input"
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-zinc-700 hover:border-[#ef233c] cursor-pointer mt-2 shadow-sm"
                    >
                      Browse PDF File
                    </label>
                  </div>
                )}
              </div>

              {fileError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{fileError}</span>
                </p>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-xs text-zinc-400">
                Submitted under student account: <strong className="font-mono text-[#ef233c]">{student.register_number}</strong>
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="shiny-cta px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center gap-2 text-white font-manrope font-bold text-xs uppercase tracking-wider">
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying & Uploading PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#ef233c]" />
                      <span>Submit SIH Idea (PDF)</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Modal for Previous Submissions */}
      {showHistoryModal && submission && submission.history && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden">
            <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#c5a059]" />
                Historical Submission Records
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
              {submission.history.map((h) => (
                <div key={h.id} className="py-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Version {h.version}</span>
                    <span className="font-mono text-slate-500">
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {h.pdf_filename}
                    </span>
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">
                      {h.status}
                    </span>
                  </div>
                  {h.rejection_reason && (
                    <div className="bg-rose-50 border border-rose-200 p-2.5 rounded text-rose-900">
                      <strong>Rejection Reason: </strong>
                      {h.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SIHPdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        submission={submission}
        reviewerRole="STUDENT"
      />

      <SIHTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        info={sihInfo}
      />
    </div>
  );
};
