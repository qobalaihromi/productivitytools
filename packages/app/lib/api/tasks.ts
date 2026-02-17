import { createClient } from 'app/lib/supabase/client'

export type Task = {
  id: string
  project_id: string
  section_id: string | null
  parent_task_id: string | null
  title: string
  description: string | null
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'done'
  estimated_minutes: number | null
  actual_minutes: number | null
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
}

export type CreateTaskInput = {
  project_id: string
  section_id?: string
  parent_task_id?: string
  title: string
  description?: string
  priority?: Task['priority']
  status?: Task['status']
  estimated_minutes?: number
  due_date?: string
  position?: number
}

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'project_id'>>

export async function getTasks(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Task[]
}

export async function createTask(input: CreateTaskInput) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function toggleTaskStatus(id: string, currentStatus: Task['status']) {
  const newStatus = currentStatus === 'done' ? 'todo' : 'done'
  return updateTask(id, { status: newStatus })
}
