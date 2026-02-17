import { TimerWidget } from 'app/features/timer/timer-widget'
import { Stack } from 'expo-router'
import { YStack } from 'tamagui'

export default function TimerPage() {
  return (
    <YStack flex={1} padding="$4" justifyContent="center">
      <Stack.Screen options={{ title: 'Focus Timer' }} />
      <TimerWidget />
    </YStack>
  )
}
