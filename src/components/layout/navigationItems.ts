import {
  LayoutDashboard,
  CheckCircle2,
  Calendar,
  Flame,
  Target,
  Timer,
  FileText,
  TrendingUp,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export const navigationItems: NavItem[] = [
  {
    id: 'overview',
    name: 'Overview',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    id: 'tasks',
    name: 'My Tasks',
    path: '/tasks',
    icon: CheckCircle2,
  },
  {
    id: 'planner',
    name: 'Planner',
    path: '/planner',
    icon: Calendar,
  },
  {
    id: 'habits',
    name: 'Habits',
    path: '/habits',
    icon: Flame,
  },
  {
    id: 'goals',
    name: 'Goals',
    path: '/goals',
    icon: Target,
  },
  {
    id: 'focus',
    name: 'Focus',
    path: '/focus',
    icon: Timer,
  },
  {
    id: 'notes',
    name: 'Notes',
    path: '/notes',
    icon: FileText,
  },
  {
    id: 'insights',
    name: 'Insights',
    path: '/insights',
    icon: TrendingUp,
  },
  {
    id: 'settings',
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];
