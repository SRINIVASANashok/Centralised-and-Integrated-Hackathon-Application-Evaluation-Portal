import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  GraduationCap,
  Users,
  Lightbulb,
  Calendar,
  Mail,
  Zap,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { loginUser } from '../services/api';
import { AuthenticatedUser } from '../types/auth';

interface MainLoginViewProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
  onSelectStudentPortal: () => void;
  onSelectFacultyPortal: () => void;
  onSelectAdminPortal: () => void;
  onForgotPassword: () => void;
  onOpenProblems?: () => void;
  onOpenTimeline?: () => void;
  onOpenEmailInbox?: () => void;
  onOpenBenchmark?: () => void;
}

export const MainLoginView: React.FC<MainLoginViewProps> = ({
  onLoginSuccess,
  onSelectStudentPortal,
  onSelectFacultyPortal,
  onSelectAdminPortal,
  onForgotPassword,
  onOpenProblems,
  onOpenTimeline,
  onOpenEmailInbox,
  onOpenBenchmark,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickDemoLogin = async (role: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    setError(null);
    setLoading(true);
    let u = '';
    let p = '';
    if (role === 'STUDENT') {
      u = 'an9482@srmist.edu.in';
      p = 'Student@srmtrchy2026';
    } else if (role === 'FACULTY') {
      u = 'faculty.cse@ist.srmtrichy.edu.in';
      p = 'Faculty@srmtrchy2026';
    } else {
      u = 'ADMIN@SRM01';
      p = 'Admin@srmisttrchy';
    }
    try {
      const res = await loginUser(u, p);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Failed to authenticate demo account.');
      }
    } catch (err: any) {
      setError('Communication failure connecting to authentication gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please provide your username or registered email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(username.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid username or password.');
      }
    } catch (err: any) {
      setError('Network communication failure. Please verify connection to SRM gateway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8 font-inter selection-red text-white">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto mb-14">
        {/* Pulsing Live Beacon Pill */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(239,35,60,0.2)] text-white"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef233c]"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide font-manrope text-zinc-100">
            SRM IST Tiruchirappalli · Identity & Access Gateway
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#ef233c]" />
        </div>

        {/* Crystal Clear High-Contrast Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight font-manrope text-white leading-tight mb-4">
          Centralised and Integrated <br className="hidden sm:inline" />
          <span className="text-[#ef233c] inline-block relative underline decoration-[#ef233c] decoration-4 underline-offset-8">
            Hackathon Application Portal
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-200 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Official institutional single-sign-on for Tiruchirappalli campus. Authenticate with your student registration, faculty credentials, or administrative console account.
        </p>

        {/* Quick Direct Floating Portals Hub */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={onSelectStudentPortal}
            className="group px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-white font-semibold hover:border-sky-400 hover:bg-zinc-800 hover:shadow-[0_0_16px_rgba(56,189,248,0.45)] transition-all flex items-center gap-2 text-xs font-manrope cursor-pointer shadow-md"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
            <span>Student Portal</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={onSelectFacultyPortal}
            className="group px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-white font-semibold hover:border-amber-400 hover:bg-zinc-800 hover:shadow-[0_0_16px_rgba(251,191,36,0.45)] transition-all flex items-center gap-2 text-xs font-manrope cursor-pointer shadow-md"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
            <span>Faculty Access</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={onSelectAdminPortal}
            className="group px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-white font-semibold hover:border-[#ef233c] hover:bg-zinc-800 hover:shadow-[0_0_16px_rgba(239,35,60,0.5)] transition-all flex items-center gap-2 text-xs font-manrope cursor-pointer shadow-md"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef233c] shadow-[0_0_8px_rgba(239,35,60,0.8)]"></div>
            <span>Admin Console</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {onOpenProblems && (
            <button
              type="button"
              onClick={onOpenProblems}
              className="group px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-white font-semibold hover:border-violet-400 hover:bg-zinc-800 hover:shadow-[0_0_16px_rgba(167,139,250,0.45)] transition-all flex items-center gap-2 text-xs font-manrope cursor-pointer shadow-md"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"></div>
              <span>Problem Statements</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

        </div>
      </section>

      {/* Main Authentication Grid (Bento Style with Solid High Contrast) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Login Form (7 cols) - Atmospheric Noir Glassmorphism Harmonized with Background */}
        <div className="login-card-noir lg:col-span-6 lg:col-start-4 group relative overflow-hidden p-6 sm:p-9 border border-zinc-700/80 bg-zinc-950/85 hover:border-zinc-600 transition-all rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(239,35,60,0.15)] backdrop-blur-2xl text-white">

          {/* Ambient atmospheric light accents */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#ef233c]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#ef233c]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="border-b border-zinc-800 pb-5 mb-6 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs uppercase font-mono font-bold tracking-widest text-[#ef233c] mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef233c] shadow-[0_0_8px_rgba(239,35,60,0.8)]"></span>
                  <span>UNIFIED IDENTITY GATEWAY</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-manrope font-bold text-white tracking-tight">
                  Institutional Account Sign In
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-normal leading-relaxed">
                  Enter your registered username / institutional email and password to enter.
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[#ef233c] shadow-lg shrink-0 group-hover:border-[#ef233c]/50 transition-colors">
                <Shield className="w-5 h-5 text-[#ef233c]" />
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs backdrop-blur-md">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef233c]" />
                <div className="flex-1">
                  <span className="font-bold block text-rose-100 font-manrope text-sm">Authentication Failed</span>
                  <span className="text-rose-200 mt-0.5 block">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleGeneralLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                  USERNAME / REGISTERED EMAIL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. an9482@srmist.edu.in or ADMIN@SRM01"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider font-manrope">
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs font-bold text-[#ef233c] hover:underline cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="shiny-cta w-full group transition-all"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white font-manrope font-bold text-sm tracking-wider">
                    {loading ? (
                      <span>AUTHENTICATING SECURELY...</span>
                    ) : (
                      <>
                        <span>ENTER GATEWAY</span>
                        <ArrowRight className="w-4 h-4 text-[#ef233c] transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Role Segregation Bar */}
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider text-center mb-4 font-mono">
                Dedicated Institutional Portals
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={onSelectStudentPortal}
                  className="p-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-[#ef233c] rounded-xl text-center transition-all group cursor-pointer shadow-sm"
                >
                  <span className="block text-xs font-bold text-white group-hover:text-[#ef233c] font-manrope">
                    STUDENT
                  </span>
                  <span className="block text-[11px] text-zinc-400 font-medium mt-0.5">
                    Registration & SSO
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onSelectFacultyPortal}
                  className="p-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-[#ef233c] rounded-xl text-center transition-all group cursor-pointer shadow-sm"
                >
                  <span className="block text-xs font-bold text-white group-hover:text-[#ef233c] font-manrope">
                    FACULTY
                  </span>
                  <span className="block text-[11px] text-zinc-400 font-medium mt-0.5">
                    Staff Portal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onSelectAdminPortal}
                  className="p-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-[#ef233c] rounded-xl text-center transition-all group cursor-pointer shadow-sm"
                >
                  <span className="block text-xs font-bold text-white group-hover:text-[#ef233c] font-manrope">
                    ADMIN
                  </span>
                  <span className="block text-[11px] text-zinc-400 font-medium mt-0.5">
                    System Console
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>


        </div>
      </div>
  );
};

