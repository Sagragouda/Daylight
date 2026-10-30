import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { Task, Priority, TaskCategory } from '../types';
import { taskService } from '../services/taskService';
import { useAuth } from './AuthContext';
import { sound } from '../utils/sound';
import { getTodayDateString } from '../utils/date';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (data: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: Priority;
    dueDate: string;
    dueTime?: string;
    estimatedMinutes?: number;
  }) => Promise<Task | null>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  completedTasksCount: number;
  totalTasksCount: number;
  pendingTasksCount: number;
  progressPercentage: number;
  todayTasks: Task[];
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to the current tasks to avoid stale closures in rollback logic
  const tasksRef = useRef<Task[]>(tasks);
  tasksRef.current = tasks;

  // Track active fetch requests to ignore stale async responses
  useEffect(() => {
    let isCurrent = true;

    // While Auth is initializing, keep waiting
    if (authLoading) {
      return;
    }

    // Unauthenticated user: immediately clear tasks in-memory
    if (!user) {
      setTasks([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Authenticated user: load tasks from Supabase PostgreSQL
    setLoading(true);
    setError(null);

    taskService
      .fetchTasks(user.id)
      .then((loadedTasks) => {
        if (!isCurrent) return;
        setTasks(loadedTasks);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('[Daylight TaskContext] Failed to load tasks from Supabase:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [user?.id, authLoading]);

  // Explicit refresh helper
  const refreshTasks = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    try {
      setError(null);
      const reloaded = await taskService.fetchTasks(user.id);
      setTasks(reloaded);
    } catch (err) {
      console.error('[Daylight TaskContext] Failed to refresh tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh tasks');
    }
  }, [user?.id]);

  // Create Task with real PostgreSQL UUID
  const addTask = useCallback(
    async (data: {
      title: string;
      description?: string;
      category: TaskCategory;
      priority: Priority;
      dueDate: string;
      dueTime?: string;
      estimatedMinutes?: number;
    }): Promise<Task | null> => {
      if (!user?.id) {
        console.warn('[Daylight TaskContext] Cannot add task: No authenticated user');
        return null;
      }

      sound.playClick();
      try {
        const created = await taskService.createTask(user.id, {
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          dueDate: data.dueDate || getTodayDateString(),
          dueTime: data.dueTime || '05:00 PM',
          estimatedMinutes: data.estimatedMinutes || 25,
        });

        // Insert newly created server record at top of tasks
        setTasks((prev) => [created, ...prev]);
        setError(null);
        return created;
      } catch (err) {
        console.error('[Daylight TaskContext] Failed to create task:', err);
        setError(err instanceof Error ? err.message : 'Failed to create task');
        return null;
      }
    },
    [user?.id]
  );

  // Toggle Task Completion with optimistic update and rollback on failure
  const toggleTask = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) return;

      const previousTasks = tasksRef.current;
      const target = previousTasks.find((t) => t.id === id);
      if (!target) return;

      const nextCompleted = !target.completed;

      // Audio feedback
      if (nextCompleted) {
        sound.playTaskComplete();
      } else {
        sound.playClick();
      }

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: nextCompleted,
                completedAt: nextCompleted ? new Date().toISOString() : undefined,
              }
            : t
        )
      );

      try {
        const updated = await taskService.toggleTask(id, user.id, nextCompleted);
        // Sync with canonical server record
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch (err) {
        console.error('[Daylight TaskContext] Failed to toggle task in Supabase:', err);
        // Rollback optimistic update
        setTasks(previousTasks);
        setError(err instanceof Error ? err.message : 'Failed to toggle task');
      }
    },
    [user?.id]
  );

  // Delete Task with optimistic update and rollback on failure
  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) return;

      const previousTasks = tasksRef.current;
      sound.playClick();

      // Optimistic removal
      setTasks((prev) => prev.filter((t) => t.id !== id));

      try {
        await taskService.deleteTask(id, user.id);
      } catch (err) {
        console.error('[Daylight TaskContext] Failed to delete task in Supabase:', err);
        // Rollback optimistic removal
        setTasks(previousTasks);
        setError(err instanceof Error ? err.message : 'Failed to delete task');
      }
    },
    [user?.id]
  );

  // Update Task with optimistic update and rollback on failure
  const updateTask = useCallback(
    async (updated: Task): Promise<void> => {
      if (!user?.id) return;

      const previousTasks = tasksRef.current;
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      try {
        const serverUpdated = await taskService.updateTask(
          updated.id,
          user.id,
          updated
        );
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? serverUpdated : t))
        );
      } catch (err) {
        console.error('[Daylight TaskContext] Failed to update task in Supabase:', err);
        setTasks(previousTasks);
        setError(err instanceof Error ? err.message : 'Failed to update task');
      }
    },
    [user?.id]
  );

  // Derived today's tasks
  const todayStr = getTodayDateString();

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const totalTasksCount = todayTasks.length;
  const completedTasksCount = todayTasks.filter((t) => t.completed).length;
  const pendingTasksCount = totalTasksCount - completedTasksCount;

  const progressPercentage = useMemo(() => {
    if (totalTasksCount === 0) return 0;
    return Math.round((completedTasksCount / totalTasksCount) * 100);
  }, [completedTasksCount, totalTasksCount]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        completedTasksCount,
        totalTasksCount,
        pendingTasksCount,
        progressPercentage,
        todayTasks,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
