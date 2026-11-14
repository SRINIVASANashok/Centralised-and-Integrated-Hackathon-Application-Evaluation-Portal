import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, ChevronRight, ChevronLeft, Lightbulb, BookOpen, AlertTriangle } from 'lucide-react';
import { SIHHackathonInfo, SIHTemplateSlide } from '../types/sih';

interface SIHTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  info?: SIHHackathonInfo | null;
}

export const SIHTemplateModal: React.FC<SIHTemplateModalProps> = ({
  isOpen,
  onClose,
  info,
}) => {
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);

  if (!isOpen) return null;

  const slides: SIHTemplateSlide[] = info?.template_slides || [
    {
      slide_number: 1,
      title: 'Team Details & Track Details',
      description: 'Team structure, contact details, and chosen problem statement',
      pointers: [
        'Team Name & Team Members (6 members with mandatory female representation if applicable)',
        'College/Organization: SRMIST Tiruchirappalli',
        'Team Leader contact email and phone',
        'Track Name & Problem Statement ID / Title',
      ],
      tips: 'Ensure all member register numbers match official student portal records.',
    },
    {
      slide_number: 2,
      title: 'Problem Statement',
      description: 'Contextualizing the core operational challenge',
      pointers: [
        'What problem are you trying to solve?',
        'Who faces this problem? (Impacted stakeholders)',
        'Why is this problem important? (Scale and socioeconomic cost)',
      ],
      tips: 'Avoid generic statements; quantify the severity and current latency.',
    },
    {
      slide_number: 3,
      title: 'Proposed Solution',
      description: 'High-level innovation and workflow',
      pointers: [
        'Briefly describe your solution',
        'How does it solve the identified problem?',
        'Step-by-step workflow from problem input to successful outcome',
      ],
      tips: 'Use an architectural block diagram rather than dense text.',
    },
    {
      slide_number: 4,
      title: 'Innovation / Uniqueness',
      description: 'Key differentiators and competitive edge',
      pointers: [
        'What is new or different about your idea?',
        'How is it better than existing solutions? (Quantitative comparison)',
      ],
      tips: 'Highlight novel algorithms, patents, or integrations.',
    },
    {
      slide_number: 5,
      title: 'Target Users',
      description: 'Beneficiary personas and deployment scope',
      pointers: [
        'Who will use the solution? (e.g. students, hospitals, farmers, businesses)',
        'Primary vs. Secondary stakeholders',
      ],
      tips: 'Demonstrate practical usability for non-technical field operators.',
    },
    {
      slide_number: 6,
      title: 'Key Features',
      description: 'Core functional capabilities',
      pointers: [
        'List 3–6 major features',
        'Keep them short, specific, and measurable',
      ],
      tips: 'Focus on functional delivery over speculative roadmap items.',
    },
    {
      slide_number: 7,
      title: 'Technology / Tech Stack',
      description: 'Concrete tools, frameworks, and architecture',
      pointers: [
        'Languages (TypeScript, Python, C++)',
        'Frameworks (React, Node.js, FastAPI, PyTorch)',
        'AI/ML models & Datasets',
        'APIs, Cloud & Platforms (Supabase, Docker, GCP)',
        'Hardware components (ESP32, Raspberry Pi, Sensors, if applicable)',
      ],
      tips: 'Only list tools your team has verified capability to implement.',
    },
    {
      slide_number: 8,
      title: 'Implementation Plan',
      description: 'Sprint breakdown and MVP scope during the hackathon',
      pointers: [
        'How will you build it during the hackathon? (Phase-wise breakdown)',
        'What will be the minimum viable prototype (MVP)?',
      ],
      tips: 'Clearly define what will be demonstrated live during judging.',
    },
    {
      slide_number: 9,
      title: 'Expected Impact',
      description: 'Measurable benefits and value creation',
      pointers: [
        'What benefit will the solution provide?',
        'Expected social, economic, educational, environmental, or technical impact',
      ],
      tips: 'Provide realistic projected metrics and return on investment.',
    },
    {
      slide_number: 10,
      title: 'Feasibility & Viability',
      description: 'Realistic execution capability and risk management',
      pointers: [
        'Can the solution realistically be built during the hackathon?',
        'Any major dependencies or limitations?',
      ],
      tips: 'Address fallback options for network drops or hardware delays.',
    },
    {
      slide_number: 11,
      title: 'Prototype / References (Optional)',
      description: 'Live links, wireframes, and citations',
      pointers: [
        'Figma UI prototype link',
        'GitHub repository or proof of concept',
        'Architecture diagram & IEEE/ACM research references',
      ],
      tips: 'Include clickable repository or design links for verification.',
    },
    {
      slide_number: 12,
      title: 'One-Line Pitch',
      description: 'The defining elevator statement',
      pointers: [
        'Describe the entire idea in one clear, compelling sentence',
      ],
      tips: 'Make it memorable, precise, and focused on customer value.',
    },
  ];

  const currentSlide = slides[selectedSlideIdx];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between border-b border-[#c5a059]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center text-[#c5a059]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#c5a059] tracking-widest uppercase block">
                SRMIST Tiruchirappalli · YUVA Mega-Thon Template Guide
              </span>
              <h2 className="text-lg font-serif font-bold text-white">
                SIH Idea PPT Reference Specification
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/sih/template-pdf"
              download="SRMIST_SIH_Idea_Template_YUVA_MegaThon.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#c5a059] hover:bg-[#b08b44] text-[#002147] font-bold rounded text-xs transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download SIH Idea PPT Template (.pdf)</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mandatory Institutional Rules Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Institutional Hackathon Guidelines: </strong>
            Maximum number of slides is 6 including the title slide (or up to 12 slides following the YUVA Mega-Thon structure).
            Explanations should be precise and concise. The provided template pointers must be followed without altering the required section headers.
            <span className="font-bold text-amber-950 block mt-0.5">
              Completed submissions must be saved and uploaded exclusively as a PDF document. PPT/PPTX and images will be rejected.
            </span>
          </div>
        </div>

        {/* Interactive Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50">
          {/* Left: Slide Navigation List */}
          <div className="md:col-span-4 bg-white border border-slate-200 rounded-lg p-3 space-y-1.5 max-h-[460px] overflow-y-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 block">
              Template Slide Breakdown ({slides.length})
            </span>
            {slides.map((s, idx) => {
              const isActive = idx === selectedSlideIdx;
              return (
                <button
                  key={s.slide_number}
                  type="button"
                  onClick={() => setSelectedSlideIdx(idx)}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#002147] text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate">
                    <span className="opacity-75 font-mono text-[10px] mr-1.5">
                      Slide {s.slide_number}:
                    </span>
                    <span>{s.title}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ml-1 ${isActive ? 'text-[#c5a059]' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Right: Slide Spec Detail Card */}
          <div className="md:col-span-8 bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-wider block">
                    Slide {currentSlide.slide_number} of {slides.length}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#002147]">
                    {currentSlide.title}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                  #{currentSlide.slide_number}
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4 italic">
                {currentSlide.description}
              </p>

              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Mandatory Pointers to Address:
                </h4>
                <ul className="space-y-2">
                  {currentSlide.pointers.map((pointer: string, pIdx: number) => (
                    <li
                      key={pIdx}
                      className="text-xs text-slate-700 bg-slate-50 border border-slate-200/70 rounded p-2.5 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mt-1.5 shrink-0" />
                      <span>{pointer}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {currentSlide.tips && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Reviewer Tip: </strong>
                    <span>{currentSlide.tips}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => setSelectedSlideIdx((prev) => Math.max(0, prev - 1))}
                disabled={selectedSlideIdx === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous Slide
              </button>

              <div className="text-[11px] font-mono text-slate-500">
                {selectedSlideIdx + 1} / {slides.length}
              </div>

              <button
                type="button"
                onClick={() => setSelectedSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
                disabled={selectedSlideIdx === slides.length - 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next Slide
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-600">
            Reference Document: <strong className="text-slate-800">SRMIST SIH Internal Hackathon 2026 – YUVA Mega-Thon PPT Standard</strong>
          </span>

          <div className="flex items-center gap-3">
            <a
              href="/api/sih/template-pdf"
              download="SRMIST_SIH_Idea_Template_YUVA_MegaThon.pdf"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#002147] hover:bg-[#001833] text-white font-bold rounded text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Download Official PDF Template</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 transition-colors cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
