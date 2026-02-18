'use client'

import { YStack, H1, Paragraph, Theme, Card, XStack, Text, Separator } from 'tamagui'
import { Check, Timer, LayoutGrid, CalendarDays, Brain } from '@tamagui/lucide-icons'

export function LoginScreen() {
  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center" padding="$4" minHeight="100vh">
        <YStack
          maxWidth={420}
          width="100%"
          gap="$5"
          alignItems="center"
        >
          {/* Logo / Brand */}
          <YStack alignItems="center" gap="$2">
            <XStack
              backgroundColor="$blue6"
              width={56}
              height={56}
              borderRadius="$6"
              alignItems="center"
              justifyContent="center"
            >
              <Check size={28} color="white" strokeWidth={3} />
            </XStack>
            <H1 size="$9" fontWeight="800" color="$color12" letterSpacing={-1}>
              Tasktik
            </H1>
            <Paragraph color="$color10" size="$4" textAlign="center">
              All-in-one productivity app for focused work
            </Paragraph>
          </YStack>

          {/* Feature pills */}
          <XStack flexWrap="wrap" gap="$2" justifyContent="center">
            {[
              { icon: Timer, label: 'Timer' },
              { icon: LayoutGrid, label: 'Kanban' },
              { icon: CalendarDays, label: 'Timeline' },
              { icon: Brain, label: 'Smart Plan' },
            ].map(({ icon: Icon, label }) => (
              <XStack
                key={label}
                backgroundColor="$color3"
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius="$10"
                alignItems="center"
                gap="$1.5"
              >
                <Icon size={14} color="$color11" />
                <Text color="$color11" fontSize="$2" fontWeight="500">
                  {label}
                </Text>
              </XStack>
            ))}
          </XStack>
          
          <Separator width="60%" />

          <Card padding="$4" borderWidth={1} borderColor="$borderColor">
            <Paragraph textAlign="center">
              You are using the offline mode. No login required.
            </Paragraph>
          </Card>
        </YStack>
      </YStack>
    </Theme>
  )
}
