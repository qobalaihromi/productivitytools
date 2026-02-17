import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createPomodoroSession } from 'app/lib/api/timer'

export type TimerMode = 'pomodoro' | 'timer'
export type TimerStatus = 'idle' | 'running' | 'paused'

type TimerContextType = {
  mode: TimerMode
  status: TimerStatus
  timeLeft: number // in seconds (for pomodoro)
  elapsedTime: number // in seconds (for timer)
  totalDuration: number // in seconds (for pomodoro)
  projectId?: string
  setMode: (mode: TimerMode) => void
  setProjectId: (id: string | undefined) => void
  start: () => void
  pause: () => void
  stop: () => void
  reset: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<TimerMode>('pomodoro')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(25 * 60)
  const [projectId, setProjectId] = useState<string | undefined>(undefined)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleTimerComplete = useCallback(async () => {
    setStatus('idle')
    if (mode === 'pomodoro') {
      // Save session - always save in offline mode
      await createPomodoroSession({
        duration: totalDuration,
        project_id: projectId,
        notes: 'Pomodoro session',
      })
      // Reset timer
      setTimeLeft(totalDuration)
    }
  }, [mode, totalDuration, projectId])

  const tick = useCallback(() => {
    if (mode === 'pomodoro') {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    } else {
      setElapsedTime((prev) => prev + 1)
    }
  }, [mode])

  // Watch for completion
  useEffect(() => {
    if (mode === 'pomodoro' && status === 'running' && timeLeft === 0) {
      handleTimerComplete()
    }
  }, [mode, status, timeLeft, handleTimerComplete])

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [status, tick])

  const start = useCallback(() => setStatus('running'), [])
  const pause = useCallback(() => setStatus('paused'), [])
  
  const stop = useCallback(() => {
    setStatus('idle')
    if (mode === 'pomodoro') {
      setTimeLeft(totalDuration)
    } else {
      setElapsedTime(0)
    }
  }, [mode, totalDuration])

  const reset = useCallback(() => {
    setStatus('idle')
    if (mode === 'pomodoro') {
      setTimeLeft(totalDuration)
    } else {
      setElapsedTime(0)
    }
  }, [mode, totalDuration])

  const handleSetMode = useCallback((newMode: TimerMode) => {
    setMode(newMode)
    setStatus('idle')
    if (newMode === 'pomodoro') {
      setTimeLeft(25 * 60)
      setTotalDuration(25 * 60)
    } else {
      setElapsedTime(0)
    }
  }, [])

  return (
    <TimerContext.Provider
      value={{
        mode,
        status,
        timeLeft,
        elapsedTime,
        totalDuration,
        projectId,
        setMode: handleSetMode,
        setProjectId,
        start,
        pause,
        stop,
        reset,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export const useTimer = () => {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
