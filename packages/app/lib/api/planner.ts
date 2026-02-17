import { db, generateId } from 'app/lib/db'
import type { LocalDailyPlan, LocalPlannedTask } from 'app/lib/db'

export type DailyPlan = LocalDailyPlan

export type PlannedTask = LocalPlannedTask & {
  task?: {
    title: string
    status: string
    priority: string
    project?: {
      name: string
      color: string
    }
  }
}

export async function getDailyPlan(date: string) {
  // 1. Get or create plan for date
  let plan = await db.daily_plans.where('date').equals(date).first()

  if (!plan) {
    const now = new Date().toISOString()
    plan = {
      id: generateId(),
      date,
      notes: null,
      created_at: now,
      updated_at: now,
    }
    await db.daily_plans.add(plan)
  }

  // 2. Get planned tasks with enrichment
  const rawPlannedTasks = await db.planned_tasks
    .where('daily_plan_id')
    .equals(plan.id)
    .sortBy('position')

  const plannedTasks: PlannedTask[] = await Promise.all(
    rawPlannedTasks.map(async (pt) => {
      const task = await db.tasks.get(pt.task_id)
      let project: { name: string; color: string } | undefined

      if (task) {
        const proj = await db.projects.get(task.project_id)
        project = proj ? { name: proj.name, color: proj.color } : undefined
      }

      return {
        ...pt,
        task: task
          ? {
              title: task.title,
              status: task.status,
              priority: task.priority,
              project,
            }
          : undefined,
      }
    })
  )

  return { plan, plannedTasks }
}

export async function addToPlan(dailyPlanId: string, taskId: string) {
  // Get current max position
  const existing = await db.planned_tasks
    .where('daily_plan_id')
    .equals(dailyPlanId)
    .sortBy('position')

  const maxPos = existing.length > 0 ? existing[existing.length - 1]!.position : -1

  await db.planned_tasks.add({
    id: generateId(),
    daily_plan_id: dailyPlanId,
    task_id: taskId,
    is_completed: false,
    position: maxPos + 1,
  })
}

export async function removeFromPlan(plannedTaskId: string) {
  await db.planned_tasks.delete(plannedTaskId)
}

export async function updatePlanNotes(id: string, notes: string) {
  const now = new Date().toISOString()
  await db.daily_plans.update(id, { notes, updated_at: now })
}

export async function togglePlannedTask(id: string, is_completed: boolean) {
  await db.planned_tasks.update(id, { is_completed })
}
