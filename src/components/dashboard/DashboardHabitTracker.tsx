import React from 'react';
import { Card } from '../common/Card';
import { useHabits } from '../../context/HabitContext';
import { Check, Flame, Plus, Sparkles, Droplets, BookOpen, Activity } from 'lucide-react';
import { getPastSevenDays } from '../../utils/date';
import { Link } from 'react-router-dom';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
};

interface DashboardHabitTrackerProps {
  onOpenNewHabitModal?: () => void;
}

export const DashboardHabitTracker: React.FC<DashboardHabitTrackerProps> = ({ onOpenNewHabitModal }) => {
  const { habits, toggleHabitToday, isHabitDoneToday } = useHabits();
  const pastSevenDays = getPastSevenDays();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] dark:border-white/[0.08] mb-4">
        <div>
          <h3 className="font-semibold text-lg text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            Habit Consistency
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200/60 dark:border-amber-800/40">
              Daily
            </span>
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#98989f]">
            Compound small actions into identity
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenNewHabitModal && (
            <button
              onClick={onOpenNewHabitModal}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[#86868b] dark:text-[#98989f] hover:text-[#0071e3] dark:hover:text-[#2997ff] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              title="Add new habit"
              aria-label="Add new habit"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <Link
            to="/habits"
            className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const isDone = isHabitDoneToday(habit);
          const icon = ICON_MAP[habit.iconName] || <Flame className="w-4 h-4" />;

          return (
            <div
              key={habit.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-[#fbfbfd] dark:bg-[#1a1c27] border border-black/[0.04] dark:border-white/[0.06] hover:border-black/[0.1] dark:hover:border-white/[0.14] transition-all gap-3"
            >
              <div className="flex items-center gap-3">
                {/* One-tap check-in button */}
                <button
                  type="button"
                  onClick={() => toggleHabitToday(habit.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-xs scale-105 micro-bounce'
                      : 'bg-white dark:bg-[#14151e] border border-black/[0.1] dark:border-white/[0.15] text-[#86868b] dark:text-[#98989f] hover:border-[#0071e3] hover:text-[#0071e3] dark:hover:border-[#2997ff] dark:hover:text-[#2997ff]'
                  }`}
                  aria-label={isDone ? 'Mark habit undone' : 'Mark habit done today'}
                >
                  {isDone ? <Check className="w-5 h-5 stroke-[2.5]" /> : icon}
                </button>

                <div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                    {habit.name}
                    {habit.streak > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/40">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {habit.streak}d
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-[#86868b] dark:text-[#98989f]">
                    {habit.category} • {habit.frequency}
                  </p>
                </div>
              </div>

              {/* Past 7-day consistency dots */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                {pastSevenDays.map((day) => {
                  const dayDone = habit.completedDates.includes(day.dateStr);
                  return (
                    <div
                      key={day.dateStr}
                      className="flex flex-col items-center gap-1"
                      title={`${day.dateStr}: ${dayDone ? 'Completed' : 'Missed'}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-medium transition-colors ${
                          dayDone
                            ? 'bg-[#0071e3] dark:bg-[#2997ff] text-white font-bold shadow-xs'
                            : day.isToday
                            ? 'border-2 border-dashed border-[#0071e3]/40 dark:border-[#2997ff]/40 text-[#86868b]'
                            : 'bg-[#f0f0f4] dark:bg-white/[0.08] text-[#86868b] dark:text-[#98989f]'
                        }`}
                      >
                        {dayDone && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <span className="text-[9px] text-[#86868b] dark:text-[#98989f] uppercase font-semibold">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
