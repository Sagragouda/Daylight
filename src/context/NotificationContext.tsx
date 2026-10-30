import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useTasks } from './TaskContext';
import { useHabits } from './HabitContext';
import { useTimer } from './TimerContext';
import { useAuth } from './AuthContext';
import { getTodayDateString } from '../utils/date';

export type NotificationType =
  | 'overdue_task'
  | 'due_today_task'
  | 'high_priority_task'
  | 'habit_reminder'
  | 'focus_completed';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  actionPath: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationStorageState {
  readIds: string[];
  dismissedIds: string[];
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  requestBrowserPermission: () => Promise<NotificationPermission | 'unsupported'>;
  browserPermission: NotificationPermission | 'unsupported';
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { habits, isHabitDoneToday } = useHabits();
  const { completedSessions } = useTimer();

  const storageKey = useMemo(() => {
    return `daylight_notifications_${user?.id || 'anon'}`;
  }, [user?.id]);

  const [persistedState, setPersistedState] = useState<NotificationStorageState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        return JSON.parse(raw) as NotificationStorageState;
      }
    } catch {
      // Fallback
    }
    return { readIds: [], dismissedIds: [] };
  });

  // Re-read storage when user changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setPersistedState(JSON.parse(raw));
      } else {
        setPersistedState({ readIds: [], dismissedIds: [] });
      }
    } catch {
      setPersistedState({ readIds: [], dismissedIds: [] });
    }
  }, [storageKey]);

  // Save changes to localStorage
  const saveState = useCallback(
    (newState: NotificationStorageState) => {
      setPersistedState(newState);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch {
        // Ignore localStorage error
      }
    },
    [storageKey]
  );

  // Browser Notification permission status
  const [browserPermission, setBrowserPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      return permission;
    } catch {
      return 'denied' as NotificationPermission;
    }
  }, []);

  // Compute live notifications from real context data
  const todayStr = getTodayDateString();

  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = [];
    const { readIds, dismissedIds } = persistedState;

    // 1. Overdue tasks
    tasks.forEach((task) => {
      if (!task.completed && task.dueDate && task.dueDate < todayStr) {
        const id = `overdue-${task.id}-${task.dueDate}`;
        if (!dismissedIds.includes(id)) {
          list.push({
            id,
            type: 'overdue_task',
            title: `Overdue: ${task.title}`,
            message: `Was due on ${task.dueDate} • Priority: ${task.priority}`,
            timestamp: task.dueDate,
            actionPath: '/tasks',
            read: readIds.includes(id),
            priority: 'high',
          });
        }
      }
    });

    // 2. High-priority tasks due today
    tasks.forEach((task) => {
      if (!task.completed && task.dueDate === todayStr && task.priority === 'high') {
        const id = `high-${task.id}-${todayStr}`;
        if (!dismissedIds.includes(id)) {
          list.push({
            id,
            type: 'high_priority_task',
            title: `High Priority: ${task.title}`,
            message: task.dueTime ? `Due today at ${task.dueTime}` : `Scheduled for today`,
            timestamp: todayStr,
            actionPath: '/tasks',
            read: readIds.includes(id),
            priority: 'high',
          });
        }
      }
    });

    // 3. Medium & Low tasks due today
    tasks.forEach((task) => {
      if (!task.completed && task.dueDate === todayStr && task.priority !== 'high') {
        const id = `today-${task.id}-${todayStr}`;
        if (!dismissedIds.includes(id)) {
          list.push({
            id,
            type: 'due_today_task',
            title: `Due Today: ${task.title}`,
            message: task.dueTime ? `Due at ${task.dueTime}` : `Category: ${task.category}`,
            timestamp: todayStr,
            actionPath: '/tasks',
            read: readIds.includes(id),
            priority: 'medium',
          });
        }
      }
    });

    // 4. Incomplete habits today
    habits.forEach((habit) => {
      if (!isHabitDoneToday(habit)) {
        const id = `habit-${habit.id}-${todayStr}`;
        if (!dismissedIds.includes(id)) {
          list.push({
            id,
            type: 'habit_reminder',
            title: `Habit: ${habit.name}`,
            message:
              habit.streak > 0
                ? `Maintain your ${habit.streak}-day streak today!`
                : `Scheduled for ${habit.frequency.toLowerCase()}`,
            timestamp: todayStr,
            actionPath: '/habits',
            read: readIds.includes(id),
            priority: 'medium',
          });
        }
      }
    });

    // 5. Focus sessions completed today
    if (completedSessions > 0) {
      const id = `focus-${todayStr}-${completedSessions}`;
      if (!dismissedIds.includes(id)) {
        list.push({
          id,
          type: 'focus_completed',
          title: `Focus Milestone`,
          message: `${completedSessions} session${
            completedSessions > 1 ? 's' : ''
          } finished today. Great momentum!`,
          timestamp: todayStr,
          actionPath: '/focus',
          read: readIds.includes(id),
          priority: 'low',
        });
      }
    }

    // Sort: unread first, then by priority (high > medium > low)
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return list.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }, [tasks, habits, completedSessions, persistedState, todayStr, isHabitDoneToday]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback(
    (id: string) => {
      saveState({
        ...persistedState,
        readIds: Array.from(new Set([...persistedState.readIds, id])),
      });
    },
    [persistedState, saveState]
  );

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    saveState({
      ...persistedState,
      readIds: Array.from(new Set([...persistedState.readIds, ...allIds])),
    });
  }, [notifications, persistedState, saveState]);

  const dismissNotification = useCallback(
    (id: string) => {
      saveState({
        readIds: persistedState.readIds.filter((item) => item !== id),
        dismissedIds: Array.from(new Set([...persistedState.dismissedIds, id])),
      });
    },
    [persistedState, saveState]
  );

  const clearAll = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    saveState({
      readIds: [],
      dismissedIds: Array.from(new Set([...persistedState.dismissedIds, ...allIds])),
    });
  }, [notifications, persistedState, saveState]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading: tasksLoading,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearAll,
        requestBrowserPermission,
        browserPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
