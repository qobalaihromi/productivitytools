'use client'

import { WebSidebar } from 'app/features/navigation/web-sidebar'
import { XStack, YStack, ScrollView } from 'tamagui'
import { usePathname } from 'next/navigation'

export function WebLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup')

    if (isAuthPage) {
        return <>{children}</>
    }

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
