import { supabase } from '../lib/supabaseClient';
import { Task, Priority, TaskCategory } from '../types';

/**
 * Database representation of the public.tasks table in PostgreSQL
 */
export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  completed_at: string | null;
  category: TaskCategory;
  priority: Priority;
  due_date: string; // YYYY-MM-DD
  due_time: string | null;
  estimated_minutes: number;
  created_at: string;
  updated_at: string;
}

/**
 * Input payload for creating a new task
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string;
  dueTime?: string;
  estimatedMinutes?: number;
}

/**
 * Maps a database row from public.tasks to the application Task model
 */
export function mapTaskFromDb(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    completed: row.completed,
    completedAt: row.completed_at ?? undefined,
    category: row.category,
    priority: row.priority,
    dueDate: row.due_date,
    dueTime: row.due_time ?? undefined,
    estimatedMinutes: row.estimated_minutes,
    createdAt: row.created_at,
  };
}

/**
 * Loads all tasks for the authenticated user's UUID, ordered by due_date ASC, created_at DESC.
 * Enforces explicit user_id filter in addition to Supabase Row Level Security.
 */
export async function fetchTasks(userId: string): Promise<Task[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Daylight taskService] fetchTasks error:', error);
    throw new Error(error.message);
  }

  return ((data as TaskRow[]) || []).map(mapTaskFromDb);
}

/**
 * Inserts a new task into public.tasks, returning the canonical created record with UUID.
 */
export async function createTask(
  userId: string,
  input: CreateTaskInput
): Promise<Task> {
  if (!userId) {
    throw new Error('User ID is required to create a task');
  }

  const insertPayload = {
    user_id: userId,
    title: input.title.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    completed: false,
    completed_at: null,
    category: input.category || 'Work',
    priority: input.priority || 'medium',
    due_date: input.dueDate,
    due_time: input.dueTime?.trim() ? input.dueTime.trim() : null,
    estimated_minutes:
      input.estimatedMinutes && input.estimatedMinutes > 0
        ? input.estimatedMinutes
        : 25,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('[Daylight taskService] createTask error:', error);
    throw new Error(error.message);
  }

  return mapTaskFromDb(data as TaskRow);
}

/**
 * Toggles a task's completed status and updates completed_at timestamp accordingly.
 */
export async function toggleTask(
  taskId: string,
  userId: string,
  nextCompleted: boolean
): Promise<Task> {
  if (!taskId || !userId) {
    throw new Error('Task ID and User ID are required to toggle a task');
  }

  const nowIso = new Date().toISOString();
  const updatePayload = {
    completed: nextCompleted,
    completed_at: nextCompleted ? nowIso : null,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from('tasks')
    .update(updatePayload)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('[Daylight taskService] toggleTask error:', error);
    throw new Error(error.message);
  }

  return mapTaskFromDb(data as TaskRow);
}

/**
 * Updates editable fields of a task in public.tasks.
 */
export async function updateTask(
  taskId: string,
  userId: string,
  updates: Partial<Task>
): Promise<Task> {
  if (!taskId || !userId) {
    throw new Error('Task ID and User ID are required to update a task');
  }

  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) {
    dbUpdates.title = updates.title.trim();
  }
  if (updates.description !== undefined) {
    dbUpdates.description =
      updates.description && updates.description.trim().length > 0
        ? updates.description.trim()
        : null;
  }
  if (updates.category !== undefined) {
    dbUpdates.category = updates.category;
  }
  if (updates.priority !== undefined) {
    dbUpdates.priority = updates.priority;
  }
  if (updates.dueDate !== undefined) {
    dbUpdates.due_date = updates.dueDate;
  }
  if (updates.dueTime !== undefined) {
    dbUpdates.due_time =
      updates.dueTime && updates.dueTime.trim().length > 0
        ? updates.dueTime.trim()
        : null;
  }
  if (updates.estimatedMinutes !== undefined) {
    dbUpdates.estimated_minutes =
      updates.estimatedMinutes > 0 ? updates.estimatedMinutes : 25;
  }
  if (updates.completed !== undefined) {
    dbUpdates.completed = updates.completed;
    if (updates.completedAt !== undefined) {
      dbUpdates.completed_at = updates.completedAt || null;
    } else {
      dbUpdates.completed_at = updates.completed
        ? new Date().toISOString()
        : null;
    }
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('[Daylight taskService] updateTask error:', error);
    throw new Error(error.message);
  }

  return mapTaskFromDb(data as TaskRow);
}

/**
 * Deletes a task by ID for the authenticated user.
 */
export async function deleteTask(
  taskId: string,
  userId: string
): Promise<void> {
  if (!taskId || !userId) {
    throw new Error('Task ID and User ID are required to delete a task');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Daylight taskService] deleteTask error:', error);
    throw new Error(error.message);
  }
}

export const taskService = {
  fetchTasks,
  createTask,
  toggleTask,
  updateTask,
  deleteTask,
};
