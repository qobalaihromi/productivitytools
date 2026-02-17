'use client'

import { useState } from 'react'
import { XStack, Text, Button, Checkbox, YStack } from 'tamagui'
import { Check, Calendar, Flag, GripVertical } from '@tamagui/lucide-icons'
import type { Task } from 'app/lib/api/tasks'

export function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task
  onToggle: (id: string, status: Task['status']) => void
  onDelete: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  const priorityColor = {
    urgent: '$red10',
    high: '$orange10',
    medium: '$blue10',
    low: '$gray10',
  }[task.priority] || '$gray10'

  return (
    <XStack
      // group="item" removed as we use state for hover
      alignItems="center"
      gap="$3"
      paddingVertical="$2"
      paddingHorizontal="$3"
      backgroundColor="$background"
      hoverStyle={{ backgroundColor: '$color2' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      borderRadius="$3"
      borderWidth={1}
      borderColor="transparent"
      cursor="pointer"
    >
      {/* Drag Handle (visible on hover) */}
      <YStack opacity={hovered ? 1 : 0} cursor="grab">
        <GripVertical size={16} color="$color8" />
      </YStack>

      {/* Checkbox */}
      <Checkbox
        size="$4"
        checked={task.status === 'done'}
        onCheckedChange={() => onToggle(task.id, task.status)}
        borderColor={task.status === 'done' ? ('$green9' as any) : '$color8'}
        backgroundColor={task.status === 'done' ? ('$green9' as any) : 'transparent'}
      >
        <Checkbox.Indicator>
          <Check color="white" />
        </Checkbox.Indicator>
      </Checkbox>

      {/* Content */}
      <YStack flex={1} gap="$1">
        <Text
          fontSize="$3"
          color="$color12"
          textDecorationLine={task.status === 'done' ? 'line-through' : 'none'}
          opacity={task.status === 'done' ? 0.6 : 1}
        >
          {task.title}
        </Text>
        
        {/* Metadata Row */}
        <XStack gap="$3" alignItems="center">
          {task.due_date && (
            <XStack gap="$1.5" alignItems="center">
              <Calendar size={12} color="$color9" />
              <Text fontSize="$2" color="$color9">
                {task.due_date}
              </Text>
            </XStack>
          )}
          
          <XStack gap="$1.5" alignItems="center">
            <Flag size={12} color={priorityColor as any} />
            <Text fontSize="$2" color="$color9" textTransform="capitalize">
              {task.priority}
            </Text>
          </XStack>
        </XStack>
      </YStack>

      {/* Actions */}
      {hovered && (
        <Button
          size="$2"
          chromeless
          onPress={() => onDelete(task.id)}
          icon={null} // Tamagui fix
        >
          <Button.Text color="$red10" fontSize="$2" fontWeight="600">Delete</Button.Text>
        </Button>
      )}
    </XStack>
  )
}
