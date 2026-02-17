import { db, generateId } from 'app/lib/db'
import type { LocalProject } from 'app/lib/db'

export type Project = LocalProject

export type CreateProjectInput = {
  name: string
  description?: string
  color?: string
  start_date?: string
  end_date?: string
}

export type UpdateProjectInput = Partial<CreateProjectInput> & {
  status?: 'active' | 'completed' | 'archived'
}

export async function getProjects() {
  const projects = await db.projects
    .orderBy('created_at')
    .reverse()
    .toArray()
  return projects
}

export async function getProject(id: string) {
  const project = await db.projects.get(id)
  if (!project) throw new Error(`Project not found: ${id}`)
  return project
}

export async function createProject(input: CreateProjectInput) {
  const now = new Date().toISOString()
  const project: Project = {
    id: generateId(),
    name: input.name,
    description: input.description ?? null,
    color: input.color ?? '#3B82F6',
    status: 'active',
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    created_at: now,
    updated_at: now,
  }

  await db.projects.add(project)
  return project
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const now = new Date().toISOString()
  await db.projects.update(id, { ...input, updated_at: now })
  const updated = await db.projects.get(id)
  if (!updated) throw new Error(`Project not found: ${id}`)
  return updated
}

export async function deleteProject(id: string) {
  // Also delete associated tasks
  await db.tasks.where('project_id').equals(id).delete()
  await db.projects.delete(id)
}
