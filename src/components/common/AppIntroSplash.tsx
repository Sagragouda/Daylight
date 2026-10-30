import React, { useState, useEffect } from 'react';
import { FloworaLogo } from './FloworaLogo';

export const AppIntroSplash: React.FC = () => {
  const [shouldRender, setShouldRender] = useState<boolean>(() => {
    // Only show once per browser session
    try {
      return !(
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
      sessionStorage.setItem('flowora_intro_seen', 'true');
    } catch {
      // ignore
    }

    // Begin fade out after 1.2 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1200);

    // Unmount after exit transition completes (1.55s total)
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 1550);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-[#090a0f]/95 backdrop-blur-2xl transition-all duration-350 pointer-events-none select-none ${
        isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      aria-hidden="true"
    >
      {/* Ambient background bloom */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#0071E3]/30 via-[#8B5CF6]/25 to-[#10B981]/35 blur-3xl animate-pulse-subtle pointer-events-none" />

      {/* Logo container with scale-up entrance */}
      <div className="relative z-10 flex flex-col items-center gap-4 animate-scale-in">
        <FloworaLogo size="xl" withGlow />

        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#1d1d1f] via-[#0071e3] to-[#5e5ce6] dark:from-white dark:via-[#2997ff] dark:to-[#af52de] bg-clip-text text-transparent">
            Flowora
          </h1>
          <p className="text-xs font-semibold tracking-wider uppercase text-[#86868b] dark:text-[#98989f]">
            Mindful Flow & Peak Execution
          </p>
        </div>

        {/* Minimal luminous loading bar */}
        <div className="w-32 h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.1] overflow-hidden mt-3">
          <div className="w-full h-full bg-gradient-to-r from-[#0071E3] via-[#8B5CF6] to-[#10B981] rounded-full animate-[progressPulse_1.2s_ease-out_forwards]" />
        </div>
      </div>
    </div>
  );
};
