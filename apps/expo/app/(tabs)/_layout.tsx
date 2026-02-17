import { Tabs } from 'expo-router'
import { Home, List, Calendar, Clock } from '@tamagui/lucide-icons'
import { useTheme } from 'tamagui'

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.blue10.val,
        tabBarStyle: {
            backgroundColor: theme.background.val,
            borderTopColor: theme.borderColor.val,
        },
        headerStyle: {
            backgroundColor: theme.background.val,
        },
        headerTintColor: theme.color.val,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          headerShown: false, // Stack handles header
          tabBarIcon: ({ color }) => <List color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color }) => <Calendar color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color }) => <Clock color={color as any} />,
        }}
      />
    </Tabs>
  )
}
