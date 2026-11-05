import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  Goal,
  Milestone,
  CreateGoalInput,
  UpdateGoalInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  GoalStatus,
} from '../types';
import { goalService } from '../services/goalService';
import { useAuth } from './AuthContext';
import { sound } from '../utils/sound';

export interface GoalContextType {
  goals: Goal[];
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
  createGoal: (input: CreateGoalInput, initialMilestoneTitles?: string[]) => Promise<Goal | null>;
  updateGoal: (goalId: string, input: UpdateGoalInput) => Promise<Goal | null>;
  deleteGoal: (goalId: string) => Promise<boolean>;
  toggleGoalStatus: (goalId: string) => Promise<void>;
  addMilestone: (input: CreateMilestoneInput) => Promise<Milestone | null>;
  updateMilestone: (milestoneId: string, input: UpdateMilestoneInput) => Promise<Milestone | null>;
  toggleMilestone: (milestoneId: string) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<boolean>;
  updateGoalMetric: (goalId: string, currentValue: number) => Promise<void>;
  getGoalProgress: (goal: Goal) => number;
  getGoalMilestones: (goalId: string) => Milestone[];
  totalGoalsCount: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  overallProgressPercentage: number;
  totalMilestonesCompleted: number;
  refreshGoals: () => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const goalsRef = useRef<Goal[]>(goals);
  goalsRef.current = goals;
  const milestonesRef = useRef<Milestone[]>(milestones);
  milestonesRef.current = milestones;

