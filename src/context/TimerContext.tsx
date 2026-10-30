import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { PomodoroMode } from '../types';
import { sound } from '../utils/sound';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface TimerContextType {
  mode: PomodoroMode;
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchMode: (newMode: PomodoroMode) => void;
  completedSessions: number;
  formattedTime: string;
  progressPercent: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const MODE_DURATIONS: Record<PomodoroMode, number> = {
  pomodoro: 25 * 60,   // 25 minutes
  shortBreak: 5 * 60,  // 5 minutes
  longBreak: 15 * 60,  // 15 minutes
};

const STORAGE_KEY_SESSIONS = 'daylight_timer_sessions';

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PomodoroMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    return loadFromStorage<number>(STORAGE_KEY_SESSIONS, 2);
  });

  const timerRef = useRef<number | null>(null);

  const totalTime = MODE_DURATIONS[mode];

  // Format time as MM:SS
  const formatSeconds = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatSeconds(timeLeft);

  // Sync title when running
  useEffect(() => {
    if (isRunning) {
      document.title = `(${formattedTime}) Daylight Focus`;
    } else {
      document.title = 'Daylight — Modern Mindful Productivity';
    }
  }, [isRunning, formattedTime]);

  const handleSessionComplete = useCallback(() => {
    sound.playTimerDone();
    setIsRunning(false);

    if (mode === 'pomodoro') {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      saveToStorage(STORAGE_KEY_SESSIONS, nextCount);

      // Offer short break or long break
      if (nextCount % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(MODE_DURATIONS.longBreak);
      } else {
        setMode('shortBreak');
        setTimeLeft(MODE_DURATIONS.shortBreak);
      }
    } else {
      // Break finished, return to pomodoro
      setMode('pomodoro');
      setTimeLeft(MODE_DURATIONS.pomodoro);
    }
  }, [mode, completedSessions]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, handleSessionComplete]);

  const startTimer = () => {
    sound.playClick();
    setIsRunning(true);
  };

  const pauseTimer = () => {
    sound.playClick();
    setIsRunning(false);
  };

  const resetTimer = () => {
    sound.playClick();
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const switchMode = (newMode: PomodoroMode) => {
    sound.playClick();
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const progressPercent = Math.min(100, Math.max(0, Math.round(((totalTime - timeLeft) / totalTime) * 100)));

  return (
    <TimerContext.Provider
      value={{
        mode,
        timeLeft,
        totalTime,
        isRunning,
        startTimer,
        pauseTimer,
        resetTimer,
        switchMode,
        completedSessions,
        formattedTime,
        progressPercent,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
