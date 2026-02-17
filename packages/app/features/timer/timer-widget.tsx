'use client'

import { useState } from 'react'
import { Card, XStack, Text, Button, YStack } from 'tamagui'
import { Play, Pause, Square, Timer as TimerIcon } from '@tamagui/lucide-icons'
import { useTimer } from 'app/lib/timer/TimerContext'
import { useAuth } from 'app/provider/auth'

export function TimerWidget() {
  const { user } = useAuth()
  const { mode, status, timeLeft, elapsedTime, start, pause, stop, setMode } = useTimer()
  const [expanded, setExpanded] = useState(false)

  if (!user) return null

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const displayTime = mode === 'pomodoro' ? formatTime(timeLeft) : formatTime(elapsedTime)

  if (!expanded) {
    return (
      <Card
        position="absolute"
        bottom="$4"
        right="$4"
        elevation="$4"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$10"
        padding="$2"
        cursor="pointer"
        onPress={() => setExpanded(true)}
        backgroundColor="$background"
        hoverStyle={{ scale: 1.05 }}
      >
        <XStack alignItems="center" gap="$2">
          <TimerIcon size={20} color={status === 'running' ? '$green10' : '$color10'} />
          <Text fontFamily="$body" fontSize="$4" fontWeight="600">
            {displayTime}
          </Text>
        </XStack>
      </Card>
    )
  }

  return (
    <Card
      position="absolute"
      bottom="$4"
      right="$4"
      elevation="$4"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$6"
      padding="$4"
      backgroundColor="$background"
      width={280}
    >
      <YStack gap="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontWeight="600" color="$color11">
            {mode === 'pomodoro' ? 'Pomodoro' : 'Stopwatch'}
          </Text>
          <Button
            size="$2"
            chromeless
            icon={expanded ? <Square size={12} /> : undefined}
            onPress={() => setExpanded(false)}
          >
            Minimize
          </Button>
        </XStack>

        {/* Time Display */}
        <YStack alignItems="center" paddingVertical="$2">
          <Text fontFamily="$body" fontSize={48} fontWeight="700" color="$color12" lineHeight={56}>
            {displayTime}
          </Text>
        </YStack>

        {/* Controls */}
        <XStack justifyContent="center" gap="$4">
          {status === 'running' ? (
            <Button
              size="$4"
              circular
              icon={<Pause size={20} />}
              onPress={pause}
              backgroundColor="$color8"
            />
          ) : (
            <Button
              size="$4"
              circular
              icon={<Play size={20} />}
              onPress={start}
              backgroundColor="$blue10"
            />
          )}

          <Button
            size="$4"
            circular
            chromeless
            icon={<Square size={16} color="$red10" />}
            onPress={stop}
            disabled={status === 'idle' && (mode === 'pomodoro' ? timeLeft === 25 * 60 : elapsedTime === 0)}
          />
        </XStack>

        {/* Mode Switcher */}
        <XStack backgroundColor="$color3" borderRadius="$4" padding="$1">
          <Button
            flex={1}
            size="$2"
            chromeless={mode !== 'pomodoro'}
            onPress={() => setMode('pomodoro')}
            backgroundColor={mode === 'pomodoro' ? '$background' : 'transparent'}
          >
            Pomodoro
          </Button>
          <Button
            flex={1}
            size="$2"
            chromeless={mode !== 'timer'}
            onPress={() => setMode('timer')}
            backgroundColor={mode === 'timer' ? '$background' : 'transparent'}
          >
            Stopwatch
          </Button>
        </XStack>
      </YStack>
    </Card>
  )
}
