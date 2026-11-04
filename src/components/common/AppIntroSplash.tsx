import React, { useState, useEffect } from 'react';
import { FocusUpLogo } from './FocusUpLogo';

export const AppIntroSplash: React.FC = () => {
  const [shouldRender, setShouldRender] = useState<boolean>(() => {
    // Only show once per browser session
    try {
      return !(
        sessionStorage.getItem('focusup_intro_seen') ||
        sessionStorage.getItem('flowora_intro_seen') ||
        sessionStorage.getItem('daylight_intro_seen')
      );
    } catch {
      return false;
    }
  });

  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!shouldRender) return;

    try {
      sessionStorage.setItem('focusup_intro_seen', 'true');
    } catch {
      // ignore
    }

    // Begin silky fade out quickly (800ms) to avoid blocking the user
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 800);

    // Unmount after smooth transition (1.1s total)
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 1100);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-[#090a0f]/95 backdrop-blur-2xl transition-all duration-300 pointer-events-none select-none ${
        isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      aria-hidden="true"
    >
      {/* Ambient background neon bloom (FocusUp magenta & orange glow) */}
      <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-[#ec4899]/30 via-[#a855f7]/25 to-[#f97316]/35 blur-3xl animate-pulse-subtle pointer-events-none" />

      {/* Logo container with scale-up entrance */}
      <div className="relative z-10 flex flex-col items-center gap-3.5 animate-scale-in">
        <FocusUpLogo size="xl" withGlow />

        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#f97316] bg-clip-text text-transparent">
            FocusUp
          </h1>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#86868b] dark:text-[#98989f]">
            habit tracker & focus
          </p>
        </div>

        {/* Minimal luminous loading bar */}
        <div className="w-28 h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.1] overflow-hidden mt-2">
          <div className="w-full h-full bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#f97316] rounded-full animate-[progressPulse_0.8s_ease-out_forwards]" />
        </div>
      </div>
    </div>
  );
};
