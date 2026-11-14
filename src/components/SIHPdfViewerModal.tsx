import React from 'react';
import { X, ExternalLink, Download, FileText, CheckCircle2, AlertCircle, Clock, ShieldCheck, User } from 'lucide-react';
import { SIHSubmission } from '../types/sih';

interface SIHPdfViewerModalProps {
  submission: SIHSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  // If teacher review actions are enabled in this modal
  reviewerRole?: 'TEACHER' | 'ADMIN' | 'STUDENT';
  onApprove?: (submissionId: string) => void;
  onReject?: (submissionId: string) => void;
}

export const SIHPdfViewerModal: React.FC<SIHPdfViewerModalProps> = ({
  submission,
  isOpen,
  onClose,
  reviewerRole = 'ADMIN',
  onApprove,
  onReject,
}) => {
  if (!isOpen || !submission) return null;

  const pdfUrl = `/api/sih/submissions/${submission.id}/pdf`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            REJECTED
          </span>
        );
      case 'ASSIGNED_TO_TEACHER':
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            ASSIGNED / UNDER REVIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            SUBMITTED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="login-card-noir rounded-2xl shadow-2xl border border-zinc-700/80 bg-zinc-950 text-white w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-950/90 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-[#ef233c]/50 flex items-center justify-center text-[#ef233c] shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#ef233c] tracking-widest uppercase font-mono">
                  SRM IST Internal Hackathon 2026 · PDF Inspector
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {submission.team_id}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-manrope font-bold text-white truncate max-w-xl">
                {submission.idea_title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-colors"
              title="Open PDF in new window"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ef233c]" />
              <span>Open in New Tab</span>
            </a>
            <a
              href={pdfUrl}
              download={submission.pdf_filename}
              className="shiny-cta inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-bold text-xs transition-colors"
              title="Download original PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors ml-2 cursor-pointer border border-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata Details Ribbon */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">Lead Student</span>
            <span className="font-semibold text-white truncate block">{submission.student_name}</span>
            <span className="text-[10px] font-mono text-[#ef233c]">{submission.register_number}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">Academic Unit</span>
            <span className="font-semibold text-white truncate block">{submission.department}</span>
            <span className="text-[10px] text-zinc-300">{submission.section} · {submission.year}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">Problem Statement</span>
            <span className="font-mono font-bold text-[#ef233c] block">{submission.problem_statement_id}</span>
            <span className="text-[10px] text-zinc-300 truncate block">{submission.problem_statement_title}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">Theme / Category</span>
            <span className="font-semibold text-white truncate block">{submission.theme}</span>
            <span className="text-[10px] text-zinc-400">{submission.category} Track</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">Evaluator</span>
            <span className="font-semibold text-white truncate block">
              {submission.assigned_teacher_name || 'Unassigned'}
            </span>
            <span className="text-[10px] text-zinc-400">
              {submission.assigned_teacher_dept || 'Pending Allocation'}
            </span>
          </div>

          <div className="flex flex-col justify-center items-start sm:items-end">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1 font-mono">Status</span>
            {getStatusBadge(submission.status)}
          </div>
        </div>

        {/* Feedback / Rejection Notice if applicable */}
        {submission.status === 'REJECTED' && submission.rejection_reason && (
          <div className="bg-rose-950/40 border-b border-rose-500/40 px-6 py-2.5 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white">Faculty Review Rejection Notice: </strong>
              <span>{submission.rejection_reason}</span>
              {submission.reviewed_by_teacher_name && (
                <span className="text-zinc-400 ml-2 font-mono text-[11px]">
                  (Evaluated by {submission.reviewed_by_teacher_name})
                </span>
              )}
            </div>
          </div>
        )}

        {submission.status === 'APPROVED' && submission.review_feedback && (
          <div className="bg-emerald-950/40 border-b border-emerald-500/40 px-6 py-2.5 flex items-start gap-2.5 text-xs text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white">Evaluator Feedback: </strong>
              <span>{submission.review_feedback}</span>
              {submission.reviewed_by_teacher_name && (
                <span className="text-emerald-400 ml-2 font-mono text-[11px]">
                  (Approved by {submission.reviewed_by_teacher_name})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Embedded PDF Viewer */}
        <div className="flex-1 bg-zinc-900 min-h-[500px] relative">
          <iframe
            src={pdfUrl}
            title={submission.idea_title}
            className="w-full h-full min-h-[520px] border-0"
          />
        </div>

        {/* Footer Actions (Especially for Teacher reviewing) */}
        <div className="bg-zinc-950 border-t border-zinc-800 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-zinc-400 flex items-center gap-3">
            <span>Team Members: <strong className="text-white">{submission.team_members || submission.student_name}</strong></span>
            <span>·</span>
            <span>File: <strong className="font-mono text-zinc-300">{submission.pdf_filename}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            {reviewerRole === 'TEACHER' && submission.status !== 'APPROVED' && (
              <>
                <button
                  type="button"
                  onClick={() => onReject && onReject(submission.id)}
                  className="px-4 py-2 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/50 rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  REJECT IDEA
                </button>
                <button
                  type="button"
                  onClick={() => onApprove && onApprove(submission.id)}
                  className="shiny-cta px-4 py-2 rounded-xl text-white font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  APPROVE IDEA
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
