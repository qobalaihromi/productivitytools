import Dexie, { type EntityTable } from 'dexie'

// ─── Types ───────────────────────────────────────────────

export type LocalProject = {
  id: string
  name: string
  description: string | null
  color: string
  status: 'active' | 'completed' | 'archived'
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export type LocalTask = {
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
  start_date: string | null
  due_date: string | null
  position: number
  board_column_id: string | null
  created_at: string
  updated_at: string
}

export type LocalPomodoroSession = {
  id: string
  duration: number // seconds
  completed_at: string
  project_id: string | null
  notes: string | null
}

export type LocalDailyPlan = {
  id: string
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type LocalPlannedTask = {
  id: string
  daily_plan_id: string
  task_id: string
  is_completed: boolean
  position: number
}

export type LocalBoard = {
  id: string
  project_id: string
  name: string
  created_at: string
}

export type LocalBoardColumn = {
  id: string
  board_id: string
  name: string
  position: number
  is_default: boolean
  created_at: string
}

export type LocalWorkSettings = {
  id: string
  daily_work_hours: number
  work_start_time: string
  work_end_time: string
  pomodoro_work_minutes: number
  pomodoro_break_minutes: number
  pomodoro_long_break_minutes: number
}

// ─── Database ────────────────────────────────────────────

class TasktikDB extends Dexie {
  projects!: EntityTable<LocalProject, 'id'>
  tasks!: EntityTable<LocalTask, 'id'>
  pomodoro_sessions!: EntityTable<LocalPomodoroSession, 'id'>
  daily_plans!: EntityTable<LocalDailyPlan, 'id'>
  planned_tasks!: EntityTable<LocalPlannedTask, 'id'>
  boards!: EntityTable<LocalBoard, 'id'>
  board_columns!: EntityTable<LocalBoardColumn, 'id'>
  work_settings!: EntityTable<LocalWorkSettings, 'id'>

  constructor() {
    super('tasktik')

    this.version(1).stores({
      projects: 'id, name, status, created_at, updated_at',
      tasks: 'id, project_id, section_id, parent_task_id, status, priority, due_date, position, board_column_id, created_at, updated_at',
      pomodoro_sessions: 'id, project_id, completed_at',
      daily_plans: 'id, date, created_at',
      planned_tasks: 'id, daily_plan_id, task_id, position',
      boards: 'id, project_id',
      board_columns: 'id, board_id, position',
      work_settings: 'id',
    })
  }
}

export const db = new TasktikDB()
