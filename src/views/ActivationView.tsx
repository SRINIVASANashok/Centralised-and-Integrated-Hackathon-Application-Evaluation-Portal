import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  KeyRound,
  ArrowLeft,
  Camera,
  Copy,
  Check,
  Eye,
  EyeOff,
  BookOpen,
  Briefcase,
  IdCard,
  Compass,
  Mail,
  User,
} from 'lucide-react';
import { verifyActivationToken, activateAccount, resendActivationLink } from '../services/api';
import { ActivationTokenVerifyResult, AuthenticatedUser } from '../types/auth';

interface ActivationViewProps {
  token: string;
  onActivationSuccess?: (user: AuthenticatedUser) => void;
  onGoToLogin: () => void;
  onGoToFacultyLogin?: () => void;
}

export const ActivationView: React.FC<ActivationViewProps> = ({
  token,
  onActivationSuccess,
  onGoToLogin,
  onGoToFacultyLogin,
}) => {
  const [tokenInput, setTokenInput] = useState(token);
  const [verifying, setVerifying] = useState(true);
  const [verifyResult, setVerifyResult] = useState<ActivationTokenVerifyResult | null>(null);

  // Form inputs
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-activation state (showing final password for screenshot)
  const [activatedSuccess, setActivatedSuccess] = useState(false);
  const [finalPassword, setFinalPassword] = useState('');
  const [activatedUser, setActivatedUser] = useState<AuthenticatedUser | null>(null);
  const [showPassword, setShowPassword] = useState(true);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Resend flow for expired token
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Synchronize when token prop changes
  useEffect(() => {
    if (token && token !== tokenInput) {
      setTokenInput(token);
    }
  }, [token]);

  // Verify token on mount or token change
  useEffect(() => {
    if (!tokenInput.trim()) {
      setVerifying(false);
      setVerifyResult({
        valid: false,
        status: 'INVALID',
        message: 'No activation token provided. Please use the link sent to your registered email address.',
      });
      return;
    }

    let isMounted = true;
    setVerifying(true);
    setError(null);

    verifyActivationToken(tokenInput.trim())
      .then((res) => {
        if (isMounted) {
          setVerifyResult(res);
          if (res.email) setResendEmail(res.email);
        }
      })
      .catch(() => {
        if (isMounted) {
          setVerifyResult({
            valid: false,
            status: 'INVALID',
            message: 'Unable to verify activation link status with SRM IST authority.',
          });
        }
      })
      .finally(() => {
        if (isMounted) setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tokenInput]);

  const isFaculty = verifyResult?.role === 'FACULTY' || Boolean(verifyResult?.faculty);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError('Password must be at least 12 characters long according to institutional security standards.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password accurately.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await activateAccount(tokenInput.trim(), password, confirmPassword);
      if (res.success) {
        setFinalPassword(password);
        setActivatedUser(res.user || null);
        setActivatedSuccess(true);
        if (res.user && onActivationSuccess) {
          onActivationSuccess(res.user);
        }
      } else {
        setError(res.error || 'Activation failed.');
      }
    } catch (err) {
      setError('Network communication error during credential establishment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestNewLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResending(true);
    setResendMessage(null);
    try {
      const res = await resendActivationLink(resendEmail.trim());
      setResendMessage(res.message || 'If a pending account exists, a fresh activation link has been sent.');
    } catch (err) {
      setResendMessage('Request failed. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(finalPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleCopyAllCredentials = () => {
    const credText = isFaculty
      ? `SRM IST TIRUCHIRAPPALLI - FACULTY CREDENTIALS
Name: ${verifyResult?.user_name || verifyResult?.student_name || activatedUser?.name || 'Faculty Member'}
Designation: ${verifyResult?.faculty?.designation || activatedUser?.faculty?.designation || 'Staff'}
FET ID: ${verifyResult?.faculty?.fet_id || activatedUser?.faculty?.faculty_id || activatedUser?.faculty?.fet_id || 'N/A'}
Registered Email: ${verifyResult?.email || activatedUser?.email || ''}
Research Area: ${verifyResult?.faculty?.research_area || activatedUser?.faculty?.research_area || 'Engineering & Technology'}
Password: ${finalPassword}`
      : `SRM IST TIRUCHIRAPPALLI - STUDENT CREDENTIALS
Name: ${verifyResult?.student_name || activatedUser?.name || 'Student'}
Email: ${verifyResult?.email || activatedUser?.email || ''}
Password: ${finalPassword}`;

    navigator.clipboard.writeText(credText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleNavigateToLoginDashboard = () => {
    if (isFaculty && onGoToFacultyLogin) {
      onGoToFacultyLogin();
    } else {
      onGoToLogin();
    }
  };

  // 1. Loading state while checking token
  if (verifying) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 text-white">
        <RefreshCw className="w-8 h-8 text-[#ef233c] animate-spin mx-auto" />
        <h2 className="text-lg font-manrope font-bold text-white">
          Verifying One-Time Activation Token...
        </h2>
        <p className="text-xs text-zinc-400">
          Validating cryptographic token with SRM IST security authority.
        </p>
      </div>
    );
  }

  // 2. SUCCESS STATE: Show final password on screen so teacher/student can take screenshot
  if (activatedSuccess) {
    const teacherName = verifyResult?.user_name || verifyResult?.student_name || activatedUser?.name || 'Teacher / Faculty';
    const fetId = verifyResult?.faculty?.fet_id || activatedUser?.faculty?.faculty_id || activatedUser?.faculty?.fet_id || 'FET ID';
    const designation = verifyResult?.faculty?.designation || activatedUser?.faculty?.designation || 'Faculty';
    const email = verifyResult?.email || activatedUser?.email || '';
    const researchArea = verifyResult?.faculty?.research_area || activatedUser?.faculty?.research_area || 'Engineering & Technology';

    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
          {/* Header */}
          <div className="bg-zinc-950/90 text-white px-6 py-6 border-b border-zinc-800 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#ef233c] block font-mono">
              {isFaculty ? 'Faculty of Engineering & Technology (FET)' : 'SRM IST Tiruchirappalli'}
            </span>
            <h1 className="text-2xl font-manrope font-bold text-white tracking-tight mt-1">
              Account Activated & Credentials Established
            </h1>
            <p className="text-xs text-zinc-300 mt-1">
              Your institutional password has been securely configured.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* SCREENSHOT NOTICE CALLOUT */}
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 flex items-start gap-3 shadow-md">
              <div className="p-2 bg-amber-900/60 text-amber-300 rounded-xl shrink-0 mt-0.5 border border-amber-500/30">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <span className="font-bold text-amber-100 block text-sm uppercase tracking-wide font-manrope">
                  Take a Screenshot Now
                </span>
                <p className="mt-1 leading-relaxed text-amber-200/90 font-medium">
                  Please take a screenshot of your screen right now before continuing. You will need your <strong className="text-white">FET ID / Username</strong> and <strong className="text-white">Password</strong> to sign in to the dashboard.
                </p>
              </div>
            </div>

            {/* CREDENTIAL DETAILS CARD */}
            <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-manrope">
                  <ShieldCheck className="w-4 h-4 text-[#ef233c]" />
                  <span>Official Institutional Credentials</span>
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">NAME:</span>
                  <strong className="text-white font-serif text-sm">{teacherName}</strong>
                </div>

                {isFaculty && (
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">DESIGNATION:</span>
                    <strong className="text-white">{designation}</strong>
                  </div>
                )}

                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">
                    {isFaculty ? 'FET ID (LOGIN USERNAME):' : 'REGISTER NUMBER:'}
                  </span>
                  <strong className="text-[#ef233c] font-mono text-sm font-bold bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-700 inline-block">
                    {isFaculty ? fetId : (verifyResult?.student_name || 'N/A')}
                  </strong>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">REGISTERED EMAIL:</span>
                  <strong className="text-white font-mono text-xs">{email}</strong>
                </div>

                {isFaculty && (
                  <div className="sm:col-span-2">
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">RESEARCH AREA:</span>
                    <strong className="text-white">{researchArea}</strong>
                  </div>
                )}
              </div>

              {/* FINAL PASSWORD HIGHLIGHT BOX */}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 font-manrope">
                    FINAL PASSWORD:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-medium text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#ef233c]" />}
                      <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="text-[11px] font-bold text-[#ef233c] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPassword ? 'Copied' : 'Copy Password'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-950 text-[#ef233c] rounded-xl border border-zinc-800 flex items-center justify-between font-mono text-base font-bold tracking-wider select-all shadow-inner">
                  <span>{showPassword ? finalPassword : '••••••••••••••••'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCopyAllCredentials}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                <span>{copiedAll ? 'Credentials Summary Copied' : 'Copy Full Credentials Summary'}</span>
              </button>

              {/* REQUIRED BUTTON: continue to login dashboard */}
              <button
                type="button"
                onClick={handleNavigateToLoginDashboard}
                className="shiny-cta w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <span>CONTINUE TO LOGIN DASHBOARD</span>
                <ArrowRight className="w-4 h-4 text-[#ef233c]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Already Used Link
  if (verifyResult?.status === 'USED') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl p-8 text-center space-y-5 text-white">
          <div className="w-16 h-16 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#ef233c] uppercase tracking-widest block font-mono">
              Security Notice
            </span>
            <h2 className="text-xl font-manrope font-bold text-white mt-1">
              This activation link has already been used.
            </h2>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              All SRM IST account activation links are strictly single-use and cannot be reused. Your password has already been established and your account is active.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleNavigateToLoginDashboard}
              className="shiny-cta w-full py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>CONTINUE TO LOGIN DASHBOARD</span>
              <ArrowRight className="w-4 h-4 text-[#ef233c]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Expired Link
  if (verifyResult?.status === 'EXPIRED') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl p-8 text-center space-y-5 text-white">
          <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#ef233c] uppercase tracking-widest block font-mono">
              Time Expired
            </span>
            <h2 className="text-xl font-manrope font-bold text-white mt-1">
              This activation link has expired.
            </h2>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Activation links expire 24 hours after registration for security. You may request a new link below.
            </p>
          </div>

          {resendMessage ? (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl text-left">
              <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-400" />
              {resendMessage}
            </div>
          ) : (
            <form onSubmit={handleRequestNewLink} className="space-y-4 pt-2 text-left">
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  REGISTERED EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="faculty@ist.srmtrichy.edu.in"
                  required
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={resending}
                className="shiny-cta w-full py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-60"
              >
                {resending ? 'Dispatching New Link...' : 'REQUEST NEW ACTIVATION LINK'}
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-zinc-800">
            <button
              onClick={handleNavigateToLoginDashboard}
              className="text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
            >
              ← Return to Login Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Invalid / Unknown Token
  if (!verifyResult?.valid) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl p-8 text-center space-y-5 text-white">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 flex items-center justify-center mx-auto">
            <KeyRound className="w-8 h-8 text-[#ef233c]" />
          </div>
          <div>
            <h2 className="text-xl font-manrope font-bold text-white">
              Invalid Activation Link
            </h2>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              {verifyResult?.message || 'The specified activation link could not be verified.'}
            </p>
          </div>

          {/* Manual Token Paste for Testing */}
          <div className="text-left bg-zinc-900/90 p-4 rounded-2xl border border-zinc-700/80 space-y-2">
            <label className="block text-[11px] font-bold text-zinc-200 uppercase tracking-wider font-manrope">
              Paste Activation Token or URL:
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. 64-character token hex"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c]"
            />
          </div>

          <button
            onClick={handleNavigateToLoginDashboard}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Continue to Login Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 6. VALID TOKEN: Password Creation Form
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-4">
        <button
          onClick={handleNavigateToLoginDashboard}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700 hover:border-[#ef233c] shadow-md transition-all cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-[#ef233c]" />
          <span>Return to Login Dashboard</span>
        </button>
      </div>

      <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(239,35,60,0.15)] backdrop-blur-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="bg-zinc-950/90 text-white px-6 py-6 border-b border-zinc-800">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#ef233c] block font-mono">
            {isFaculty ? 'Faculty of Engineering & Technology (FET)' : 'SRM IST Tiruchirappalli'}
          </span>
          <h1 className="text-2xl font-manrope font-bold text-white tracking-tight mt-0.5">
            {isFaculty ? 'Set Faculty Password' : 'Activate Your Account'}
          </h1>
          <p className="text-xs text-zinc-300 mt-1">
            Establish your institutional password to complete onboarding and receive your credentials.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Display Profile Parameters */}
          <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">
                {isFaculty ? 'Teacher Name:' : 'Student Name:'}
              </span>
              <strong className="text-white font-manrope text-sm">
                {verifyResult.user_name || verifyResult.student_name}
              </strong>
            </div>

            {isFaculty && verifyResult.faculty && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">Designation:</span>
                  <strong className="text-white">{verifyResult.faculty.designation}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">FET ID:</span>
                  <strong className="text-[#ef233c] font-mono font-bold bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-700">
                    {verifyResult.faculty.fet_id}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-medium">Research Area:</span>
                  <strong className="text-white">{verifyResult.faculty.research_area}</strong>
                </div>
              </>
            )}

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">Registered Mail:</span>
              <strong className="text-white font-mono text-xs">{verifyResult.email}</strong>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
              <span className="text-zinc-400 font-medium">Activation Status:</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid Single-Use Token
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef233c]" />
              <div className="flex-1">
                <span className="font-bold block text-rose-100 font-manrope text-sm">Password Requirement Error</span>
                <span className="text-rose-200 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleActivate} className="space-y-5">
            {/* Create Password */}
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                CREATE PASSWORD <span className="text-[#ef233c]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 12 characters"
                  required
                  minLength={12}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                CONFIRM PASSWORD <span className="text-[#ef233c]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={12}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Policy Guidelines */}
            <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
              <span className="font-semibold text-white block">
                Institutional Password Standards:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                <li className={password.length >= 12 ? 'text-emerald-400 font-medium' : ''}>
                  Minimum 12 characters (strong passphrases supported)
                </li>
                <li>Reject common or easily guessed dictionary combinations</li>
                <li>Must not contain your name, FET ID, or email</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="shiny-cta w-full group transition-all"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-white font-manrope font-bold text-sm tracking-wider">
                {submitting ? (
                  <span>Validating & Establishing Credentials...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#ef233c]" />
                    <span>SET PASSWORD & COMPLETE ACTIVATION</span>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
