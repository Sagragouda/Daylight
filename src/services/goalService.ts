import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  Goal,
  Milestone,
  CreateGoalInput,
  UpdateGoalInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  GoalCategory,
  GoalPriority,
  GoalTrackingType,
  GoalStatus,
} from '../types';
import { getTodayDateString } from '../utils/date';

/**
 * Database schema representation of public.goals
 */
export interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  icon: string | null;
  color: string | null;
  priority: GoalPriority;
  tracking_type: GoalTrackingType;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  manual_progress: number | null;
  start_date: string;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Database schema representation of public.goal_milestones
 */
export interface MilestoneRow {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a database row from public.goals to the frontend Goal model
 */
export function mapGoalFromDb(row: GoalRow): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    category: row.category || 'Personal',
    icon: row.icon || 'Target',
    color: row.color || 'blue',
    priority: row.priority || 'medium',
    trackingType: row.tracking_type || 'milestone',
    targetValue: row.target_value !== null ? Number(row.target_value) : undefined,
    currentValue: row.current_value !== null ? Number(row.current_value) : 0,
    unit: row.unit ?? undefined,
    manualProgress: row.manual_progress !== null ? Number(row.manual_progress) : 0,
    startDate: row.start_date || getTodayDateString(),
    targetDate: row.target_date ?? undefined,
    status: row.status || 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Maps a database row from public.goal_milestones to the frontend Milestone model
 */
export function mapMilestoneFromDb(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    goalId: row.goal_id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    dueDate: row.due_date ?? undefined,
    isCompleted: row.is_completed,
    completedAt: row.completed_at ?? undefined,
    sortOrder: row.sort_order ?? 0,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// LOCAL STORAGE RESILIENT CACHE HELPERS
// (Guarantees uninterrupted experience if table not yet migrated or offline)
// ============================================================================

function getLocalGoals(userId: string): Goal[] {
  try {
    const raw = localStorage.getItem(`focusup_goals_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalGoals(userId: string, goals: Goal[]) {
  try {
    localStorage.setItem(`focusup_goals_${userId}`, JSON.stringify(goals));
  } catch {
    // ignore
  }
}

function getLocalMilestones(userId: string): Milestone[] {
  try {
    const raw = localStorage.getItem(`focusup_milestones_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMilestones(userId: string, milestones: Milestone[]) {
  try {
    localStorage.setItem(`focusup_milestones_${userId}`, JSON.stringify(milestones));
  } catch {
    // ignore
  }
}

// ============================================================================
// GOAL SERVICE IMPLEMENTATION
// ============================================================================

export const goalService = {
  /**
   * Fetches all goals for the authenticated user, ordered by target_date ASC, created_at DESC.
   */
  async fetchGoals(userId: string): Promise<Goal[]> {
    if (!userId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = (data as GoalRow[]).map(mapGoalFromDb);
          saveLocalGoals(userId, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('[goalService] Supabase fetchGoals fallback to local store:', err);
      }
    }

    return getLocalGoals(userId);
  },

  /**
   * Creates a new goal for the authenticated user.
   */
  async createGoal(userId: string, input: CreateGoalInput): Promise<Goal> {
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const today = getTodayDateString();

    const newGoal: Goal = {
      id: newId,
      userId,
      title: input.title.trim(),
      description: input.description?.trim(),
      category: input.category || 'Personal',
      icon: input.icon || 'Target',
      color: input.color || 'blue',
      priority: input.priority || 'medium',
      trackingType: input.trackingType || 'milestone',
      targetValue: input.targetValue !== undefined ? Number(input.targetValue) : undefined,
      currentValue: input.currentValue !== undefined ? Number(input.currentValue) : 0,
      unit: input.unit?.trim(),
      manualProgress: input.manualProgress !== undefined ? Number(input.manualProgress) : 0,
      startDate: input.startDate || today,
      targetDate: input.targetDate || undefined,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured) {
      try {
        const row = {
          id: newId,
          user_id: userId,
          title: newGoal.title,
          description: newGoal.description ?? null,
          category: newGoal.category,
          icon: newGoal.icon,
          color: newGoal.color,
          priority: newGoal.priority,
          tracking_type: newGoal.trackingType,
          target_value: newGoal.targetValue ?? null,
          current_value: newGoal.currentValue ?? 0,
          unit: newGoal.unit ?? null,
          manual_progress: newGoal.manualProgress ?? 0,
          start_date: newGoal.startDate,
          target_date: newGoal.targetDate ?? null,
          status: newGoal.status,
          created_at: now,
          updated_at: now,
        };

        const { data, error } = await supabase
          .from('goals')
          .insert(row)
          .select()
          .single();

        if (!error && data) {
          const created = mapGoalFromDb(data as GoalRow);
          const current = getLocalGoals(userId);
          saveLocalGoals(userId, [created, ...current]);
          return created;
        }
      } catch (err) {
        console.warn('[goalService] Supabase createGoal fallback:', err);
      }
    }

    // Local fallback
    const current = getLocalGoals(userId);
    saveLocalGoals(userId, [newGoal, ...current]);
    return newGoal;
  },

  /**
   * Updates an existing goal.
   */
  async updateGoal(userId: string, goalId: string, input: UpdateGoalInput): Promise<Goal> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const payload: Partial<GoalRow> = {
          updated_at: now,
        };

        if (input.title !== undefined) payload.title = input.title.trim();
        if (input.description !== undefined) payload.description = input.description?.trim() ?? null;
        if (input.category !== undefined) payload.category = input.category;
        if (input.icon !== undefined) payload.icon = input.icon;
        if (input.color !== undefined) payload.color = input.color;
        if (input.priority !== undefined) payload.priority = input.priority;
        if (input.trackingType !== undefined) payload.tracking_type = input.trackingType;
        if (input.targetValue !== undefined) payload.target_value = input.targetValue;
        if (input.currentValue !== undefined) payload.current_value = input.currentValue;
        if (input.unit !== undefined) payload.unit = input.unit?.trim() ?? null;
        if (input.manualProgress !== undefined) payload.manual_progress = input.manualProgress;
        if (input.startDate !== undefined) payload.start_date = input.startDate;
        if (input.targetDate !== undefined) payload.target_date = input.targetDate;
        if (input.status !== undefined) payload.status = input.status;

        const { data, error } = await supabase
          .from('goals')
          .update(payload)
          .eq('id', goalId)
          .eq('user_id', userId)
          .select()
          .single();

        if (!error && data) {
          const updated = mapGoalFromDb(data as GoalRow);
          const current = getLocalGoals(userId);
          saveLocalGoals(
            userId,
            current.map((g) => (g.id === goalId ? updated : g))
          );
          return updated;
        }
      } catch (err) {
        console.warn('[goalService] Supabase updateGoal fallback:', err);
      }
    }

    // Local fallback update
    const current = getLocalGoals(userId);
    const existing = current.find((g) => g.id === goalId);
    if (!existing) {
      throw new Error('Goal not found');
    }

    const updated: Goal = {
      ...existing,
      title: input.title !== undefined ? input.title.trim() : existing.title,
      description: input.description !== undefined ? input.description?.trim() : existing.description,
      category: input.category ?? existing.category,
      icon: input.icon ?? existing.icon,
      color: input.color ?? existing.color,
      priority: input.priority ?? existing.priority,
      trackingType: input.trackingType ?? existing.trackingType,
      targetValue: input.targetValue !== undefined ? input.targetValue : existing.targetValue,
      currentValue: input.currentValue !== undefined ? input.currentValue : existing.currentValue,
      unit: input.unit !== undefined ? input.unit : existing.unit,
      manualProgress: input.manualProgress !== undefined ? input.manualProgress : existing.manualProgress,
      startDate: input.startDate ?? existing.startDate,
      targetDate: input.targetDate !== undefined ? input.targetDate : existing.targetDate,
      status: input.status ?? existing.status,
      updatedAt: now,
    };

    saveLocalGoals(
      userId,
      current.map((g) => (g.id === goalId ? updated : g))
    );
    return updated;
  },

  /**
   * Deletes a goal and its associated milestones.
   */
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('goals')
          .delete()
          .eq('id', goalId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[goalService] Supabase deleteGoal error:', err);
      }
    }

    // Always update local cache
    const currentGoals = getLocalGoals(userId);
    saveLocalGoals(
      userId,
      currentGoals.filter((g) => g.id !== goalId)
    );

    const currentMilestones = getLocalMilestones(userId);
    saveLocalMilestones(
      userId,
      currentMilestones.filter((m) => m.goalId !== goalId)
    );
  },

