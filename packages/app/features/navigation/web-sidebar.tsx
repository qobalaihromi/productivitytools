'use client'

import { usePathname, useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Separator, Avatar, useMedia } from 'tamagui'
import { Home, List, Calendar, Clock, Settings } from '@tamagui/lucide-icons'

export function WebSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Projects', icon: List, path: '/projects' },
    { name: 'Planner', icon: Calendar, path: '/planner' },
    { name: 'Focus', icon: Clock, path: '/timer' },
  ]

  const isActive = (path: string) => pathname?.startsWith(path)

  return (
    <YStack
      width={240}
      backgroundColor="$background"
      borderRightWidth={1}
      borderColor="$borderColor"
      padding="$4"
      height="100vh"
      position="sticky"
      top={0}
      $sm={{ display: 'none' }}
    >
      <YStack gap="$4" flex={1}>
        <XStack alignItems="center" gap="$3" paddingHorizontal="$2">
            <Avatar circular size="$3">
                <Avatar.Image src="" />
                <Avatar.Fallback backgroundColor="$blue10" />
            </Avatar>
            <YStack>
                <Text fontWeight="bold" fontSize="$4">Tasktik</Text>
                <Text fontSize="$2" color="$color10">Productivity</Text>
            </YStack>
        </XStack>
        
        <Separator />

        <YStack gap="$2">
            {links.map(link => {
                const active = isActive(link.path)
                return (
                    <Button
                        key={link.path}
                        icon={link.icon}
                        justifyContent="flex-start"
                        backgroundColor={active ? '$color4' : 'transparent'}
                        hoverStyle={{ backgroundColor: '$color3' }}
                        onPress={() => router.push(link.path)}
                        unstyled
                        padding="$3"
                        borderRadius="$4"
                        cursor="pointer"
                        flexDirection="row"
                        alignItems="center"
                        gap="$3"
                    >
                        <link.icon size={20} color={active ? '$color12' : '$color10'} />
                        <Text color={active ? '$color12' : '$color10'} fontWeight={active ? '600' : '400'}>{link.name}</Text>
                    </Button>
                )
            })}
        </YStack>
      </YStack>

      <Separator marginVertical="$4" />

      <Button
        icon={Settings}
        chromeless
        onPress={() => router.push('/settings')}
        justifyContent="flex-start"
      >
        Settings
      </Button>
    </YStack>
  )
}
