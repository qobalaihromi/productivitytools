'use client'

import { useMemo, useState } from 'react'
import { ScrollView, YStack, XStack, Text } from 'tamagui'
import { TimelineGrid } from './timeline-grid'
import { TimelineRow } from './timeline-row'
import { Task } from 'app/lib/api/tasks'
import { startOfMonth, subDays, addDays } from 'date-fns'

type TimelineViewProps = {
  tasks: Task[]
}

const DAY_WIDTH = 50

export function TimelineView({ tasks }: TimelineViewProps) {
  // Determine timeline range
  // Default to [start of this month - 7 days] to [start + 30 days] if no tasks
  // Or range covering all tasks
  
  const timelineRange = useMemo(() => {
    const now = new Date()
    const start = subDays(startOfMonth(now), 7)
    // Find min start and max end from tasks if available?
    // For simplicity MVP: Fixed window of 60 days around current month
    return {
      start: start,
      days: 60
    }
  }, [])

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
      <YStack>
        <TimelineGrid startDate={timelineRange.start} days={timelineRange.days} dayWidth={DAY_WIDTH} />
        
        <YStack position="relative" height={tasks.length * 40} marginTop="$2">
            {tasks.map((task, index) => (
                <YStack key={task.id} height={40} justifyContent="center" width="100%">
                    {/* Placeholder for row background lines? */}
                     <XStack 
                        position="absolute" 
                        top={0} 
                        bottom={0} 
                        left={0} 
                        right={0} 
                        zIndex={-1}
                    >
                         {/* We could render grid lines here too */}
                    </XStack>
                    
                    <TimelineRow 
                        task={task} 
                        timelineStartDate={timelineRange.start} 
                        dayWidth={DAY_WIDTH} 
                    />
                </YStack>
            ))}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
