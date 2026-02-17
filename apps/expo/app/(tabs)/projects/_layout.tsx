import { Stack } from 'expo-router'

export default function ProjectsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Projects' }} />
      <Stack.Screen name="[id]" options={{ title: 'Project Details' }} />
      <Stack.Screen name="new" options={{ title: 'New Project', presentation: 'modal' }} />
    </Stack>
  )
}
