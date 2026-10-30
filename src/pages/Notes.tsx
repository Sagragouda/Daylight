import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { initialNotes } from '../utils/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { Note } from '../types';
import { Plus, Pin, Trash2, Search, Sparkles, FileText } from 'lucide-react';

const STORAGE_KEY = 'daylight_notes_v1';

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    return loadFromStorage<Note[]>(STORAGE_KEY, initialNotes);
  });

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Thoughts');

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: category.trim() || 'General',
      updatedAt: 'Just now',
      isPinned: false,
      colorAccent: 'border-l-[#0071e3] dark:border-l-[#2997ff]',
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveToStorage(STORAGE_KEY, updated);

    setTitle('');
    setContent('');
    setIsModalOpen(false);
  };

  const togglePin = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    setNotes(updated);
    saveToStorage(STORAGE_KEY, updated);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveToStorage(STORAGE_KEY, updated);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
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
          onClick={() => setIsModalOpen(true)}
          size="md"
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          New Note
        </Button>
      </div>

      {/* Search Input */}
      <Card className="p-4 sm:p-5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#86868b] dark:text-[#98989f]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search through notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1a1c27] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition-all placeholder:text-[#86868b] dark:placeholder:text-[#686872]"
          />
        </div>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              hoverable
              className={`p-5 flex flex-col justify-between border-l-4 ${
                note.colorAccent || 'border-l-[#0071e3] dark:border-l-[#2997ff]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-[#86868b] dark:text-[#98989f] uppercase tracking-wider">
                    {note.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(note.id)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                        note.isPinned
                          ? 'text-[#0071e3] dark:text-[#2997ff] bg-blue-50 dark:bg-blue-950/60'
                          : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                      aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
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
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868b] dark:text-[#98989f]">
                <span>{note.updatedAt}</span>
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
            No notes found
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-1 max-w-sm mx-auto">
            {search ? 'Try clearing your search query.' : 'Capture your first quick note or insight.'}
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="mt-4 shadow-xs">
            Create New Note
          </Button>
        </Card>
      )}

      {/* New Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Capture New Note"
        subtitle="Free your mind from cognitive clutter."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts..."
              className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Philosophy, Engineering, Inspiration, etc."
              className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
