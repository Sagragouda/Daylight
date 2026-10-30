import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { PlannerTimeBlock } from '../types';
import {
  plannerService,
  CreatePlannerBlockInput,
  UpdatePlannerBlockInput,
  isBlockCurrent,
} from '../services/plannerService';
import { useAuth } from './AuthContext';
import { sound } from '../utils/sound';
import { getLocalDateString, getTodayDateString } from '../utils/date';

export type PlannerViewMode = 'day' | 'week';

export interface PlannerContextType {
  blocks: PlannerTimeBlock[];
  loading: boolean;
  error: string | null;
  selectedDate: string; // 'YYYY-MM-DD'
  viewMode: PlannerViewMode;
  setSelectedDate: (dateStr: string) => void;
  setViewMode: (mode: PlannerViewMode) => void;
  createBlock: (input: CreatePlannerBlockInput) => Promise<PlannerTimeBlock | null>;
  addBlock: (input: CreatePlannerBlockInput) => Promise<PlannerTimeBlock | null>;
  updateBlock: (id: string, updates: UpdatePlannerBlockInput) => Promise<PlannerTimeBlock | null>;
  toggleCompleted: (id: string) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  refreshBlocks: () => Promise<void>;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
  totalBlocksCount: number;
  completedBlocksCount: number;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

/**
 * Calculates start and end of week (Sunday to Saturday) in local calendar dates
 */
export function getWeekBounds(dateStr: string): { startOfWeek: string; endOfWeek: string } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const current = new Date(year, month - 1, day);
  const dayOfWeek = current.getDay(); // 0 is Sunday

  const start = new Date(year, month - 1, day - dayOfWeek);
  const end = new Date(year, month - 1, day + (6 - dayOfWeek));

