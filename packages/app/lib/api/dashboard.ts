import { db } from 'app/lib/db'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'

export type DashboardStats = {
  tasksCompletedToday: number
  tasksCompletedWeek: number
  pomodoroMinutesToday: number
  pomodoroMinutesWeek: number
  upcomingDeadlines: {
    id: string
    title: string
    due_date: string
    project?: { name: string; color: string }
  }[]
  recentActivity: {
    id: string
    type: 'task_completed' | 'pomodoro_session'
    title: string
    timestamp: string
  }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const todayEnd = endOfDay(now).toISOString()
  const weekStart = startOfWeek(now).toISOString()
  const weekEnd = endOfWeek(now).toISOString()

  // 1. Tasks Stats
  const allDoneTasks = await db.tasks
    .where('status')
    .equals('done')
    .toArray()

  const tasksCompletedToday = allDoneTasks.filter(
    (t) => t.updated_at >= todayStart && t.updated_at <= todayEnd
  ).length

  const tasksCompletedWeek = allDoneTasks.filter(
    (t) => t.updated_at >= weekStart && t.updated_at <= weekEnd
  ).length

  // 2. Pomodoro Stats
  const allSessions = await db.pomodoro_sessions.toArray()

  const pomodoroMinutesToday = allSessions
    .filter((s) => s.completed_at >= todayStart && s.completed_at <= todayEnd)
    .reduce((acc, s) => acc + Math.round(s.duration / 60), 0)

  const pomodoroMinutesWeek = allSessions
    .filter((s) => s.completed_at >= weekStart && s.completed_at <= weekEnd)
    .reduce((acc, s) => acc + Math.round(s.duration / 60), 0)

  // 3. Upcoming Deadlines
  const tasksWithDeadline = await db.tasks
    .where('due_date')
    .above(now.toISOString())
    .limit(5)
    .toArray()

  // Filter only non-done and sort
  const filteredDeadlines = tasksWithDeadline
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 5)

  const upcomingDeadlines = await Promise.all(
    filteredDeadlines.map(async (t) => {
      const project = await db.projects.get(t.project_id)
      return {
        id: t.id,
        title: t.title,
        due_date: t.due_date!,
        project: project ? { name: project.name, color: project.color } : undefined,
      }
    })
  )

  // 4. Recent Activity
  const recentDoneTasks = allDoneTasks
    .sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1))
    .slice(0, 5)

  const recentActivity = recentDoneTasks.map((t) => ({
    id: t.id,
    type: 'task_completed' as const,
    title: `Completed "${t.title}"`,
    timestamp: t.updated_at,
  }))

  return {
    tasksCompletedToday,
    tasksCompletedWeek,
    pomodoroMinutesToday,
    pomodoroMinutesWeek,
    upcomingDeadlines,
    recentActivity,
  }
}
