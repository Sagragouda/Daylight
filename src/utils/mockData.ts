import { Task, Habit, PlannerTimeBlock, Note, DailyStat } from '../types';
import { getTodayDateString } from './date';

const today = getTodayDateString();

// Helper to calculate relative date offsets (e.g. yesterday, tomorrow)
function getOffsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const yesterday = getOffsetDate(-1);
const dayBefore = getOffsetDate(-2);
const threeDaysAgo = getOffsetDate(-3);
const tomorrow = getOffsetDate(1);

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize Daylight UI design system & token definitions',
    description: 'Ensure subtle borders, Apple-style corner radii, and soft blue tint hierarchy are consistent across all views.',
    completed: true,
    completedAt: `${today}T10:15:00Z`,
    category: 'Design',
    priority: 'high',
    dueDate: today,
    dueTime: '11:00 AM',
    estimatedMinutes: 45,
    createdAt: `${yesterday}T14:00:00Z`,
  },
  {
    id: 'task-2',
    title: 'Review team pull requests & release notes for v1.2',
    description: 'Check navigation drawer responsiveness and micro-interactions on mobile screens.',
    completed: true,
    completedAt: `${today}T11:45:00Z`,
    category: 'Work',
    priority: 'medium',
    dueDate: today,
    dueTime: '01:30 PM',
    estimatedMinutes: 30,
    createdAt: `${yesterday}T16:00:00Z`,
  },
  {
    id: 'task-3',
    title: 'Complete 25-minute Pomodoro deep work sprint on task logic',
    description: 'Implement dynamic progress recalculation and sound chime feedback.',
    completed: false,
    category: 'Work',
    priority: 'high',
    dueDate: today,
    dueTime: '03:00 PM',
    estimatedMinutes: 25,
    createdAt: `${today}T08:30:00Z`,
  },
  {
    id: 'task-4',
    title: 'Hydration & 15-minute afternoon mindful stretch',
    description: 'Step away from screen, drink 500ml water, and reset physical posture.',
    completed: false,
    category: 'Health',
    priority: 'medium',
    dueDate: today,
    dueTime: '04:15 PM',
    estimatedMinutes: 15,
    createdAt: `${today}T09:00:00Z`,
  },
  {
    id: 'task-5',
    title: 'Draft architecture roadmap for Supabase Phase 2 integration',
    description: 'Outline auth schema, database tables for tasks & habits, and real-time syncing policies.',
    completed: false,
    category: 'Learning',
    priority: 'medium',
    dueDate: tomorrow,
    dueTime: '05:00 PM',
    estimatedMinutes: 60,
    createdAt: `${today}T09:30:00Z`,
  },
  {
    id: 'task-6',
    title: 'Plan weekly grocery list and Sunday meal prep',
    description: 'Restock fruits, greens, matcha, and healthy snacks for optimal focus.',
    completed: false,
    category: 'Personal',
    priority: 'low',
    dueDate: tomorrow,
    dueTime: '07:00 PM',
    estimatedMinutes: 20,
    createdAt: `${today}T10:00:00Z`,
  },
];

export const initialHabits: Habit[] = [
  {
    id: 'habit-1',
    name: 'Morning Meditation & Breathwork',
    iconName: 'Sparkles',
    color: '#0071e3', // Apple blue
    category: 'Mindfulness',
    streak: 12,
    completedDates: [threeDaysAgo, dayBefore, yesterday, today],
    frequency: 'Daily',
  },
  {
    id: 'habit-2',
    name: 'Drink 2.5L Clean Water',
    iconName: 'Droplets',
    color: '#0ea5e9', // Sky blue
    category: 'Health',
    streak: 8,
    completedDates: [threeDaysAgo, dayBefore, yesterday, today],
    frequency: 'Daily',
  },
  {
    id: 'habit-3',
    name: 'Read 20 Pages Non-Fiction',
    iconName: 'BookOpen',
    color: '#8b5cf6', // Violet
    category: 'Growth',
    streak: 5,
    completedDates: [dayBefore, yesterday],
    frequency: 'Daily',
  },
  {
    id: 'habit-4',
    name: '30-minute Cardio or Gym Workout',
    iconName: 'Activity',
    color: '#10b981', // Emerald
    category: 'Fitness',
    streak: 3,
    completedDates: [threeDaysAgo, yesterday],
    frequency: '5x / week',
  },
];

export const initialPlannerBlocks: PlannerTimeBlock[] = [
  {
    id: 'plan-1',
    title: 'Morning Clarity & Daily Setup',
    startTime: '08:30 AM',
    endTime: '09:00 AM',
    category: 'Planning',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'plan-2',
    title: 'Deep Work: Core Architecture Sprints',
    startTime: '09:00 AM',
    endTime: '11:30 AM',
    category: 'Focus',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'plan-3',
    title: 'Lunch, Outdoor Walk & Recharge',
    startTime: '12:30 PM',
    endTime: '01:30 PM',
    category: 'Personal',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'plan-4',
    title: 'Collaborative Sync & Code Reviews',
    startTime: '02:00 PM',
    endTime: '03:15 PM',
    category: 'Team',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    isCurrent: true,
  },
  {
    id: 'plan-5',
    title: 'Pomodoro Deep Focus: Feature Polish',
    startTime: '03:30 PM',
    endTime: '05:00 PM',
    category: 'Focus',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'plan-6',
    title: 'Evening Review & Next-Day Preparation',
    startTime: '05:30 PM',
    endTime: '06:00 PM',
    category: 'Wrap-up',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Daylight Principles: Calm Computing',
    content: 'Software should feel like natural morning light: unobtrusive, soothing, yet giving total clarity on what matters. Minimal noise, high intentionality.',
    category: 'Philosophy',
    updatedAt: '2 hours ago',
    isPinned: true,
    colorAccent: 'border-l-blue-500',
  },
  {
    id: 'note-2',
    title: 'Phase 2 Supabase Integration Notes',
    content: 'Prepare database schema for users, tasks, habits, and focus logs. Use row-level security (RLS) so each user only queries their authenticated records.',
    category: 'Engineering',
    updatedAt: 'Yesterday',
    isPinned: true,
    colorAccent: 'border-l-emerald-500',
  },
  {
    id: 'note-3',
    title: 'Quotes on Daily Flow',
    content: '"Focus is not saying yes to the thing you have to focus on. It means saying no to the hundred other good ideas that there are." — Steve Jobs',
    category: 'Inspiration',
    updatedAt: '3 days ago',
    isPinned: false,
    colorAccent: 'border-l-purple-500',
  },
];

export const initialDailyStats: DailyStat[] = [
  {
    label: 'Tasks Completed',
    value: '2 / 5',
    change: '+40%',
    trend: 'up',
    subtext: '3 priority tasks remaining',
  },
  {
    label: 'Focus Time',
    value: '50m',
    change: '+15m',
    trend: 'up',
    subtext: 'Target: 100m today',
  },
  {
    label: 'Active Habits',
    value: '75%',
    change: '3 of 4',
    trend: 'up',
    subtext: 'Longest streak: 12 days',
  },
  {
    label: 'Clarity Score',
    value: '88',
    change: '+4 pts',
    trend: 'up',
    subtext: 'Optimal mental flow',
  },
];
