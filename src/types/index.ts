export type Priority = 'low' | 'medium' | 'high';

export type TaskCategory = 'Work' | 'Design' | 'Personal' | 'Health' | 'Learning';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  estimatedMinutes?: number;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  iconName: string;
  color: string;
  category: string;
  streak: number;
  completedDates: string[]; // List of YYYY-MM-DD
  frequency: string; // e.g. 'Daily' or '5x / week'
}

export type PomodoroMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  mode: PomodoroMode;
  durationMinutes: number;
  completedAt: string;
  associatedTaskId?: string;
}

export interface PlannerTimeBlock {
  id: string;
  title: string;
  startTime: string; // e.g. '09:00 AM'
  endTime: string;   // e.g. '10:30 AM'
  category: string;
  color: string;
  isCurrent?: boolean;
  completed?: boolean;
  scheduleDate?: string; // YYYY-MM-DD
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  isPinned?: boolean;
  colorAccent?: string;
}

export interface DailyStat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  subtext: string;
}
