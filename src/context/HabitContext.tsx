import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Habit } from '../types';
import { initialHabits } from '../utils/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { getTodayDateString } from '../utils/date';
import { sound } from '../utils/sound';

interface HabitContextType {
  habits: Habit[];
  toggleHabitToday: (id: string) => void;
  addHabit: (data: { name: string; category: string; iconName: string; color: string; frequency: string }) => Habit;
  deleteHabit: (id: string) => void;
  todayCompletedCount: number;
  totalHabitsCount: number;
  habitProgressPercentage: number;
  isHabitDoneToday: (habit: Habit) => boolean;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const STORAGE_KEY = 'daylight_habits_v1';

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    return loadFromStorage<Habit[]>(STORAGE_KEY, initialHabits);
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEY, habits);
  }, [habits]);

  const todayStr = getTodayDateString();

  const isHabitDoneToday = (habit: Habit): boolean => {
    return habit.completedDates.includes(todayStr);
  };

  const toggleHabitToday = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const isDone = h.completedDates.includes(todayStr);
          let newDates: string[];
          let newStreak = h.streak;

          if (isDone) {
            newDates = h.completedDates.filter((d) => d !== todayStr);
            newStreak = Math.max(0, h.streak - 1);
            sound.playClick();
          } else {
            newDates = [...h.completedDates, todayStr];
            newStreak = h.streak + 1;
            sound.playTaskComplete();
          }

          return {
            ...h,
            completedDates: newDates,
            streak: newStreak,
          };
        }
        return h;
      })
    );
  };

  const addHabit = (data: {
    name: string;
    category: string;
    iconName: string;
    color: string;
    frequency: string;
  }): Habit => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: data.name.trim(),
      category: data.category.trim() || 'General',
      iconName: data.iconName || 'Sparkles',
      color: data.color || '#0071e3',
      streak: 0,
      completedDates: [],
      frequency: data.frequency || 'Daily',
    };

    setHabits((prev) => [...prev, newHabit]);
    sound.playClick();
    return newHabit;
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    sound.playClick();
  };

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
        toggleHabitToday,
        addHabit,
        deleteHabit,
        todayCompletedCount,
        totalHabitsCount,
        habitProgressPercentage,
        isHabitDoneToday,
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
