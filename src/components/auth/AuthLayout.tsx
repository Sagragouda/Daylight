import React from 'react';
import { SunMedium, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* Background ambient lighting accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,113,227,0.3)] transition-transform duration-300 group-hover:scale-105">
            <SunMedium className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#1d1d1f]">
            Daylight
          </span>
        </Link>
      </div>

      {/* Main Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl border border-black/[0.06] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] rounded-3xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[#6e6e73] mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {children}
      </div>

      {/* Bottom Privacy & Security Badge */}
      <div className="relative z-10 mt-6 flex items-center gap-1.5 text-xs text-[#86868b]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3]" />
        <span>End-to-End Auth with Supabase</span>
        <span>•</span>
        <span>Daylight v1.0</span>
      </div>
    </div>
  );
};
