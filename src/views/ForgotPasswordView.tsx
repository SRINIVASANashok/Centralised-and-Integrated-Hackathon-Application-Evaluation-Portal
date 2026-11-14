import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  KeyRound,
  Mail,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import { forgotPassword, verifyResetToken, resetPassword } from '../services/api';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
  onOpenEmailInbox: () => void;
  resetToken?: string;
}

function extractTokenFromInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Case 1: Full URL or contains search params
  if (trimmed.includes('?') || trimmed.includes('/')) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://host/${trimmed.replace(/^\/+/, '')}`);
      const param =
        url.searchParams.get('reset') ||
        url.searchParams.get('resetToken') ||
        url.searchParams.get('reset_token') ||
        url.searchParams.get('token');
      if (param) return param.trim();
    } catch {
      const match = trimmed.match(/[?&#](?:reset|resetToken|reset_token|token)=([^&#\s]+)/i);
      if (match && match[1]) return decodeURIComponent(match[1]).trim();
    }
  }

  // Case 2: URL hash format (#reset=...)
  if (trimmed.includes('#')) {
    const match = trimmed.match(/#(?:reset|resetToken|token)=([^&#\s]+)/i);
    if (match && match[1]) return decodeURIComponent(match[1]).trim();
  }

  // Case 3: Raw hex or alphanumeric token
  return trimmed.replace(/[^a-zA-Z0-9_-]/g, '');
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onBackToLogin,
  onOpenEmailInbox,
  resetToken,
}) => {
  // If resetToken is present, we are in Phase 2: Enter new password
  const [token, setToken] = useState(resetToken || '');
  const [isResetMode, setIsResetMode] = useState(Boolean(resetToken));

  // Phase 1 Tab: 'REQUEST_LINK' vs 'ENTER_CODE'
  const [activeTab, setActiveTab] = useState<'REQUEST_LINK' | 'ENTER_CODE'>('REQUEST_LINK');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [manualCodeError, setManualCodeError] = useState<string | null>(null);

  // Request Reset form state
  const [email, setEmail] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [genericMessage, setGenericMessage] = useState('');
  const [deliveredToInbox, setDeliveredToInbox] = useState(false);
  const [generatedResetToken, setGeneratedResetToken] = useState<string | null>(null);
  const [generatedResetLink, setGeneratedResetLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Password submission state
  const [tokenStatus, setTokenStatus] = useState<'VALID' | 'EXPIRED' | 'USED' | 'INVALID' | 'CHECKING'>('CHECKING');
  const [tokenMessage, setTokenMessage] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Keep token state synchronized if resetToken prop changes
  useEffect(() => {
    if (resetToken) {
      setToken(resetToken);
      setIsResetMode(true);
    }
  }, [resetToken]);

  // If token is provided, verify it immediately
  useEffect(() => {
    if (token) {
      setIsResetMode(true);
      setTokenStatus('CHECKING');
      verifyResetToken(token).then((res) => {
        if (res.valid) {
          setTokenStatus('VALID');
          if (res.email) setTargetEmail(res.email);
        } else {
          setTokenStatus((res.status as any) || 'INVALID');
          setTokenMessage(res.message || 'This password reset link is invalid or has expired.');
        }
      });
    }
  }, [token]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setRequestLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setGenericMessage(
        res.message || 'If an account exists for this email, password reset instructions have been sent.'
      );
      if (res.resetToken) setGeneratedResetToken(res.resetToken);
      if (res.previewLink) setGeneratedResetLink(res.previewLink);
      if (res.deliveredToInbox) setDeliveredToInbox(true);
      setRequestSubmitted(true);
    } catch (err) {
      setGenericMessage('If an account exists for this email, password reset instructions have been sent.');
      setRequestSubmitted(true);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualCodeError(null);
    const extracted = extractTokenFromInput(manualCodeInput);
    if (!extracted || extracted.length < 8) {
      setManualCodeError('Please enter a valid reset token or paste the full reset link from your email.');
      return;
    }
    setToken(extracted);
    setIsResetMode(true);
  };

  const handleCopyLink = () => {
    if (!generatedResetLink) return;
    navigator.clipboard.writeText(generatedResetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyToken = () => {
    if (!generatedResetToken) return;
    navigator.clipboard.writeText(generatedResetToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 12) {
      setResetError('Password must be at least 12 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await resetPassword(token, newPassword, confirmPassword);
      if (res.success) {
        setResetSuccess(true);
      } else {
        setResetError(res.error || 'Password reset failed.');
      }
    } catch (err) {
      setResetError('Network error while resetting password.');
    } finally {
      setResetLoading(false);
    }
  };

  // Phase 2: Password Reset Execution Screen
  if (isResetMode) {
    if (resetSuccess) {
      return (
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                Password Reset Successful
              </h2>
              <p className="text-sm font-semibold text-emerald-700 mt-2">
                Your password has been changed successfully.
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                All previous sessions and temporary tokens have been invalidated for your security.
              </p>
            </div>
            <button
              onClick={onBackToLogin}
              className="w-full py-3 px-4 bg-[#002147] hover:bg-blue-950 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              PROCEED TO LOGIN
            </button>
          </div>
        </div>
      );
    }

    if (tokenStatus === 'CHECKING') {
      return (
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#002147] animate-spin mx-auto" />
          <h2 className="text-lg font-serif font-bold text-slate-800">
            Verifying Reset Token...
          </h2>
          <p className="text-xs text-slate-500">
            Validating single-use cryptographic security credentials.
          </p>
        </div>
      );
    }

    if (tokenStatus === 'EXPIRED') {
      return (
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Reset Link Expired
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                This password reset link has expired (validity: 30 minutes). For institutional security, temporary tokens automatically lapse.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsResetMode(false);
                  setToken('');
                  setActiveTab('REQUEST_LINK');
                }}
                className="w-full py-2.5 px-4 bg-[#002147] hover:bg-blue-950 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Request New Reset Link
              </button>
              <button
                onClick={onBackToLogin}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (tokenStatus === 'USED') {
      return (
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Reset Link Already Used
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                This password reset link has already been used and cannot be reused. If you have already updated your password, please proceed to login.
              </p>
            </div>
            <button
              onClick={onBackToLogin}
              className="w-full py-2.5 px-4 bg-[#002147] hover:bg-blue-950 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    if (tokenStatus === 'INVALID') {
      return (
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Invalid Reset Link
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {tokenMessage || 'This password reset link is invalid, incomplete, or was issued prior to a system refresh. You can request a fresh single-use link or enter your reset token below.'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsResetMode(false);
                  setToken('');
                  setActiveTab('REQUEST_LINK');
                }}
                className="w-full py-2.5 px-4 bg-[#002147] hover:bg-blue-950 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Request Fresh Reset Link
              </button>
              <button
                onClick={() => {
                  setIsResetMode(false);
                  setToken('');
                  setActiveTab('ENTER_CODE');
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Enter Reset Token Manually
              </button>
              <button
                onClick={onBackToLogin}
                className="w-full py-2 px-4 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Valid Reset Token Form
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 backdrop-blur-2xl shadow-xl overflow-hidden text-white">
          <div className="bg-zinc-950/90 text-white px-6 py-6 border-b border-zinc-800">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#ef233c] block font-mono">
              SRM IST Tiruchirappalli
            </span>
            <h1 className="text-2xl font-manrope font-bold text-white tracking-tight mt-0.5">
              Reset Your Password
            </h1>
            <p className="text-xs text-zinc-300 mt-1">
              Account: {targetEmail || 'Verified User'}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {resetError && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs backdrop-blur-md">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef233c]" />
                <div className="flex-1">
                  <span className="font-bold block text-rose-100 font-manrope text-sm">Password Error</span>
                  <span className="text-rose-200 font-medium">{resetError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  NEW PASSWORD <span className="text-[#ef233c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 12 characters"
                    required
                    minLength={12}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

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
                    placeholder="Re-enter new password"
                    required
                    minLength={12}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs text-zinc-400 font-normal">
                Minimum 12 characters. Reject common passwords. Do not reuse your email name.
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="shiny-cta w-full group transition-all"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-manrope font-bold text-sm tracking-wider">
                  {resetLoading ? 'UPDATING CREDENTIALS...' : 'RESET PASSWORD'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Phase 1: Request Reset or Enter Token Manually Screen
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="mb-4">
        <button
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700 hover:border-[#ef233c] shadow-md transition-all cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-[#ef233c]" />
          <span>Return to Sign In</span>
        </button>
      </div>

      <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(239,35,60,0.15)] backdrop-blur-2xl overflow-hidden text-white">
        <div className="bg-zinc-950/90 text-white px-6 py-6 border-b border-zinc-800">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#ef233c] block font-mono">
            SRM IST Tiruchirappalli
          </span>
          <h1 className="text-2xl font-manrope font-bold text-white tracking-tight mt-0.5">
            Reset Password
          </h1>
          <p className="text-xs text-zinc-300 mt-1">
            Request single-use cryptographic reset instructions or enter token.
          </p>
        </div>

        {/* Tab switcher: Request Link vs Enter Token */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/90 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('REQUEST_LINK')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'REQUEST_LINK'
                ? 'bg-[#ef233c] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. Request Reset Link
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ENTER_CODE')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'ENTER_CODE'
                ? 'bg-[#ef233c] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            2. Enter Token / Paste Link
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-white">
          {activeTab === 'ENTER_CODE' ? (
            /* TAB 2: Enter Token / Paste Reset Link Manually (Fixes External Redirect Issues) */
            <form onSubmit={handleManualCodeSubmit} className="space-y-5">
              <div className="p-3.5 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs text-zinc-300 space-y-1">
                <span className="font-bold text-[#ef233c] flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4 text-[#ef233c]" />
                  Direct Token Bypass
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  If clicking the reset link in your email gave an unexpected redirect error, simply paste the link or the 64-character token here to open the reset form directly.
                </p>
              </div>

              {manualCodeError && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/50 text-rose-200 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
                  <span>{manualCodeError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  RESET TOKEN OR FULL LINK <span className="text-[#ef233c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="Paste ?reset= token or full link from email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 shadow-inner"
                  />
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Accepts either the raw token code or the full URL from your email or Campus Outbox.
                </span>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  className="shiny-cta w-full group transition-all"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white font-manrope font-bold text-sm tracking-wider">
                    <span>VERIFY & OPEN RESET FORM</span>
                    <ArrowRight className="w-4 h-4 text-[#ef233c]" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onOpenEmailInbox}
                  className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#ef233c]" />
                  <span>Open Campus Mail Outbox to Copy Token</span>
                </button>
              </div>
            </form>
          ) : requestSubmitted ? (
            /* TAB 1 SUBMITTED: Success Card with Instant Reset, Copy, and Outbox Options */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">Instructions Dispatched</span>
                  <p className="text-zinc-300">{genericMessage}</p>
                  {deliveredToInbox && (
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-semibold text-[10px] mt-1 border border-emerald-500/30">
                      Direct Delivery to Inbox Confirmed
                    </span>
                  )}
                </div>
              </div>

              {/* Immediate Reset Action Button (Bypasses any external redirect error completely) */}
              {generatedResetToken && (
                <div className="p-4 bg-zinc-900/90 border border-zinc-700/80 rounded-xl space-y-3">
                  <div className="text-xs text-zinc-200">
                    <span className="font-bold text-[#ef233c] block font-mono">Instant Reset Available</span>
                    <span className="text-[11px] text-zinc-400">
                      You can proceed directly in this window without opening an external email link:
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setToken(generatedResetToken);
                      setIsResetMode(true);
                    }}
                    className="shiny-cta w-full py-2.5 px-4 rounded-xl text-white text-xs font-manrope font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>RESET PASSWORD NOW</span>
                    <ArrowRight className="w-4 h-4 text-[#ef233c]" />
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="flex-1 py-2 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedToken ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied Token</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-400" />
                          <span>Copy Token Code</span>
                        </>
                      )}
                    </button>

                    {generatedResetLink && (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex-1 py-2 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied Link</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-400" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-zinc-400 space-y-2">
                <p>The reset link is single-use and will expire in <strong className="text-white">30 minutes</strong>.</p>
                <button
                  type="button"
                  onClick={onOpenEmailInbox}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#ef233c]" />
                  <span>Inspect Dispatched Email in Campus Outbox</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequestSubmitted(false);
                    setEmail('');
                  }}
                  className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Request Another
                </button>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="flex-1 py-2 px-3 bg-[#ef233c] hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* TAB 1 FORM: Enter Email to Request Reset Link */
            <form onSubmit={handleRequestReset} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  REGISTERED EMAIL ADDRESS <span className="text-[#ef233c]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., student@srmist.edu.in or your email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                  />
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Enter the email address registered with your SRM IST student, faculty, or admin account.
                </span>
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                className="shiny-cta w-full group transition-all"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-manrope font-bold text-sm tracking-wider">
                  {requestLoading ? (
                    <span>Dispatching Request...</span>
                  ) : (
                    <>
                      <span>SEND RESET LINK</span>
                      <ArrowRight className="w-4 h-4 text-[#ef233c]" />
                    </>
                  )}
                </span>
              </button>

              <div className="pt-2 border-t border-zinc-800 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('ENTER_CODE')}
                  className="text-xs text-[#ef233c] hover:underline font-semibold cursor-pointer"
                >
                  Already received a link or token? Click here to enter token directly &rarr;
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

