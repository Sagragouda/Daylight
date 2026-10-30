import React from 'react';
import { Card } from '../common/Card';
import { useTimer } from '../../context/TimerContext';
import { Play, Pause, RotateCcw, ExternalLink } from 'lucide-react';
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

  const modeColors: Record<PomodoroMode, { ring: string; badge: string; text: string }> = {
    pomodoro: {
      ring: 'text-[#0071e3] dark:text-[#2997ff]',
      badge: 'bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] border-blue-100 dark:border-blue-900/40',
      text: 'Deep Work Sprint',
    },
    shortBreak: {
      ring: 'text-emerald-500 dark:text-emerald-400',
      badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40',
      text: 'Short Refresh',
    },
    longBreak: {
      ring: 'text-purple-500 dark:text-purple-400',
      badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900/40',
      text: 'Extended Rest',
    },
  };

  // SVG circular countdown ring
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <Card id="dashboard-focus-timer" className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] dark:border-white/[0.08] mb-4">
        <div>
          <h3 className="font-semibold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            Focus Room
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${modeColors[mode].badge}`}
            >
              {modeColors[mode].text}
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
      <div className="flex items-center justify-center gap-1.5 p-1 bg-[#f5f5f7] dark:bg-white/[0.06] rounded-xl max-w-sm mx-auto mb-6">
        {(['pomodoro', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              mode === m
                ? 'bg-white dark:bg-[#202230] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
                : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
          >
            {m === 'pomodoro' ? 'Focus (25m)' : m === 'shortBreak' ? 'Short (5m)' : 'Long (15m)'}
          </button>
        ))}
      </div>

      {/* Main Countdown Display */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="relative flex items-center justify-center">
          <svg className="w-44 h-44 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              className="text-[#f0f0f4] dark:text-white/[0.08]"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated countdown ring */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              className={`${modeColors[mode].ring} transition-all duration-700 ease-out`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time & State in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span
              className={`text-4xl font-mono font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] ${
                isRunning ? 'scale-105 transition-transform duration-300' : ''
              }`}
            >
              {formattedTime}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#86868b] dark:text-[#98989f] mt-1">
              {isRunning ? 'Flow State Active' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-6">
          <Button
            onClick={resetTimer}
            variant="secondary"
            size="md"
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>

          <Button
            onClick={isRunning ? pauseTimer : startTimer}
            variant="primary"
            size="md"
            className="w-32 shadow-md"
            icon={isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