  return {
    startOfWeek: getLocalDateString(start),
    endOfWeek: getLocalDateString(end),
  };
}

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [viewMode, setViewMode] = useState<PlannerViewMode>('day');
  const [blocks, setBlocks] = useState<PlannerTimeBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const blocksRef = useRef<PlannerTimeBlock[]>(blocks);
  blocksRef.current = blocks;

  // Active query parameters
  const { startOfWeek, endOfWeek } = useMemo(() => getWeekBounds(selectedDate), [selectedDate]);

  // Load planner blocks from Supabase PostgreSQL
  useEffect(() => {
    let isCurrent = true;

    if (authLoading) {
      return;
    }

    // Unauthenticated user: immediately purge blocks from memory
    if (!user) {
      setBlocks([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchPromise =
      viewMode === 'day'
        ? plannerService.fetchBlocksForDate(user.id, selectedDate)
        : plannerService.fetchBlocksForDateRange(user.id, startOfWeek, endOfWeek);

    fetchPromise
      .then((loadedBlocks) => {
        if (!isCurrent) return;
        setBlocks(loadedBlocks);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('[Daylight PlannerContext] Failed to load planner blocks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load planner blocks');
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [user?.id, authLoading, selectedDate, viewMode, startOfWeek, endOfWeek]);

  // Live minute ticker to update isCurrent flag without refetching from server
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setBlocks((prev) =>
        prev.map((b) => ({
          ...b,
          isCurrent: isBlockCurrent(b.scheduleDate || selectedDate, b.startTime, b.endTime, now),
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  // Explicit refresh helper
  const refreshBlocks = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    try {
      setError(null);
      const reloaded =
        viewMode === 'day'
          ? await plannerService.fetchBlocksForDate(user.id, selectedDate)
          : await plannerService.fetchBlocksForDateRange(user.id, startOfWeek, endOfWeek);
      setBlocks(reloaded);
    } catch (err) {
      console.error('[Daylight PlannerContext] Failed to refresh blocks:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh planner blocks');
    }
  }, [user?.id, selectedDate, viewMode, startOfWeek, endOfWeek]);

  // Create new Planner block
  const createBlock = useCallback(
    async (input: CreatePlannerBlockInput): Promise<PlannerTimeBlock | null> => {
      if (!user?.id) {
        console.warn('[Daylight PlannerContext] Cannot create block: No authenticated user');
        setError('You must be signed in to add schedule blocks');
        return null;
      }

      try {
        setError(null);
        const created = await plannerService.createPlannerBlock(user.id, input);

        // Include block if it falls within current view
        const isVisibleInView =
          viewMode === 'day'
            ? created.scheduleDate === selectedDate
            : (created.scheduleDate ?? '') >= startOfWeek &&
              (created.scheduleDate ?? '') <= endOfWeek;

        if (isVisibleInView) {
          setBlocks((prev) => {
            const next = [...prev, created];
            // Sort by schedule_date then start_time
            return next.sort((a, b) => {
              if (a.scheduleDate !== b.scheduleDate) {
                return (a.scheduleDate || '').localeCompare(b.scheduleDate || '');
              }
              const minA = plannerService.parseTimeToMinutes(a.startTime) || 0;
              const minB = plannerService.parseTimeToMinutes(b.startTime) || 0;
              return minA - minB;
            });
          });
        }

        sound.playTaskComplete();
        return created;
      } catch (err) {
        console.error('[Daylight PlannerContext] Failed to create block:', err);
        setError(err instanceof Error ? err.message : 'Failed to create planner block');
        throw err;
      }
    },
    [user?.id, viewMode, selectedDate, startOfWeek, endOfWeek]
  );

  const addBlock = createBlock;

  // Update existing block with optimistic updates and rollback
  const updateBlock = useCallback(
    async (id: string, updates: UpdatePlannerBlockInput): Promise<PlannerTimeBlock | null> => {
      if (!user?.id) {
        console.warn('[Daylight PlannerContext] Cannot update block: No authenticated user');
        return null;
      }

      const previousBlocks = blocksRef.current;
      const target = previousBlocks.find((b) => b.id === id);
      if (!target) return null;

      // Optimistic update
      const optimisticBlock: PlannerTimeBlock = {
        ...target,
        title: updates.title !== undefined ? updates.title : target.title,
        startTime: updates.startTime !== undefined ? updates.startTime : target.startTime,
        endTime: updates.endTime !== undefined ? updates.endTime : target.endTime,
        category: updates.category !== undefined ? updates.category : target.category,
        color: updates.color !== undefined ? updates.color : target.color,
        completed: updates.completed !== undefined ? updates.completed : target.completed,
        scheduleDate: updates.scheduleDate !== undefined ? updates.scheduleDate : target.scheduleDate,
      };

      setBlocks((prev) => prev.map((b) => (b.id === id ? optimisticBlock : b)));

      try {
        setError(null);
        const updated = await plannerService.updatePlannerBlock(id, user.id, updates);
        setBlocks((prev) => prev.map((b) => (b.id === id ? updated : b)));
        return updated;
      } catch (err) {
        console.error('[Daylight PlannerContext] Failed to update block, rolling back:', err);
        setBlocks(previousBlocks);
        setError(err instanceof Error ? err.message : 'Failed to update planner block');
        throw err;
      }
    },
    [user?.id]
  );

  // Toggle completed state with optimistic update and rollback
  const toggleCompleted = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) return;

      const previousBlocks = blocksRef.current;
      const target = previousBlocks.find((b) => b.id === id);
      if (!target) return;

      sound.playClick();
      const nextCompleted = !target.completed;

      // Optimistic toggle
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, completed: nextCompleted } : b))
      );

      try {
        setError(null);
        await plannerService.toggleBlockCompleted(id, user.id, nextCompleted);
      } catch (err) {
        console.error('[Daylight PlannerContext] Failed to toggle completion, rolling back:', err);
        setBlocks(previousBlocks);
        setError(err instanceof Error ? err.message : 'Failed to update completion status');
      }
    },
    [user?.id]
  );

  // Delete block with optimistic update and rollback
  const deleteBlock = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) return;

      const previousBlocks = blocksRef.current;
      sound.playClick();

      // Optimistic deletion
      setBlocks((prev) => prev.filter((b) => b.id !== id));

      try {
        setError(null);
        await plannerService.deletePlannerBlock(id, user.id);
      } catch (err) {
        console.error('[Daylight PlannerContext] Failed to delete block, rolling back:', err);
        setBlocks(previousBlocks);
        setError(err instanceof Error ? err.message : 'Failed to delete planner block');
      }
    },
    [user?.id]
  );

  // Navigation helpers
  const goToPrevious = useCallback(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const step = viewMode === 'day' ? 1 : 7;
    d.setDate(d.getDate() - step);
    setSelectedDate(getLocalDateString(d));
  }, [selectedDate, viewMode]);

  const goToNext = useCallback(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const step = viewMode === 'day' ? 1 : 7;
    d.setDate(d.getDate() + step);
    setSelectedDate(getLocalDateString(d));
  }, [selectedDate, viewMode]);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDateString());
  }, []);

  const totalBlocksCount = blocks.length;
  const completedBlocksCount = useMemo(() => blocks.filter((b) => b.completed).length, [blocks]);

  return (
    <PlannerContext.Provider
      value={{
        blocks,
        loading,
        error,
        selectedDate,
        viewMode,
        setSelectedDate,
        setViewMode,
        createBlock,
        addBlock,
        updateBlock,
        toggleCompleted,
        deleteBlock,
        refreshBlocks,
        goToPrevious,
        goToNext,
        goToToday,
        totalBlocksCount,
        completedBlocksCount,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = (): PlannerContextType => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
