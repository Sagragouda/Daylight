import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useNotes } from '../context/NoteContext';
import { Note } from '../types';
import { formatNoteDate } from '../services/noteService';
import {
  Plus,
  Pin,
  Trash2,
  Search,
  Sparkles,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  X,
  RotateCw,
} from 'lucide-react';

const COLOR_ACCENTS = [
  {
    name: 'Blue',
    borderClass: 'border-l-[#0071e3] dark:border-l-[#2997ff]',
    indicatorClass: 'bg-[#0071e3] dark:bg-[#2997ff]',
  },
  {
    name: 'Emerald',
    borderClass: 'border-l-emerald-500 dark:border-l-emerald-400',
    indicatorClass: 'bg-emerald-500 dark:bg-emerald-400',
  },
  {
    name: 'Amber',
    borderClass: 'border-l-amber-500 dark:border-l-amber-400',
    indicatorClass: 'bg-amber-500 dark:bg-amber-400',
  },
  {
    name: 'Purple',
    borderClass: 'border-l-purple-500 dark:border-l-purple-400',
    indicatorClass: 'bg-purple-500 dark:bg-purple-400',
  },
  {
    name: 'Rose',
    borderClass: 'border-l-rose-500 dark:border-l-rose-400',
    indicatorClass: 'bg-rose-500 dark:bg-rose-400',
  },
  {
    name: 'Cyan',
    borderClass: 'border-l-cyan-500 dark:border-l-cyan-400',
    indicatorClass: 'bg-cyan-500 dark:bg-cyan-400',
  },
];

