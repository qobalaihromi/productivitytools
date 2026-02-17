import { db, generateId } from 'app/lib/db'
import type { LocalTask } from 'app/lib/db'

export type Task = LocalTask & {
  project?: { name: string; color: string } | null
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
  start_date?: string
  due_date?: string
  position?: number
  board_column_id?: string
}

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'project_id'>>

export async function getTasks(projectId: string) {
  let tasks: LocalTask[]

  if (projectId && projectId !== 'ALL') {
    tasks = await db.tasks
      .where('project_id')
      .equals(projectId)
      .sortBy('position')
  } else {
    tasks = await db.tasks
      .orderBy('position')
      .toArray()
  }

  // Enrich with project data
  const enriched: Task[] = await Promise.all(
    tasks.map(async (task) => {
      const project = await db.projects.get(task.project_id)
      return {
        ...task,
        project: project ? { name: project.name, color: project.color } : null,
      }
    })
  )

  return enriched
}

export async function createTask(input: CreateTaskInput) {
  const now = new Date().toISOString()

  // Get max position
  const existingTasks = await db.tasks
    .where('project_id')
    .equals(input.project_id)
    .toArray()
  const maxPosition = existingTasks.reduce((max, t) => Math.max(max, t.position), -1)

  const task: LocalTask = {
    id: generateId(),
    project_id: input.project_id,
    section_id: input.section_id ?? null,
    parent_task_id: input.parent_task_id ?? null,
    title: input.title,
    description: input.description ?? null,
    priority: input.priority ?? 'medium',
    status: input.status ?? 'todo',
    estimated_minutes: input.estimated_minutes ?? null,
    actual_minutes: null,
    start_date: input.start_date ?? null,
    due_date: input.due_date ?? null,
    position: input.position ?? maxPosition + 1,
    board_column_id: input.board_column_id ?? null,
    created_at: now,
    updated_at: now,
  }

  await db.tasks.add(task)
  return task as Task
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const now = new Date().toISOString()
  await db.tasks.update(id, { ...input, updated_at: now })
  const updated = await db.tasks.get(id)
  if (!updated) throw new Error(`Task not found: ${id}`)

  // Enrich with project data
  const project = await db.projects.get(updated.project_id)
  return {
    ...updated,
    project: project ? { name: project.name, color: project.color } : null,
  } as Task
}

export async function deleteTask(id: string) {
  // Delete subtasks
  await db.tasks.where('parent_task_id').equals(id).delete()
  await db.tasks.delete(id)
}

export async function toggleTaskStatus(id: string, currentStatus: Task['status']) {
  const newStatus = currentStatus === 'done' ? 'todo' : 'done'
  return updateTask(id, { status: newStatus })
}
