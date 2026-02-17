import { db, generateId } from 'app/lib/db'
import type { LocalPomodoroSession } from 'app/lib/db'

export type PomodoroSession = LocalPomodoroSession

export async function createPomodoroSession(session: Omit<PomodoroSession, 'id' | 'completed_at'>) {
  const newSession: PomodoroSession = {
    id: generateId(),
    duration: session.duration,
    project_id: session.project_id ?? null,
    notes: session.notes ?? null,
    completed_at: new Date().toISOString(),
  }

  await db.pomodoro_sessions.add(newSession)
  return newSession
}

export async function getRecentSessions(limit = 10) {
  const sessions = await db.pomodoro_sessions
    .orderBy('completed_at')
    .reverse()
    .limit(limit)
    .toArray()
  return sessions
}
