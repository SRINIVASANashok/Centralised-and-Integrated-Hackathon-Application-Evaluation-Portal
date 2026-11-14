import React from 'react';
import { Mail, Send, ArrowRight, LogOut } from 'lucide-react';
import { AuthenticatedUser } from '../types/auth';

interface HeaderProps {
  currentUser?: AuthenticatedUser | null;
  onLogout?: () => void;
  onOpenEmailInbox?: () => void;
  onOpenEmailConfig?: () => void;
  onOpenTestBench?: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenEmailInbox,
  onOpenEmailConfig,
  onOpenTestBench,
  onNavigateHome,
}) => {
  return (
    <>
      {/* Top Blur Mask from Reference Design */}
      <div className="gradient-blur" />

      {/* Floating Red Noir Navbar */}
      <header className="fixed top-0 left-0 w-full z-40 pt-4 sm:pt-6 px-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl">
          {/* Brand Mark with rotated neon crimson accent */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            >
              <div className="w-5 h-5 bg-[#ef233c] rounded-xs rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(239,35,60,0.6)] group-hover:rotate-90 transition-transform duration-300 shrink-0"></div>
              <div>
                <span className="text-base sm:text-lg font-bold font-manrope tracking-tight text-white block leading-tight">
                  SRM IST
                  <span className="text-[#ef233c] font-normal text-xs uppercase ml-1.5 tracking-wider hidden sm:inline">
                    Tiruchirappalli
                  </span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase block sm:hidden">
                  IDENTITY GATEWAY
                </span>
              </div>
            </button>
          </div>

          {/* Center Links (Reference Navigation) */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-zinc-400 font-inter">
            <button
              onClick={onOpenEmailConfig}
              className="hover:text-sky-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Direct Email Inbox Delivery Setup"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Inbox Relay</span>
            </button>
            <button
              onClick={onOpenEmailInbox}
              className="hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View Campus Outbox"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Outbox</span>
            </button>
          </div>

          {/* Right Action: Shiny Animated Button or User Status */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-white block truncate max-w-40 font-manrope">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#ef233c] tracking-wider uppercase block">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/5 px-4 py-1.5 transition-transform active:scale-95 cursor-pointer text-xs font-bold text-zinc-300 hover:text-white border border-white/10"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1 text-[#ef233c]" />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateHome}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/5 px-4 sm:px-5 py-1.5 sm:py-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <span className="absolute inset-0 border border-white/10 rounded-full"></span>
                  <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#ef233c_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute inset-[1px] rounded-full bg-black"></span>
                  <span className="relative z-10 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white font-manrope">
                    <span>Access</span>
                    <ArrowRight className="w-3 h-3 text-[#ef233c] group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-24 sm:h-28" />
    </>
  );
};
