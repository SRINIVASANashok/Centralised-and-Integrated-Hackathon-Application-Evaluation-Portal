import React, { useState } from 'react';
import { ShieldAlert, User, Lock, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginUser } from '../services/api';
import { AuthenticatedUser } from '../types/auth';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
  onBackToMain: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToMain,
}) => {
  const [username, setUsername] = useState('ADMIN@SRM01');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please provide administrative username and password.');
      return;
    }

    setLoading(true);
    try {
      // Authenticate with expectedRole = ADMIN
      const res = await loginUser(username.trim(), password, 'ADMIN');
      if (res.success && res.user) {
        if (res.user.role !== 'ADMIN') {
          setError('Access Denied. Account does not possess administrative privileges.');
        } else {
          onLoginSuccess(res.user);
        }
      } else {
        setError(res.error || 'Invalid administrative credentials.');
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
            <ShieldAlert className="w-4 h-4 text-[#ef233c]" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#ef233c] font-mono">
              Restricted Authority
            </span>
          </div>
          <h1 className="text-2xl font-manrope font-bold text-white tracking-tight">
            Administrator Console Login
          </h1>
          <p className="text-xs text-zinc-300 mt-1">
            SRM IST Tiruchirappalli · Institutional Directory & Security Management
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-transparent text-white">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef233c]" />
              <div className="flex-1">
                <span className="font-bold block text-rose-100 font-manrope text-sm">Authentication Refused</span>
                <span className="text-rose-200 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                USERNAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ADMIN@SRM01"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 font-semibold focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 uppercase font-mono transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2 font-manrope">
                PASSWORD
              </label>
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
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-base text-white placeholder-zinc-500 font-semibold focus:outline-none focus:border-[#ef233c] focus:ring-2 focus:ring-[#ef233c]/30 transition-all shadow-inner"
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
                  <span>VERIFYING ADMINISTRATIVE AUTHORITY...</span>
                ) : (
                  <>
                    <span>VERIFY AUTHORITY & ENTER</span>
                    <ArrowRight className="w-4 h-4 text-[#ef233c] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Security Governance Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              All administrative access requests are cryptographically audited and timestamped in the server security ledger.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
