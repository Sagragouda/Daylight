import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { FocusSession, PomodoroMode } from '../types';
import { sound } from '../utils/sound';
import { focusService, CreateFocusSessionInput } from '../services/focusService';
import { useAuth } from './AuthContext';
import { getLocalDateString, getTodayDateString } from '../utils/date';

export interface TimerContextType {
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
  // Supabase cloud session extensions
  sessions: FocusSession[];
  loadingSessions: boolean;
  sessionError: string | null;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  deleteSession: (id: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  retrySaveSession: () => Promise<void>;
  totalFocusMinutesToday: number;
  allTimeFocusMinutes: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const MODE_DURATIONS: Record<PomodoroMode, number> = {
  pomodoro: 25 * 60,  // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<PomodoroMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Cloud Focus Sessions state
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Optional associated task
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Failed session retry stash
  const pendingSessionRef = useRef<CreateFocusSessionInput | null>(null);

  const timerRef = useRef<number | null>(null);
  const isCompletingRef = useRef<boolean>(false);
  const sessionsRef = useRef<FocusSession[]>(sessions);
  sessionsRef.current = sessions;

  const totalTime = MODE_DURATIONS[mode];

  // Load user's focus sessions from Supabase PostgreSQL
  useEffect(() => {
    let isCurrent = true;

    if (authLoading) {
      return;
    }

    // Unauthenticated user: immediately purge session history from memory
    if (!user) {
      setSessions([]);
      setLoadingSessions(false);
      setSessionError(null);
      setSelectedTaskId(null);
      pendingSessionRef.current = null;
      return;
    }

    setLoadingSessions(true);
    setSessionError(null);

    focusService
      .fetchFocusSessions(user.id)
      .then((loaded) => {
        if (!isCurrent) return;
        setSessions(loaded);
        setLoadingSessions(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('[Daylight TimerContext] Failed to load focus sessions:', err);
        setSessionError(err instanceof Error ? err.message : 'Failed to load focus sessions');
        setLoadingSessions(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [user?.id, authLoading]);

  // Format time as MM:SS
  const formatSeconds = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatSeconds(timeLeft);

  // Sync browser title during running focus sessions
  useEffect(() => {
    if (isRunning) {
      document.title = `(${formattedTime}) Flowora Focus`;
    } else {
      document.title = 'Flowora — Modern Mindful Productivity';
    }
  }, [isRunning, formattedTime]);

  // Explicit session refresh
  const refreshSessions = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    try {
      setSessionError(null);
      const reloaded = await focusService.fetchFocusSessions(user.id);
      setSessions(reloaded);
    } catch (err) {
      console.error('[Daylight TimerContext] Failed to refresh sessions:', err);
      setSessionError(err instanceof Error ? err.message : 'Failed to refresh focus sessions');
    }
  }, [user?.id]);

  // Handle actual timer completion: save to PostgreSQL only when timer completes
  const handleSessionComplete = useCallback(async () => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    sound.playTimerDone();
    setIsRunning(false);

    const completedMode = mode;
    const durationMinutes = Math.max(1, Math.round(MODE_DURATIONS[completedMode] / 60));
    const payload: CreateFocusSessionInput = {
      mode: completedMode,
      durationMinutes,
      associatedTaskId: selectedTaskId || null,
      completedAt: new Date().toISOString(),
    };

    // Save to Supabase if authenticated
    if (user?.id) {
      try {
        setSessionError(null);
        const savedSession = await focusService.recordFocusSession(user.id, payload);
        setSessions((prev) => [savedSession, ...prev]);
        pendingSessionRef.current = null;
      } catch (err) {
        console.error('[Daylight TimerContext] Failed to save completed focus session:', err);
        pendingSessionRef.current = payload;
        setSessionError(
          err instanceof Error
            ? `Failed to save focus session: ${err.message}`
            : 'Failed to save focus session to cloud.'
        );
      }
    }

    // Advance Pomodoro sequence
    if (completedMode === 'pomodoro') {
      const todayStr = getTodayDateString();
      const currentTodayPomodoros = sessionsRef.current.filter(
        (s) => s.mode === 'pomodoro' && getLocalDateString(new Date(s.completedAt)) === todayStr
      ).length + 1;

      // Offer long break every 4 pomodoros, otherwise short break
      if (currentTodayPomodoros % 4 === 0) {
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

    setTimeout(() => {
      isCompletingRef.current = false;
    }, 1200);
  }, [mode, selectedTaskId, user?.id]);

  // Retry saving a failed session without duplicate inserts
  const retrySaveSession = useCallback(async (): Promise<void> => {
    if (!user?.id || !pendingSessionRef.current) return;
    try {
      setSessionError(null);
      const saved = await focusService.recordFocusSession(user.id, pendingSessionRef.current);
      setSessions((prev) => [saved, ...prev]);
      pendingSessionRef.current = null;
    } catch (err) {
      console.error('[Daylight TimerContext] Retry save failed:', err);
      setSessionError(err instanceof Error ? err.message : 'Retry failed to save session');
    }
  }, [user?.id]);

  // Active timer interval loop
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

  // Delete a session with optimistic update and rollback
  const deleteSession = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) return;

      const previousSessions = sessionsRef.current;
      sound.playClick();

      // Optimistic removal
      setSessions((prev) => prev.filter((s) => s.id !== id));

      try {
        setSessionError(null);
        await focusService.deleteFocusSession(id, user.id);
      } catch (err) {
        console.error('[Daylight TimerContext] Failed to delete session, rolling back:', err);
        setSessions(previousSessions);
        setSessionError(err instanceof Error ? err.message : 'Failed to delete session');
      }
    },
    [user?.id]
  );

  // Compute focus stats based only on actual completed Pomodoro sessions
  const todayStr = getTodayDateString();

  const todayPomodoroSessions = useMemo(() => {
    return sessions.filter((s) => {
      const sessionDateStr = getLocalDateString(new Date(s.completedAt));
      return s.mode === 'pomodoro' && sessionDateStr === todayStr;
    });
  }, [sessions, todayStr]);

  // Compatibility metric: count of completed Pomodoros today
  const completedSessions = todayPomodoroSessions.length;

  // Minutes of focused work today (breaks excluded)
  const totalFocusMinutesToday = useMemo(() => {
    return todayPomodoroSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [todayPomodoroSessions]);

  // All-time focused minutes
  const allTimeFocusMinutes = useMemo(() => {
    return sessions
      .filter((s) => s.mode === 'pomodoro')
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [sessions]);

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((totalTime - timeLeft) / totalTime) * 100))
  );

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
        sessions,
        loadingSessions,
        sessionError,
        selectedTaskId,
        setSelectedTaskId,
        deleteSession,
        refreshSessions,
        retrySaveSession,
        totalFocusMinutesToday,
        allTimeFocusMinutes,
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