  /**
   * Fetches milestones for a user, optionally filtered by goalId.
   */
  async fetchMilestones(userId: string, goalId?: string): Promise<Milestone[]> {
    if (!userId) return [];

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('goal_milestones')
          .select('*')
          .eq('user_id', userId)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (goalId) {
          query = query.eq('goal_id', goalId);
        }

        const { data, error } = await query;
        if (!error && data) {
          const mapped = (data as MilestoneRow[]).map(mapMilestoneFromDb);
          const allLocal = getLocalMilestones(userId);
          // Merge or replace cached for goal
          if (goalId) {
            const filtered = allLocal.filter((m) => m.goalId !== goalId);
            saveLocalMilestones(userId, [...filtered, ...mapped]);
          } else {
            saveLocalMilestones(userId, mapped);
          }
          return mapped;
        }
      } catch (err) {
        console.warn('[goalService] Supabase fetchMilestones fallback:', err);
      }
    }

    const all = getLocalMilestones(userId);
    if (goalId) {
      return all
        .filter((m) => m.goalId === goalId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  /**
   * Creates a milestone under a goal.
   */
  async createMilestone(userId: string, input: CreateMilestoneInput): Promise<Milestone> {
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newMilestone: Milestone = {
      id: newId,
      goalId: input.goalId,
      userId,
      title: input.title.trim(),
      description: input.description?.trim(),
      dueDate: input.dueDate,
      isCompleted: false,
      sortOrder: input.sortOrder ?? 0,
      notes: input.notes?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured) {
      try {
        const row = {
          id: newId,
          goal_id: input.goalId,
          user_id: userId,
          title: newMilestone.title,
          description: newMilestone.description ?? null,
          due_date: newMilestone.dueDate ?? null,
          is_completed: false,
          sort_order: newMilestone.sortOrder,
          notes: newMilestone.notes ?? null,
          created_at: now,
          updated_at: now,
        };

        const { data, error } = await supabase
          .from('goal_milestones')
          .insert(row)
          .select()
          .single();

        if (!error && data) {
          const created = mapMilestoneFromDb(data as MilestoneRow);
          const current = getLocalMilestones(userId);
          saveLocalMilestones(userId, [...current, created]);
          return created;
        }
      } catch (err) {
        console.warn('[goalService] Supabase createMilestone fallback:', err);
      }
    }

    const current = getLocalMilestones(userId);
    saveLocalMilestones(userId, [...current, newMilestone]);
    return newMilestone;
  },

  /**
   * Updates an existing milestone.
   */
  async updateMilestone(
    userId: string,
    milestoneId: string,
    input: UpdateMilestoneInput
  ): Promise<Milestone> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const payload: Partial<MilestoneRow> = {
          updated_at: now,
        };

        if (input.title !== undefined) payload.title = input.title.trim();
        if (input.description !== undefined) payload.description = input.description?.trim() ?? null;
        if (input.dueDate !== undefined) payload.due_date = input.dueDate ?? null;
        if (input.isCompleted !== undefined) {
          payload.is_completed = input.isCompleted;
          payload.completed_at = input.isCompleted ? now : null;
        }
        if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
        if (input.notes !== undefined) payload.notes = input.notes?.trim() ?? null;

        const { data, error } = await supabase
          .from('goal_milestones')
          .update(payload)
          .eq('id', milestoneId)
          .eq('user_id', userId)
          .select()
          .single();

        if (!error && data) {
          const updated = mapMilestoneFromDb(data as MilestoneRow);
          const current = getLocalMilestones(userId);
          saveLocalMilestones(
            userId,
            current.map((m) => (m.id === milestoneId ? updated : m))
          );
          return updated;
        }
      } catch (err) {
        console.warn('[goalService] Supabase updateMilestone fallback:', err);
      }
    }

    const current = getLocalMilestones(userId);
    const existing = current.find((m) => m.id === milestoneId);
    if (!existing) {
      throw new Error('Milestone not found');
    }

    const updated: Milestone = {
      ...existing,
      title: input.title !== undefined ? input.title.trim() : existing.title,
      description: input.description !== undefined ? input.description?.trim() : existing.description,
      dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
      isCompleted: input.isCompleted !== undefined ? input.isCompleted : existing.isCompleted,
      completedAt:
        input.isCompleted !== undefined
          ? input.isCompleted
            ? now
            : undefined
          : existing.completedAt,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder,
      notes: input.notes !== undefined ? input.notes?.trim() : existing.notes,
      updatedAt: now,
    };

    saveLocalMilestones(
      userId,
      current.map((m) => (m.id === milestoneId ? updated : m))
    );
    return updated;
  },

  /**
   * Deletes a single milestone.
   */
  async deleteMilestone(userId: string, milestoneId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('goal_milestones')
          .delete()
          .eq('id', milestoneId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[goalService] Supabase deleteMilestone error:', err);
      }
    }

    const current = getLocalMilestones(userId);
    saveLocalMilestones(
      userId,
      current.filter((m) => m.id !== milestoneId)
    );
  },

  /**
   * Calculates dynamic goal progress (0 to 100) based on goal tracking type.
   */
  calculateProgress(goal: Goal, milestones: Milestone[] = []): number {
    if (goal.status === 'completed') return 100;

    if (goal.trackingType === 'numeric') {
      const target = Number(goal.targetValue) || 0;
      const current = Number(goal.currentValue) || 0;
      if (target <= 0) return 0;
      return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
    }

    if (goal.trackingType === 'percentage') {
      return Math.min(100, Math.max(0, Math.round(goal.manualProgress || 0)));
    }

    // Default: 'milestone'
    const goalMilestones = milestones.filter((m) => m.goalId === goal.id);
    if (goalMilestones.length === 0) {
      return goal.manualProgress || 0;
    }
    const completed = goalMilestones.filter((m) => m.isCompleted).length;
    return Math.min(100, Math.max(0, Math.round((completed / goalMilestones.length) * 100)));
  },
};
