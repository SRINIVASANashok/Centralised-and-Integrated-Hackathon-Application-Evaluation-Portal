import React, { useState } from 'react';
import {
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Mail,
  Shield,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Phone,
  IdCard,
  Briefcase,
  Compass,
  Copy,
  Check,
  Send,
  ExternalLink,
} from 'lucide-react';
import { registerFaculty } from '../services/api';
import { FacultyRegistrationInput } from '../types/auth';

interface FacultyRegisterViewProps {
  onBack: () => void;
  onOpenEmailInbox: () => void;
  onNavigateToActivation?: (token: string) => void;
}

const DESIGNATION_OPTIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor (Senior Grade)',
  'Assistant Professor',
  'Head of Department (HOD)',
  'Dean / Director',
  'Professor of Practice',
  'Research Scientist / Fellow',
  'Adjunct / Visiting Faculty',
];

const RESEARCH_AREA_OPTIONS = [
  'Artificial Intelligence & Machine Learning',
  'VLSI Design & Embedded Systems',
  'Cloud Computing & Distributed Systems',
  'Cybersecurity, Cryptography & Network Defense',
  'Data Science & Big Data Analytics',
  'Robotics, Mechatronics & Autonomous Systems',
  'Internet of Things (IoT) & Smart Sensors',
  'Wireless Communications, 5G/6G & RF Engineering',
  'Renewable Energy, Smart Grids & Power Electronics',
  'Computer Vision, Image Processing & AR/VR',
  'Biomedical Signal Processing & Health Informatics',
  'Natural Language Processing & LLM Architecture',
  'Software Architecture & Formal Verification',
  'Other / Interdisciplinary Research Area',
];

