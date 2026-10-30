import { supabase } from '../lib/supabaseClient';
import { Habit } from '../types';
import { getLocalDateString } from '../utils/date';

/**
 * Database representation of a row in the public.habits table
 */
export interface HabitRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  icon_name: string;
  color: string;
  frequency: string;
  created_at: string;
  updated_at: string;
}

/**
 * Database representation of a row in the public.habit_logs table
 */
export interface HabitLogRow {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string; // YYYY-MM-DD format
  created_at: string;
}

/**
 * Input payload for creating a new habit
 */
export interface CreateHabitInput {
  name: string;
  category?: string;
  iconName?: string;
  color?: string;
  frequency?: string;
}

/**
 * Input payload for updating an existing habit
 */
export interface UpdateHabitInput {
  name?: string;
  category?: string;
  iconName?: string;
  color?: string;
  frequency?: string;
}

/**
 * Calculates a habit's active streak in days from its completion log dates.
 * Uses local calendar dates to avoid UTC day-shift boundaries.
 * 
 * Rules:
 * - If completed today, streak includes today and counts backward consecutive days.
 * - If not yet completed today, the streak remains active from yesterday while today is in progress.
 * - If frequency is 'Weekdays only', weekend days (Saturday & Sunday) are skipped and do not break the streak.
 */
export function calculateHabitStreak(
  completedDates: string[],
  frequency: string = 'Daily',
  refDate: Date = new Date()
): number {
  if (!completedDates || completedDates.length === 0) return 0;

  const dateSet = new Set(completedDates);
  const isWeekdaysOnly = frequency.toLowerCase().includes('weekday');

  const isWeekend = (d: Date): boolean => {
    const day = d.getDay();
    return day === 0 || day === 6;
  };

  // Clone to local midnight
  const cursor = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const todayStr = getLocalDateString(cursor);
  const isDoneToday = dateSet.has(todayStr);

  let streak = 0;

  if (isDoneToday) {
    streak = 1;
    // Step back to check yesterday and preceding consecutive days
    cursor.setDate(cursor.getDate() - 1);
  } else {
    // Not done today yet. The streak is not broken yet for today; check yesterday
    cursor.setDate(cursor.getDate() - 1);
  }

  // Iterate backward consecutively
  while (true) {
    // If weekdays only and cursor falls on a weekend, skip without breaking streak
    if (isWeekdaysOnly && isWeekend(cursor)) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    const dateStr = getLocalDateString(cursor);
    if (dateSet.has(dateStr)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // First missing required day: streak sequence terminates
      break;
    }
  }

  return streak;
}

/**
 * Maps a database row from public.habits plus associated completion dates to the frontend Habit model.
 */
export function mapHabitFromDb(
  row: HabitRow,
  completedDates: string[] = []
): Habit {
  const streak = calculateHabitStreak(completedDates, row.frequency);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    iconName: row.icon_name,
    color: row.color,
    frequency: row.frequency,
    completedDates,
    streak,
  };
}

/**
 * Fetches all habits and their normalized completion dates for the authenticated user.
 * Explicitly filters by user_id in addition to Row Level Security.
 */
export async function fetchHabits(userId: string): Promise<Habit[]> {
  if (!userId) return [];

  // Query habits and habit_logs in parallel for maximum responsiveness
  const [habitsResult, logsResult] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('completed_date', { ascending: true }),
  ]);

  if (habitsResult.error) {
    console.error('[Daylight habitService] fetchHabits error:', habitsResult.error);
    throw new Error(habitsResult.error.message);
  }

  if (logsResult.error) {
    console.error('[Daylight habitService] fetchHabitLogs error:', logsResult.error);
    throw new Error(logsResult.error.message);
  }

  const habitRows = (habitsResult.data as HabitRow[]) || [];
  const logRows = (logsResult.data as HabitLogRow[]) || [];

  // Group completion dates by habit_id
  const logsByHabitId: Record<string, string[]> = {};
  for (const log of logRows) {
    if (!logsByHabitId[log.habit_id]) {
      logsByHabitId[log.habit_id] = [];
    }
    if (!logsByHabitId[log.habit_id].includes(log.completed_date)) {
      logsByHabitId[log.habit_id].push(log.completed_date);
    }
  }

  return habitRows.map((row) => mapHabitFromDb(row, logsByHabitId[row.id] || []));
}

