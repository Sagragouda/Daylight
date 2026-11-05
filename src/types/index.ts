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
  goalId?: string; // Optional linked Goal ID
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
  goalId?: string; // Optional linked Goal ID
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

// ============================================================================
// GOALS & MILESTONES TYPES
// ============================================================================

export type GoalCategory =
  | 'Personal'
  | 'Career'
  | 'Health & Fitness'
  | 'Learning'
  | 'Finance'
  | 'Projects'
  | 'Other';

export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';

export type GoalTrackingType = 'milestone' | 'numeric' | 'percentage';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface Milestone {
  id: string;
  goalId: string;
  userId?: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;
  sortOrder: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  category: GoalCategory;
  icon: string;
  color: string;
  priority: GoalPriority;
  trackingType: GoalTrackingType;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  manualProgress?: number; // 0 - 100
  startDate: string; // YYYY-MM-DD
  targetDate?: string; // YYYY-MM-DD
  status: GoalStatus;
  createdAt: string;
  updatedAt?: string;
  milestones?: Milestone[];
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category?: GoalCategory;
  icon?: string;
  color?: string;
  priority?: GoalPriority;
  trackingType?: GoalTrackingType;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  manualProgress?: number;
  startDate?: string;
  targetDate?: string;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  category?: GoalCategory;
  icon?: string;
  color?: string;
  priority?: GoalPriority;
  trackingType?: GoalTrackingType;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  manualProgress?: number;
  startDate?: string;
  targetDate?: string;
  status?: GoalStatus;
}

export interface CreateMilestoneInput {
  goalId: string;
  title: string;
  description?: string;
  dueDate?: string;
  sortOrder?: number;
  notes?: string;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  sortOrder?: number;
  notes?: string;
}
