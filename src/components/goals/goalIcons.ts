import {
  Target,
  Trophy,
  Flame,
  Dumbbell,
  BookOpen,
  Briefcase,
  DollarSign,
  Rocket,
  Compass,
  Heart,
  Code,
  Star,
  Zap,
  GraduationCap,
  FolderKanban,
  Shield,
  LucideIcon,
} from 'lucide-react';
import { GoalCategory } from '../../types';

export interface GoalIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const GOAL_ICON_OPTIONS: GoalIconOption[] = [
  { id: 'Target', label: 'Target', icon: Target },
  { id: 'Trophy', label: 'Trophy', icon: Trophy },
  { id: 'Flame', label: 'Flame', icon: Flame },
  { id: 'Dumbbell', label: 'Fitness', icon: Dumbbell },
  { id: 'BookOpen', label: 'Reading', icon: BookOpen },
  { id: 'Briefcase', label: 'Career', icon: Briefcase },
  { id: 'DollarSign', label: 'Finance', icon: DollarSign },
  { id: 'Rocket', label: 'Launch', icon: Rocket },
  { id: 'Compass', label: 'Vision', icon: Compass },
  { id: 'Heart', label: 'Wellness', icon: Heart },
  { id: 'Code', label: 'Dev / Tech', icon: Code },
  { id: 'Star', label: 'Excellence', icon: Star },
  { id: 'Zap', label: 'Energy', icon: Zap },
  { id: 'GraduationCap', label: 'Education', icon: GraduationCap },
  { id: 'FolderKanban', label: 'Project', icon: FolderKanban },
  { id: 'Shield', label: 'Discipline', icon: Shield },
];

export const CATEGORY_CONFIG: Record<
  GoalCategory,
  {
    icon: LucideIcon;
    color: string;
    bgLight: string;
    bgDark: string;
    border: string;
    glow: 'blue' | 'purple' | 'emerald' | 'amber' | 'cyan' | 'rose';
  }
> = {
  Personal: {
    icon: Heart,
    color: 'text-rose-500 dark:text-rose-400',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/40',
    glow: 'rose',
  },
  Career: {
    icon: Briefcase,
    color: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/40',
    glow: 'purple',
  },
  'Health & Fitness': {
    icon: Dumbbell,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    glow: 'emerald',
  },
  Learning: {
    icon: GraduationCap,
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/40',
    glow: 'blue',
  },
  Finance: {
    icon: DollarSign,
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/40',
    glow: 'amber',
  },
  Projects: {
    icon: Rocket,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/40',
    border: 'border-cyan-200 dark:border-cyan-800/40',
    glow: 'cyan',
  },
  Other: {
    icon: Target,
    color: 'text-slate-600 dark:text-slate-400',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-800/40',
    border: 'border-slate-200 dark:border-slate-700/40',
    glow: 'blue',
  },
};

export function getGoalIconComponent(iconName?: string): LucideIcon {
  const match = GOAL_ICON_OPTIONS.find((opt) => opt.id === iconName);
  return match ? match.icon : Target;
}