/**
 * Inserts a new habit into public.habits for the authenticated user.
 */
export async function createHabit(
  userId: string,
  input: CreateHabitInput
): Promise<Habit> {
  if (!userId) {
    throw new Error('User ID is required to create a habit');
  }

  const insertPayload = {
    user_id: userId,
    name: input.name.trim(),
    category: input.category?.trim() || 'Mindfulness',
    icon_name: input.iconName?.trim() || 'Sparkles',
    color: input.color || '#0071e3',
    frequency: input.frequency?.trim() || 'Daily',
  };

  const { data, error } = await supabase
    .from('habits')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('[Daylight habitService] createHabit error:', error);
    throw new Error(error.message);
  }

  return mapHabitFromDb(data as HabitRow, []);
}

/**
 * Updates editable fields of a habit in public.habits.
 */
export async function updateHabit(
  habitId: string,
  userId: string,
  updates: UpdateHabitInput,
  currentCompletedDates: string[] = []
): Promise<Habit> {
  if (!habitId || !userId) {
    throw new Error('Habit ID and User ID are required to update a habit');
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
  if (updates.category !== undefined) dbUpdates.category = updates.category.trim();
  if (updates.iconName !== undefined) dbUpdates.icon_name = updates.iconName;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;

  const { data, error } = await supabase
    .from('habits')
    .update(dbUpdates)
    .eq('id', habitId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('[Daylight habitService] updateHabit error:', error);
    throw new Error(error.message);
  }

  return mapHabitFromDb(data as HabitRow, currentCompletedDates);
}

/**
 * Deletes a habit by ID for the authenticated user.
 * Deleting the habit automatically deletes all its habit_logs via PostgreSQL ON DELETE CASCADE.
 */
export async function deleteHabit(
  habitId: string,
  userId: string
): Promise<void> {
  if (!habitId || !userId) {
    throw new Error('Habit ID and User ID are required to delete a habit');
  }

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Daylight habitService] deleteHabit error:', error);
    throw new Error(error.message);
  }
}

/**
 * Records a habit check-in by inserting a row into public.habit_logs.
 * Handles duplicate completion attempts safely without throwing.
 */
export async function logHabitCompletion(
  habitId: string,
  userId: string,
  completedDate: string
): Promise<HabitLogRow | null> {
  if (!habitId || !userId || !completedDate) {
    throw new Error('habitId, userId, and completedDate are required to log completion');
  }

  const { data, error } = await supabase
    .from('habit_logs')
    .insert({
      habit_id: habitId,
      user_id: userId,
      completed_date: completedDate,
    })
    .select('*')
    .single();

  if (error) {
    // Unique constraint violation (duplicate check-in attempt)
    if (
      error.code === '23505' ||
      error.message?.includes('duplicate key') ||
      error.message?.includes('unique')
    ) {
      console.warn('[Daylight habitService] Duplicate check-in safely ignored:', habitId, completedDate);
      return null;
    }
    console.error('[Daylight habitService] logHabitCompletion error:', error);
    throw new Error(error.message);
  }

  return data as HabitLogRow;
}

/**
 * Removes a habit check-in by deleting the row from public.habit_logs.
 * Does not use update or upsert since UPDATE is intentionally not granted on habit_logs.
 */
export async function removeHabitCompletion(
  habitId: string,
  userId: string,
  completedDate: string
): Promise<void> {
  if (!habitId || !userId || !completedDate) {
    throw new Error('habitId, userId, and completedDate are required to remove completion');
  }

  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .eq('completed_date', completedDate);

  if (error) {
    console.error('[Daylight habitService] removeHabitCompletion error:', error);
    throw new Error(error.message);
  }
}

export const habitService = {
  fetchHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabitCompletion,
  removeHabitCompletion,
  calculateHabitStreak,
  mapHabitFromDb,
};
