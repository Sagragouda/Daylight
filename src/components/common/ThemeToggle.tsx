import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const modes: { id: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
        title={`Appearance: ${themeMode} (${resolvedTheme})`}
        aria-label="Toggle theme appearance"
        aria-expanded={menuOpen}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-blue-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white/95 dark:bg-[#161722]/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.55)] border border-black/[0.08] dark:border-white/[0.1] p-1.5 z-50 animate-scale-in">
          {modes.map((item) => {
            const Icon = item.icon;
            const isSelected = themeMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setThemeMode(item.id);
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff]'
                    : 'text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
