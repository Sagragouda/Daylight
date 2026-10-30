import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { usePlanner } from '../context/PlannerContext';
import { PlannerTimeBlock } from '../types';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Trash2,
  Pencil,
  RotateCw,
  Check,
} from 'lucide-react';
import {
  formatPlannerDate,
  formatPlannerWeekRange,
  getTodayDateString,
  getLocalDateString,
} from '../utils/date';
import { getWeekBounds } from '../context/PlannerContext';

const COLOR_PRESETS = [
  {
    name: 'Blue',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40',
    indicatorClass: 'bg-[#0071e3]',
  },
  {
    name: 'Indigo',
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/40',
    indicatorClass: 'bg-indigo-600',
  },
  {
    name: 'Emerald',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40',
    indicatorClass: 'bg-emerald-500',
  },
  {
    name: 'Amber',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40',
    indicatorClass: 'bg-amber-500',
  },
  {
    name: 'Purple',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40',
    indicatorClass: 'bg-purple-600',
  },
  {
    name: 'Slate',
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/40',
    indicatorClass: 'bg-slate-500',
  },
];

const SUGGESTED_CATEGORIES = ['Focus', 'Planning', 'Team', 'Personal', 'Wrap-up', 'Health'];

export const Planner: React.FC = () => {
  const {
    blocks,
    loading,
    error,
    selectedDate,
    viewMode,
    setSelectedDate,
    setViewMode,
    createBlock,
    updateBlock,
    toggleCompleted,
    deleteBlock,
    refreshBlocks,
    goToPrevious,
    goToNext,
    goToToday,
    totalBlocksCount,
  } = usePlanner();

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDate, setCreateDate] = useState(selectedDate);
  const [createStartTime, setCreateStartTime] = useState('09:00 AM');
  const [createEndTime, setCreateEndTime] = useState('10:00 AM');
  const [createCategory, setCreateCategory] = useState('Focus');
  const [createColor, setCreateColor] = useState(COLOR_PRESETS[0].colorClass);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createModalError, setCreateModalError] = useState<string | null>(null);

  // Edit Modal State
  const [editingBlock, setEditingBlock] = useState<PlannerTimeBlock | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  // Week bounds
  const { startOfWeek, endOfWeek } = useMemo(() => getWeekBounds(selectedDate), [selectedDate]);

  // 7-day strip for weekly navigation
  const weekDays = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const current = new Date(year, month - 1, day);
    const dayOfWeek = current.getDay();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(year, month - 1, day - dayOfWeek + i);
      const dateStr = getLocalDateString(d);
      days.push({
        dateStr,
        dayNum: d.getDate(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        count: blocks.filter((b) => b.scheduleDate === dateStr).length,
      });
    }
    return days;
  }, [selectedDate, todayStr, blocks]);

  // Open Create Modal pre-populated with active date
  const handleOpenCreateModal = () => {
    setCreateTitle('');
    setCreateDate(selectedDate);
    setCreateStartTime('09:00 AM');
    setCreateEndTime('10:00 AM');
    setCreateCategory('Focus');
    setCreateColor(COLOR_PRESETS[0].colorClass);
    setCreateModalError(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (block: PlannerTimeBlock) => {
    setEditingBlock(block);
    setEditTitle(block.title);
    setEditDate(block.scheduleDate || selectedDate);
    setEditStartTime(block.startTime);
    setEditEndTime(block.endTime);
    setEditCategory(block.category);
    setEditColor(block.color || COLOR_PRESETS[0].colorClass);
    setEditModalError(null);
  };

  // Handle Create submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    setCreateSubmitting(true);
    setCreateModalError(null);

    try {
      await createBlock({
        title: createTitle.trim(),
        scheduleDate: createDate,
        startTime: createStartTime.trim(),
        endTime: createEndTime.trim(),
        category: createCategory.trim() || 'Focus',
        color: createColor,
        completed: false,
      });

      setIsCreateModalOpen(false);
    } catch (err) {
      setCreateModalError(err instanceof Error ? err.message : 'Failed to create block');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handle Edit submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock || !editTitle.trim()) return;

    setEditSubmitting(true);
    setEditModalError(null);

    try {
      await updateBlock(editingBlock.id, {
        title: editTitle.trim(),
        scheduleDate: editDate,
        startTime: editStartTime.trim(),
        endTime: editEndTime.trim(),
        category: editCategory.trim() || 'Focus',
        color: editColor,
      });

      setEditingBlock(null);
    } catch (err) {
      setEditModalError(err instanceof Error ? err.message : 'Failed to update block');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Handle Delete with confirmation
  const handleDeleteBlock = async (id: string) => {
    if (window.confirm('Delete this scheduled time block?')) {
      if (editingBlock?.id === id) {
        setEditingBlock(null);
      }
      await deleteBlock(id);
    }
  };

  // Group blocks by date in Week view
  const groupedBlocksByDate = useMemo(() => {
    if (viewMode === 'day') return null;

    const map = new Map<string, PlannerTimeBlock[]>();
    for (const d of weekDays) {
      map.set(d.dateStr, []);
    }
    for (const b of blocks) {
      const dateKey = b.scheduleDate || selectedDate;
      const list = map.get(dateKey);
      if (list) {
        list.push(b);
      } else {
        map.set(dateKey, [b]);
      }
    }
    return map;
  }, [viewMode, weekDays, blocks, selectedDate]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Daily Planner & Time Blocks
          </h1>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989f] mt-1">
            Structure your hours with intentional deep work sprints and deliberate rest.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          size="md"
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          Add Time Block
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
            onClick={() => refreshBlocks()}
            className="flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-300 hover:underline ml-4"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Date Navigation & View Mode Strip */}
      <Card hoverable glowColor="cyan" className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shadow-xs shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
              {viewMode === 'day'
                ? formatPlannerDate(selectedDate)
                : formatPlannerWeekRange(startOfWeek, endOfWeek)}
            </h3>
            <p className="text-xs text-[#86868b] dark:text-[#98989f]">
              {totalBlocksCount} {totalBlocksCount === 1 ? 'segment' : 'segments'} mapped
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
          {/* Day / Week View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#f0f0f4] dark:bg-white/[0.06] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-[#1f212f] text-[#0071e3] dark:text-[#2997ff] shadow-xs'
                  : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-[#1f212f] text-[#0071e3] dark:text-[#2997ff] shadow-xs'
                  : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              Week
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToPrevious}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[#86868b] dark:text-[#98989f] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] transition-colors"
              aria-label={viewMode === 'day' ? 'Previous day' : 'Previous week'}
              title={viewMode === 'day' ? 'Previous day' : 'Previous week'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={goToToday}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                isToday
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] border-blue-200/80 dark:border-blue-900/60'
                  : 'text-[#86868b] dark:text-[#98989f] border-black/[0.06] dark:border-white/[0.08] hover:text-[#0071e3] dark:hover:text-[#2997ff]'
              }`}
            >
              Today
            </button>

            <button
              onClick={goToNext}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[#86868b] dark:text-[#98989f] hover:bg-[#f5f5f7] dark:hover:bg-white/[0.06] transition-colors"
              aria-label={viewMode === 'day' ? 'Next day' : 'Next week'}
              title={viewMode === 'day' ? 'Next day' : 'Next week'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* 7-Day Week Bar in Week View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((d) => (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => {
                setSelectedDate(d.dateStr);
              }}
              className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all ${
                d.isSelected
                  ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                  : d.isToday
                  ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#0071e3]/40 text-[#0071e3] dark:text-[#2997ff]'
                  : 'bg-white dark:bg-[#14151e] border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-black/[0.14] dark:hover:border-white/[0.14]'
              }`}
            >
              <span className={`block text-[10px] font-semibold uppercase ${d.isSelected ? 'text-white/80' : 'text-[#86868b] dark:text-[#98989f]'}`}>
                {d.weekday}
              </span>
              <span className="block text-sm sm:text-base font-bold mt-0.5">
                {d.dayNum}
              </span>
              {d.count > 0 && (
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mt-1 ${
                    d.isSelected ? 'bg-white' : 'bg-[#0071e3] dark:bg-[#2997ff]'
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && blocks.length === 0 ? (
        <div className="space-y-3.5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 sm:p-5 animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/10 dark:bg-white/10 shrink-0" />
                <div className="space-y-2">
                  <div className="w-36 h-3 bg-black/10 dark:bg-white/10 rounded-full" />
                  <div className="w-56 h-4 bg-black/10 dark:bg-white/10 rounded-full" />
                </div>
              </div>
              <div className="w-20 h-8 rounded-xl bg-black/10 dark:bg-white/10" />
            </Card>
          ))}
        </div>
      ) : viewMode === 'day' ? (
        /* Day View Timeline */
        blocks.length > 0 ? (
          <div className="space-y-3.5">
            {blocks.map((block) => (
              <div
                key={block.id}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  block.isCurrent
                    ? 'bg-blue-50/40 dark:bg-blue-950/30 border-[#0071e3]/40 dark:border-[#2997ff]/40 shadow-sm ring-1 ring-[#0071e3]/30'
                    : 'bg-white dark:bg-[#14151e] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.16] shadow-xs'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] dark:bg-white/[0.06] flex flex-col items-center justify-center shrink-0 border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                    <Clock className="w-4 h-4 text-[#86868b] dark:text-[#98989f]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#0071e3] dark:text-[#2997ff]">
                        {block.startTime} – {block.endTime}
                      </span>
                      {block.isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3] dark:bg-[#2997ff] text-white shadow-xs">
                          <Sparkles className="w-2.5 h-2.5" /> In Progress
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-base font-semibold mt-0.5 ${
                        block.completed
                          ? 'line-through text-[#86868b] dark:text-[#686872]'
                          : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
                      }`}
                    >
                      {block.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          block.color || 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {block.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(block)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                    title="Edit block"
                    aria-label="Edit block"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(block.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-[#86868b] dark:text-[#98989f] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete block"
                    aria-label="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Button
                    variant={block.completed ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => toggleCompleted(block.id)}
                    icon={<CheckCircle className="w-3.5 h-3.5" />}
                  >
                    {block.completed ? 'Done' : 'Mark Done'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-14 px-4 border-dashed">
            <Clock className="w-10 h-10 text-[#86868b] dark:text-[#98989f] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              No schedule segments mapped for this date
            </h3>
            <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-1 max-w-sm mx-auto">
              Carve out intentional blocks for deep work sprints, team collaboration, and deliberate rest.
            </p>
            <Button onClick={handleOpenCreateModal} size="sm" className="mt-4 shadow-xs">
              Add First Block
            </Button>
          </Card>
        )
      ) : (
        /* Week View Timeline */
        groupedBlocksByDate && (
          <div className="space-y-6">
            {weekDays.map((d) => {
              const dayBlocks = groupedBlocksByDate.get(d.dateStr) || [];
              return (
                <div key={d.dateStr} className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] flex items-center gap-2">
                      <span>{d.weekday}, {formatPlannerDate(d.dateStr)}</span>
                      {d.isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0071e3] dark:text-[#2997ff]">
                          Today
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-[#86868b]">
                      {dayBlocks.length} {dayBlocks.length === 1 ? 'block' : 'blocks'}
                    </span>
                  </div>

                  {dayBlocks.length > 0 ? (
                    <div className="space-y-2.5">
                      {dayBlocks.map((block) => (
                        <div
                          key={block.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            block.isCurrent
                              ? 'bg-blue-50/40 dark:bg-blue-950/30 border-[#0071e3]/40 dark:border-[#2997ff]/40 shadow-sm'
                              : 'bg-white dark:bg-[#14151e] border-black/[0.06] dark:border-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-[#86868b] shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-[#0071e3] dark:text-[#2997ff]">
                                  {block.startTime} – {block.endTime}
                                </span>
                                {block.isCurrent && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#0071e3] text-white">
                                    In Progress
                                  </span>
                                )}
                              </div>
                              <h5
                                className={`text-sm font-semibold mt-0.5 ${
                                  block.completed ? 'line-through text-[#86868b]' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
                                }`}
                              >
                                {block.title}
                              </h5>
                              <span
                                className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.2 rounded-md border ${
                                  block.color || 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {block.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(block)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBlock(block.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#86868b] hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <Button
                              variant={block.completed ? 'secondary' : 'primary'}
                              size="sm"
                              onClick={() => toggleCompleted(block.id)}
                            >
                              {block.completed ? 'Done' : 'Mark Done'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-black/[0.06] dark:border-white/[0.08] text-center text-xs text-[#86868b]">
                      No blocks scheduled
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Add Time Block Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New Planner Time Block"
        subtitle="Carve out intentional blocks for your calendar."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createModalError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{createModalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
              Block Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="e.g. Deep Work: System Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
              Schedule Date
            </label>
            <input
              type="date"
              required
              value={createDate}
              onChange={(e) => setCreateDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                Start Time
              </label>
              <input
                type="text"
                required
                value={createStartTime}
                onChange={(e) => setCreateStartTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                End Time
              </label>
              <input
                type="text"
                required
                value={createEndTime}
                onChange={(e) => setCreateEndTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={createCategory}
                onChange={(e) => setCreateCategory(e.target.value)}
                placeholder="Focus, Team, Personal..."
                list="planner-categories"
                className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
              <datalist id="planner-categories">
                {SUGGESTED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                Color Accent
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setCreateColor(p.colorClass)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                      p.indicatorClass
                    } ${
                      createColor === p.colorClass
                        ? 'ring-2 ring-offset-2 ring-[#0071e3] scale-110 shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={p.name}
                  >
                    {createColor === p.colorClass && (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    )}
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
            >
              {createSubmitting ? 'Saving...' : 'Save Block'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Time Block Modal */}
      {editingBlock && (
        <Modal
          isOpen={true}
          onClose={() => setEditingBlock(null)}
          title="Edit Planner Block"
          subtitle="Update schedule details or re-align times."
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editModalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{editModalError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                Block Title
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                Schedule Date
              </label>
              <input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                  Start Time
                </label>
                <input
                  type="text"
                  required
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                  End Time
                </label>
                <input
                  type="text"
                  required
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  list="edit-planner-categories"
                  className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1f212f] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                />
                <datalist id="edit-planner-categories">
                  {SUGGESTED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
                  Color Accent
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setEditColor(p.colorClass)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                        p.indicatorClass
                      } ${
                        editColor === p.colorClass
                          ? 'ring-2 ring-offset-2 ring-[#0071e3] scale-110 shadow-xs'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={p.name}
                    >
                      {editColor === p.colorClass && (
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => handleDeleteBlock(editingBlock.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBlock(null)}
                  disabled={editSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
