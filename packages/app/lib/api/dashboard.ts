import { createClient } from '../supabase/client'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays } from 'date-fns'

export type DashboardStats = {
  tasksCompletedToday: number
  tasksCompletedWeek: number
  pomodoroMinutesToday: number
  pomodoroMinutesWeek: number
  upcomingDeadlines: {
      id: string
      title: string
      due_date: string
      project?: { name: string, color: string }
  }[]
  recentActivity: {
      id: string
      type: 'task_completed' | 'pomodoro_session'
      title: string
      timestamp: string
  }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient()
  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const todayEnd = endOfDay(now).toISOString()
  const weekStart = startOfWeek(now).toISOString()
  const weekEnd = endOfWeek(now).toISOString()

  // 1. Tasks Stats
  const { count: tasksToday } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'done')
    .gte('updated_at', todayStart)
    .lte('updated_at', todayEnd)

  const { count: tasksWeek } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'done')
    .gte('updated_at', weekStart)
    .lte('updated_at', weekEnd)

  // 2. Pomodoro Stats
  const { data: promoToday } = await supabase
    .from('pomodoro_sessions')
    .select('duration_minutes')
    .gte('completed_at', todayStart)
    .lte('completed_at', todayEnd)

  const { data: promoWeek } = await supabase
    .from('pomodoro_sessions')
    .select('duration_minutes')
    .gte('completed_at', weekStart)
    .lte('completed_at', weekEnd)

  const minutesToday = promoToday?.reduce((acc, curr) => acc + curr.duration_minutes, 0) || 0
  const minutesWeek = promoWeek?.reduce((acc, curr) => acc + curr.duration_minutes, 0) || 0

  // 3. Upcoming Deadlines
  const { data: deadlines } = await supabase
    .from('tasks')
    .select('id, title, due_date, project:projects(name, color)')
    .eq('status', 'todo') // or in_progress
    .gte('due_date', now.toISOString())
    .order('due_date', { ascending: true })
    .limit(5)

  // 4. Recent Activity (Simplified)
  // Fetch recent completed tasks
  const { data: recentTasks } = await supabase
    .from('tasks')
    .select('id, title, updated_at')
    .eq('status', 'done')
    .order('updated_at', { ascending: false })
    .limit(5)
  
  const recentActivity = recentTasks?.map(t => ({
      id: t.id,
      type: 'task_completed' as const,
      title: `Completed "${t.title}"`,
      timestamp: t.updated_at
  })) || []

  return {
    tasksCompletedToday: tasksToday || 0,
    tasksCompletedWeek: tasksWeek || 0,
    pomodoroMinutesToday: minutesToday,
    pomodoroMinutesWeek: minutesWeek,
    upcomingDeadlines: deadlines as any || [],
    recentActivity: recentActivity
  }
}
