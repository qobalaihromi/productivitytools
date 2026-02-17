import { DashboardScreen } from 'app/features/dashboard/dashboard-screen'
import { Stack } from 'expo-router'

export default function DashboardPage() {
  return (
    <>
      <Stack.Screen options={{ title: 'Dashboard' }} />
      <DashboardScreen />
    </>
  )
}
