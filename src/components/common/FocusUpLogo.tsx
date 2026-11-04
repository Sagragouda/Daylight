import React, { useState } from 'react';

export interface FocusUpLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withGlow?: boolean;
  showText?: boolean;
}

export const FocusUpLogo: React.FC<FocusUpLogoProps> = ({
  size = 'md',
  className = '',
  withGlow = false,
  showText = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    xs: { box: 'w-6 h-6', imgSize: 24, rounded: 'rounded-lg' },
    sm: { box: 'w-8 h-8', imgSize: 32, rounded: 'rounded-xl' },
    md: { box: 'w-10 h-10', imgSize: 40, rounded: 'rounded-2xl' },
    lg: { box: 'w-13 h-13', imgSize: 52, rounded: 'rounded-2xl' },
    xl: { box: 'w-20 h-20', imgSize: 80, rounded: 'rounded-3xl' },
  };

  const { box, rounded } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon Squircle Container */}
      <div
        className={`relative inline-flex items-center justify-center shrink-0 ${box} ${rounded} overflow-hidden bg-[#0c0d16] border border-white/20 shadow-[0_4px_14px_rgba(217,70,239,0.25)] transition-transform duration-300 hover:scale-105`}
      >
        {/* Ambient Neon Glow */}
        {withGlow && (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#ec4899] via-[#a855f7] to-[#f97316] blur-md opacity-60 dark:opacity-80 animate-pulse-subtle pointer-events-none" />
        )}

        {/* Gloss Top Specular Reflection Highlight */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none z-10" />

        {!imageError ? (
          <img
            src="/brand/focusup-icon.png"
            alt="FocusUp"
            onError={() => setImageError(true)}
            className="relative z-10 w-full h-full object-contain p-0.5 transition-all"
            loading="eager"
          />
        ) : (
          /* SVG Vector Fallback (Stopwatch + Upward Arrow + Leaves) */
          <svg
            viewBox="0 0 100 100"
            className="relative z-10 w-full h-full p-1 drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="focusUpSvgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="52" r="30" stroke="url(#focusUpSvgGrad)" strokeWidth="6" />
            <path d="M48 22 L52 22 L52 16 L48 16 Z" fill="#fb7185" />
            <path d="M45 55 L70 30 M70 30 L58 29 M70 30 L71 42" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="45" cy="55" r="5" fill="#facc15" />
            {/* Sprout Leaves on left */}
            <path d="M28 42 C20 40 18 30 26 28 C28 36 28 42 28 42 Z" fill="#c084fc" />
            <path d="M22 56 C14 56 12 48 20 44 C22 50 22 56 22 56 Z" fill="#e879f9" />
          </svg>
        )}
      </div>

      {/* Optional Side Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#f97316] bg-clip-text text-transparent flex items-center gap-1.5 leading-snug">
            FocusUp
          </span>
          <span className="text-[10px] font-semibold text-[#86868b] dark:text-[#98989f] tracking-wider uppercase">
            habit tracker & focus
          </span>
        </div>
      )}
    </div>
  );
};
