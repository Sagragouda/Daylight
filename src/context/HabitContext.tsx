import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { Habit } from '../types';
import {
  habitService,
  CreateHabitInput,
  UpdateHabitInput,
  calculateHabitStreak,
} from '../services/habitService';
import { useAuth } from './AuthContext';
import { sound } from '../utils/sound';
import { getTodayDateString } from '../utils/date';

interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  toggleHabitToday: (id: string) => Promise<void>;
  toggleHabitForDate?: (id: string, dateStr: string) => Promise<void>;
  addHabit: (data: {
    name: string;
    category: string;
    iconName: string;
    color: string;
    frequency: string;
  }) => Promise<Habit | null>;
  createHabit: (data: CreateHabitInput) => Promise<Habit | null>;
  updateHabit: (id: string, updates: UpdateHabitInput) => Promise<Habit | null>;
  deleteHabit: (id: string) => Promise<void>;
  todayCompletedCount: number;
  totalHabitsCount: number;
  habitProgressPercentage: number;
  isHabitDoneToday: (habit: Habit) => boolean;
  refreshHabits: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to the current habits to avoid stale closures in rollback logic
  const habitsRef = useRef<Habit[]>(habits);
  habitsRef.current = habits;

  // Track active fetch requests to ignore stale async responses from previous sessions
  useEffect(() => {
    let isCurrent = true;

    // While Auth is initializing, stay in loading state
    if (authLoading) {
      return;
    }

    // Unauthenticated user: immediately clear habits in-memory
    if (!user) {
      setHabits([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Authenticated user: load habits and completion logs from Supabase PostgreSQL
    setLoading(true);
    setError(null);

    habitService
      .fetchHabits(user.id)
      .then((loadedHabits) => {
        if (!isCurrent) return;
        setHabits(loadedHabits);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('[Daylight HabitContext] Failed to load habits from Supabase:', err);
        setError(err instanceof Error ? err.message : 'Failed to load habits');
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [user?.id, authLoading]);

  // Explicit refresh helper
  const refreshHabits = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    try {
      setError(null);
      const reloaded = await habitService.fetchHabits(user.id);
      setHabits(reloaded);
    } catch (err) {
      console.error('[Daylight HabitContext] Failed to refresh habits:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh habits');
    }
  }, [user?.id]);

  const todayStr = getTodayDateString();

  const isHabitDoneToday = useCallback(
    (habit: Habit): boolean => {
      return habit.completedDates.includes(todayStr);
    },
    [todayStr]
  );

  // Toggle habit completion for a specific calendar date (defaults to today)
  const toggleHabitForDate = useCallback(
    async (id: string, dateStr: string): Promise<void> => {
      if (!user?.id) {
        console.warn('[Daylight HabitContext] Cannot toggle habit: No authenticated user');
        return;
      }

      const targetHabit = habitsRef.current.find((h) => h.id === id);
      if (!targetHabit) return;

      const previousHabits = habitsRef.current;
      const isAlreadyDone = targetHabit.completedDates.includes(dateStr);

      // Play immediate auditory feedback
      if (isAlreadyDone) {
        sound.playClick();
      } else {
        sound.playTaskComplete();
      }

      // 1. Optimistic UI update
      const updatedDates = isAlreadyDone
        ? targetHabit.completedDates.filter((d) => d !== dateStr)
        : [...targetHabit.completedDates, dateStr];

      const updatedStreak = calculateHabitStreak(updatedDates, targetHabit.frequency);

      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                completedDates: updatedDates,
                streak: updatedStreak,
              }
            : h
        )
      );

      // 2. Perform write to Supabase habit_logs table
      try {
        setError(null);
        if (isAlreadyDone) {
          // Remove row from habit_logs using DELETE
          await habitService.removeHabitCompletion(id, user.id, dateStr);
        } else {
          // Add row to habit_logs using INSERT
          await habitService.logHabitCompletion(id, user.id, dateStr);
        }
      } catch (err) {
        console.error('[Daylight HabitContext] Failed to persist habit check-in, rolling back:', err);
        // Rollback on write failure
        setHabits(previousHabits);
        setError(err instanceof Error ? err.message : 'Failed to update habit check-in');
      }
    },
    [user?.id]
  );

  // Toggle habit completion for today
  const toggleHabitToday = useCallback(
    async (id: string): Promise<void> => {
      await toggleHabitForDate(id, todayStr);
    },
    [toggleHabitForDate, todayStr]
  );

  // Create Habit with PostgreSQL UUID
  const createHabit = useCallback(
    async (data: CreateHabitInput): Promise<Habit | null> => {
      if (!user?.id) {
        console.warn('[Daylight HabitContext] Cannot create habit: No authenticated user');
        return null;
      }

      sound.playClick();
      try {
        setError(null);
        const created = await habitService.createHabit(user.id, {
          name: data.name,
          category: data.category || 'Mindfulness',
          iconName: data.iconName || 'Sparkles',
          color: data.color || '#0071e3',
          frequency: data.frequency || 'Daily',
        });

        // Append to state
        setHabits((prev) => [...prev, created]);
        return created;
      } catch (err) {
        console.error('[Daylight HabitContext] Failed to create habit:', err);
        setError(err instanceof Error ? err.message : 'Failed to create habit');
        return null;
      }
    },
    [user?.id]
  );

  // Backward-compatible alias matching previous addHabit signature
  const addHabit = useCallback(
    async (data: {
      name: string;
      category: string;
      iconName: string;
      color: string;
      frequency: string;
    }): Promise<Habit | null> => {
      return createHabit(data);
    },
    [createHabit]
  );

  // Update Habit editable metadata
  const updateHabit = useCallback(
    async (id: string, updates: UpdateHabitInput): Promise<Habit | null> => {
      if (!user?.id) {
        console.warn('[Daylight HabitContext] Cannot update habit: No authenticated user');
        return null;
      }

      const targetHabit = habitsRef.current.find((h) => h.id === id);
      if (!targetHabit) return null;

      const previousHabits = habitsRef.current;

      // Optimistic update
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                name: updates.name !== undefined ? updates.name : h.name,
                category: updates.category !== undefined ? updates.category : h.category,
                iconName: updates.iconName !== undefined ? updates.iconName : h.iconName,
                color: updates.color !== undefined ? updates.color : h.color,
                frequency: updates.frequency !== undefined ? updates.frequency : h.frequency,
              }
            : h
        )
      );

      try {
        setError(null);
        const updated = await habitService.updateHabit(
          id,
          user.id,
          updates,
          targetHabit.completedDates
        );

        // Synchronize with database record
        setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
        return updated;
      } catch (err) {
        console.error('[Daylight HabitContext] Failed to update habit, rolling back:', err);
        setHabits(previousHabits);
        setError(err instanceof Error ? err.message : 'Failed to update habit');
        return null;
      }
    },
    [user?.id]
  );

  // Delete Habit with optimistic update and rollback
  const deleteHabit = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        console.warn('[Daylight HabitContext] Cannot delete habit: No authenticated user');
        return;
      }

      const previousHabits = habitsRef.current;
      sound.playClick();

      // Optimistic removal
      setHabits((prev) => prev.filter((h) => h.id !== id));

      try {
        setError(null);
        await habitService.deleteHabit(id, user.id);
      } catch (err) {
        console.error('[Daylight HabitContext] Failed to delete habit, rolling back:', err);
        setHabits(previousHabits);
        setError(err instanceof Error ? err.message : 'Failed to delete habit');
      }
    },
    [user?.id]
  );

  const totalHabitsCount = habits.length;

  const todayCompletedCount = useMemo(() => {
    return habits.filter((h) => h.completedDates.includes(todayStr)).length;
  }, [habits, todayStr]);

  const habitProgressPercentage = useMemo(() => {
    if (totalHabitsCount === 0) return 0;
    return Math.round((todayCompletedCount / totalHabitsCount) * 100);
  }, [todayCompletedCount, totalHabitsCount]);

  return (
    <HabitContext.Provider
      value={{
        habits,
        loading,
        error,
        toggleHabitToday,
        toggleHabitForDate,
        addHabit,
        createHabit,
        updateHabit,
        deleteHabit,
        todayCompletedCount,
        totalHabitsCount,
        habitProgressPercentage,
        isHabitDoneToday,
        refreshHabits,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = (): HabitContextType => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
