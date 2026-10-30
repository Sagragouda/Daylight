import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { Note } from '../types';
import {
  noteService,
  CreateNoteInput,
  UpdateNoteInput,
  sortNotes,
} from '../services/noteService';
import { useAuth } from './AuthContext';
import { sound } from '../utils/sound';

export interface NoteContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (input: CreateNoteInput) => Promise<Note | null>;
  addNote: (input: CreateNoteInput) => Promise<Note | null>;
  updateNote: (id: string, updates: UpdateNoteInput) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  totalNotesCount: number;
  pinnedNotesCount: number;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to the current notes to avoid stale closures in rollback logic
  const notesRef = useRef<Note[]>(notes);
  notesRef.current = notes;

  // Track active fetch requests to ignore stale async responses from previous sessions
  useEffect(() => {
    let isCurrent = true;

    // While Auth is initializing, stay in loading state
    if (authLoading) {
      return;
    }

    // Unauthenticated user: immediately clear notes from memory
    if (!user) {
      setNotes([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Authenticated user: load notes from Supabase PostgreSQL
    setLoading(true);
    setError(null);

    noteService
      .fetchNotes(user.id)
      .then((loadedNotes) => {
        if (!isCurrent) return;
        setNotes(sortNotes(loadedNotes));
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('[Daylight NoteContext] Failed to load notes from Supabase:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notes');
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [user?.id, authLoading]);

  // Explicit refresh helper
  const refreshNotes = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    try {
      setError(null);
      const reloaded = await noteService.fetchNotes(user.id);
      setNotes(sortNotes(reloaded));
    } catch (err) {
      console.error('[Daylight NoteContext] Failed to refresh notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh notes');
    }
  }, [user?.id]);

  // Create Note with real PostgreSQL UUID
  const createNote = useCallback(
    async (input: CreateNoteInput): Promise<Note | null> => {
      if (!user?.id) {
        console.warn('[Daylight NoteContext] Cannot create note: No authenticated user');
        setError('You must be signed in to create notes');
        return null;
      }

      try {
        setError(null);
        const created = await noteService.createNote(user.id, input);

        // Prepend and sort notes
        setNotes((prev) => sortNotes([created, ...prev]));
        sound.playTaskComplete();
        return created;
      } catch (err) {
        console.error('[Daylight NoteContext] Failed to create note:', err);
        setError(err instanceof Error ? err.message : 'Failed to create note');
        throw err;
      }
    },
    [user?.id]
  );

  // Alias for backward compatibility
  const addNote = createNote;

  // Update Note with optimistic update and rollback
  const updateNote = useCallback(
    async (id: string, updates: UpdateNoteInput): Promise<Note | null> => {
      if (!user?.id) {
        console.warn('[Daylight NoteContext] Cannot update note: No authenticated user');
        setError('You must be signed in to update notes');
        return null;
      }

      const previousNotes = notesRef.current;
      const targetNote = previousNotes.find((n) => n.id === id);

      if (!targetNote) {
        console.warn(`[Daylight NoteContext] Note with id ${id} not found in state`);
        return null;
      }

      // Optimistic update
      const optimisticNote: Note = {
        ...targetNote,
        title: updates.title !== undefined ? updates.title : targetNote.title,
        content: updates.content !== undefined ? updates.content : targetNote.content,
        category: updates.category !== undefined ? updates.category : targetNote.category,
        isPinned: updates.isPinned !== undefined ? updates.isPinned : targetNote.isPinned,
        colorAccent: updates.colorAccent !== undefined ? updates.colorAccent : targetNote.colorAccent,
        updatedAt: new Date().toISOString(),
      };

      setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? optimisticNote : n))));

      try {
        setError(null);
        const updated = await noteService.updateNote(id, user.id, updates);

        // Sync with verified database response
        setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? updated : n))));
        return updated;
      } catch (err) {
        console.error('[Daylight NoteContext] Failed to update note, rolling back:', err);
        setNotes(previousNotes);
        setError(err instanceof Error ? err.message : 'Failed to update note');
        throw err;
      }
    },
    [user?.id]
  );

  // Toggle Pin with optimistic update and rollback
  const togglePin = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        console.warn('[Daylight NoteContext] Cannot toggle pin: No authenticated user');
        return;
      }

      const previousNotes = notesRef.current;
      const targetNote = previousNotes.find((n) => n.id === id);
      if (!targetNote) return;

      sound.playClick();
      const newPinned = !targetNote.isPinned;

      // Optimistic re-sort
      setNotes((prev) =>
        sortNotes(prev.map((n) => (n.id === id ? { ...n, isPinned: newPinned } : n)))
      );

      try {
        setError(null);
        const updated = await noteService.togglePinNote(id, user.id, newPinned);
        setNotes((prev) => sortNotes(prev.map((n) => (n.id === id ? updated : n))));
      } catch (err) {
        console.error('[Daylight NoteContext] Failed to toggle pin, rolling back:', err);
        setNotes(previousNotes);
        setError(err instanceof Error ? err.message : 'Failed to pin/unpin note');
      }
    },
    [user?.id]
  );

  // Delete Note with optimistic update and rollback
  const deleteNote = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) {
        console.warn('[Daylight NoteContext] Cannot delete note: No authenticated user');
        return;
      }

      const previousNotes = notesRef.current;
      sound.playClick();

      // Optimistic removal
      setNotes((prev) => prev.filter((n) => n.id !== id));

      try {
        setError(null);
        await noteService.deleteNote(id, user.id);
      } catch (err) {
        console.error('[Daylight NoteContext] Failed to delete note, rolling back:', err);
        setNotes(previousNotes);
        setError(err instanceof Error ? err.message : 'Failed to delete note');
      }
    },
    [user?.id]
  );

  const totalNotesCount = notes.length;
  const pinnedNotesCount = useMemo(() => notes.filter((n) => n.isPinned).length, [notes]);

  return (
    <NoteContext.Provider
      value={{
        notes,
        loading,
        error,
        createNote,
        addNote,
        updateNote,
        deleteNote,
        togglePin,
        refreshNotes,
        totalNotesCount,
        pinnedNotesCount,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};
