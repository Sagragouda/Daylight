import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useHabits } from '../context/HabitContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { getPastSevenDays } from '../utils/date';
import { Flame, Plus, Check, Trash2, Sparkles, Droplets, BookOpen, Activity, Award } from 'lucide-react';

interface OutletContextType {
  openHabitModal: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5" />,
  Droplets: <Droplets className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
};

export const Habits: React.FC = () => {
  const { openHabitModal } = useOutletContext<OutletContextType>();
  const {
    habits,
    toggleHabitToday,
    deleteHabit,
    todayCompletedCount,
    totalHabitsCount,
    habitProgressPercentage,
    isHabitDoneToday,
  } = useHabits();

  const pastSevenDays = getPastSevenDays();

  // Find highest streak
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Habits & Routines
          </h1>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989f] mt-1">
            Build unshakeable daily momentum through small, consistent rituals.
          </p>
        </div>

        <Button
          onClick={openHabitModal}
          size="md"
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          New Habit
        </Button>
      </div>

      {/* Habit Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              Best Streak
            </p>
            <p className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={bestStreak} suffix=" Days" />
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0 shadow-xs">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              Done Today
            </p>
            <p className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={todayCompletedCount} />
              <span className="text-lg font-normal text-[#86868b] dark:text-[#98989f]">
                /{totalHabitsCount}
              </span>
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0071e3] dark:text-[#2997ff] border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              Adherence
            </p>
            <p className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={habitProgressPercentage} suffix="%" />
            </p>
            <ProgressBar progress={habitProgressPercentage} size="sm" className="mt-1" />
          </div>
        </Card>
      </div>

      {/* Habit Cards List */}
      <div className="space-y-4">
        {habits.length > 0 ? (
          habits.map((habit) => {
            const isDone = isHabitDoneToday(habit);
            const icon = ICON_MAP[habit.iconName] || <Flame className="w-5 h-5" />;

            return (
              <Card
                key={habit.id}
                className="p-5 sm:p-6 transition-all hover:border-black/[0.12] dark:hover:border-white/[0.16]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Habit Info & Check-in */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleHabitToday(habit.id)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-xs scale-105 micro-bounce'
                          : 'bg-[#f5f5f7] dark:bg-[#1a1c27] border border-black/[0.08] dark:border-white/[0.1] text-[#6e6e73] dark:text-[#d2d2d7] hover:border-[#0071e3] hover:text-[#0071e3] dark:hover:border-[#2997ff] dark:hover:text-[#2997ff]'
                      }`}
                      title={isDone ? 'Mark as not done today' : 'Check in for today'}
                      aria-label={isDone ? 'Mark as not done today' : 'Check in for today'}
                    >
                      {isDone ? <Check className="w-6 h-6 stroke-[2.5]" /> : icon}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {habit.name}
                        </h3>
                        {habit.streak > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                            <Flame className="w-3.5 h-3.5 fill-amber-500" />
                            {habit.streak} day streak
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-0.5">
                        {habit.category} • Frequency: {habit.frequency}
                      </p>
                    </div>
                  </div>

                  {/* 7-day Matrix & Delete */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-black/[0.04] dark:border-white/[0.06]">
                    {/* Past 7 days badges */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full">
                      {pastSevenDays.map((day) => {
                        const completed = habit.completedDates.includes(day.dateStr);
                        return (
                          <div key={day.dateStr} className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-semibold text-[#86868b] dark:text-[#98989f] uppercase">
                              {day.label}
                            </span>
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                                completed
                                  ? 'bg-[#0071e3] dark:bg-[#2997ff] text-white shadow-xs'
                                  : day.isToday
                                  ? 'border-2 border-dashed border-[#0071e3]/40 dark:border-[#2997ff]/40 text-[#86868b]'
                                  : 'bg-[#f0f0f4] dark:bg-white/[0.06] text-[#86868b]/70 dark:text-[#98989f]/70'
                              }`}
                            >
                              {completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delete Habit */}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-[#86868b] dark:text-[#98989f] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete habit"
                      aria-label="Delete habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="text-center py-14 px-4 border-dashed">
            <Flame className="w-10 h-10 text-[#86868b] dark:text-[#98989f] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              No habits tracked yet
            </h3>
            <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-1 max-w-sm mx-auto">
              Start small by adding a simple daily habit like mindful reading or hydration.
            </p>
            <Button onClick={openHabitModal} size="sm" className="mt-4 shadow-xs">
              Create First Habit
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
