import React from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface HackathonTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HackathonTimelineModal: React.FC<HackathonTimelineModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const milestones = [
    {
      phase: 'Phase 1: Registration & Idea Submission',
      date: 'Sept 15 – Oct 25, 2026',
      status: 'ACTIVE NOW',
      statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      description:
        'Team registration (6 students, minimum 1 female mandatory) with assigned faculty guide. Submission of 3-page idea summary PPT following official AICTE / SIH template.',
    },
    {
      phase: 'Phase 2: Department Internal Screening',
      date: 'Oct 28 – Nov 05, 2026',
      status: 'UPCOMING',
      statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      description:
        'Departmental panels evaluate submissions based on novelty, technical feasibility, social/economic impact, and architectural clarity. Guide endorsement verified.',
    },
    {
      phase: 'Phase 3: Campus Hackathon & Jury Evaluation',
      date: 'Nov 12 – Nov 14, 2026',
      status: 'SCHEDULED',
      statusColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
      description:
        'Shortlisted teams present working prototypes and live demos before academic and industry jury panels. Top 35 teams selected for central nomination.',
    },
    {
      phase: 'Phase 4: Central SPOC Portal Nomination & Export',
      date: 'Nov 20, 2026',
      status: 'FINAL',
      statusColor: 'bg-red-500/20 text-[#ef233c] border-[#ef233c]/40',
      description:
        'Official institutional endorsement by SRM IST Tiruchirappalli Single Point of Contact (SPOC). Central export & submission to national portal.',
    },
  ];

  const rubrics = [
    { title: 'Novelty & Innovation', weight: '25%', desc: 'Uniqueness of the solution vs existing market products.' },
    { title: 'Technical Feasibility', weight: '25%', desc: 'Realistic architecture, edge/cloud stack, hardware readiness.' },
    { title: 'Impact & Relevance', weight: '25%', desc: 'Social, environmental, or economic benefit to stakeholders.' },
    { title: 'Execution & Prototype', weight: '25%', desc: 'Completeness of demo, UI polish, presentation clarity.' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="login-card-noir w-full max-w-3xl bg-zinc-950/95 border border-zinc-700/80 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(239,35,60,0.2)] text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold mb-2">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>HACKATHON SCHEDULE & EVALUATION RUBRICS</span>
            </div>
            <h2 className="text-2xl font-bold font-manrope text-white tracking-tight">
              Institutional Hackathon Roadmap & Rules
            </h2>
            <p className="text-xs text-zinc-300 mt-1">
              SRM Institute of Science and Technology Tiruchirappalli official selection timeline and mandatory criteria.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#ef233c] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Mandatory Team Composition Notice */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 flex items-start gap-3 text-xs">
            <Users className="w-5 h-5 text-[#ef233c] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white font-manrope block text-sm">
                Mandatory Team Composition Regulations
              </span>
              <p className="text-zinc-300 leading-relaxed">
                Each competing team must consist of exactly <strong className="text-white">6 students</strong> from SRM IST Tiruchirappalli with at least <strong className="text-white">1 female team member</strong> and 1 nominated <strong className="text-white">faculty guide</strong>. Cross-department teams (e.g., CSE + ECE + Mech) are encouraged.
              </p>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono mb-3">
              Official Key Milestones
            </h3>
            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ef233c]" />
                      <h4 className="text-sm font-bold text-white font-manrope">{m.phase}</h4>
                    </div>
                    <p className="text-xs text-zinc-300 pl-4">{m.description}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 pl-4 sm:pl-0">
                    <span className="text-xs font-mono text-zinc-300">{m.date}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold mt-1 ${m.statusColor}`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Rubrics */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono mb-3">
              Jury Evaluation Rubric (100 Points Total)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rubrics.map((r, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between gap-3"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white font-manrope">{r.title}</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{r.desc}</p>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-zinc-800 text-[#ef233c] shrink-0 border border-zinc-700">
                    {r.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <span>SRM IST Hackathon Oversight Committee</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold cursor-pointer transition-colors"
          >
            Close Roadmap
          </button>
        </div>
      </div>
    </div>
  );
};
