import React from 'react';
import { Card } from '../components/common/Card';
import { useTasks } from '../context/TaskContext';
import { useTimer } from '../context/TimerContext';
import { TrendingUp, Clock, Flame, Sparkles, Lightbulb } from 'lucide-react';

export const Insights: React.FC = () => {
  const { completedTasksCount, tasks } = useTasks();
  const { completedSessions } = useTimer();

  // Weekly productivity distribution (Simulated realistic dataset)
  const weeklyActivity = [
    { day: 'Mon', tasks: 6, focusMinutes: 75, rate: 85 },
    { day: 'Tue', tasks: 8, focusMinutes: 100, rate: 92 },
    { day: 'Wed', tasks: 5, focusMinutes: 50, rate: 70 },
    { day: 'Thu', tasks: 9, focusMinutes: 125, rate: 95 },
    { day: 'Fri', tasks: completedTasksCount + 4, focusMinutes: completedSessions * 25 + 50, rate: 88 },
    { day: 'Sat', tasks: 3, focusMinutes: 25, rate: 60 },
    { day: 'Sun', tasks: 4, focusMinutes: 50, rate: 75 },
  ];

  const maxTasks = 10;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
          Productivity Insights
        </h1>
        <p className="text-sm text-[#6e6e73] mt-1">
          Observe your cognitive rhythms, habit consistency, and task velocity.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">Weekly Velocity</p>
            <p className="text-2xl font-bold text-[#1d1d1f]">39 Tasks</p>
            <span className="text-[11px] text-emerald-600 font-semibold">+18% vs last week</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">Total Deep Focus</p>
            <p className="text-2xl font-bold text-[#1d1d1f]">{completedSessions * 25 + 320}m</p>
            <span className="text-[11px] text-indigo-600 font-semibold">14 Pomodoro blocks</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">Habit Consistency</p>
            <p className="text-2xl font-bold text-[#1d1d1f]">91%</p>
            <span className="text-[11px] text-amber-600 font-semibold">Consistent 4-week streak</span>
          </div>
        </Card>
      </div>

      {/* Weekly Activity Bar Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] mb-6">
          <div>
            <h3 className="font-semibold text-lg text-[#1d1d1f]">Weekly Output Rhythm</h3>
            <p className="text-xs text-[#86868b]">Task volume and completion frequency per day</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-[#1d1d1f]">
              <span className="w-3 h-3 rounded-md bg-[#0071e3]" /> Tasks Completed
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-56 flex items-end justify-between gap-2.5 sm:gap-6 pt-6 px-1 sm:px-4 relative">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-x-0 top-6 border-b border-dashed border-black/[0.05]" />
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-black/[0.05]" />

          {weeklyActivity.map((item) => {
            const heightPercent = Math.min(100, Math.round((item.tasks / maxTasks) * 100));
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end z-10">
                {/* Tooltip on hover */}
                <span className="text-[10px] font-bold text-[#0071e3] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.tasks}
                </span>

                {/* Animated bar */}
                <div className="w-full max-w-[44px] bg-[#f0f0f4] rounded-xl overflow-hidden h-40 flex items-end shadow-xs">
                  <div
                    className="w-full bg-[#0071e3] rounded-xl transition-all duration-700 ease-out group-hover:bg-[#0062c4]"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <span className="text-xs font-semibold text-[#86868b] uppercase">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Categories & Mindful Reflections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold text-base text-[#1d1d1f] mb-1">
            Focus Distribution by Category
          </h3>
          <p className="text-xs text-[#86868b] mb-4">Where your creative attention went</p>

          <div className="space-y-3.5">
            {Object.entries(categoryCounts).length > 0 ? (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = Math.round((count / (tasks.length || 1)) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center text-xs font-medium mb-1">
                      <span className="text-[#1d1d1f] font-semibold">{cat}</span>
                      <span className="text-[#86868b]">{count} tasks ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#f0f0f4] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0071e3] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#86868b]">No task categories recorded yet.</p>
            )}
          </div>
        </Card>

        {/* Cognitive Insights Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0071e3] mb-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold text-base text-[#1d1d1f]">Daylight Cognitive Insight</h3>
            </div>
            <p className="text-sm text-[#515154] leading-relaxed">
              Your peak focus window occurs between <strong>09:00 AM and 11:30 AM</strong>.
              Scheduling high-priority cognitive challenges during this morning window yields an estimated <strong>35% higher throughput</strong>.
            </p>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-[#0071e3] font-medium">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-[#0071e3]" />
            <p className="leading-relaxed">
              <strong>Recommendation:</strong> Keep your afternoon reserved for lower-friction tasks, syncs, and habit check-ins.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
