import { HomeScreen } from 'app/features/home/screen'
import { Stack, Redirect } from 'expo-router'

export default function Screen() {


  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
        }}
      />
      <Redirect href="/(tabs)/dashboard" />
    </>
  )
}
