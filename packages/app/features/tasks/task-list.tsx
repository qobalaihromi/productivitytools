'use client'

import { YStack, Spinner, Text, Card } from 'tamagui'
import { type Task } from 'app/lib/api/tasks'
import { TaskItem } from './task-item'
import { CreateTaskInput } from './create-task-input'

type TaskListProps = {
  projectId: string
  tasks: Task[]
  loading: boolean
  addTask: (task: Task) => void
  onToggle: (id: string, status: Task['status']) => void
  onDelete: (id: string) => void
}

export function TaskList({ 
  projectId, 
  tasks, 
  loading, 
  addTask, 
  onToggle, 
  onDelete 
}: TaskListProps) {
  
  if (loading && tasks.length === 0) {
    return (
      <YStack padding="$4" alignItems="center">
        <Spinner size="small" color="$blue9" />
      </YStack>
    )
  }

  return (
    <Card padding="$4" borderRadius="$4" borderColor="$color4" borderWidth={1}>
      <YStack gap="$2">
        <CreateTaskInput projectId={projectId} onCreated={addTask} />
        
        {tasks.length === 0 ? (
          <YStack padding="$4" alignItems="center" opacity={0.5}>
            <Text>No tasks yet</Text>
          </YStack>
        ) : (
          <YStack gap="$1">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </YStack>
        )}
      </YStack>
    </Card>
  )
}
