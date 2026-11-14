import React, { useState } from 'react';
import { User, Lock, AlertCircle, ArrowLeft, ArrowRight, UserPlus, CheckCircle2, KeyRound, Lightbulb, Calendar, Sparkles } from 'lucide-react';
import { loginUser } from '../services/api';
import { AuthenticatedUser } from '../types/auth';
import { StudentRegisterView } from './StudentRegisterView';

interface StudentPortalViewProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
  onBackToMain: () => void;
  onForgotPassword: () => void;
  onOpenEmailInbox: () => void;
  onOpenProblems: () => void;
  onOpenTimeline: () => void;
  onNavigateToActivation?: (token: string) => void;
  onOpenEmailConfig?: (defaultEmail?: string) => void;
  initialTab?: 'EXISTING' | 'NEW';
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  onLoginSuccess,
  onBackToMain,
  onForgotPassword,
  onOpenEmailInbox,
  onOpenProblems,
  onOpenTimeline,
  onNavigateToActivation,
  onOpenEmailConfig,
  initialTab = 'EXISTING',
}) => {
  const [activeTab, setActiveTab] = useState<'EXISTING' | 'NEW'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Invalid username or password.');
      return;
    }

    setLoading(true);
    try {
      // Authenticate strictly with expectedRole = STUDENT
      const res = await loginUser(email.trim(), password, 'STUDENT');
      if (res.success && res.user) {
        if (res.user.role !== 'STUDENT') {
          setError('Access Denied. Only student accounts can log in through the Student Portal.');
        } else {
          onLoginSuccess(res.user);
        }
      } else {
        // Requirement 3: "On failed login show: 'Invalid username or password.' Do not reveal whether the email exists."
        setError(res.error || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Navigation Return */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToMain}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700 hover:border-[#ef233c] shadow-md transition-all cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-[#ef233c]" />
          <span>Return to Institutional Gateway</span>
        </button>
        <span className="text-xs text-zinc-400 font-mono">SEC-STU-PORTAL-v26</span>
      </div>

      {/* Institutional Card */}
      <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(239,35,60,0.15)] backdrop-blur-2xl overflow-hidden text-white">
        {/* Portal Header */}
        <div className="bg-zinc-950/90 text-white px-6 py-6 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#ef233c] block font-mono">
                SRM IST Tiruchirappalli
              </span>
              <h1 className="text-2xl font-manrope font-bold text-white tracking-tight mt-0.5">
                Student Authentication
              </h1>
              <p className="text-xs text-zinc-300 mt-1">
                Access your academic records, course registrations, and student credentials.
              </p>
            </div>
            {/* Tab Selection: [ EXISTING USER ] [ NEW USER ] */}
            <div className="flex items-center p-1 bg-zinc-900 border border-zinc-700/80 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab('EXISTING'); setError(null); }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'EXISTING'
                    ? 'bg-[#ef233c] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                EXISTING USER
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('NEW'); setError(null); }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'NEW'
                    ? 'bg-[#ef233c] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                NEW USER
              </button>
            </div>
          </div>
        </div>

        {/* New Ecosystem Card */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-white font-manrope tracking-wider uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Hackathon Portal Ecosystem</span>
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-violet-950/60 border border-violet-500 text-violet-400 font-mono font-bold">
              MULTI-PORTAL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <button
              type="button"
              onClick={onOpenProblems}
              className="p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-500/70 text-left transition-all group/btn cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center mb-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white block group-hover/btn:text-violet-300 font-manrope">
                Problem Repo
              </span>
              <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
                45+ SIH Themes
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenTimeline}
              className="p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/70 text-left transition-all group/btn cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white block group-hover/btn:text-emerald-300 font-manrope">
                Roadmap & Rules
              </span>
              <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
                Phase 1 - Phase 4
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Existing Student Login */}
        {activeTab === 'EXISTING' ? (
          <div className="p-6 sm:p-8 bg-transparent text-white">
            <div className="max-w-md mx-auto text-white">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-manrope text-white">
                  Student Sign In
                </h2>
                <p className="text-xs text-zinc-300 mt-1.5 font-normal">
                  Log in using your registered institutional email address.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef233c]" />
                  <div className="flex-1">
                    <span className="font-bold block text-rose-100 font-manrope text-sm">Authentication Error</span>
                    <span className="text-rose-200 font-medium">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleStudentLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                    USERNAME / EMAIL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. an9482@srmist.edu.in"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 font-medium focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium mt-1.5 block">
                    The student username must be your registered email address.
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider font-manrope">
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-xs font-bold text-[#ef233c] hover:underline cursor-pointer"
                    >
                      FORGOT PASSWORD?
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
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 font-medium focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner"
                    />
                  </div>
                </div>

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
                        <span>LOGIN TO STUDENT PORTAL</span>
                        <ArrowRight className="w-4 h-4 text-[#ef233c] transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 font-medium">First time logging in or admitted recently?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('NEW')}
                  className="block mx-auto mt-2 text-xs font-extrabold text-[#ef233c] hover:underline cursor-pointer tracking-wide"
                >
                  REGISTER AS NEW STUDENT →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: New Student Registration */
          <StudentRegisterView
            onRegistrationComplete={() => {
              setActiveTab('EXISTING');
            }}
            onOpenEmailInbox={onOpenEmailInbox}
            onNavigateToActivation={onNavigateToActivation}
            onOpenEmailConfig={onOpenEmailConfig}
          />
        )}
      </div>
    </div>
  );
};
