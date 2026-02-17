import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, Text, XStack, YStack, Avatar } from 'tamagui'
import { GripVertical } from '@tamagui/lucide-icons'
import { Task } from 'app/lib/api/tasks'

type KanbanCardProps = {
  task: Task
  isOverlay?: boolean
}

export function KanbanCard({ task, isOverlay }: KanbanCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  return (
    <Card
      ref={setNodeRef as any}
      style={style}
      {...(attributes as any)}
      {...listeners}
      borderWidth={1}
      borderColor="$borderColor"
      elevation={isDragging || isOverlay ? '$4' : '$1'}
      opacity={isDragging ? 0.5 : 1}
      backgroundColor="$background"
      borderRadius="$4"
      padding="$3"
      gap="$2"
      marginBottom="$3"
      cursor="grab"
      hoverStyle={{ borderColor: '$color8' }}
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <Text fontSize="$3" fontWeight="600" color="$color12" numberOfLines={2} flex={1}>
          {task.title}
        </Text>
        <GripVertical size={16} color="$color8" />
      </XStack>
      
      {task.description && (
        <Text fontSize="$2" color="$color10" numberOfLines={2}>
          {task.description}
        </Text>
      )}

      <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
        <XStack gap="$2" alignItems="center">
           {/* Priority Badge */}
           <XStack 
             backgroundColor={
               task.priority === 'high' ? '$red4' : 
               task.priority === 'medium' ? '$orange4' : '$green4'
             } 
             paddingHorizontal="$2" 
             paddingVertical="$1" 
             borderRadius="$4"
           >
             <Text fontSize={10} color={
               task.priority === 'high' ? '$red11' : 
               task.priority === 'medium' ? '$orange11' : '$green11'
             } fontWeight="700" textTransform="uppercase">
               {task.priority || 'No Priority'}
             </Text>
           </XStack>
        </XStack>

        {/* Avatar placeholder */}
        <Avatar circular size="$2">
          <Avatar.Image src="http://placekitten.com/50/50" />
          <Avatar.Fallback backgroundColor="$blue10" />
        </Avatar>
      </XStack>
    </Card>
  )
}
