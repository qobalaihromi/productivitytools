import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

export type TimerMode = 'pomodoro' | 'timer'
export type TimerStatus = 'idle' | 'running' | 'paused'

type TimerContextType = {
  mode: TimerMode
  status: TimerStatus
  timeLeft: number // in seconds (for pomodoro)
  elapsedTime: number // in seconds (for timer)
  totalDuration: number // in seconds (for pomodoro)
  setMode: (mode: TimerMode) => void
  start: () => void
  pause: () => void
  stop: () => void
  reset: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<TimerMode>('pomodoro')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 mins default
  const [elapsedTime, setElapsedTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(25 * 60)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const tick = useCallback(() => {
    if (mode === 'pomodoro') {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
          setStatus('idle')
          return 0
        }
        return prev - 1
      })
    } else {
      setElapsedTime((prev) => prev + 1)
    }
  }, [mode])

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
        setMode: handleSetMode,
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
