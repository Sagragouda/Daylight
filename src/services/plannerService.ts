import { supabase } from '../lib/supabaseClient';
import { PlannerTimeBlock } from '../types';
import { getLocalDateString } from '../utils/date';

/**
 * PostgreSQL public.planner_blocks row representation
 */
export interface PlannerBlockRow {
  id: string;
  user_id: string;
  title: string;
  schedule_date: string; // 'YYYY-MM-DD'
  start_time: string;    // 'HH:MM:SS'
  end_time: string;      // 'HH:MM:SS'
  category: string;
  color: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Input payload for creating a new planner block
 */
export interface CreatePlannerBlockInput {
  title: string;
  scheduleDate: string; // 'YYYY-MM-DD'
  startTime: string;    // '09:00 AM' or '09:00'
  endTime: string;      // '10:30 AM' or '10:30'
  category?: string;
  color?: string;
  completed?: boolean;
}

/**
 * Input payload for updating an existing planner block
 */
export interface UpdatePlannerBlockInput {
  title?: string;
  scheduleDate?: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  color?: string;
  completed?: boolean;
}

/**
 * Parses a time string (12-hour or 24-hour) into minutes from midnight (0..1439).
 * Returns null if the format is invalid or out of range.
 * Does NOT fallback or silently guess.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim();

  // Try 12-hour format: e.g. "09:30 AM", "9:30am", "12:00 PM"
  const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (twelveHourMatch) {
    let hours = parseInt(twelveHourMatch[1], 10);
    const minutes = parseInt(twelveHourMatch[2], 10);
    const period = twelveHourMatch[3].toLowerCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }

    if (period === 'am') {
      if (hours === 12) hours = 0;
    } else {
      if (hours !== 12) hours += 12;
    }
    return hours * 60 + minutes;
  }

  // Try 24-hour format: e.g. "09:30", "14:15", "09:30:00"
  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourHourMatch) {
    const hours = parseInt(twentyFourHourMatch[1], 10);
    const minutes = parseInt(twentyFourHourMatch[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Converts any valid time input into PostgreSQL 'HH:MM:SS'.
 * Throws a descriptive validation Error if invalid.
 */
export function formatTimeToDb(timeStr: string): string {
  const totalMinutes = parseTimeToMinutes(timeStr);
  if (totalMinutes === null) {
    throw new Error(
      `Invalid time format: "${timeStr}". Please enter a valid time like "09:00 AM" or "14:30".`
    );
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

/**
 * Converts PostgreSQL time string (e.g. '09:30:00') into 12-hour display format '09:30 AM'.
 */
export function formatDbTimeToDisplay(dbTime: string): string {
  if (!dbTime) return '';
  const match = dbTime.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return dbTime.trim();
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

/**
 * Derives isCurrent dynamically from local calendar date and local time.
 * Avoids UTC date boundary issues.
 */
export function isBlockCurrent(
  scheduleDate: string,
  startTime: string,
  endTime: string,
  refDate: Date = new Date()
): boolean {
  const localToday = getLocalDateString(refDate);
  if (scheduleDate !== localToday) return false;

  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  if (startMin === null || endMin === null) return false;

  const currentMin = refDate.getHours() * 60 + refDate.getMinutes();
  return currentMin >= startMin && currentMin < endMin;
}

/**
 * Validates that end_time > start_time respecting database CHECK constraint.
 */
export function validateTimeOrder(startTime: string, endTime: string): void {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  if (startMin === null) {
    throw new Error(`Invalid start time: "${startTime}". Use e.g. "09:00 AM" or "09:00".`);
  }
  if (endMin === null) {
    throw new Error(`Invalid end time: "${endTime}". Use e.g. "10:30 AM" or "10:30".`);
  }
  if (endMin <= startMin) {
    throw new Error('End time must be after start time. Overnight schedules are not supported.');
  }
}

/**
 * Maps a database PlannerBlockRow to the application PlannerTimeBlock model.
 * Derives isCurrent at runtime using the user's local date and time.
 */
export function mapPlannerBlockFromDb(
  row: PlannerBlockRow,
  refDate: Date = new Date()
): PlannerTimeBlock {
  const displayStart = formatDbTimeToDisplay(row.start_time);
  const displayEnd = formatDbTimeToDisplay(row.end_time);

  return {
    id: row.id,
    title: row.title,
    startTime: displayStart,
    endTime: displayEnd,
    category: row.category,
    color: row.color,
    completed: row.completed,
    isCurrent: isBlockCurrent(row.schedule_date, row.start_time, row.end_time, refDate),
    scheduleDate: row.schedule_date,
  };
}

/**
 * Fetches all planner blocks for a specific user and date.
 * Orders by start_time ascending.
 */
export async function fetchBlocksForDate(
  userId: string,
  dateStr: string,
  refDate: Date = new Date()
): Promise<PlannerTimeBlock[]> {
  if (!userId || !dateStr) return [];

  const { data, error } = await supabase
    .from('planner_blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('schedule_date', dateStr)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('[Daylight plannerService] fetchBlocksForDate error:', error);
    throw error;
  }

  return (data as PlannerBlockRow[]).map((row) => mapPlannerBlockFromDb(row, refDate));
}

/**
 * Fetches all planner blocks for a specific user within a date range (e.g. week).
 * Orders by schedule_date ascending, then start_time ascending.
 */
export async function fetchBlocksForDateRange(
  userId: string,
  startDate: string,
  endDate: string,
  refDate: Date = new Date()
): Promise<PlannerTimeBlock[]> {
  if (!userId || !startDate || !endDate) return [];

  const { data, error } = await supabase
    .from('planner_blocks')
    .select('*')
    .eq('user_id', userId)
    .gte('schedule_date', startDate)
    .lte('schedule_date', endDate)
    .order('schedule_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('[Daylight plannerService] fetchBlocksForDateRange error:', error);
    throw error;
  }

  return (data as PlannerBlockRow[]).map((row) => mapPlannerBlockFromDb(row, refDate));
}

/**
 * Creates a new planner block in public.planner_blocks.
 * Omits id so PostgreSQL generates a real UUID with gen_random_uuid().
 */
export async function createPlannerBlock(
  userId: string,
  input: CreatePlannerBlockInput,
  refDate: Date = new Date()
): Promise<PlannerTimeBlock> {
  if (!userId) throw new Error('Cannot create planner block: missing authenticated userId');
  if (!input.title?.trim()) throw new Error('Block title cannot be empty');
  if (!input.scheduleDate) throw new Error('Schedule date is required');

  validateTimeOrder(input.startTime, input.endTime);
  const dbStart = formatTimeToDb(input.startTime);
  const dbEnd = formatTimeToDb(input.endTime);

  const { data, error } = await supabase
    .from('planner_blocks')
    .insert({
      user_id: userId,
      title: input.title.trim(),
      schedule_date: input.scheduleDate,
      start_time: dbStart,
      end_time: dbEnd,
      category: input.category?.trim() || 'Focus',
      color: input.color || 'bg-blue-50 text-blue-700 border-blue-200',
      completed: input.completed ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('[Daylight plannerService] createPlannerBlock error:', error);
    throw error;
  }

  return mapPlannerBlockFromDb(data as PlannerBlockRow, refDate);
}

/**
 * Updates an existing planner block in public.planner_blocks.
 */
export async function updatePlannerBlock(
  blockId: string,
  userId: string,
  updates: UpdatePlannerBlockInput,
  refDate: Date = new Date()
): Promise<PlannerTimeBlock> {
  if (!userId) throw new Error('Cannot update planner block: missing authenticated userId');
  if (!blockId) throw new Error('Cannot update planner block: missing blockId');

  const payload: Partial<{
    title: string;
    schedule_date: string;
    start_time: string;
    end_time: string;
    category: string;
    color: string;
    completed: boolean;
    updated_at: string;
  }> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.scheduleDate !== undefined) payload.schedule_date = updates.scheduleDate;

  if (updates.startTime !== undefined && updates.endTime !== undefined) {
    validateTimeOrder(updates.startTime, updates.endTime);
    payload.start_time = formatTimeToDb(updates.startTime);
    payload.end_time = formatTimeToDb(updates.endTime);
  } else if (updates.startTime !== undefined) {
    payload.start_time = formatTimeToDb(updates.startTime);
  } else if (updates.endTime !== undefined) {
    payload.end_time = formatTimeToDb(updates.endTime);
  }

  if (updates.category !== undefined) payload.category = updates.category.trim();
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.completed !== undefined) payload.completed = updates.completed;

  const { data, error } = await supabase
    .from('planner_blocks')
    .update(payload)
    .eq('id', blockId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Daylight plannerService] updatePlannerBlock error:', error);
    throw error;
  }

  return mapPlannerBlockFromDb(data as PlannerBlockRow, refDate);
}

/**
 * Toggles completed status of a planner block.
 */
export async function toggleBlockCompleted(
  blockId: string,
  userId: string,
  completed: boolean,
  refDate: Date = new Date()
): Promise<PlannerTimeBlock> {
  if (!userId || !blockId) throw new Error('Missing parameter for toggleBlockCompleted');

  const { data, error } = await supabase
    .from('planner_blocks')
    .update({
      completed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blockId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Daylight plannerService] toggleBlockCompleted error:', error);
    throw error;
  }

  return mapPlannerBlockFromDb(data as PlannerBlockRow, refDate);
}

/**
 * Deletes a planner block from public.planner_blocks.
 */
export async function deletePlannerBlock(blockId: string, userId: string): Promise<void> {
  if (!userId || !blockId) throw new Error('Missing parameter for deletePlannerBlock');

  const { error } = await supabase
    .from('planner_blocks')
    .delete()
    .eq('id', blockId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Daylight plannerService] deletePlannerBlock error:', error);
    throw error;
  }
}

export const plannerService = {
  fetchBlocksForDate,
  fetchBlocksForDateRange,
  createPlannerBlock,
  updatePlannerBlock,
  toggleBlockCompleted,
  deletePlannerBlock,
  parseTimeToMinutes,
  formatTimeToDb,
  formatDbTimeToDisplay,
  isBlockCurrent,
  validateTimeOrder,
  mapPlannerBlockFromDb,
};