const SUGGESTED_CATEGORIES = ['Thoughts', 'Work', 'Personal', 'Ideas', 'Engineering', 'Reading'];

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const Notes: React.FC = () => {
  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    refreshNotes,
    totalNotesCount,
    pinnedNotesCount,
  } = useNotes();

  // Search state with debounced filtering
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  // Create Note Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [createCategory, setCreateCategory] = useState('Thoughts');
  const [createColor, setCreateColor] = useState(COLOR_ACCENTS[0].borderClass);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Active / Editing Note Modal state with Auto-Save
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftCategory, setDraftCategory] = useState('');
  const [draftColor, setDraftColor] = useState('');
  const [draftPinned, setDraftPinned] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // References for safe auto-save without stale closures
  const draftTitleRef = useRef(draftTitle);
  draftTitleRef.current = draftTitle;
  const draftContentRef = useRef(draftContent);
  draftContentRef.current = draftContent;
  const draftCategoryRef = useRef(draftCategory);
  draftCategoryRef.current = draftCategory;
  const draftColorRef = useRef(draftColor);
  draftColorRef.current = draftColor;
  const draftPinnedRef = useRef(draftPinned);
  draftPinnedRef.current = draftPinned;

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveSequenceRef = useRef(0);
  const lastSavedSnapshotRef = useRef<{
    title: string;
    content: string;
    category: string;
    colorAccent: string;
    isPinned: boolean;
  }>({
    title: '',
    content: '',
    category: '',
    colorAccent: '',
    isPinned: false,
  });

  // Client-side search across title, content, and category
  const filteredNotes = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }, [notes, debouncedSearch]);

  // Open note for viewing / editing
  const handleOpenNote = (note: Note) => {
    // Clear any pending save timer from previous note
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    setActiveNote(note);
    setDraftTitle(note.title);
    setDraftContent(note.content);
    setDraftCategory(note.category);
    setDraftColor(note.colorAccent || COLOR_ACCENTS[0].borderClass);
    setDraftPinned(note.isPinned ?? false);
    setSaveStatus('idle');

    lastSavedSnapshotRef.current = {
      title: note.title,
      content: note.content,
      category: note.category,
      colorAccent: note.colorAccent || COLOR_ACCENTS[0].borderClass,
      isPinned: note.isPinned ?? false,
    };
  };

  // Perform actual Supabase update with race-condition guard
  const performSave = useCallback(
    async (noteId: string): Promise<boolean> => {
      const currentSeq = ++saveSequenceRef.current;
      setSaveStatus('saving');

      const payload = {
        title: draftTitleRef.current.trim() || 'Untitled Note',
        content: draftContentRef.current,
        category: draftCategoryRef.current.trim() || 'Thoughts',
        colorAccent: draftColorRef.current,
        isPinned: draftPinnedRef.current,
      };

      try {
        const result = await updateNote(noteId, payload);
        if (saveSequenceRef.current === currentSeq) {
          if (result) {
            lastSavedSnapshotRef.current = {
              title: result.title,
              content: result.content,
              category: result.category,
              colorAccent: result.colorAccent || payload.colorAccent,
              isPinned: result.isPinned ?? false,
            };
          }
          setSaveStatus('saved');
        }
        return true;
      } catch (err) {
        if (saveSequenceRef.current === currentSeq) {
          console.error('[Daylight Notes] Auto-save error:', err);
          setSaveStatus('error');
        }
        return false;
      }
    },
    [updateNote]
  );

  // Trigger debounced auto-save whenever edits occur
  const scheduleAutoSave = useCallback(() => {
    if (!activeNote) return;

    // Check if edits actually differ from last saved snapshot
    const isDifferent =
      draftTitleRef.current !== lastSavedSnapshotRef.current.title ||
      draftContentRef.current !== lastSavedSnapshotRef.current.content ||
      draftCategoryRef.current !== lastSavedSnapshotRef.current.category ||
      draftColorRef.current !== lastSavedSnapshotRef.current.colorAccent ||
      draftPinnedRef.current !== lastSavedSnapshotRef.current.isPinned;

    if (!isDifferent) {
      return;
    }

    setSaveStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      performSave(activeNote.id);
    }, 650);
  }, [activeNote, performSave]);

  // Clean close of active note: flush any pending save first
  const handleCloseActiveNote = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (activeNote) {
      // Check if dirty
      const isDifferent =
        draftTitleRef.current !== lastSavedSnapshotRef.current.title ||
        draftContentRef.current !== lastSavedSnapshotRef.current.content ||
        draftCategoryRef.current !== lastSavedSnapshotRef.current.category ||
        draftColorRef.current !== lastSavedSnapshotRef.current.colorAccent ||
        draftPinnedRef.current !== lastSavedSnapshotRef.current.isPinned;

      if (isDifferent) {
        await performSave(activeNote.id);
      }
    }

    setActiveNote(null);
  };

  // Create new note submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    setCreateSubmitting(true);
    setCreateError(null);

    try {
      await createNote({
        title: createTitle.trim(),
        content: createContent.trim(),
        category: createCategory.trim() || 'Thoughts',
        colorAccent: createColor,
        isPinned: false,
      });

      setCreateTitle('');
      setCreateContent('');
      setCreateCategory('Thoughts');
      setCreateColor(COLOR_ACCENTS[0].borderClass);
      setIsCreateModalOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create note');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Safe delete handler with confirmation
  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      if (activeNote?.id === id) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        setActiveNote(null);
      }
      await deleteNote(id);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Quick Notes & Ideation
          </h1>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989f] mt-1">
            Capture thoughts, meeting briefs, and creative sparks before they fade.
          </p>
        </div>

        <Button
          onClick={() => {
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
          size="md"
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          New Note
        </Button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => refreshNotes()}
            className="flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-300 hover:underline ml-4"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Search & Metadata Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#86868b] dark:text-[#98989f]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search through notes by title, content, or category..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1a1c27] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition-all placeholder:text-[#86868b] dark:placeholder:text-[#686872]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="w-6 h-6 absolute right-2.5 top-3 flex items-center justify-center rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#86868b] dark:text-[#98989f] shrink-0 self-end sm:self-auto font-medium">
            <span>
              {totalNotesCount} {totalNotesCount === 1 ? 'note' : 'notes'}
            </span>
            {pinnedNotesCount > 0 && (
              <>
                <span>•</span>
                <span className="text-[#0071e3] dark:text-[#2997ff] flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" /> {pinnedNotesCount} pinned
                </span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Notes Grid / Loading / Empty State */}
      {loading && notes.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-5 animate-pulse border-l-4 border-l-black/10 dark:border-l-white/10 flex flex-col justify-between h-48">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-20 h-3 bg-black/10 dark:bg-white/10 rounded-full" />
                  <div className="w-6 h-6 bg-black/5 dark:bg-white/5 rounded-lg" />
                </div>
                <div className="w-44 h-4 bg-black/10 dark:bg-white/10 rounded-full" />
                <div className="space-y-1.5 pt-1">
                  <div className="w-full h-2.5 bg-black/5 dark:bg-white/5 rounded-full" />
                  <div className="w-5/6 h-2.5 bg-black/5 dark:bg-white/5 rounded-full" />
                  <div className="w-3/4 h-2.5 bg-black/5 dark:bg-white/5 rounded-full" />
                </div>
              </div>
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                <div className="w-16 h-2.5 bg-black/10 dark:bg-white/10 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              hoverable
              onClick={() => handleOpenNote(note)}
              className={`p-5 flex flex-col justify-between cursor-pointer border-l-4 transition-all hover:shadow-md ${
                note.colorAccent || 'border-l-[#0071e3] dark:border-l-[#2997ff]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-[#86868b] dark:text-[#98989f] uppercase tracking-wider bg-black/[0.03] dark:bg-white/[0.04] px-2 py-0.5 rounded-md">
                    {note.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(note.id);
                      }}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                        note.isPinned
                          ? 'text-[#0071e3] dark:text-[#2997ff] bg-blue-50 dark:bg-blue-950/60'
                          : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                      aria-label={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNote(e, note.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#86868b] dark:text-[#98989f] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7] mb-2 leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-[#515154] dark:text-[#d2d2d7] leading-relaxed line-clamp-4 whitespace-pre-wrap">
                  {note.content || <span className="italic text-[#86868b]">No additional content...</span>}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868b] dark:text-[#98989f]">
                <span>{formatNoteDate(note.updatedAt)}</span>
                {note.isPinned && (
                  <span className="font-semibold text-[#0071e3] dark:text-[#2997ff] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-14 px-4 border-dashed">
          <FileText className="w-10 h-10 text-[#86868b] dark:text-[#98989f] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {debouncedSearch ? 'No matching notes found' : 'No notes created yet'}
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-1 max-w-sm mx-auto">
            {debouncedSearch
              ? `No notes match "${debouncedSearch}". Try searching with a different term.`
              : 'Capture your first quick thought, meeting summary, or creative spark.'}
          </p>
          {debouncedSearch ? (
            <Button onClick={() => setSearch('')} variant="secondary" size="sm" className="mt-4 shadow-xs">
              Clear Search Filter
            </Button>
          ) : (
            <Button
              onClick={() => {
                setCreateError(null);
                setIsCreateModalOpen(true);
              }}
              size="sm"
              className="mt-4 shadow-xs"
            >
              Create First Note
            </Button>
          )}
        </Card>
      )}

      {/* Create New Note Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Capture New Note"
        subtitle="Free your mind from cognitive clutter."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="e.g. Design review takeaways"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
              Content
            </label>
            <textarea
              rows={5}
              value={createContent}
              onChange={(e) => setCreateContent(e.target.value)}
              placeholder="Write your thoughts..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={createCategory}
                onChange={(e) => setCreateCategory(e.target.value)}
                placeholder="Thoughts, Work, Ideas..."
                list="note-categories"
                className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
              <datalist id="note-categories">
                {SUGGESTED_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                Color Accent
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_ACCENTS.map((accent) => (
                  <button
                    key={accent.name}
                    type="button"
                    onClick={() => setCreateColor(accent.borderClass)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                      accent.indicatorClass
                    } ${
                      createColor === accent.borderClass
                        ? 'ring-2 ring-offset-2 ring-[#0071e3] scale-110 shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={accent.name}
                    aria-label={`Select ${accent.name} accent`}
                  >
                    {createColor === accent.borderClass && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={createSubmitting}
              icon={createSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {createSubmitting ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Note Modal with Safe Auto-Save */}
      {activeNote && (
        <Modal
          isOpen={true}
          onClose={handleCloseActiveNote}
          title="Edit Note"
          subtitle="Edits are automatically synced and saved."
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Auto-save status bar */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] text-xs">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1.5 font-semibold text-[#0071e3] dark:text-[#2997ff]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving changes...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" /> All changes saved
                </span>
              )}
              {saveStatus === 'error' && (
                <button
                  type="button"
                  onClick={() => performSave(activeNote.id)}
                  className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Save failed — Click to retry
                </button>
              )}
              {saveStatus === 'idle' && (
                <span className="text-[#86868b] dark:text-[#98989f]">
                  Last updated {formatNoteDate(activeNote.updatedAt)}
                </span>
              )}

              <span className="text-[11px] text-[#86868b] dark:text-[#98989f]">
                Auto-save active
              </span>
            </div>
            {/* Title & Pin control */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value);
                  draftTitleRef.current = e.target.value;
                  scheduleAutoSave();
                }}
                placeholder="Note Title"
                className="flex-1 font-semibold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] bg-transparent border-b border-black/[0.08] dark:border-white/[0.1] pb-1.5 focus:outline-none focus:border-[#0071e3] transition-colors"
              />

              <button
                type="button"
                onClick={() => {
                  const nextPinned = !draftPinned;
                  setDraftPinned(nextPinned);
                  draftPinnedRef.current = nextPinned;
                  scheduleAutoSave();
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  draftPinned
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] border-blue-200/80 dark:border-blue-900/60 shadow-xs'
                    : 'bg-[#fbfbfd] dark:bg-[#1a1c27] text-[#86868b] dark:text-[#98989f] border-black/[0.08] dark:border-white/[0.1] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
                title={draftPinned ? 'Unpin note' : 'Pin note'}
              >
                <Pin className={`w-3.5 h-3.5 ${draftPinned ? 'fill-current' : ''}`} />
                {draftPinned ? 'Pinned' : 'Pin'}
              </button>
            </div>

            {/* Content Textarea */}
            <div>
              <textarea
                rows={9}
                value={draftContent}
                onChange={(e) => {
                  setDraftContent(e.target.value);
                  draftContentRef.current = e.target.value;
                  scheduleAutoSave();
                }}
                placeholder="Start typing your note... Edits are safely auto-saved."
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 leading-relaxed"
              />
            </div>

            {/* Category and Color Customization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={draftCategory}
                  onChange={(e) => {
                    setDraftCategory(e.target.value);
                    draftCategoryRef.current = e.target.value;
                    scheduleAutoSave();
                  }}
                  placeholder="Category..."
                  list="edit-note-categories"
                  className="w-full px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 font-medium"
                />
                <datalist id="edit-note-categories">
                  {SUGGESTED_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1">
                  Border Accent
                </label>
                <div className="flex items-center gap-2 pt-0.5">
                  {COLOR_ACCENTS.map((accent) => (
                    <button
                      key={accent.name}
                      type="button"
                      onClick={() => {
                        setDraftColor(accent.borderClass);
                        draftColorRef.current = accent.borderClass;
                        scheduleAutoSave();
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                        accent.indicatorClass
                      } ${
                        draftColor === accent.borderClass
                          ? 'ring-2 ring-offset-2 ring-[#0071e3] scale-110 shadow-xs'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={accent.name}
                      aria-label={`Select ${accent.name} color`}
                    >
                      {draftColor === accent.borderClass && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={(e) => handleDeleteNote(e, activeNote.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Note
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleCloseActiveNote}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
