export { db } from './local-database'
export type {
  LocalProject,
  LocalTask,
  LocalPomodoroSession,
  LocalDailyPlan,
  LocalPlannedTask,
  LocalBoard,
  LocalBoardColumn,
  LocalWorkSettings,
} from './local-database'

// ─── UUID helper ─────────────────────────────────

export function generateId(): string {
  // Use crypto.randomUUID if available, else fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // V4 UUID fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
