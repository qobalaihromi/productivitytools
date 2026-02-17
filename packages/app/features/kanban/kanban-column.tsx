import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { YStack, Text, XStack } from 'tamagui'
import { KanbanCard } from './kanban-card'
import { Task } from 'app/lib/api/tasks'

type KanbanColumnProps = {
  id: string
  title: string
  tasks: Task[]
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: 'Column',
      id,
    },
  })

  return (
    <YStack
      ref={setNodeRef as any}
      width={300}
      backgroundColor="$color2"
      borderRadius="$6"
      padding="$3"
      height="100%"
      flex={1}
      minWidth={300}
    >
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
        <Text fontSize="$5" fontWeight="700" color="$color12">
          {title}
        </Text>
        <XStack backgroundColor="$color5" paddingHorizontal="$2" borderRadius="$10">
          <Text fontSize="$3" fontWeight="600" color="$color11">
            {tasks.length}
          </Text>
        </XStack>
      </XStack>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <YStack flex={1} gap="$2">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </YStack>
      </SortableContext>
    </YStack>
  )
}
