import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FocusUpLogo } from '../common/FocusUpLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#090a0f] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none transition-colors duration-200">
      {/* Background ambient lighting accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-100/40 dark:bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 mb-6 text-center animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <FocusUpLogo size="lg" withGlow />
          <div className="text-left">
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#f97316] bg-clip-text text-transparent block">
              FocusUp
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#86868b] dark:text-[#98989f]">
              habit tracker & focus
            </span>
          </div>
        </Link>
      </div>

      {/* Main Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-[#14151e]/95 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-glossy-light dark:shadow-glossy-dark rounded-3xl p-6 sm:p-8 animate-scale-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[#6e6e73] dark:text-[#98989f] mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {children}
      </div>

      {/* Bottom Privacy & Security Badge */}
      <div className="relative z-10 mt-6 flex items-center gap-1.5 text-xs text-[#86868b] dark:text-[#98989f] animate-fade-in">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
        <span>End-to-End Auth with Supabase</span>
        <span className="text-black/20 dark:text-white/20">•</span>
        <span>FocusUp v1.0</span>
      </div>
    </div>
  );
};