  const loadData = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setMilestones([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [fetchedGoals, fetchedMilestones] = await Promise.all([
        goalService.fetchGoals(user.id),
        goalService.fetchMilestones(user.id),
      ]);
      setGoals(fetchedGoals);
      setMilestones(fetchedMilestones);
    } catch (err: any) {
      console.error('[GoalContext] Failed to load goals and milestones:', err);
      setError(err?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  const getGoalMilestones = useCallback(
    (goalId: string): Milestone[] => {
      return milestones
        .filter((m) => m.goalId === goalId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    [milestones]
  );

  const getGoalProgress = useCallback(
    (goal: Goal): number => {
      return goalService.calculateProgress(goal, milestones);
    },
    [milestones]
  );

  const createGoal = useCallback(
    async (
      input: CreateGoalInput,
      initialMilestoneTitles?: string[]
    ): Promise<Goal | null> => {
      if (!user) return null;

      try {
        const created = await goalService.createGoal(user.id, input);
        setGoals((prev) => [created, ...prev]);

        // Add initial milestones if provided
        if (initialMilestoneTitles && initialMilestoneTitles.length > 0) {
          const createdMilestones: Milestone[] = [];
          for (let i = 0; i < initialMilestoneTitles.length; i++) {
            const title = initialMilestoneTitles[i].trim();
            if (title) {
              const ms = await goalService.createMilestone(user.id, {
                goalId: created.id,
                title,
                sortOrder: i,
              });
              createdMilestones.push(ms);
            }
          }
          if (createdMilestones.length > 0) {
            setMilestones((prev) => [...prev, ...createdMilestones]);
          }
        }

        sound.playClick();
        return created;
      } catch (err: any) {
        console.error('[GoalContext] createGoal failed:', err);
        setError(err?.message || 'Failed to create goal');
        return null;
      }
    },
    [user]
  );

  const updateGoal = useCallback(
    async (goalId: string, input: UpdateGoalInput): Promise<Goal | null> => {
      if (!user) return null;

      // Optimistic update
      const previousGoals = goalsRef.current;
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, ...input, updatedAt: new Date().toISOString() } : g))
      );

      try {
        const updated = await goalService.updateGoal(user.id, goalId, input);
        setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
        return updated;
      } catch (err: any) {
        console.error('[GoalContext] updateGoal failed, rolling back:', err);
        setGoals(previousGoals);
        setError(err?.message || 'Failed to update goal');
        return null;
      }
    },
    [user]
  );

  const deleteGoal = useCallback(
    async (goalId: string): Promise<boolean> => {
      if (!user) return false;

      const previousGoals = goalsRef.current;
      const previousMilestones = milestonesRef.current;

      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      setMilestones((prev) => prev.filter((m) => m.goalId !== goalId));

      try {
        await goalService.deleteGoal(user.id, goalId);
        sound.playClick();
        return true;
      } catch (err: any) {
        console.error('[GoalContext] deleteGoal failed, rolling back:', err);
        setGoals(previousGoals);
        setMilestones(previousMilestones);
        setError(err?.message || 'Failed to delete goal');
        return false;
      }
    },
    [user]
  );

  const toggleGoalStatus = useCallback(
    async (goalId: string): Promise<void> => {
      if (!user) return;
      const target = goalsRef.current.find((g) => g.id === goalId);
      if (!target) return;

      const newStatus: GoalStatus = target.status === 'completed' ? 'active' : 'completed';
      if (newStatus === 'completed') {
        sound.playGoalComplete();
      } else {
        sound.playClick();
      }

      await updateGoal(goalId, { status: newStatus });
    },
    [user, updateGoal]
  );

  const addMilestone = useCallback(
    async (input: CreateMilestoneInput): Promise<Milestone | null> => {
      if (!user) return null;

      try {
        const created = await goalService.createMilestone(user.id, input);
        setMilestones((prev) => [...prev, created]);
        sound.playClick();
        return created;
      } catch (err: any) {
        console.error('[GoalContext] addMilestone failed:', err);
        setError(err?.message || 'Failed to add milestone');
        return null;
      }
    },
    [user]
  );

  const updateMilestone = useCallback(
    async (milestoneId: string, input: UpdateMilestoneInput): Promise<Milestone | null> => {
      if (!user) return null;

      const previousMilestones = milestonesRef.current;
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, ...input, updatedAt: new Date().toISOString() } : m))
      );

      try {
        const updated = await goalService.updateMilestone(user.id, milestoneId, input);
        setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? updated : m)));
        return updated;
      } catch (err: any) {
        console.error('[GoalContext] updateMilestone failed, rolling back:', err);
        setMilestones(previousMilestones);
        setError(err?.message || 'Failed to update milestone');
        return null;
      }
    },
    [user]
  );

  const toggleMilestone = useCallback(
    async (milestoneId: string): Promise<void> => {
      if (!user) return;
      const target = milestonesRef.current.find((m) => m.id === milestoneId);
      if (!target) return;

      const willBeCompleted = !target.isCompleted;

      if (willBeCompleted) {
        sound.playTaskComplete();
      } else {
        sound.playClick();
      }

      // Check if all other milestones for this goal are completed
      const goalMilestones = milestonesRef.current.filter((m) => m.goalId === target.goalId);
      const remainingIncomplete = goalMilestones.filter(
        (m) => m.id !== milestoneId && !m.isCompleted
      );

      // If completing this milestone finishes the entire goal
      if (willBeCompleted && remainingIncomplete.length === 0 && goalMilestones.length > 0) {
        setTimeout(() => {
          sound.playGoalComplete();
        }, 150);

        // Update goal to completed if milestone-based
        const parentGoal = goalsRef.current.find((g) => g.id === target.goalId);
        if (parentGoal && parentGoal.status === 'active' && parentGoal.trackingType === 'milestone') {
          updateGoal(parentGoal.id, { status: 'completed' });
        }
      }

      await updateMilestone(milestoneId, { isCompleted: willBeCompleted });
    },
    [user, updateMilestone, updateGoal]
  );

  const deleteMilestone = useCallback(
    async (milestoneId: string): Promise<boolean> => {
      if (!user) return false;
      const previousMilestones = milestonesRef.current;
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));

      try {
        await goalService.deleteMilestone(user.id, milestoneId);
        sound.playClick();
        return true;
      } catch (err: any) {
        console.error('[GoalContext] deleteMilestone failed, rolling back:', err);
        setMilestones(previousMilestones);
        setError(err?.message || 'Failed to delete milestone');
        return false;
      }
    },
    [user]
  );

  const updateGoalMetric = useCallback(
    async (goalId: string, currentValue: number): Promise<void> => {
      const target = goalsRef.current.find((g) => g.id === goalId);
      if (!target) return;

      const isCompleted =
        target.targetValue && target.targetValue > 0
          ? currentValue >= target.targetValue
          : false;

      if (isCompleted && target.status !== 'completed') {
        sound.playGoalComplete();
        await updateGoal(goalId, {
          currentValue,
          status: 'completed',
        });
      } else {
        await updateGoal(goalId, { currentValue });
      }
    },
    [updateGoal]
  );

  // Derived Statistics
  const totalGoalsCount = goals.length;
  const activeGoalsCount = useMemo(
    () => goals.filter((g) => g.status === 'active').length,
    [goals]
  );
  const completedGoalsCount = useMemo(
    () => goals.filter((g) => g.status === 'completed').length,
    [goals]
  );
  const totalMilestonesCompleted = useMemo(
    () => milestones.filter((m) => m.isCompleted).length,
    [milestones]
  );

  const overallProgressPercentage = useMemo(() => {
    if (goals.length === 0) return 0;
    const sum = goals.reduce((acc, g) => acc + goalService.calculateProgress(g, milestones), 0);
    return Math.round(sum / goals.length);
  }, [goals, milestones]);

  return (
    <GoalContext.Provider
      value={{
        goals,
        milestones,
        loading,
        error,
        createGoal,
        updateGoal,
        deleteGoal,
        toggleGoalStatus,
        addMilestone,
        updateMilestone,
        toggleMilestone,
        deleteMilestone,
        updateGoalMetric,
        getGoalProgress,
        getGoalMilestones,
        totalGoalsCount,
        activeGoalsCount,
        completedGoalsCount,
        overallProgressPercentage,
        totalMilestonesCompleted,
        refreshGoals: loadData,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = (): GoalContextType => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};
