'use client'

import { useEffect, useState } from 'react'
import { YStack, XStack, H2, H4, Text, Card, ScrollView, Spinner, Separator } from 'tamagui'
import { CheckCircle, Clock, Calendar, Activity } from '@tamagui/lucide-icons'
import { getDashboardStats, DashboardStats } from 'app/lib/api/dashboard'
import { useAuth } from 'app/provider/auth'
import { format } from 'date-fns'

export function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (!stats) return null

  return (
    <ScrollView contentContainerStyle={{ padding: '$4', gap: '$4' }}>
      <YStack gap="$2">
          <H2>Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}</H2>
          <Text color="$color10">Here's your productivity overview.</Text>
      </YStack>

      <XStack gap="$4" flexWrap="wrap">
        <StatsCard 
          title="Tasks Today" 
          value={stats.tasksCompletedToday.toString()} 
          subtitle="Completed" 
          icon={CheckCircle} 
          color="$green9" 
        />
        <StatsCard 
            title="Focus Today" 
            value={`${Math.round(stats.pomodoroMinutesToday)}m`} 
            subtitle="Deep Work" 
            icon={Clock} 
            color="$blue9" 
        />
        <StatsCard 
            title="Tasks Week" 
            value={stats.tasksCompletedWeek.toString()} 
            subtitle="Completed" 
            icon={CheckCircle} 
            color="$green10" 
        />
        <StatsCard 
            title="Focus Week" 
            value={`${Math.round(stats.pomodoroMinutesWeek / 60)}h`} 
            subtitle="Deep Work" 
            icon={Clock} 
            color="$blue10" 
        />
      </XStack>

      <XStack gap="$4" flexDirection="column" $sm={{ flexDirection: 'row' }}>
        {/* Upcoming Deadlines */}
        <Card flex={1} padding="$4" elevation="$2" borderWidth={1} borderColor="$color4">
          <XStack gap="$2" alignItems="center" marginBottom="$3">
            <Calendar size={20} color="$orange9" />
            <H4>On the Horizon</H4>
          </XStack>
          <YStack gap="$3">
            {stats.upcomingDeadlines.length === 0 ? (
                <Text color="$color10" fontStyle="italic">No upcoming deadlines.</Text>
            ) : (
                stats.upcomingDeadlines.map(task => (
                    <YStack key={task.id} gap="$1">
                        <XStack justifyContent="space-between">
                            <Text fontWeight="600">{task.title}</Text>
                            <Text color="$red9" fontSize="$2">{format(new Date(task.due_date), 'MMM d')}</Text>
                        </XStack>
                        {task.project && <Text fontSize="$2" color={task.project.color as any || '$color10'}>{task.project.name}</Text>}
                        <Separator />
                    </YStack>
                ))
            )}
          </YStack>
        </Card>

        {/* Recent Activity */}
        <Card flex={1} padding="$4" elevation="$2" borderWidth={1} borderColor="$color4">
          <XStack gap="$2" alignItems="center" marginBottom="$3">
            <Activity size={20} color="$purple9" />
            <H4>Recent Wins</H4>
          </XStack>
          <YStack gap="$3">
            {stats.recentActivity.length === 0 ? (
                <Text color="$color10" fontStyle="italic">No recent activity.</Text>
            ) : (
                stats.recentActivity.map(act => (
                    <XStack key={act.id} justifyContent="space-between" alignItems="center">
                        <Text numberOfLines={1} flex={1}>{act.title}</Text>
                        <Text fontSize="$2" color="$color10">{format(new Date(act.timestamp), 'h:mm a')}</Text>
                    </XStack>
                ))
            )}
          </YStack>
        </Card>
      </XStack>
    </ScrollView>
  )
}

function StatsCard({ title, value, subtitle, icon: Icon, color }: { title: string, value: string, subtitle: string, icon: any, color: string }) {
    return (
        <Card flex={1} minWidth={150} padding="$4" elevation="$2" borderWidth={1} borderColor="$color4">
            <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack>
                    <Text color="$color10" fontSize="$2" textTransform="uppercase" fontWeight="600">{title}</Text>
                    <H2 color="$color12">{value}</H2>
                    <Text color="$color10" fontSize="$2">{subtitle}</Text>
                </YStack>
                <YStack backgroundColor="$color4" padding="$2" borderRadius="$4">
                    <Icon color={color} size={24} />
                </YStack>
            </XStack>
        </Card>
    )
}
