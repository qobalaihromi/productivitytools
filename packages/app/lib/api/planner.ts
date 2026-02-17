import { createClient } from '../supabase/client'
const supabase = createClient()

export type DailyPlan = {
  id: string
  user_id: string
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type PlannedTask = {
  id: string
  daily_plan_id: string
  task_id: string
  is_completed: boolean
  position: number
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
  const { data: existingPlan, error: findError } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('date', date)
    .single()

  if (findError && findError.code !== 'PGRST116') {
    throw findError
  }

  let plan = existingPlan

  if (!plan) {
    const { data: newPlan, error: createError } = await supabase
      .from('daily_plans')
      .insert({ date })
      .select()
      .single()

    if (createError) throw createError
    plan = newPlan
  }

  // 2. Get planned tasks
  const { data: plannedTasks, error: tasksError } = await supabase
    .from('planned_tasks')
    .select(`
      *,
      task:tasks (
        title,
        status,
        priority,
        project:projects (
          name,
          color
        )
      )
    `)
    .eq('daily_plan_id', plan.id)
    .order('position')

  if (tasksError) throw tasksError

  return { plan, plannedTasks: plannedTasks as PlannedTask[] }
}

export async function addToPlan(dailyPlanId: string, taskId: string) {
  // Get current max position
  const { data: existing } = await supabase
    .from('planned_tasks')
    .select('position')
    .eq('daily_plan_id', dailyPlanId)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { error } = await supabase
    .from('planned_tasks')
    .insert({
      daily_plan_id: dailyPlanId,
      task_id: taskId,
      position
    })

  if (error) throw error
}

export async function removeFromPlan(plannedTaskId: string) {
  const { error } = await supabase
    .from('planned_tasks')
    .delete()
    .eq('id', plannedTaskId)

  if (error) throw error
}

export async function updatePlanNotes(id: string, notes: string) {
  const { error } = await supabase
    .from('daily_plans')
    .update({ notes })
    .eq('id', id)

  if (error) throw error
}

export async function togglePlannedTask(id: string, is_completed: boolean) {
    const { error } = await supabase
        .from('planned_tasks')
        .update({ is_completed })
        .eq('id', id)
    
    if (error) throw error
}
