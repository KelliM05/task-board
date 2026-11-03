import { supabase } from './supabase';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'normal' | 'high';
  due_date: string | null;
  user_id: string;
  created_at: string;
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}

export async function createTask(
  title: string,
  description: string,
  priority: Task['priority'],
  due_date: string | null
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      description,
      priority,
      due_date
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateTaskStatus(
  id: string,
  status: Task['status']
): Promise<void> {
  const { error } = await supabase
  .from('tasks')
  .update({ status })
  .eq('id', id)

  if(error) throw error;
}

export async function updateTaskPriority(
  id: string,
  priority: Task['priority']
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ priority })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}