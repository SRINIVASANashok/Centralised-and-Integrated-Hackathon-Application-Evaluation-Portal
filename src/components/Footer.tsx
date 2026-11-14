import React from 'react';
import { Award, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 pt-20 pb-10 relative overflow-hidden text-zinc-400 font-inter z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-5 h-5 bg-[#ef233c] rounded-xs rotate-45 shadow-[0_0_12px_rgba(239,35,60,0.5)]"></div>
            <span className="text-2xl font-bold font-manrope tracking-tight text-white">
              SRM IST Tiruchirappalli
            </span>
          </div>
          <p className="text-zinc-500 max-w-sm leading-relaxed text-sm mb-4">
            Deemed to be University under section 3 of UGC Act 1956. Authorized identity verification and single-sign-on access infrastructure for collegiate students, faculty, and administrators.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-[#ef233c] font-mono">
            <Award className="w-4 h-4 text-[#ef233c]" />
            <span>NAAC A++ ACCREDITED · NIRF RANKED</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-manrope">
            Campus Location
          </h4>
          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#ef233c] shrink-0 mt-1" />
              <address className="not-italic leading-relaxed text-xs">
                SRM Institute of Science and Technology<br />
                Tiruchirappalli Campus, NH-45, Irungalur<br />
                Tiruchirappalli – 621 105, Tamil Nadu, India
              </address>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              <span>Office: +91 431 225 8000</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-manrope">
            Gateways & Support
          </h4>
          <ul className="space-y-3 text-zinc-400 text-xs">
            <li>
              <a href="mailto:it.helpdesk@ist.srmtrichy.edu.in" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>IT Service Desk</span>
              </a>
            </li>
            <li>
              <span className="text-zinc-500">Admissions: admissions@ist.srmtrichy.edu.in</span>
            </li>
            <li>
              <span className="text-zinc-500">Security: Cryptographic SSO Token Authority</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Huge Footer Text from Reference Implementation */}
      <div className="flex justify-center items-center py-6 opacity-25 pointer-events-none select-none">
        <h1 className="text-[12vw] sm:text-[14vw] leading-none font-bold font-manrope tracking-tighter text-stroke">
          SRM IST TRICHY
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-[10px] uppercase tracking-widest font-mono">
        <p>&copy; 2026 SRM Institute of Science and Technology. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span>Identity Gateway v4.2</span>
          <span className="text-zinc-400">Red Noir Edition</span>
        </div>
      </div>
    </footer>
  );
};
