import { db } from 'app/lib/db'
import type { 
    LocalProject, 
    LocalTask, 
    LocalPomodoroSession, 
    LocalDailyPlan, 
    LocalPlannedTask,
    LocalWorkSettings 
} from 'app/lib/db'

export type BackupData = {
    version: number
    timestamp: string
    projects: LocalProject[]
    tasks: LocalTask[]
    pomodoro_sessions: LocalPomodoroSession[]
    daily_plans: LocalDailyPlan[]
    planned_tasks: LocalPlannedTask[]
    work_settings: LocalWorkSettings[]
}

export const BACKUP_VERSION = 1

export async function exportData(): Promise<BackupData> {
    const [
        projects,
        tasks,
        pomodoro_sessions,
        daily_plans,
        planned_tasks,
        work_settings
    ] = await Promise.all([
        db.projects.toArray(),
        db.tasks.toArray(),
        db.pomodoro_sessions.toArray(),
        db.daily_plans.toArray(),
        db.planned_tasks.toArray(),
        db.work_settings.toArray()
    ])

    return {
        version: BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        projects,
        tasks,
        pomodoro_sessions,
        daily_plans,
        planned_tasks,
        work_settings
    }
}

export async function importData(data: BackupData): Promise<{ success: boolean; error?: string }> {
    if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid backup file format' }
    }

    if (data.version !== BACKUP_VERSION) {
        // In future we might handle migration here
        console.warn(`Backup version mismatch: expected ${BACKUP_VERSION}, got ${data.version}`)
    }

    try {
        await db.transaction('rw', 
            db.projects, 
            db.tasks, 
            db.pomodoro_sessions, 
            db.daily_plans, 
            db.planned_tasks, 
            db.work_settings, 
            async () => {
                // Clear existing data
                await Promise.all([
                    db.projects.clear(),
                    db.tasks.clear(),
                    db.pomodoro_sessions.clear(),
                    db.daily_plans.clear(),
                    db.planned_tasks.clear(),
                    db.work_settings.clear()
                ])

                // Import new data
                await Promise.all([
                    db.projects.bulkAdd(data.projects || []),
                    db.tasks.bulkAdd(data.tasks || []),
                    db.pomodoro_sessions.bulkAdd(data.pomodoro_sessions || []),
                    db.daily_plans.bulkAdd(data.daily_plans || []),
                    db.planned_tasks.bulkAdd(data.planned_tasks || []),
                    db.work_settings.bulkAdd(data.work_settings || [])
                ])
            }
        )
        return { success: true }
    } catch (error: any) {
        console.error('Import failed:', error)
        return { success: false, error: error.message || 'Unknown import error' }
    }
}
