import { XStack, Text } from 'tamagui'
import { Task } from 'app/lib/api/tasks'
import { differenceInDays } from 'date-fns'

type TimelineRowProps = {
  task: Task
  timelineStartDate: Date
  dayWidth: number
}

export function TimelineRow({ task, timelineStartDate, dayWidth }: TimelineRowProps) {
  // Determine start and end
  // If no start_date, use created_at? Or assumed "today" if timeline starts today?
  // If no due_date, assume 1 day duration?
  
  const startDate = task.start_date ? new Date(task.start_date) : new Date(task.created_at)
  const endDate = task.due_date ? new Date(task.due_date) : startDate
  
  // Calculate position
  const startOffsetDays = differenceInDays(startDate, timelineStartDate)
  const durationDays = differenceInDays(endDate, startDate) + 1 // inclusive
  
  const left = startOffsetDays * dayWidth
  const width = Math.max(durationDays, 1) * dayWidth

  if (startOffsetDays < 0) {
     // Task started before timeline start?
     // For now, let's just clip it or hide it? 
     // Or render it partially?
     // Simple: only render if it overlaps?
     // We'll trust the offset for now. If negative, it might go off screen left.
  }

  // Color based on priority
  const color = 
    task.priority === 'urgent' ? '$red9' :
    task.priority === 'high' ? '$orange9' :
    task.priority === 'medium' ? '$blue9' : '$green9'

  return (
    <XStack
      position="absolute"
      left={left}
      width={width}
      height={30}
      backgroundColor={color}
      borderRadius="$4"
      alignItems="center"
      paddingHorizontal="$2"
      overflow="hidden"
      opacity={task.status === 'done' ? 0.6 : 1}
    >
      <Text fontSize={10} color="white" fontWeight="600" numberOfLines={1}>
        {task.title}
      </Text>
    </XStack>
  )
}
