import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  MoreHorizontal,
  ChevronRight,
  Music2,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RotateCw,
  Target,
  Sparkles,
  Waves,
  X,
} from 'lucide-react';
import { formatFriendlyDate, getLocalDateString } from '../utils/date';
import { ambientSound, SOUND_PRESETS, AmbientSoundType } from '../utils/ambientAudio';

export const Focus: React.FC = () => {
  const {
    mode,
    timeLeft,
    totalTime,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    formattedTime,
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
  const currentTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  // Ambient Audio State
  const [activeSound, setActiveSound] = useState<AmbientSoundType | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // UI Drawer / Dropdown states
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Custom visual thumbnail renderer matching the reference image's artwork
  const renderSoundThumbnail = (soundId: AmbientSoundType, isCurrentPlaying: boolean) => {
    if (isCurrentPlaying) {
      return (
        <div className="flex items-center gap-0.5 h-3.5">
          <span className="w-0.5 bg-white rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2.5" />
          <span className="w-0.5 bg-white rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.15s] h-3.5" />
          <span className="w-0.5 bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.3s] h-2" />
        </div>
      );
    }

    switch (soundId) {
      case 'binaural':
        return (
          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-400 p-1 flex items-center justify-center shadow-inner">
            <div className="w-full h-full rounded-lg bg-black/40 border border-white/30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 shadow-sm" />
            </div>
          </div>
        );
      case 'noise':
        return (
          <div className="w-full h-full rounded-xl bg-zinc-800 p-1 flex items-center justify-center relative overflow-hidden border border-white/10">
            <div className="absolute inset-0 opacity-45 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:3px_3px]" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-500/40 border border-white/20" />
          </div>
        );
      case 'rainfall':
        return (
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-teal-900 via-emerald-950 to-slate-900 p-1 flex items-center justify-center relative overflow-hidden border border-emerald-500/30">
            <span className="absolute top-1 left-2 w-0.5 h-2 bg-teal-200/70 rounded-full rotate-12" />
            <span className="absolute bottom-1 right-2 w-0.5 h-2 bg-teal-200/50 rounded-full rotate-12" />
            <div className="w-2 h-2 rounded-full bg-teal-300/80 shadow-[0_0_6px_rgba(94,234,212,0.8)]" />
          </div>
        );
      case 'cafe':
        return (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-700 via-stone-800 to-stone-900 p-1.5 flex items-center justify-center border border-amber-500/30">
            <div className="w-4 h-3 rounded-xs border border-amber-300/60 bg-amber-500/20 shadow-inner flex items-center justify-center">
              <span className="w-1.5 h-0.5 bg-amber-200/80 rounded-full" />
            </div>
          </div>
        );
      case 'ocean':
        return (
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-sky-800 via-blue-900 to-indigo-950 p-1 flex flex-col justify-end border border-sky-400/30 overflow-hidden">
            <div className="w-full h-1 bg-sky-300/60 rounded-full mb-0.5 shadow-[0_0_4px_rgba(56,189,248,0.8)]" />
            <div className="w-3/4 h-0.5 bg-sky-400/40 rounded-full mx-auto" />
          </div>
        );
      case 'office':
        return (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-700 to-zinc-900 p-1.5 border border-white/10 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
              <div className="bg-slate-300/60 rounded-[2px]" />
              <div className="bg-slate-400/40 rounded-[2px]" />
              <div className="bg-slate-500/30 rounded-[2px]" />
              <div className="bg-slate-300/70 rounded-[2px]" />
            </div>
          </div>
        );
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [moreMenuOpen]);

  // Handle ambient sound playback
  const handleSelectSound = (soundId: AmbientSoundType) => {
    if (activeSound === soundId && isPlayingAudio) {
      ambientSound.stop();
      setIsPlayingAudio(false);
      setActiveSound(null);
    } else {
      setActiveSound(soundId);
      ambientSound.play(soundId, volume);
      setIsPlayingAudio(true);
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      ambientSound.stop();
      setIsPlayingAudio(false);
    } else {
      const target = activeSound || 'binaural';
      setActiveSound(target);
      ambientSound.play(target, volume);
      setIsPlayingAudio(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSound.setVolume(newVol);
  };

  // Cleanup audio when leaving the Focus Chamber
  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  // SVG Circular progress arc geometry
  // Remaining session progress: At full time (e.g. 24:59), the glowing white arc is radiant and filled!
  const radius = 115;
  const circumference = 2 * Math.PI * radius; // ~722.56
  const remainingFraction =
    totalTime > 0 ? Math.max(0, Math.min(1, timeLeft / totalTime)) : 1;
  const strokeDashoffset = circumference * (1 - remainingFraction);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-36 lg:pb-8 flex flex-col justify-between overflow-y-auto lg:overflow-hidden bg-[#040711] text-white select-none">
      {/* =========================================================================
          ATMOSPHERIC STARRY NIGHT MOUNTAINS BACKDROP
          (Exact visual replica of the reference image: deep cosmic night + snowy mountain silhouettes)
         ========================================================================= */}
      <div className="fixed lg:absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full object-cover"
        >
          <defs>
            {/* Deep Night Sky Gradient */}
            <linearGradient id="nightSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#040711" />
              <stop offset="35%" stopColor="#080e1e" />
              <stop offset="65%" stopColor="#0b1326" />
              <stop offset="100%" stopColor="#050812" />
            </linearGradient>

            {/* Distant Mountain Shading */}
            <linearGradient id="backMtnGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#151e33" />
              <stop offset="100%" stopColor="#070c18" />
            </linearGradient>

            {/* Mid Snowy Peaks Gradient */}
            <linearGradient id="snowPeakGrad" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#94a3b8" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#1e293b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#060a14" />
            </linearGradient>

            {/* Foreground Ridge Shadow */}
            <linearGradient id="foreRidgeGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#0e172a" />
              <stop offset="60%" stopColor="#060913" />
              <stop offset="100%" stopColor="#020408" />
            </linearGradient>

            {/* Ambient moonlit glow */}
            <radialGradient id="moonGlow" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#1e293b" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Sky background */}
          <rect width="1440" height="900" fill="url(#nightSkyGrad)" />
          <rect width="1440" height="900" fill="url(#moonGlow)" />

          {/* Constellation Stars (Procedurally placed for natural density) */}
          <g opacity="0.85">
            {[
              [120, 80, 1.2, 0.9],
              [160, 140, 0.8, 0.6],
              [240, 95, 1.5, 0.95],
              [310, 160, 1.0, 0.7],
              [380, 70, 1.8, 1.0],
              [440, 130, 0.7, 0.5],
              [520, 85, 1.4, 0.8],
              [600, 150, 1.1, 0.7],
              [680, 65, 2.0, 1.0],
              [750, 110, 0.8, 0.6],
              [820, 75, 1.3, 0.85],
              [900, 140, 1.0, 0.7],
              [970, 90, 1.7, 0.9],
              [1050, 130, 0.9, 0.6],
              [1120, 60, 1.5, 0.9],
              [1200, 120, 1.1, 0.75],
              [1280, 85, 1.6, 0.85],
              [1360, 145, 0.8, 0.5],
              [90, 220, 1.0, 0.6],
              [210, 260, 1.4, 0.8],
              [340, 230, 0.9, 0.7],
              [470, 280, 1.2, 0.75],
              [590, 240, 1.6, 0.95],
              [710, 270, 0.8, 0.5],
              [840, 230, 1.3, 0.8],
              [960, 280, 1.0, 0.7],
              [1090, 220, 1.5, 0.9],
              [1220, 270, 0.9, 0.6],
              [1340, 240, 1.2, 0.8],
              [150, 340, 1.1, 0.7],
              [280, 370, 0.7, 0.5],
              [420, 350, 1.3, 0.8],
              [560, 380, 1.0, 0.6],
              [800, 360, 1.4, 0.85],
              [930, 390, 0.8, 0.5],
              [1070, 350, 1.2, 0.75],
              [1250, 380, 1.5, 0.9],
              [1380, 340, 0.9, 0.6],
            ].map(([cx, cy, r, op], idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={r}
                fill="#ffffff"
                opacity={op}
              />
            ))}
          </g>

          {/* Distant Mountain Range (Soft background silhouette) */}
          <path
            d="M0 650 L120 540 L280 580 L440 470 L580 530 L720 440 L880 510 L1040 430 L1190 520 L1320 460 L1440 540 L1440 900 L0 900 Z"
            fill="url(#backMtnGrad)"
            opacity="0.95"
          />

          {/* Majestic Snowy Midground Peaks (Matching reference image) */}
          {/* Main Peak Left-Center */}
          <path
            d="M180 720 L380 440 L480 530 L660 360 L780 490 L920 380 L1080 520 L1240 410 L1440 620 L1440 900 L0 900 L0 680 Z"
            fill="url(#snowPeakGrad)"
          />

          {/* Sharp Snow Crags & Shaded Ridges */}
          <g opacity="0.65">
            {/* Left snow gulley */}
            <polygon points="380,440 410,500 390,560 340,620 370,540" fill="#f8fafc" opacity="0.8" />
            <polygon points="410,500 480,530 450,590 390,560" fill="#0f172a" opacity="0.9" />

            {/* Central High Snowy Summit */}
            <polygon points="660,360 700,430 670,510 630,560 620,470" fill="#ffffff" opacity="0.9" />
            <polygon points="700,430 780,490 730,570 670,510" fill="#090d16" opacity="0.95" />
            <polygon points="660,360 640,430 655,470 620,470" fill="#94a3b8" opacity="0.75" />

            {/* Right Snowy Ridge */}
            <polygon points="920,380 960,450 940,520 890,570 880,480" fill="#ffffff" opacity="0.85" />
            <polygon points="960,450 1080,520 1020,590 940,520" fill="#0b101c" opacity="0.9" />

            {/* Far Right Crag */}
            <polygon points="1240,410 1280,480 1260,550 1200,600" fill="#e2e8f0" opacity="0.8" />
            <polygon points="1280,480 1380,540 1330,620 1260,550" fill="#070c16" opacity="0.95" />
          </g>

          {/* Foreground Dark Shadowy Foothills */}
          <path
            d="M0 720 Q240 680 480 730 T960 710 T1440 740 L1440 900 L0 900 Z"
            fill="url(#foreRidgeGrad)"
          />
        </svg>
      </div>

      {/* =========================================================================
          TOP CENTER FLOATING PILL SWITCHER
          (Focus session | Break session | ...)
         ========================================================================= */}
      <div className="relative z-20 flex justify-center w-full px-2">
        <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-[#0e121d]/85 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-full">
          {/* Focus Session Tab */}
          <button
            onClick={() => switchMode('pomodoro')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 ${
              mode === 'pomodoro'
                ? 'bg-[#1e2538] text-white shadow-sm border border-white/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Focus session
          </button>

          {/* Break Session Tab */}
          <button
            onClick={() => switchMode(mode === 'shortBreak' ? 'longBreak' : 'shortBreak')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 ${
              mode !== 'pomodoro'
                ? 'bg-[#1e2538] text-white shadow-sm border border-white/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Break session {mode === 'longBreak' && '(15m)'}
          </button>

          {/* More Options (...) Trigger Button */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Focus chamber options"
              aria-label="More options"
              aria-expanded={moreMenuOpen}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {moreMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0e131f]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] p-2 z-50 text-xs animate-scale-in">
                {/* Target Task Link */}
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setTaskPickerOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-white/10 transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-200">
                    <Target className="w-3.5 h-3.5 text-[#38bdf8]" />
                    Linked Task
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[100px]">
                    {currentTask ? currentTask.title : 'None'}
                  </span>
                </button>

                {/* Reset Timer */}
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    resetTimer();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-white/10 text-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  Reset Timer
                </button>

                {/* View Focus History */}
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setHistoryOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-white/10 text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Session History
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold">
                    {completedSessions} today
                  </span>
                </button>

                {/* Break Interval Mode Selector */}
                <div className="pt-2 mt-1 border-t border-white/10 flex items-center justify-between px-3 py-1 text-[11px] text-slate-400">
                  <span>Break Type:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => switchMode('shortBreak')}
                      className={`px-2 py-0.5 rounded-lg ${
                        mode === 'shortBreak' ? 'bg-[#38bdf8]/20 text-[#38bdf8] font-bold' : ''
                      }`}
                    >
                      5m
                    </button>
                    <button
                      onClick={() => switchMode('longBreak')}
                      className={`px-2 py-0.5 rounded-lg ${
                        mode === 'longBreak' ? 'bg-purple-500/20 text-purple-300 font-bold' : ''
                      }`}
                    >
                      15m
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Session Error Banner */}
      {sessionError && (
        <div className="relative z-20 max-w-lg mx-auto my-3 p-3.5 rounded-2xl bg-rose-950/80 backdrop-blur-xl border border-rose-800/50 text-xs font-medium text-rose-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{sessionError}</span>
          </div>
          <button
            onClick={() => retrySaveSession()}
            className="flex items-center gap-1 font-semibold text-rose-300 hover:underline ml-3 shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* =========================================================================
          MAIN CENTER AREA: GLOWING CIRCULAR ARC + CENTRAL PAUSE BUTTON + BIG DIGITS
          & RIGHT AMBIENT SOUNDS CARD
         ========================================================================= */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-14 my-3 sm:my-5 w-full max-w-6xl mx-auto px-2 sm:px-4">
        {/* Left Placeholder spacer on desktop to keep the timer strictly center-stage */}
        <div className="hidden lg:block lg:w-80 shrink-0" />

        {/* Center Stage: Circular Arc & Pause Button */}
        <div className="w-full lg:flex-1 flex flex-col items-center justify-center shrink-0">
          {/* Luminous Glowing Arc Display */}
          <div className="relative flex items-center justify-center">
            {/* SVG Arc */}
            <svg
              viewBox="0 0 280 280"
              className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 transform -rotate-90 select-none"
            >
              <defs>
                {/* Brilliant White Neon Drop-Shadow Filter */}
                <filter id="whiteGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.9" />
                  <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#ffffff" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Faint Dark Track */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                className="text-white/[0.08]"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />

              {/* Luminous Glowing White Progress Stroke */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="#ffffff"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                filter="url(#whiteGlow)"
                className="transition-all duration-700 ease-out"
                fill="transparent"
              />
            </svg>

            {/* Big Solid White Circular Button with Bold Pause / Play icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={isRunning ? pauseTimer : startTimer}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white text-[#040711] shadow-[0_0_36px_rgba(255,255,255,0.55)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-4 focus:ring-white/30"
                aria-label={isRunning ? 'Pause Focus Session' : 'Start Focus Session'}
                title={isRunning ? 'Pause' : 'Start Focus'}
              >
                {isRunning ? (
                  <Pause className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 fill-[#040711] text-[#040711] transition-transform group-hover:scale-105" />
                ) : (
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 fill-[#040711] text-[#040711] ml-0.5 sm:ml-1 transition-transform group-hover:scale-105" />
                )}
              </button>
            </div>
          </div>

          {/* Large Bold Digital Countdown Display underneath the circle (24:59) */}
          <div className="mt-3 sm:mt-4 text-center select-none">
            <span className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white font-sans drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              {formattedTime}
            </span>

            {/* Linked Task Chip (Subtle below timer) */}
            {currentTask && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-slate-300">
                <Target className="w-3 h-3 text-[#38bdf8]" />
                <span className="truncate max-w-[200px] sm:max-w-[240px]">{currentTask.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Atmospheric Ambient Sound Card */}
        <div className="w-full max-w-sm sm:w-80 shrink-0 mt-6 lg:mt-0">
          <div className="bg-[#0b0f19]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
            {/* Header with Waveform Icon */}
            <div className="flex items-start gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                <Waves className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Sharpen your focus with sounds designed to enhance what matters most.
              </p>
            </div>

            {/* List of Ambient Sounds */}
            <div className="space-y-1.5">
              {SOUND_PRESETS.map((preset) => {
                const isSelected = activeSound === preset.id;
                const isCurrentPlaying = isSelected && isPlayingAudio;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectSound(preset.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-2xl transition-all text-left group ${
                      isSelected
                        ? 'bg-white/15 border border-white/20 shadow-sm'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Visual Thumbnail Square */}
                      <div
                        className="w-9 h-9 rounded-xl shadow-xs flex items-center justify-center shrink-0 overflow-hidden"
                      >
                        {renderSoundThumbnail(preset.id, isCurrentPlaying)}
                      </div>

                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-white truncate block">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {isCurrentPlaying ? 'Playing live' : preset.description}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0 ${
                        isSelected ? 'text-[#38bdf8]' : ''
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM RIGHT FLOATING AUDIO BAR & VOLUME CONTROLLER
         ========================================================================= */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 w-full px-2 mt-6 mb-2 lg:mb-0">
        {/* Left: Quick Session Count pill */}
        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 bg-[#0e121d]/85 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white font-semibold">{completedSessions}</strong> sessions today (
            {totalFocusMinutesToday}m pure focus)
          </span>
        </div>

        {/* Right: Floating Mini Player Pill */}
        <div className="sm:ml-auto inline-flex items-center gap-2.5 bg-[#0e131f]/90 backdrop-blur-2xl border border-white/10 rounded-full px-3 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          {/* Audio icon button with volume popover toggle */}
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Adjust Ambient Volume"
          >
            <Music2 className="w-3.5 h-3.5 text-[#38bdf8]" />
          </button>

          {/* Equalizer Waveform Bars */}
          <div className="flex items-center gap-0.5 h-4 px-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
              <span
                key={bar}
                className={`w-0.5 rounded-full bg-slate-300 transition-all ${
                  isPlayingAudio
                    ? 'animate-[pulse_0.7s_ease-in-out_infinite]'
                    : 'h-1 opacity-40'
                }`}
                style={{
                  height: isPlayingAudio ? `${Math.max(4, (bar % 4) * 4 + 4)}px` : '4px',
                  animationDelay: `${bar * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Play/Pause Mini Toggle */}
          <button
            onClick={handleToggleAudio}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title={isPlayingAudio ? 'Pause Ambient Sound' : 'Play Ambient Sound'}
          >
            {isPlayingAudio ? (
              <Pause className="w-3.5 h-3.5 fill-white" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            )}
          </button>

          {/* Volume Slider Popover */}
          {showVolumeSlider && (
            <div className="absolute bottom-12 right-0 bg-[#0e131f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center gap-2 z-50 animate-scale-in">
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 accent-[#38bdf8]"
                aria-label="Ambient volume"
              />
              <Volume2 className="w-3.5 h-3.5 text-[#38bdf8]" />
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODALS / DRAWERS:
          1. Task Association Modal
          2. Session History Modal
         ========================================================================= */}
      {/* 1. Task Association Modal */}
      {taskPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0e131f] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="font-semibold text-base">Select Focus Task</h3>
              </div>
              <button
                onClick={() => setTaskPickerOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Tie this 25-minute Pomodoro sprint to an active task in your Flowora database:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedTaskId(null);
                  setTaskPickerOpen(false);
                }}
                className={`w-full p-3 rounded-2xl text-left text-xs font-semibold border transition-all ${
                  selectedTaskId === null
                    ? 'bg-[#38bdf8]/15 border-[#38bdf8]/50 text-white'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                General Focus (No Task Linked)
              </button>

              {activeTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTaskId(t.id);
                    setTaskPickerOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                    selectedTaskId === t.id
                      ? 'bg-[#38bdf8]/15 border-[#38bdf8]/50 text-white'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span className="font-semibold truncate">{t.title}</span>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0 ml-2">
                    {t.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Session History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0e131f] border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-white max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Focus History
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-[#38bdf8] border border-blue-500/30 font-semibold">
                    Cloud Synced
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified records of deep work saved to Supabase PostgreSQL
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => refreshSessions()}
                  className="text-xs text-[#38bdf8] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCw className="w-3 h-3" /> Refresh
                </button>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="w-7 h-7 rounded-full text-slate-400 hover:text-white flex items-center justify-center ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {loadingSessions && sessions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">Loading history...</div>
              ) : sessions.length > 0 ? (
                sessions.slice(0, 20).map((session) => {
                  const associatedTask = tasks.find((t) => t.id === session.associatedTaskId);
                  return (
                    <div
                      key={session.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {associatedTask ? associatedTask.title : 'General Session'}
                          </span>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-semibold text-slate-300">
                            {session.durationMinutes}m • {session.mode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatFriendlyDate(getLocalDateString(new Date(session.completedAt)))},{' '}
                          {new Date(session.completedAt).toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm('Delete this completed session from history?')) {
                            deleteSession(session.id);
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">
                  No sessions recorded yet today. Start a 25m sprint!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
