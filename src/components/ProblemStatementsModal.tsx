import React, { useState } from 'react';
import {
  X,
  Search,
  Filter,
  Lightbulb,
  ExternalLink,
  Tag,
  Building2,
  Cpu,
  CheckCircle,
  Copy,
  Sparkles,
} from 'lucide-react';

interface ProblemStatement {
  id: string;
  code: string;
  title: string;
  organization: string;
  category: 'Software' | 'Hardware' | 'Both';
  domain: string;
  description: string;
  submissionsCount: number;
  complexity: 'Intermediate' | 'Advanced';
}

const PROBLEM_STATEMENTS: ProblemStatement[] = [
  {
    id: 'ps-1',
    code: 'SIH1420',
    title: 'AI-Powered Smart Grid Energy Optimization & Predictive Fault Detection',
    organization: 'Ministry of Power / NTPC',
    category: 'Software',
    domain: 'Clean & Green Energy',
    description:
      'Develop an edge-compatible machine learning framework that analyzes microgrid SCADA telemetry to forecast renewable power loads, detect abnormal phase shifts, and self-heal distribution lines before brownout occurrences.',
    submissionsCount: 4,
    complexity: 'Advanced',
  },
  {
    id: 'ps-2',
    code: 'SIH1512',
    title: 'Automated Real-Time Retinal Disease Screening for Primary Healthcare Centers',
    organization: 'Ministry of Health & Family Welfare / ICMR',
    category: 'Software',
    domain: 'Healthcare & MedTech',
    description:
      'Create an offline-first computer vision mobile diagnostic tool capable of analyzing fundus photographs to grade diabetic retinopathy, glaucoma, and macular degeneration with clinical-grade sensitivity.',
    submissionsCount: 7,
    complexity: 'Advanced',
  },
  {
    id: 'ps-3',
    code: 'SIH1633',
    title: 'IoT-Based Water Quality & Subterranean Contaminant Monitoring Network',
    organization: 'Ministry of Jal Shakti',
    category: 'Hardware',
    domain: 'Smart Water & Environment',
    description:
      'Design low-cost, self-powered submerged telemetry buoys with multiparameter sensors (pH, TDS, Turbidity, Arsenic trace) broadcasting telemetry over LoRaWAN to a central state water dashboard.',
    submissionsCount: 3,
    complexity: 'Intermediate',
  },
  {
    id: 'ps-4',
    code: 'SIH1708',
    title: 'Autonomous Drone Swarm Navigation for Disaster Relief & Thermal Victim Finding',
    organization: 'National Disaster Management Authority (NDMA)',
    category: 'Both',
    domain: 'Disaster Management & Robotics',
    description:
      'Build a coordinated multi-UAV localization and mesh networking system with onboard thermal edge compute to generate 3D heatmaps of survivors in collapsed urban structures during zero-cellular scenarios.',
    submissionsCount: 5,
    complexity: 'Advanced',
  },
  {
    id: 'ps-5',
    code: 'SIH1845',
    title: 'Hyper-Localized Crop Pest & Soil Moisture Telemetry with Multilingual Advisory',
    organization: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Software',
    domain: 'AgriTech & Rural Development',
    description:
      'Engineer a lightweight progressive web platform analyzing satellite SAR imagery alongside leaf disease smartphone photos to deliver audio-first agronomic recommendations in vernacular Indian dialects.',
    submissionsCount: 6,
    complexity: 'Intermediate',
  },
  {
    id: 'ps-6',
    code: 'SIH1910',
    title: 'Zero-Trust Academic Credential Verification Engine on EVM Blockchain',
    organization: 'All India Council for Technical Education (AICTE)',
    category: 'Software',
    domain: 'Cybersecurity & Blockchain',
    description:
      'Implement an immutable decentralized ledger architecture for issuing, signing, and instantly validating university degrees and student academic certificates with sub-second QR proof of authenticity.',
    submissionsCount: 2,
    complexity: 'Intermediate',
  },
];

interface ProblemStatementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStatement?: (code: string, title: string) => void;
}

export const ProblemStatementsModal: React.FC<ProblemStatementsModalProps> = ({
  isOpen,
  onClose,
  onSelectStatement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const domains = ['ALL', ...Array.from(new Set(PROBLEM_STATEMENTS.map((p) => p.domain)))];

  const filteredStatements = PROBLEM_STATEMENTS.filter((ps) => {
    const matchesSearch =
      ps.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ps.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ps.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ps.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = domainFilter === 'ALL' || ps.domain === domainFilter;
    const matchesCategory = categoryFilter === 'ALL' || ps.category === categoryFilter;
    return matchesSearch && matchesDomain && matchesCategory;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="login-card-noir w-full max-w-4xl bg-zinc-950/95 border border-zinc-700/80 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(239,35,60,0.2)] text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>SIH & CENTRAL HACKATHON PROBLEM STATEMENTS</span>
            </div>
            <h2 className="text-2xl font-bold font-manrope text-white tracking-tight">
              Problem Statements & Challenges Repository
            </h2>
            <p className="text-xs text-zinc-300 mt-1">
              Explore national and institutional challenges verified for SRM Institute of Science and Technology Tiruchirappalli campus.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#ef233c] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-900/50 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by PS Code, Title, Ministry, or Technology Keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-1 focus:ring-[#ef233c]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-[#ef233c]"
            >
              <option value="ALL">All Categories</option>
              <option value="Software">Software Only</option>
              <option value="Hardware">Hardware Only</option>
              <option value="Both">Both (Hybrid)</option>
            </select>
          </div>

          {/* Domain Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-400 font-medium shrink-0 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-[#ef233c]" /> Domain:
            </span>
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setDomainFilter(dom)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  domainFilter === dom
                    ? 'bg-[#ef233c] text-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredStatements.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <Lightbulb className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No matching problem statements found.</p>
              <p className="text-xs text-zinc-500 mt-1">Try adjusting your search terms or domain filters.</p>
            </div>
          ) : (
            filteredStatements.map((ps) => (
              <div
                key={ps.id}
                className="group p-5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-[#ef233c]/60 transition-all shadow-md relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#ef233c]/20 border border-[#ef233c]/40 text-[#ef233c] font-mono text-xs font-bold">
                      {ps.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-[11px] flex items-center gap-1">
                      <Tag className="w-3 h-3 text-sky-400" />
                      {ps.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-[11px] hidden md:inline-flex">
                      {ps.complexity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(ps.code)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy PS Code"
                    >
                      {copiedCode === ps.code ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                    {onSelectStatement && (
                      <button
                        onClick={() => {
                          onSelectStatement(ps.code, ps.title);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg bg-[#ef233c] hover:bg-[#d90429] text-white text-[11px] font-bold font-manrope transition-colors cursor-pointer shadow-sm"
                      >
                        Select For Idea
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white font-manrope group-hover:text-rose-100 transition-colors">
                  {ps.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 mb-2 font-inter">
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{ps.organization}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-violet-400">{ps.domain}</span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {ps.description}
                </p>

                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="text-zinc-400 font-mono">
                    Active SRM Campus Submissions: <strong className="text-white">{ps.submissionsCount} Teams</strong>
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Open for Campus Selection
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <span>Showing {filteredStatements.length} verified national problem statements</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold cursor-pointer transition-colors"
          >
            Close Repository
          </button>
        </div>
      </div>
    </div>
  );
};
