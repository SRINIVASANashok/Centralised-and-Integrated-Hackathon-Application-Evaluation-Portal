import React, { useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle2, Mail, Shield, ArrowRight, ExternalLink, Copy, Check, Settings, Send } from 'lucide-react';
import { registerStudent } from '../services/api';
import { StudentRegistrationInput } from '../types/auth';

interface StudentRegisterViewProps {
  onRegistrationComplete: () => void;
  onOpenEmailInbox: () => void;
  onNavigateToActivation?: (token: string) => void;
  onOpenEmailConfig?: (defaultEmail?: string) => void;
}

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Biotechnology',
  'Artificial Intelligence & Data Science',
  'Electrical & Electronics Engineering',
  'Civil Engineering',
];

const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const StudentRegisterView: React.FC<StudentRegisterViewProps> = ({
  onRegistrationComplete,
  onOpenEmailInbox,
  onNavigateToActivation,
  onOpenEmailConfig,
}) => {
  const [formData, setFormData] = useState<StudentRegistrationInput>({
    name: '',
    register_number: '',
    department: DEPARTMENTS[0],
    section: SECTIONS[0],
    year: YEARS[0],
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDirectActivate = () => {
    if (!successData?.activation_link_preview) return;
    try {
      const url = new URL(successData.activation_link_preview);
      const token = url.searchParams.get('activate') || url.searchParams.get('token');
      if (token && onNavigateToActivation) {
        onNavigateToActivation(token);
      }
    } catch {
      // If relative or parsing fails
      const match = successData.activation_link_preview.match(/[?&](?:activate|token)=([^&]+)/);
      if (match && match[1] && onNavigateToActivation) {
        onNavigateToActivation(decodeURIComponent(match[1]));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend Validations
    if (
      !formData.name.trim() ||
      !formData.register_number.trim() ||
      !formData.department ||
      !formData.section ||
      !formData.year ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      setError('All fields are required. Please fill in all academic and contact information.');
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Please provide a valid full legal name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    const cleanedPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{10,14}$/.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (formData.register_number.trim().length < 6) {
      setError('Please enter a valid SRM Register Number (e.g. RA2411003010042).');
      return;
    }

    setLoading(true);
    try {
      const res = await registerStudent({
        ...formData,
        register_number: formData.register_number.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        name: formData.name.trim(),
      });

      if (res.success) {
        setSuccessData(res.data);
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError('Failed to contact registration server.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    const isLiveDelivered = Boolean(successData.delivered_to_inbox);
    const activationLink = successData.activation_link_preview || '';

    return (
      <div className="p-8 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
            Registration Received Successfully
          </span>
          <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Account Created & Activation Dispatched
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {isLiveDelivered ? (
              <>
                A one-time, cryptographically secure activation link has been sent directly to your email inbox:{' '}
                <strong className="text-slate-900">{successData.email}</strong>.
              </>
            ) : (
              <>
                A one-time activation link has been generated for{' '}
                <strong className="text-slate-900">{successData.email}</strong>.
              </>
            )}
          </p>
        </div>

        {/* Live Delivery Status Card */}
        {isLiveDelivered ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-900 text-left flex items-start gap-2.5">
            <Send className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950">✓ Direct Inbox Delivery Confirmed</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Check your Gmail or email inbox (and Spam/Promotions tab). Look for an email from{' '}
                <span className="font-medium">SRM IST Admissions</span> with the subject{' '}
                <span className="italic">"Welcome to SRM IST Tiruchirappalli – Activate Your Account"</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-900 text-left flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-blue-950">Campus Outbox & Fast Activation Ready</p>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Remote SMTP was not detected on this server instance. Your activation email was recorded in the Campus Mail Outbox, and your instant activation link is ready below.
              </p>
              {onOpenEmailConfig && (
                <button
                  type="button"
                  onClick={() => onOpenEmailConfig(successData.email)}
                  className="mt-2 text-[11px] font-semibold text-blue-800 underline hover:text-blue-950 flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Configure Gmail / SMTP Credentials to receive emails in your real inbox</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Academic Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-left space-y-2 text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-500">Student Name:</span>
            <span className="font-semibold text-slate-900">{successData.student_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Register Number:</span>
            <span className="font-mono font-semibold text-slate-900">{successData.register_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Destination Email:</span>
            <span className="font-medium text-slate-900">{successData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Activation Window:</span>
            <span className="font-medium text-emerald-700">24 Hours (Single-use)</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span className="text-slate-500">Password Policy:</span>
            <span className="font-medium text-slate-700">Set by student upon activation</span>
          </div>
        </div>

        {/* Instant Activation Link Box */}
        {activationLink && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900">Your One-Time Activation Link:</span>
              <button
                type="button"
                onClick={() => handleCopyLink(activationLink)}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Link'}</span>
              </button>
            </div>
            <div className="p-2 bg-white rounded border border-amber-200 text-[11px] font-mono text-slate-600 break-all select-all">
              {activationLink}
            </div>
          </div>
        )}

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 text-left flex items-start gap-2.5">
          <Shield className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Institutional Security Notice:</strong> No temporary password was generated or emailed. You will establish your own confidential, high-strength password upon clicking the activation link.
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          {onNavigateToActivation && (
            <button
              type="button"
              onClick={handleDirectActivate}
              className="w-full py-3 px-4 bg-[#002147] hover:bg-blue-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <span>Activate Account Now</span>
              <ArrowRight className="w-4 h-4 text-[#c5a059]" />
            </button>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={onOpenEmailInbox}
              className="w-full sm:flex-1 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-[#002147]" />
              <span>Campus Mail Outbox</span>
            </button>

            {onOpenEmailConfig && (
              <button
                type="button"
                onClick={() => onOpenEmailConfig(successData.email)}
                className="w-full sm:flex-1 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Settings className="w-3.5 h-3.5 text-blue-700" />
                <span>Email SMTP Settings</span>
              </button>
            )}

            <button
              type="button"
              onClick={onRegistrationComplete}
              className="w-full sm:flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-transparent text-white">
      <div className="max-w-2xl mx-auto text-white">
        <div className="border-b border-zinc-800 pb-4 mb-6">
          <h2 className="text-2xl font-bold font-manrope text-white">
            New Student Academic Registration
          </h2>
          <p className="text-xs text-zinc-300 mt-1.5 font-normal">
            Register your institutional student profile. An activation link will be delivered to your registered email to establish your permanent password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs backdrop-blur-md">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef233c]" />
            <div className="flex-1">
              <span className="font-bold block text-rose-100 font-manrope text-sm">Registration Error</span>
              <span className="text-rose-200 font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name and Register No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                NAME <span className="text-[#ef233c]">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Legal Name as per Admission"
                required
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 font-semibold focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                REGISTER NO <span className="text-[#ef233c]">*</span>
              </label>
              <input
                type="text"
                value={formData.register_number}
                onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                placeholder="e.g. RA2411003010042"
                required
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 uppercase font-mono font-semibold focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Row 2: Department */}
          <div>
            <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
              DEPARTMENT <span className="text-[#ef233c]">*</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
              className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white font-medium focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-zinc-900 text-white">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3: Section and Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                SECTION <span className="text-[#ef233c]">*</span>
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                required
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white font-medium focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner cursor-pointer"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec} className="bg-zinc-900 text-white">
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                YEAR <span className="text-[#ef233c]">*</span>
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white font-medium focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner cursor-pointer"
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr} className="bg-zinc-900 text-white">
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Mail ID and Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                MAIL ID <span className="text-[#ef233c]">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@srmist.edu.in"
                required
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 font-semibold focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner"
              />
              <span className="text-[11px] text-zinc-400 font-normal mt-1.5 block">
                The one-time activation link will be dispatched here.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                PHONE NUMBER <span className="text-[#ef233c]">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                required
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 font-semibold focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Registration Notice */}
          <div className="p-4 bg-zinc-900/80 border border-zinc-700/80 rounded-2xl text-xs text-zinc-300 flex items-start gap-3 backdrop-blur-md">
            <Shield className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
            <div className="leading-relaxed font-normal">
              <strong className="text-white">Institutional Verification Flow:</strong> Upon submission, your record will be registered in the Supabase database. You will immediately receive a 24-hour single-use activation email. <em className="text-zinc-200 font-semibold">No password is ever sent via email.</em>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="shiny-cta w-full group transition-all"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-white font-manrope font-bold text-sm tracking-wider">
              {loading ? (
                <span>PROCESSING INSTITUTIONAL REGISTRATION...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-[#ef233c]" />
                  <span>REGISTER NOW</span>
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
