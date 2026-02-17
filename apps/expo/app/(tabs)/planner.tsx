import { PlannerScreen } from 'app/features/planner/planner-screen'
import { Stack } from 'expo-router'

export default function PlannerPage() {
  return (
      <>
        <Stack.Screen options={{ title: 'Daily Planner' }} />
        <PlannerScreen />
      </>
  )
}
