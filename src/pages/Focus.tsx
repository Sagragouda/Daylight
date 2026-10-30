import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useTimer } from '../context/TimerContext';
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
} from 'lucide-react';

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
  } = useTimer();

  // Ambient White Noise generator using Web Audio API
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Generate 5-second buffer of soothing soft pink noise
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
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
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Focus Chamber
          </h1>
          <p className="text-sm text-[#6e6e73] mt-1">
            Eliminate digital noise. Work in rhythmic 25-minute sprints backed by cognitive science.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0071e3] text-xs font-semibold self-start sm:self-auto shadow-xs">
          <TimerIcon className="w-3.5 h-3.5" />
          <span>Pomodoro Flow</span>
        </div>
      </div>

      {/* Main Focus Card */}
      <Card className="p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#f5f5f7] rounded-2xl max-w-sm w-full mb-6">
            <button
              onClick={() => switchMode('pomodoro')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'pomodoro'
                  ? 'bg-white text-[#0071e3] shadow-xs'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <TimerIcon className="w-3.5 h-3.5" />
              Focus (25m)
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'shortBreak'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              Break (5m)
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'longBreak'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Rest (15m)
            </button>
          </div>

          {/* Big Circular Display with responsive viewBox */}
          <div className="relative flex items-center justify-center my-3">
            <svg
              viewBox="0 0 240 240"
              className="w-56 h-56 sm:w-68 sm:h-68 transform -rotate-90"
            >
              <circle
                cx="120"
                cy="120"
                r={radius}
                className="text-[#f0f0f4]"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="120"
                cy="120"
                r={radius}
                className={`${
                  mode === 'pomodoro'
                    ? 'text-[#0071e3]'
                    : mode === 'shortBreak'
                    ? 'text-emerald-500'
                    : 'text-purple-500'
                } transition-all duration-700 ease-out`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <span className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-[#1d1d1f]">
                {formattedTime}
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-[#86868b] mt-2">
                {isRunning ? 'Flow State Active' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              onClick={resetTimer}
              variant="secondary"
              size="lg"
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>

            <Button
              onClick={isRunning ? pauseTimer : startTimer}
              variant="primary"
              size="lg"
              className="w-36 sm:w-40 shadow-lg text-base"
              icon={isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            >
              {isRunning ? 'Pause' : 'Start Focus'}
            </Button>
          </div>

          {/* Sessions Done Banner */}
          <div className="mt-8 pt-6 border-t border-black/[0.06] flex items-center gap-2 text-xs font-medium text-[#6e6e73]">
            <CheckCircle2 className="w-4 h-4 text-[#0071e3]" />
            <span>
              <strong className="text-[#1d1d1f] font-semibold">{completedSessions}</strong> Pomodoro session(s) completed today ({completedSessions * 25} minutes of pure focus)
            </span>
          </div>
        </div>
      </Card>

      {/* Built-in Ambient White Noise Generator */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1d1d1f]">
                Calm Pink Noise Generator
              </h3>
              <p className="text-xs text-[#86868b]">
                Synthesized live in browser to mask distracting background sounds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume slider */}
            {isPlayingNoise && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#86868b]" />
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
              variant={isPlayingNoise ? 'primary' : 'secondary'}
              size="sm"
              onClick={toggleNoise}
              icon={isPlayingNoise ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            >
              {isPlayingNoise ? 'Playing Noise' : 'Play White Noise'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
