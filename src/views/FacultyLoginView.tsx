import React, { useState } from 'react';
import { User, Lock, AlertCircle, ArrowLeft, ArrowRight, BookOpen, Shield } from 'lucide-react';
import { loginUser } from '../services/api';
import { AuthenticatedUser } from '../types/auth';

interface FacultyLoginViewProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
  onBackToMain: () => void;
  onForgotPassword: () => void;
  onNavigateToRegister?: () => void;
}

export const FacultyLoginView: React.FC<FacultyLoginViewProps> = ({
  onLoginSuccess,
  onBackToMain,
  onForgotPassword,
  onNavigateToRegister,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFacultyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please provide your faculty email / username and password.');
      return;
    }

    setLoading(true);
    try {
      // Authenticate with expectedRole = FACULTY
      const res = await loginUser(username.trim(), password, 'FACULTY');
      if (res.success && res.user) {
        if (res.user.role !== 'FACULTY') {
          setError('Access Denied. Only authorized faculty members may log in through this portal.');
        } else {
          onLoginSuccess(res.user);
        }
      } else {
        setError(res.error || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Network communication failure. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="mb-4">
        <button
          onClick={onBackToMain}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700 hover:border-[#ef233c] shadow-md transition-all cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-[#ef233c]" />
          <span>Return to Institutional Gateway</span>
        </button>
      </div>

      <div className="login-card-noir rounded-3xl border border-zinc-700/80 bg-zinc-950/85 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(239,35,60,0.15)] backdrop-blur-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="bg-zinc-950/90 text-white px-6 py-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-[#ef233c]" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#ef233c] font-mono">
              Academic Faculty Portal
            </span>
          </div>
          <h1 className="text-2xl font-manrope font-bold text-white tracking-tight">
            Faculty Sign In
          </h1>
          <p className="text-xs text-zinc-300 mt-1">
            SRM IST Tiruchirappalli · Teaching & Research Staff Access
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-transparent text-white">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef233c]" />
              <div className="flex-1">
                <span className="font-bold block text-rose-100 font-manrope text-sm">Authentication Error</span>
                <span className="text-rose-200 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleFacultyLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                USERNAME / FACULTY EMAIL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. faculty.cse@ist.srmtrichy.edu.in"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 font-medium focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner"
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
                    <span>LOGIN TO FACULTY PORTAL</span>
                    <ArrowRight className="w-4 h-4 text-[#ef233c]" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Faculty Registration Link */}
          {onNavigateToRegister && (
            <div className="pt-4 text-center border-t border-zinc-800">
              <span className="text-xs text-zinc-400 mr-1.5">New Teaching or Research Staff?</span>
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-xs font-bold text-[#ef233c] hover:underline cursor-pointer"
              >
                Register Faculty Account →
              </button>
            </div>
          )}

          {/* Quick Notice */}
          <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-400 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#ef233c] shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">
              Students attempting to access faculty systems will be denied and logged in the security audit journal.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
