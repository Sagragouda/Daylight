import React from 'react';
import { Card } from '../common/Card';
import { useTimer } from '../../context/TimerContext';
import { Play, Pause, RotateCcw, ExternalLink, Zap } from 'lucide-react';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';
import { PomodoroMode } from '../../types';

export const MiniFocusTimer: React.FC = () => {
  const {
    mode,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    formattedTime,
    progressPercent,
    completedSessions,
  } = useTimer();

  const modeConfig: Record<
    PomodoroMode,
    {
      gradientId: string;
      strokeUrl: string;
      glowClass: string;
      badge: string;
      text: string;
    }
  > = {
    pomodoro: {
      gradientId: 'mini-gradient-pomodoro',
      strokeUrl: 'url(#mini-gradient-pomodoro)',
      glowClass: 'glow-ring-blue',
      badge:
        'bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] border-blue-200/50 dark:border-blue-800/40',
      text: 'Deep Work',
    },
    shortBreak: {
      gradientId: 'mini-gradient-short',
      strokeUrl: 'url(#mini-gradient-short)',
      glowClass: 'glow-ring-emerald',
      badge:
        'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/40',
      text: 'Short Break',
    },
    longBreak: {
      gradientId: 'mini-gradient-long',
      strokeUrl: 'url(#mini-gradient-long)',
      glowClass: 'glow-ring-purple',
      badge:
        'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/40',
      text: 'Long Rest',
    },
  };

  const currentMode = modeConfig[mode];

  // SVG circular countdown ring
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progressPercent)) / 100) * circumference;

  return (
    <Card
      id="dashboard-focus-timer"
      hoverable
      glowColor={mode === 'pomodoro' ? 'blue' : mode === 'shortBreak' ? 'emerald' : 'purple'}
      className="p-5 sm:p-6 glossy-glass-card relative overflow-hidden"
    >
      {/* Dynamic ambient backdrop glow */}
      <div
        className={`absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isRunning ? 'opacity-30 bg-[#0071e3]' : 'opacity-10 bg-[#0071e3]'
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.08] mb-4 relative z-10">
        <div>
          <h3 className="font-semibold text-base sm:text-lg text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            Focus Room
            <span
              className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-semibold border ${currentMode.badge}`}
            >
              {currentMode.text}
            </span>
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#98989f]">
            25-minute Pomodoro method for deep work
          </p>
        </div>

        <Link
          to="/focus"
          className="p-1.5 rounded-xl text-[#86868b] dark:text-[#98989f] hover:text-[#0071e3] dark:hover:text-[#2997ff] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Open immersive Focus room"
        >
          <span className="hidden sm:inline">Immersive</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mode Switches */}
      <div className="flex items-center justify-center gap-1 p-1 bg-[#f5f5f7] dark:bg-white/[0.06] rounded-xl max-w-sm mx-auto mb-5 relative z-10 border border-black/[0.04] dark:border-white/[0.06]">
        {(['pomodoro', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
              mode === m
                ? 'bg-white dark:bg-[#202230] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
                : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
          >
            {m === 'pomodoro' ? 'Focus (25m)' : m === 'shortBreak' ? 'Short (5m)' : 'Long (15m)'}
          </button>
        ))}
      </div>

      {/* Main Countdown Display with Colorful Gradient Ring */}
      <div className="flex flex-col items-center justify-center my-1 relative z-10">
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 180 180" className="w-48 h-48 transform -rotate-90 select-none">
            <defs>
              <linearGradient id="mini-gradient-pomodoro" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0071e3" />
                <stop offset="50%" stopColor="#5e5ce6" />
                <stop offset="100%" stopColor="#af52de" />
              </linearGradient>
              <linearGradient id="mini-gradient-short" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="mini-gradient-long" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff9500" />
                <stop offset="50%" stopColor="#ff2d55" />
                <stop offset="100%" stopColor="#af52de" />
              </linearGradient>
            </defs>

            {/* Outer Chronograph Dashed Track */}
            <circle
              cx="90"
              cy="90"
              r="80"
              className="text-black/[0.06] dark:text-white/[0.08]"
              strokeWidth="1.5"
              stroke="currentColor"
              strokeDasharray="2 6"
              fill="transparent"
            />

            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              className="text-black/[0.04] dark:text-white/[0.06]"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />

            {/* Animated countdown ring */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke={currentMode.strokeUrl}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-700 ease-out ${currentMode.glowClass}`}
              fill="transparent"
            />
          </svg>

          {/* Time & State in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span
              className={`text-4xl font-mono font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] transition-transform duration-300 ${
                isRunning ? 'scale-105' : ''
              }`}
            >
              {formattedTime}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#86868b] dark:text-[#98989f] mt-1">
              {isRunning ? (
                <>
                  <Zap className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500 animate-pulse" />
                  Flow Active
                </>
              ) : (
                'Ready'
              )}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-5">
          <Button
            onClick={resetTimer}
            variant="glass"
            size="md"
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>

          <Button
            onClick={isRunning ? pauseTimer : startTimer}
            variant={isRunning ? 'secondary' : 'gradient'}
            size="md"
            className="w-36 shadow-md"
            icon={
              isRunning ? (
                <Pause className="w-4 h-4 text-amber-500" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )
            }
          >
            {isRunning ? 'Pause' : 'Start Focus'}
          </Button>
        </div>

        {/* Completed count info */}
        <div className="mt-4 text-xs text-[#86868b] dark:text-[#98989f] text-center">
          <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {completedSessions}
          </span>{' '}
          session(s) completed today • Keep the calm flow going
        </div>
      </div>
    </Card>
  );
};