export const FacultyRegisterView: React.FC<FacultyRegisterViewProps> = ({
  onBack,
  onOpenEmailInbox,
  onNavigateToActivation,
}) => {
  const [formData, setFormData] = useState<FacultyRegistrationInput>({
    name: '',
    designation: DESIGNATION_OPTIONS[0],
    fet_id: '',
    email: '',
    phone: '',
    research_area: RESEARCH_AREA_OPTIONS[0],
    department: 'Faculty of Engineering and Technology',
  });

  const [customResearchArea, setCustomResearchArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCopy = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const handleDirectActivate = () => {
    if (!successData?.activation_token) return;
    if (onNavigateToActivation) {
      onNavigateToActivation(successData.activation_token);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const activeResearchArea =
      formData.research_area === 'Other / Interdisciplinary Research Area'
        ? customResearchArea.trim()
        : formData.research_area.trim();

    // Frontend Validations
    if (
      !formData.name.trim() ||
      !formData.designation.trim() ||
      !formData.fet_id.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !activeResearchArea
    ) {
      setError('All parameters are required. Please fill in NAME, DESIGNATION, FET ID, EMAIL, PHONE NO, and RESEARCH AREA.');
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Please provide a valid full academic title and name (e.g., Dr. Rajesh Kumar).');
      return;
    }

    if (formData.fet_id.trim().length < 3) {
      setError('Please provide a valid FET ID (e.g. FET1042 or SRM-FET-089).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid Gmail or Institutional email address.');
      return;
    }

    const cleanedPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{10,14}$/.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerFaculty({
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        fet_id: formData.fet_id.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        research_area: activeResearchArea,
        department: formData.department || 'Faculty of Engineering and Technology',
      });

      if (res.success && res.data) {
        setSuccessData(res.data);
      } else {
        setError(res.error || 'Failed to complete faculty registration.');
      }
    } catch (err) {
      setError('Network communication failure. Please verify connection to SRM gateway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Return button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700 hover:border-[#ef233c] shadow-md transition-all cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-[#ef233c]" />
          <span>Return to Previous Screen</span>
        </button>
      </div>

      <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(239,35,60,0.15)] backdrop-blur-2xl overflow-hidden text-white">
        {/* Institutional Card Header */}
        <div className="bg-zinc-950/90 text-white px-6 py-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#ef233c]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#ef233c] font-mono">
                Faculty of Engineering & Technology (FET)
              </span>
            </div>
            <span className="text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-300 px-2.5 py-0.5 rounded-lg font-mono">
              SRM IST Tiruchirappalli
            </span>
          </div>
          <h1 className="text-2xl font-manrope font-bold text-white tracking-tight mt-1">
            Teacher & Faculty Registration
          </h1>
          <p className="text-xs text-zinc-300 mt-1">
            Academic staff onboarding with one-time activation link and credential verification.
          </p>
        </div>

        {/* Success Confirmation Screen */}
        {successData ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 block font-mono">
                    Registration Recorded Successfully
                  </span>
                  <h3 className="font-manrope font-bold text-lg text-white mt-0.5">
                    One-Time Activation Link Dispatched
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    A cryptographic, single-use activation link has been sent to{' '}
                    <strong className="text-white font-mono">{successData.email}</strong>.
                    Follow the link to establish your permanent password and receive your final credentials.
                  </p>
                </div>
              </div>

              {/* Summary Table */}
              <div className="bg-zinc-900/90 rounded-xl border border-zinc-700/80 p-4 text-xs space-y-2 mt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">NAME:</span>
                    <strong className="text-white font-serif">{successData.name}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">DESIGNATION:</span>
                    <strong className="text-white">{successData.designation}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">FET ID:</span>
                    <strong className="text-[#ef233c] font-mono">{successData.fet_id}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">RESEARCH AREA:</span>
                    <strong className="text-white">{successData.research_area}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">GMAIL / INSTITUTIONAL MAIL:</span>
                    <strong className="text-white font-mono">{successData.email}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Activation Action */}
            <div className="p-5 bg-zinc-900/80 border border-zinc-700/80 rounded-2xl space-y-4">
              <div>
                <span className="text-[11px] font-bold text-[#ef233c] uppercase tracking-wider block font-mono">
                  Next Step: Set Your Faculty Password
                </span>
                <p className="text-xs text-zinc-300 mt-1">
                  You can proceed immediately to the password setup page using your activation token, or inspect the dispatched email in the campus outbox.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleDirectActivate}
                  className="shiny-cta flex-1 py-3 px-4 rounded-xl text-white font-manrope font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ArrowRight className="w-4 h-4 text-[#ef233c]" />
                  <span>PROCEED TO SET PASSWORD</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenEmailInbox}
                  className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#ef233c]" />
                  <span>VIEW DISPATCHED EMAIL</span>
                </button>
              </div>

              {/* Token & Link Backup Box */}
              {successData.activation_token && (
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 font-medium">Single-Use Activation Token:</span>
                    <button
                      onClick={() => handleCopy(successData.activation_token, false)}
                      className="inline-flex items-center gap-1 text-[#ef233c] hover:underline font-semibold cursor-pointer"
                    >
                      {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedToken ? 'Token Copied' : 'Copy Token'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-[11px] text-[#ef233c] break-all select-all">
                    {successData.activation_token}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onBack}
                className="text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                ← Return to Faculty Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs backdrop-blur-md">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef233c]" />
                <div className="flex-1">
                  <span className="font-bold block text-rose-100 font-manrope text-sm">Registration Error</span>
                  <span className="text-rose-200 font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. NAME */}
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  NAME <span className="text-[#ef233c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kumar S"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* 2. DESIGNATION */}
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  DESIGNATION <span className="text-[#ef233c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 cursor-pointer font-medium"
                  >
                    {DESIGNATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-zinc-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. FET ID */}
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  FET ID (FACULTY ID) <span className="text-[#ef233c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.fet_id}
                    onChange={(e) => setFormData({ ...formData, fet_id: e.target.value.toUpperCase() })}
                    placeholder="e.g. FET1042 or SRM-FET-089"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Faculty of Engineering and Technology institutional identification number.
                </p>
              </div>

              {/* 4. GMAIL / INSTITUTIONAL MAIL */}
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  GMAIL / INSTITUTIONAL MAIL <span className="text-[#ef233c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. dr.rajesh@gmail.com or rajesh@ist.srmtrichy.edu.in"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  The one-time activation link will be dispatched directly to this email address.
                </p>
              </div>

              {/* 5. PHONE NO */}
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  PHONE NO <span className="text-[#ef233c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9840123456"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* 6. RESEARCH AREA */}
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  RESEARCH AREA <span className="text-[#ef233c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.research_area}
                    onChange={(e) => setFormData({ ...formData, research_area: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 cursor-pointer font-medium"
                  >
                    {RESEARCH_AREA_OPTIONS.map((area) => (
                      <option key={area} value={area} className="bg-zinc-900 text-white">
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.research_area === 'Other / Interdisciplinary Research Area' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customResearchArea}
                      onChange={(e) => setCustomResearchArea(e.target.value)}
                      placeholder="Specify your academic research area / domain"
                      required
                      className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c]"
                    />
                  </div>
                )}
              </div>

              {/* Institutional Notice */}
              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  After clicking <strong className="text-white">REGISTER</strong>, a one-time activation link will be sent to the specified email. The faculty member will set their password and view their finalized credentials on-screen to capture a screenshot.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="shiny-cta w-full group transition-all"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-manrope font-bold text-sm tracking-wider">
                  {loading ? (
                    <span>Registering Faculty & Dispatching Link...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-[#ef233c]" />
                      <span>REGISTER FACULTY ACCOUNT</span>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
