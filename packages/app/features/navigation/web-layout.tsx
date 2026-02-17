'use client'

import { WebSidebar } from 'app/features/navigation/web-sidebar'
import { XStack, YStack, ScrollView } from 'tamagui'

export function WebLayout({ children }: { children: React.ReactNode }) {
    return (
        <XStack height="100vh" overflow="hidden">
            <WebSidebar />
            <YStack flex={1} height="100%" overflow="hidden">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {children}
                </ScrollView>
            </YStack>
        </XStack>
    )
}
