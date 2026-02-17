import { createClient } from 'app/lib/supabase/client'

export type PomodoroSession = {
  id: string
  user_id: string
  duration: number // in seconds
  completed_at: string
  project_id?: string
  notes?: string
}

export async function createPomodoroSession(session: Omit<PomodoroSession, 'id' | 'user_id' | 'completed_at'>) {
  const supabase = createClient()
  // Get current user to ensure RLS policies work if needed, though client usually handles it
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert([
      {
        duration: session.duration,
        project_id: session.project_id,
        notes: session.notes,
        user_id: user.id
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating pomodoro session:', error)
    return null
  }

  return data as PomodoroSession
}

export async function getRecentSessions(limit = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return data as PomodoroSession[]
}
