import { supabase } from '../lib/supabaseClient';
import { FocusSession, PomodoroMode } from '../types';

/**
 * PostgreSQL public.focus_sessions table row
 */
export interface FocusSessionRow {
  id: string;
  user_id: string;
  associated_task_id: string | null;
  mode: PomodoroMode;
  duration_minutes: number;
  completed_at: string;
  created_at: string;
}

/**
 * Input for creating a new focus session in PostgreSQL
 */
export interface CreateFocusSessionInput {
  mode: PomodoroMode;
  durationMinutes: number;
  associatedTaskId?: string | null;
  completedAt?: string;
}

/**
 * Maps a database FocusSessionRow to the application FocusSession model
 */
export function mapFocusSessionFromDb(row: FocusSessionRow): FocusSession {
  return {
    id: row.id,
    mode: row.mode,
    durationMinutes: row.duration_minutes,
    completedAt: row.completed_at,
    associatedTaskId: row.associated_task_id ?? undefined,
  };
}

/**
 * Formats session completed date into human-friendly time and date
 */
export function formatSessionTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Loads all completed focus sessions for the authenticated user, ordered by completed_at DESC.
 * Enforces explicit .eq('user_id', userId) alongside Row Level Security.
 */
export async function fetchFocusSessions(userId: string): Promise<FocusSession[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('[Daylight focusService] fetchFocusSessions error:', error);
    throw error;
  }

  return (data as FocusSessionRow[]).map(mapFocusSessionFromDb);
}

/**
 * Inserts a newly completed session into public.focus_sessions.
 * Omits id so PostgreSQL generates a real UUID with gen_random_uuid().
 * Enforces duration_minutes > 0 and valid mode check.
 * Table grants: SELECT, INSERT, DELETE only.
 */
export async function recordFocusSession(
  userId: string,
  input: CreateFocusSessionInput
): Promise<FocusSession> {
  if (!userId) throw new Error('Cannot record focus session: missing authenticated userId');
  if (input.durationMinutes <= 0) {
    throw new Error('Focus session duration must be greater than 0 minutes');
  }

  const payload = {
    user_id: userId,
    mode: input.mode,
    duration_minutes: input.durationMinutes,
    associated_task_id: input.associatedTaskId || null,
    completed_at: input.completedAt || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('focus_sessions')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Daylight focusService] recordFocusSession error:', error);
    throw error;
  }

  return mapFocusSessionFromDb(data as FocusSessionRow);
}

/**
 * Deletes a focus session from public.focus_sessions with explicit user_id scoping.
 */
export async function deleteFocusSession(sessionId: string, userId: string): Promise<void> {
  if (!userId || !sessionId) throw new Error('Missing parameter for deleteFocusSession');

  const { error } = await supabase
    .from('focus_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Daylight focusService] deleteFocusSession error:', error);
    throw error;
  }
}

export const focusService = {
  fetchFocusSessions,
  recordFocusSession,
  deleteFocusSession,
  mapFocusSessionFromDb,
  formatSessionTime,
};
