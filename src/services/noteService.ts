import { supabase } from '../lib/supabaseClient';
import { Note } from '../types';

/**
 * Database representation of a row in public.notes
 */
export interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  color_accent: string;
  created_at: string;
  updated_at: string;
}

/**
 * Input payload for creating a new note
 */
export interface CreateNoteInput {
  title: string;
  content?: string;
  category?: string;
  isPinned?: boolean;
  colorAccent?: string;
}

/**
 * Input payload for updating an existing note
 */
export interface UpdateNoteInput {
  title?: string;
  content?: string;
  category?: string;
  isPinned?: boolean;
  colorAccent?: string;
}

/**
 * Maps a database NoteRow to the application Note model.
 * Preserves updated_at as a valid ISO 8601 timestamp string for sorting and processing.
 */
export function mapNoteFromDb(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    updatedAt: row.updated_at,
    isPinned: row.is_pinned,
    colorAccent: row.color_accent,
  };
}

/**
 * Sorts notes: pinned notes first, then updated_at descending.
 */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    const timeA = new Date(a.updatedAt).getTime() || 0;
    const timeB = new Date(b.updatedAt).getTime() || 0;
    return timeB - timeA;
  });
}

/**
 * Formats an ISO date string into a user-friendly relative or local time format.
 * Returns display strings like "Just now", "5m ago", "Today, 4:15 PM", or "Oct 30".
 */
export function formatNoteDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Loads all notes for the authenticated user's UUID.
 * Orders pinned notes first, then by updated_at descending.
 * Uses explicit .eq('user_id', userId) alongside Row Level Security.
 */
export async function fetchNotes(userId: string): Promise<Note[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[Daylight noteService] fetchNotes error:', error);
    throw error;
  }

  return (data as NoteRow[]).map(mapNoteFromDb);
}

/**
 * Creates a new note in public.notes.
 * Omits id so PostgreSQL generates a real UUID with gen_random_uuid().
 */
export async function createNote(userId: string, input: CreateNoteInput): Promise<Note> {
  if (!userId) throw new Error('Cannot create note: missing authenticated userId');

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      title: input.title.trim(),
      content: input.content ?? '',
      category: input.category?.trim() || 'Thoughts',
      is_pinned: input.isPinned ?? false,
      color_accent: input.colorAccent || 'border-l-[#0071e3] dark:border-l-[#2997ff]',
    })
    .select()
    .single();

  if (error) {
    console.error('[Daylight noteService] createNote error:', error);
    throw error;
  }

  return mapNoteFromDb(data as NoteRow);
}

/**
 * Updates an existing note in public.notes with explicit user_id and noteId scoping.
 */
export async function updateNote(
  noteId: string,
  userId: string,
  updates: UpdateNoteInput
): Promise<Note> {
  if (!userId) throw new Error('Cannot update note: missing authenticated userId');
  if (!noteId) throw new Error('Cannot update note: missing noteId');

  const payload: Partial<{
    title: string;
    content: string;
    category: string;
    is_pinned: boolean;
    color_accent: string;
    updated_at: string;
  }> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.category !== undefined) payload.category = updates.category.trim();
  if (updates.isPinned !== undefined) payload.is_pinned = updates.isPinned;
  if (updates.colorAccent !== undefined) payload.color_accent = updates.colorAccent;

  const { data, error } = await supabase
    .from('notes')
    .update(payload)
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Daylight noteService] updateNote error:', error);
    throw error;
  }

  return mapNoteFromDb(data as NoteRow);
}

/**
 * Toggles a note's pinned status in public.notes.
 */
export async function togglePinNote(
  noteId: string,
  userId: string,
  isPinned: boolean
): Promise<Note> {
  if (!userId || !noteId) throw new Error('Missing parameter for togglePinNote');

  const { data, error } = await supabase
    .from('notes')
    .update({
      is_pinned: isPinned,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Daylight noteService] togglePinNote error:', error);
    throw error;
  }

  return mapNoteFromDb(data as NoteRow);
}

/**
 * Deletes a note from public.notes with explicit user_id and noteId scoping.
 */
export async function deleteNote(noteId: string, userId: string): Promise<void> {
  if (!userId || !noteId) throw new Error('Missing parameter for deleteNote');

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Daylight noteService] deleteNote error:', error);
    throw error;
  }
}

export const noteService = {
  fetchNotes,
  createNote,
  updateNote,
  togglePinNote,
  deleteNote,
  mapNoteFromDb,
  sortNotes,
  formatNoteDate,
};
