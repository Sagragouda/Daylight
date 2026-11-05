import React, { useState, useEffect } from 'react';
import {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  GoalCategory,
  GoalPriority,
  GoalTrackingType,
} from '../../types';
import { Modal } from '../common/Modal';
import {
  GOAL_ICON_OPTIONS,
  CATEGORY_CONFIG,
} from './goalIcons';
import {
  Layers,
  Plus,
  Trash2,
  Hash,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { getTodayDateString } from '../../utils/date';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    input: CreateGoalInput | UpdateGoalInput,
    initialMilestones?: string[]
  ) => Promise<void>;
  initialGoal?: Goal | null;
}

const CATEGORIES: GoalCategory[] = [
  'Personal',
  'Career',
  'Health & Fitness',
  'Learning',
  'Finance',
  'Projects',
  'Other',
];

const PRIORITIES: { id: GoalPriority; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'urgent', label: 'Urgent' },
];

const THEME_COLORS = [
  { id: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { id: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { id: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { id: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { id: 'rose', label: 'Rose', class: 'bg-rose-500' },
];

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialGoal,
}) => {
  const isEditing = Boolean(initialGoal);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Personal');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [trackingType, setTrackingType] = useState<GoalTrackingType>('milestone');
  const [targetValue, setTargetValue] = useState<string>('10');
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [unit, setUnit] = useState<string>('');
  const [manualProgress, setManualProgress] = useState<number>(0);
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('Target');
  const [color, setColor] = useState('blue');

  // Initial milestones list for creation mode
  const [initialMilestones, setInitialMilestones] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title || '');
      setDescription(initialGoal.description || '');
      setCategory(initialGoal.category || 'Personal');
      setPriority(initialGoal.priority || 'medium');
      setTrackingType(initialGoal.trackingType || 'milestone');
      setTargetValue(initialGoal.targetValue !== undefined ? String(initialGoal.targetValue) : '10');
      setCurrentValue(initialGoal.currentValue !== undefined ? String(initialGoal.currentValue) : '0');
      setUnit(initialGoal.unit || '');
      setManualProgress(initialGoal.manualProgress || 0);
      setStartDate(initialGoal.startDate || getTodayDateString());
      setTargetDate(initialGoal.targetDate || '');
      setIcon(initialGoal.icon || 'Target');
      setColor(initialGoal.color || 'blue');
      setInitialMilestones([]);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setPriority('medium');
      setTrackingType('milestone');
      setTargetValue('10');
      setCurrentValue('0');
      setUnit('');
      setManualProgress(0);
      setStartDate(getTodayDateString());
      setTargetDate('');
      setIcon('Target');
      setColor('blue');
      setInitialMilestones(['', '']);
    }
    setError(null);
  }, [initialGoal, isOpen]);

  const handleAddMilestoneField = () => {
    setInitialMilestones((prev) => [...prev, '']);
  };

  const handleMilestoneChange = (index: number, val: string) => {
    setInitialMilestones((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveMilestoneField = (index: number) => {
    setInitialMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: CreateGoalInput | UpdateGoalInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        trackingType,
        targetValue: trackingType === 'numeric' ? Number(targetValue) || 1 : undefined,
        currentValue: trackingType === 'numeric' ? Number(currentValue) || 0 : undefined,
        unit: trackingType === 'numeric' ? unit.trim() || undefined : undefined,
        manualProgress: trackingType === 'percentage' ? manualProgress : undefined,
        startDate,
        targetDate: targetDate || undefined,
        icon,
        color,
      };

      const milestonesFiltered = initialMilestones
        .map((m) => m.trim())
        .filter(Boolean);

      await onSubmit(payload, !isEditing ? milestonesFiltered : undefined);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Goal' : 'Create New Goal'}
      subtitle={
        isEditing
          ? 'Refine your milestones, target numbers, and deadline'
          : 'Set an ambitious target, divide into milestones, and build momentum'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
            Goal Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read 12 Books This Year, Master C++ & DSA, Run 5km"
            className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] focus:outline-hidden focus:border-[#0071e3] dark:focus:border-[#2997ff] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium"
          />
        </div>

        {/* Description / Motivation */}
        <div>
          <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
            Why It Matters (Optional Motivation)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does achieving this unlock for you? Why are you committed?"
            className="w-full px-4 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] focus:outline-hidden focus:border-[#0071e3] dark:focus:border-[#2997ff] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs resize-none"
          />
        </div>

        {/* Category Pills */}
        <div>
          <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const isSelected = category === cat;
              const CatIcon = cfg.icon;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? `${cfg.bgLight} ${cfg.bgDark} ${cfg.color} ${cfg.border} ring-2 ring-offset-1 ring-blue-500/50 font-bold shadow-xs`
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-[#98989f] hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority & Deadline Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all text-center ${
                    priority === p.id
                      ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 border-[#0071e3] text-[#0071e3] dark:text-[#2997ff]'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.08] text-[#6e6e73] dark:text-[#98989f]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              Target Deadline (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                value={targetDate}
                min={getTodayDateString()}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] focus:outline-hidden focus:border-[#0071e3] text-[#1d1d1f] dark:text-[#f5f5f7] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Tracking Type Tabs */}
        <div>
          <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
            Tracking Mode
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => setTrackingType('milestone')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                trackingType === 'milestone'
                  ? 'bg-white dark:bg-[#20212e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
                  : 'text-[#6e6e73] dark:text-[#98989f] hover:text-[#1d1d1f]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Milestones</span>
            </button>

            <button
              type="button"
              onClick={() => setTrackingType('numeric')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                trackingType === 'numeric'
                  ? 'bg-white dark:bg-[#20212e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
                  : 'text-[#6e6e73] dark:text-[#98989f] hover:text-[#1d1d1f]'
              }`}
            >
              <Hash className="w-3.5 h-3.5 text-emerald-500" />
              <span>Measurable</span>
            </button>

            <button
              type="button"
              onClick={() => setTrackingType('percentage')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                trackingType === 'percentage'
                  ? 'bg-white dark:bg-[#20212e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs'
                  : 'text-[#6e6e73] dark:text-[#98989f] hover:text-[#1d1d1f]'
              }`}
            >
              <Percent className="w-3.5 h-3.5 text-purple-500" />
              <span>Percentage</span>
            </button>
          </div>

          {/* Conditional Tracking Inputs */}
          {trackingType === 'numeric' && (
            <div className="grid grid-cols-3 gap-3 mt-3 p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1b26] border border-emerald-500/30 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                  Current
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1b26] border border-emerald-500/30 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                  Unit (e.g. books, ₹)
                </label>
                <input
                  type="text"
                  placeholder="books, km, ₹"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1b26] border border-emerald-500/30 text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {trackingType === 'percentage' && (
            <div className="mt-3 p-3 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-purple-700 dark:text-purple-300">
                  Initial Progress
                </span>
                <span className="font-extrabold text-purple-600 dark:text-purple-400">
                  {manualProgress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={manualProgress}
                onChange={(e) => setManualProgress(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Icon & Color Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              Goal Icon
            </label>
            <div className="grid grid-cols-8 gap-1.5 p-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08]">
              {GOAL_ICON_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = icon === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    title={opt.label}
                    onClick={() => setIcon(opt.id)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#0071e3] text-white shadow-xs scale-110'
                        : 'text-[#6e6e73] dark:text-[#98989f] hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              Theme Glow Color
            </label>
            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] h-[52px]">
              {THEME_COLORS.map((tc) => (
                <button
                  type="button"
                  key={tc.id}
                  onClick={() => setColor(tc.id)}
                  title={tc.label}
                  className={`w-7 h-7 rounded-full ${tc.class} transition-transform ${
                    color === tc.id
                      ? 'ring-2 ring-offset-2 ring-black dark:ring-white scale-110 shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Initial Milestones (Creation mode only) */}
        {!isEditing && (
          <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0071e3]" />
                Initial Milestones (Divide & Conquer)
              </label>
              <button
                type="button"
                onClick={handleAddMilestoneField}
                className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add Step
              </button>
            </div>

            <div className="space-y-2">
              {initialMilestones.map((ms, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#86868b] w-4 text-center">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={ms}
                    onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                    placeholder={`e.g. ${
                      idx === 0
                        ? 'Set up syllabus / reading list'
                        : idx === 1
                        ? 'Complete first 3 chapters'
                        : 'Review progress and final recap'
                    }`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#1d1d1f] dark:text-[#f5f5f7]"
                  />
                  {initialMilestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestoneField(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#6e6e73] dark:text-[#98989f] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071e3] to-[#a855f7] hover:opacity-95 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Save Changes'
              : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
