import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { useTasks } from '../context/TaskContext';
import { useTimer } from '../context/TimerContext';
import { useHabits } from '../context/HabitContext';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import {
  TrendingUp,
  Clock,
  Flame,
  Sparkles,
  Lightbulb,
  Target,
  CheckCircle2,
  Award,
  Zap,
} from 'lucide-react';

export const Insights: React.FC = () => {
  const { completedTasksCount, tasks, totalTasksCount } = useTasks();
  const { completedSessions, totalFocusMinutesToday } = useTimer();
  const { habitProgressPercentage, todayCompletedCount, totalHabitsCount } = useHabits();

  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Weekly productivity distribution
  const weeklyActivity = useMemo(() => [
    { day: 'Mon', tasks: 6, focusMinutes: 75 },
    { day: 'Tue', tasks: 8, focusMinutes: 100 },
    { day: 'Wed', tasks: 5, focusMinutes: 50 },
    { day: 'Thu', tasks: 9, focusMinutes: 125 },
    { day: 'Fri', tasks: completedTasksCount + 4, focusMinutes: completedSessions * 25 + 50 },
    { day: 'Sat', tasks: 3, focusMinutes: 25 },
    { day: 'Sun', tasks: 4, focusMinutes: 50 },
  ], [completedTasksCount, completedSessions]);

  const maxWeeklyTasks = 12;

  // Category counts
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      const cat = t.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const colors = [
      { stroke: '#0071e3', bg: 'bg-[#0071e3]', text: 'text-[#0071e3]' },
      { stroke: '#5e5ce6', bg: 'bg-[#5e5ce6]', text: 'text-[#5e5ce6]' },
      { stroke: '#10b981', bg: 'bg-[#10b981]', text: 'text-[#10b981]' },
      { stroke: '#ff9500', bg: 'bg-[#ff9500]', text: 'text-[#ff9500]' },
      { stroke: '#af52de', bg: 'bg-[#af52de]', text: 'text-[#af52de]' },
      { stroke: '#ff2d55', bg: 'bg-[#ff2d55]', text: 'text-[#ff2d55]' },
      { stroke: '#06b6d4', bg: 'bg-[#06b6d4]', text: 'text-[#06b6d4]' },
    ];

    const entries = Object.entries(counts);
    const total = tasks.length || 1;

    return entries.map(([name, count], index) => {
      const color = colors[index % colors.length];
      const percent = Math.round((count / total) * 100);
      return { name, count, percent, color };
    });
  }, [tasks]);

  const totalDeepFocusMinutes = completedSessions * 25 + 320;

  // Multi-Ring Activity Gauge Metrics
  const taskRingPct = Math.min(100, Math.round((completedTasksCount / Math.max(1, totalTasksCount || 6)) * 100));
  const habitRingPct = Math.min(100, Math.max(0, habitProgressPercentage || 85));
  const focusRingPct = Math.min(
    100,
    Math.round(((totalFocusMinutesToday || completedSessions * 25 || 50) / 100) * 100)
  );

  // SVG Geometry for Multi-Ring Gauge (viewBox 0 0 200 200, cx=100, cy=100)
  const ring1Radius = 80;
  const ring1Circ = 2 * Math.PI * ring1Radius; // ~502.65
  const ring1Offset = ring1Circ - (taskRingPct / 100) * ring1Circ;

  const ring2Radius = 62;
  const ring2Circ = 2 * Math.PI * ring2Radius; // ~389.56
  const ring2Offset = ring2Circ - (habitRingPct / 100) * ring2Circ;

  const ring3Radius = 44;
  const ring3Circ = 2 * Math.PI * ring3Radius; // ~276.46
  const ring3Offset = ring3Circ - (focusRingPct / 100) * ring3Circ;

  // Donut Chart SVG Geometry (viewBox 0 0 180 180, cx=90, cy=90)
  const donutRadius = 60;
  const donutCirc = 2 * Math.PI * donutRadius; // ~376.99
  let accumulatedDonutOffset = 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Productivity Insights
          </h1>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989f] mt-1">
            Observe your cognitive rhythms, habit consistency, and task velocity.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 text-[#0071e3] dark:text-[#2997ff] text-xs font-semibold self-start sm:self-auto shadow-xs">
          <Award className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
          <span>Cognitive Rhythm Engine</span>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 flex items-center gap-4 glossy-glass-card hoverable">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/20 text-[#0071e3] dark:text-[#2997ff] border border-blue-500/20 flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              Weekly Velocity
            </p>
            <p className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={39} suffix=" Tasks" />
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5">
              <Zap className="w-3 h-3 fill-emerald-500" /> +18% vs last week
            </span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4 glossy-glass-card hoverable">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              Total Deep Focus
            </p>
            <p className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={totalDeepFocusMinutes} suffix="m" />
            </p>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              14 Pomodoro blocks completed
            </span>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center gap-4 glossy-glass-card hoverable">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              Habit Consistency
            </p>
            <p className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatedCounter value={habitRingPct} suffix="%" />
            </p>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              Consistent 4-week streak
            </span>
          </div>
        </Card>
      </div>

      {/* Multi-Ring Activity Rings & Target Breakdown (Apple Fitness Style) */}
      <Card className="p-6 sm:p-8 glossy-glass-card">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Radial Activity Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 200 200"
              className="w-52 h-52 sm:w-60 sm:h-60 transform -rotate-90 select-none"
            >
              <defs>
                {/* Ring 1 Gradient: Coral Red -> Orange */}
                <linearGradient id="ring-grad-task" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff2d55" />
                  <stop offset="100%" stopColor="#ff9500" />
                </linearGradient>

                {/* Ring 2 Gradient: Emerald -> Mint */}
                <linearGradient id="ring-grad-habit" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>

                {/* Ring 3 Gradient: Electric Blue -> Purple */}
                <linearGradient id="ring-grad-focus" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0071e3" />
                  <stop offset="100%" stopColor="#af52de" />
                </linearGradient>
              </defs>

              {/* Background Tracks */}
              <circle
                cx="100"
                cy="100"
                r={ring1Radius}
                stroke="currentColor"
                strokeWidth="11"
                className="text-black/[0.05] dark:text-white/[0.06]"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r={ring2Radius}
                stroke="currentColor"
                strokeWidth="11"
                className="text-black/[0.05] dark:text-white/[0.06]"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r={ring3Radius}
                stroke="currentColor"
                strokeWidth="11"
                className="text-black/[0.05] dark:text-white/[0.06]"
                fill="transparent"
              />

              {/* Foreground Animated Rings */}
              {/* Ring 1: Tasks */}
              <circle
                cx="100"
                cy="100"
                r={ring1Radius}
                stroke="url(#ring-grad-task)"
                strokeWidth="11"
                strokeDasharray={ring1Circ}
                strokeDashoffset={ring1Offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(255,45,85,0.4)]"
                fill="transparent"
              />

              {/* Ring 2: Habits */}
              <circle
                cx="100"
                cy="100"
                r={ring2Radius}
                stroke="url(#ring-grad-habit)"
                strokeWidth="11"
                strokeDasharray={ring2Circ}
                strokeDashoffset={ring2Offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                fill="transparent"
              />

              {/* Ring 3: Focus */}
              <circle
                cx="100"
                cy="100"
                r={ring3Radius}
                stroke="url(#ring-grad-focus)"
                strokeWidth="11"
                strokeDasharray={ring3Circ}
                strokeDashoffset={ring3Offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(0,113,227,0.4)]"
                fill="transparent"
              />
            </svg>

            {/* Center Summary Icon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <Sparkles className="w-7 h-7 text-[#0071e3] dark:text-[#2997ff] animate-pulse" />
              <span className="text-[11px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-1">
                Daylight Flow
              </span>
            </div>
          </div>

          {/* Activity Breakdown Cards */}
          <div className="flex-1 w-full space-y-3.5">
            <div>
              <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Triple-Axis Activity Metrics
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#98989f]">
                Real-time tracking of tasks, habit consistency, and focus minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Task Activity Pill */}
              <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff9500] shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Tasks Completed
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold text-[#ff2d55]">
                    {completedTasksCount} / {Math.max(1, totalTasksCount)}
                  </span>
                  <span className="text-xs font-semibold text-[#ff2d55]">
                    {taskRingPct}%
                  </span>
                </div>
              </div>

              {/* Habit Activity Pill */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Habit Check-ins
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {todayCompletedCount} / {Math.max(1, totalHabitsCount)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {habitRingPct}%
                  </span>
                </div>
              </div>

              {/* Focus Activity Pill */}
              <div className="p-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#0071e3] to-[#af52de] shrink-0" />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Deep Focus
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold text-[#0071e3] dark:text-[#2997ff]">
                    {totalFocusMinutesToday || completedSessions * 25}m
                  </span>
                  <span className="text-xs font-semibold text-[#0071e3] dark:text-[#2997ff]">
                    {focusRingPct}% of goal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Weekly Output Rhythm Chart */}
      <Card className="p-6 sm:p-7 glossy-glass-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/[0.05] dark:border-white/[0.08] mb-6 gap-3">
          <div>
            <h3 className="font-semibold text-lg text-[#1d1d1f] dark:text-[#f5f5f7]">
              Weekly Output Rhythm
            </h3>
            <p className="text-xs text-[#86868b] dark:text-[#98989f]">
              Task volume and deep focus sprints distribution per day
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="w-3 h-3 rounded-md bg-gradient-to-r from-[#0071e3] to-[#5e5ce6]" /> Tasks
            </span>
            <span className="flex items-center gap-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]">
              <span className="w-3 h-3 rounded-md bg-gradient-to-r from-[#10b981] to-[#06b6d4]" /> Focus (min)
            </span>
          </div>
        </div>

        {/* Visual Bar Chart with Hover Tooltips */}
        <div className="h-64 flex items-end justify-between gap-2.5 sm:gap-6 pt-6 px-1 sm:px-4 relative">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-x-0 top-6 border-b border-dashed border-black/[0.05] dark:border-white/[0.06]" />
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-black/[0.05] dark:border-white/[0.06]" />

          {weeklyActivity.map((item) => {
            const taskHeightPercent = Math.min(100, Math.round((item.tasks / maxWeeklyTasks) * 100));
            const isHovered = hoveredDay === item.day;

            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredDay(item.day)}
                onMouseLeave={() => setHoveredDay(null)}
                className="flex-1 flex flex-col items-center gap-2 group h-full justify-end z-10 cursor-pointer"
              >
                {/* Tooltip on hover */}
                <div
                  className={`absolute -top-4 z-20 px-3 py-1.5 rounded-xl bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-xs font-semibold shadow-xl transition-all duration-200 pointer-events-none flex flex-col items-center gap-0.5 ${
                    isHovered ? 'opacity-100 -translate-y-2' : 'opacity-0 translate-y-0'
                  }`}
                >
                  <span>{item.day}: {item.tasks} tasks</span>
                  <span className="text-[10px] text-[#2997ff] dark:text-[#0071e3]">
                    {item.focusMinutes}m focus
                  </span>
                </div>

                {/* Animated Gradient Bar */}
                <div
                  className={`w-full max-w-[48px] bg-[#f0f0f4] dark:bg-white/[0.06] rounded-2xl overflow-hidden h-44 flex items-end p-1 shadow-xs transition-all duration-200 ${
                    isHovered ? 'scale-105 ring-2 ring-[#0071e3]/30' : ''
                  }`}
                >
                  <div
                    className="w-full bg-gradient-to-t from-[#0071e3] via-[#5e5ce6] to-[#af52de] rounded-xl transition-all duration-700 ease-out shadow-sm"
                    style={{ height: `${Math.max(12, taskHeightPercent)}%` }}
                  />
                </div>

                <span
                  className={`text-xs font-semibold uppercase transition-colors ${
                    isHovered
                      ? 'text-[#0071e3] dark:text-[#2997ff]'
                      : 'text-[#86868b] dark:text-[#98989f]'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Categories & Mindful Reflections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Focus Distribution (SVG Donut Chart) */}
        <Card className="p-6 sm:p-7 glossy-glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                Focus Distribution by Category
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#98989f]">
                Breakdown of active task domains
              </p>
            </div>
            <Target className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
          </div>

          {categoryData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Donut Chart */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 180 180"
                  className="w-44 h-44 transform -rotate-90 select-none"
                >
                  {categoryData.map((cat) => {
                    const segLength = (cat.percent / 100) * donutCirc;
                    const strokeDash = `${Math.max(0, segLength - 3)} ${donutCirc - Math.max(0, segLength - 3)}`;
                    const strokeOffset = -accumulatedDonutOffset;
                    accumulatedDonutOffset += segLength;

                    const isHighlighted = hoveredCategory === cat.name;

                    return (
                      <circle
                        key={cat.name}
                        cx="90"
                        cy="90"
                        r={donutRadius}
                        stroke={cat.color.stroke}
                        strokeWidth={isHighlighted ? '19' : '15'}
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredCategory(cat.name)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        fill="transparent"
                      />
                    );
                  })}
                </svg>

                {/* Center Donut Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {tasks.length}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] dark:text-[#98989f]">
                    Tasks
                  </span>
                </div>
              </div>

              {/* Category Legend */}
              <div className="flex-1 w-full space-y-2.5">
                {categoryData.map((cat) => (
                  <div
                    key={cat.name}
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                      hoveredCategory === cat.name
                        ? 'bg-black/[0.04] dark:bg-white/[0.08] scale-[1.02]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color.stroke }}
                      />
                      <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#86868b] dark:text-[#98989f]">
                        {cat.count}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {cat.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4">
              <CheckCircle2 className="w-8 h-8 text-[#86868b] mx-auto mb-2 opacity-40" />
              <p className="text-xs text-[#86868b] dark:text-[#98989f]">
                No task categories recorded yet.
              </p>
            </div>
          )}
        </Card>

        {/* Cognitive Insights Card with Aurora Glass Gradient */}
        <Card className="p-6 sm:p-7 flex flex-col justify-between glossy-glass-card relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/20 border border-blue-500/20">
          <div>
            <div className="flex items-center gap-2 text-[#0071e3] dark:text-[#2997ff] mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
              </div>
              <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                Daylight Cognitive Rhythm
              </h3>
            </div>
            <p className="text-sm text-[#515154] dark:text-[#d2d2d7] leading-relaxed mt-2">
              Your peak focus window occurs between <strong>09:00 AM and 11:30 AM</strong>.
              Scheduling high-priority cognitive challenges during this morning window yields an estimated <strong>35% higher throughput</strong>.
            </p>
          </div>

          <div className="mt-5 p-3.5 rounded-2xl bg-white/70 dark:bg-[#1a1c27]/80 backdrop-blur-md border border-blue-200/50 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-[#0071e3] dark:text-[#2997ff] font-medium shadow-xs">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-[#0071e3] dark:text-[#2997ff]" />
            <p className="leading-relaxed text-[#1d1d1f] dark:text-[#f5f5f7]">
              <strong className="text-[#0071e3] dark:text-[#2997ff]">Smart Recommendation:</strong> Reserve afternoons for low-friction admin tasks, collaborative syncs, and habit check-ins.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
