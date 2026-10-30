import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Coffee,
  Timer as TimerIcon,
  CheckCircle2,
  Headphones,
  Trash2,
  AlertCircle,
  RotateCw,
  Target,
  Zap,
} from 'lucide-react';
import { formatFriendlyDate, getLocalDateString } from '../utils/date';

export const Focus: React.FC = () => {
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
    sessions,
    loadingSessions,
    sessionError,
    selectedTaskId,
    setSelectedTaskId,
    deleteSession,
    refreshSessions,
    retrySaveSession,
    totalFocusMinutesToday,
  } = useTimer();

  const { tasks } = useTasks();
  const activeTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);

  // Ambient White/Pink Noise generator using Web Audio API
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopNoise = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch {
        // ignore
      }
      noiseSourceRef.current = null;
    }
    setIsPlayingNoise(false);
  };

  const startNoise = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Generate 5-second buffer of soothing soft pink noise
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);

      noiseSource.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();

      gainNodeRef.current = gain;
      noiseSourceRef.current = noiseSource;
      setIsPlayingNoise(true);
    } catch (e) {
      console.warn('Web Audio Ambient failed:', e);
    }
  };

  const toggleNoise = () => {
    if (isPlayingNoise) {
      stopNoise();
    } else {
      startNoise();
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopNoise();
    };
  }, []);

  // SVG Circular progress with scalable viewBox
  const radius = 94;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progressPercent)) / 100) * circumference;

  // Mode-based gradients and glowing styles
  const modeConfig = {
    pomodoro: {
      id: 'focus-gradient-pomodoro',
      gradientClass: 'glow-ring-blue',
      strokeUrl: 'url(#focus-gradient-pomodoro)',
      activeGlow: 'from-[#0071e3]/20 via-[#5e5ce6]/15 to-transparent',
      chipClass:
        'bg-blue-500/10 text-[#0071e3] dark:text-[#2997ff] border-blue-500/20 shadow-blue-500/10',
      label: 'Pomodoro Sprint',
      minuteLabel: '25m',
      icon: <TimerIcon className="w-3.5 h-3.5" />,
    },
    shortBreak: {
      id: 'focus-gradient-short',
      gradientClass: 'glow-ring-emerald',
      strokeUrl: 'url(#focus-gradient-short)',
      activeGlow: 'from-emerald-500/20 via-teal-500/15 to-transparent',
      chipClass:
        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
      label: 'Short Refresh',
      minuteLabel: '5m',
      icon: <Coffee className="w-3.5 h-3.5" />,
    },
    longBreak: {
      id: 'focus-gradient-long',
      gradientClass: 'glow-ring-purple',
      strokeUrl: 'url(#focus-gradient-long)',
      activeGlow: 'from-purple-500/20 via-pink-500/15 to-transparent',
      chipClass:
        'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-purple-500/10',
      label: 'Extended Rest',
      minuteLabel: '15m',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
  }[mode];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Focus Chamber
          </h1>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989f] mt-1">
            Eliminate digital noise. Work in rhythmic 25-minute sprints backed by cognitive science.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 text-[#0071e3] dark:text-[#2997ff] text-xs font-semibold self-start sm:self-auto shadow-xs">
          <Zap className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
          <span>Pomodoro Flow Engine</span>
        </div>
      </div>

      {/* Cloud Session Error Banner with Retry */}
      {sessionError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{sessionError}</span>
          </div>
          <button
            onClick={() => retrySaveSession()}
            className="flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-300 hover:underline ml-4 shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry Save
          </button>
        </div>
      )}

      {/* Main Focus Card with Glossy Glassmorphism & Glowing Border */}
      <Card
        glowColor={mode === 'pomodoro' ? 'blue' : mode === 'shortBreak' ? 'emerald' : 'purple'}
        className="p-6 sm:p-10 relative overflow-hidden glossy-glass-card"
      >
        {/* Dynamic ambient background glow */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial ${modeConfig.activeGlow} rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
            isRunning ? 'opacity-100 scale-110' : 'opacity-40'
          }`}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#f5f5f7] dark:bg-white/[0.06] rounded-2xl max-w-sm w-full mb-5 border border-black/[0.04] dark:border-white/[0.06]">
            <button
              onClick={() => switchMode('pomodoro')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'pomodoro'
                  ? 'bg-white dark:bg-[#1f212f] text-[#0071e3] dark:text-[#2997ff] shadow-sm border border-blue-500/20'
                  : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <TimerIcon className="w-3.5 h-3.5" />
              Focus (25m)
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'shortBreak'
                  ? 'bg-white dark:bg-[#1f212f] text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20'
                  : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              Break (5m)
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'longBreak'
                  ? 'bg-white dark:bg-[#1f212f] text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/20'
                  : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Rest (15m)
            </button>
          </div>

          {/* Task Association Dropdown */}
          <div className="w-full max-w-xs mb-4">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <Target className="w-3 h-3 text-[#0071e3] dark:text-[#2997ff]" />
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
                Focus Target (Task Association)
              </label>
            </div>
            <select
              value={selectedTaskId || ''}
              onChange={(e) => setSelectedTaskId(e.target.value || null)}
              className="w-full px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/90 dark:bg-[#1a1c27] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 truncate shadow-2xs"
            >
              <option value="">General Focus (No Task Linked)</option>
              {activeTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category})
                </option>
              ))}
            </select>
          </div>

          {/* Premium Circular Timer with Multi-Color SVG Gradients & Chronograph Track */}
          <div className="relative flex items-center justify-center my-4">
            <svg
              viewBox="0 0 240 240"
              className="w-60 h-60 sm:w-72 sm:h-72 transform -rotate-90 select-none"
            >
              <defs>
                {/* Pomodoro Gradient: Electric Blue -> Indigo -> Purple */}
                <linearGradient id="focus-gradient-pomodoro" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0071e3" />
                  <stop offset="50%" stopColor="#5e5ce6" />
                  <stop offset="100%" stopColor="#af52de" />
                </linearGradient>

                {/* Short Break Gradient: Emerald -> Mint -> Cyan */}
                <linearGradient id="focus-gradient-short" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>

                {/* Long Break Gradient: Amber -> Crimson -> Magenta */}
                <linearGradient id="focus-gradient-long" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff9500" />
                  <stop offset="50%" stopColor="#ff2d55" />
                  <stop offset="100%" stopColor="#af52de" />
                </linearGradient>
              </defs>

              {/* Outer Chronograph Dashed Track (Apple Watch style) */}
              <circle
                cx="120"
                cy="120"
                r="110"
                className="text-black/[0.07] dark:text-white/[0.08]"
                strokeWidth="1.5"
                stroke="currentColor"
                strokeDasharray="2 7"
                fill="transparent"
              />

              {/* Background Track */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                className="text-black/[0.05] dark:text-white/[0.06]"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />

              {/* Glowing Vibrant Gradient Countdown Ring */}
              <circle
                cx="120"
                cy="120"
                r={radius}
                stroke={modeConfig.strokeUrl}
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-700 ease-out ${modeConfig.gradientClass}`}
                fill="transparent"
              />
            </svg>

            {/* Inner Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span
                className={`text-5xl sm:text-6xl font-mono font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] transition-transform duration-300 ${
                  isRunning ? 'scale-105' : ''
                }`}
              >
                {formattedTime}
              </span>

              {/* State Pill */}
              <div className="mt-2.5">
                {isRunning ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Flow Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#86868b] dark:text-[#98989f] bg-black/[0.04] dark:bg-white/[0.06]">
                    Ready
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3.5 mt-5">
            <Button
              onClick={resetTimer}
              variant="glass"
              size="lg"
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>

            <Button
              onClick={isRunning ? pauseTimer : startTimer}
              variant={isRunning ? 'secondary' : 'gradient'}
              size="lg"
              className="w-40 sm:w-44 shadow-lg text-base"
              icon={
                isRunning ? (
                  <Pause className="w-5 h-5 text-amber-500" />
                ) : (
                  <Play className="w-5 h-5 fill-white" />
                )
              }
            >
              {isRunning ? 'Pause Flow' : 'Start Focus'}
            </Button>
          </div>

          {/* Sessions Done Banner */}
          <div className="mt-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center gap-2 text-xs font-medium text-[#6e6e73] dark:text-[#98989f]">
            <CheckCircle2 className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
            <span>
              <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">
                {completedSessions}
              </strong>{' '}
              Pomodoro session(s) completed today ({totalFocusMinutesToday} minutes of pure focus)
            </span>
          </div>
        </div>
      </Card>

      {/* Built-in Ambient White/Pink Noise Generator */}
      <Card hoverable glowColor="cyan" className="p-5 sm:p-6 glossy-glass-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/15 text-[#0071e3] dark:text-[#2997ff] border border-blue-500/20 flex items-center justify-center shrink-0 shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Calm Pink Noise Generator
                </h3>
                {isPlayingNoise && (
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 bg-[#0071e3] dark:bg-[#2997ff] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2.5" />
                    <span className="w-0.5 bg-[#5e5ce6] rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.15s] h-3.5" />
                    <span className="w-0.5 bg-[#af52de] rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.3s] h-2" />
                  </div>
                )}
              </div>
              <p className="text-xs text-[#86868b] dark:text-[#98989f]">
                Synthesized live in browser to mask distracting background sounds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume slider */}
            {isPlayingNoise && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#86868b] dark:text-[#98989f]" />
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-[#0071e3]"
                  aria-label="Noise Volume"
                />
              </div>
            )}

            <Button
              variant={isPlayingNoise ? 'gradient' : 'glass'}
              size="sm"
              onClick={toggleNoise}
              icon={
                isPlayingNoise ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )
              }
            >
              {isPlayingNoise ? 'Playing Noise' : 'Play White Noise'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Session History Card */}
      <Card hoverable glowColor="purple" className="p-6 glossy-glass-card">
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] dark:border-white/[0.08] mb-4">
          <div>
            <h3 className="font-semibold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              Focus History
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] font-semibold border border-blue-200/50 dark:border-blue-800/40">
                Cloud Synced
              </span>
            </h3>
            <p className="text-xs text-[#86868b] dark:text-[#98989f]">
              Chronological record of verified deep work and restorative breaks
            </p>
          </div>

          <button
            onClick={() => refreshSessions()}
            className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1"
          >
            <RotateCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Sessions List */}
        {loadingSessions && sessions.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-[#fbfbfd] dark:bg-[#1a1c27] border border-black/[0.04] dark:border-white/[0.06] animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-black/10 dark:bg-white/10" />
                  <div className="space-y-1.5">
                    <div className="w-32 h-3.5 bg-black/10 dark:bg-white/10 rounded-full" />
                    <div className="w-20 h-2 bg-black/5 dark:bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="w-16 h-3 bg-black/10 dark:bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.slice(0, 15).map((session) => {
              const associatedTask = tasks.find((t) => t.id === session.associatedTaskId);
              const modeBadge =
                session.mode === 'pomodoro'
                  ? {
                      label: 'Deep Focus',
                      badgeClass:
                        'bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] border-blue-200/60 dark:border-blue-800/40',
                      icon: <TimerIcon className="w-3.5 h-3.5" />,
                    }
                  : session.mode === 'shortBreak'
                  ? {
                      label: 'Short Break',
                      badgeClass:
                        'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40',
                      icon: <Coffee className="w-3.5 h-3.5" />,
                    }
                  : {
                      label: 'Long Rest',
                      badgeClass:
                        'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40',
                      icon: <Sparkles className="w-3.5 h-3.5" />,
                    };

              return (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-[#fbfbfd] dark:bg-[#1a1c27] border border-black/[0.04] dark:border-white/[0.06] hover:border-black/[0.1] dark:hover:border-white/[0.14] transition-all gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${modeBadge.badgeClass}`}
                    >
                      {modeBadge.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {associatedTask ? associatedTask.title : 'General Session'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${modeBadge.badgeClass}`}
                        >
                          {modeBadge.label} • {session.durationMinutes}m
                        </span>
                      </div>
                      <p className="text-[11px] text-[#86868b] dark:text-[#98989f] mt-0.5">
                        Completed {formatFriendlyDate(getLocalDateString(new Date(session.completedAt)))},{' '}
                        {new Date(session.completedAt).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Delete this completed session from history?')) {
                        deleteSession(session.id);
                      }
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#86868b] dark:text-[#98989f] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors self-end sm:self-auto"
                    title="Delete session"
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-4">
            <TimerIcon className="w-8 h-8 text-[#86868b] mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium text-[#86868b] dark:text-[#98989f]">
              No completed focus sessions recorded yet today.
            </p>
            <p className="text-[11px] text-[#86868b]/70 dark:text-[#98989f]/70 mt-1">
              Start a 25-minute Pomodoro timer above to record your first verified session.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
