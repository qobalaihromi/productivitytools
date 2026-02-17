'use client'

import { useState, useEffect, useCallback } from 'react'
import { YStack, Spinner, Text, Card } from 'tamagui'
import { getTasks, toggleTaskStatus, deleteTask, type Task } from 'app/lib/api/tasks'
import { TaskItem } from './task-item'
import { CreateTaskInput } from './create-task-input'

export function TaskList({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getTasks(projectId)
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev])
  }

  const handleToggle = async (id: string, status: Task['status']) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: status === 'done' ? 'todo' : 'done' } : t
      )
    )
    try {
      await toggleTaskStatus(id, status)
    } catch (error) {
      // Revert if failed
      console.error('Toggle failed:', error)
      fetchTasks()
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task?')) return
    
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id))
    
    try {
      await deleteTask(id)
    } catch (error) {
      console.error('Delete failed:', error)
      fetchTasks()
    }
  }

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
        <CreateTaskInput projectId={projectId} onCreated={handleTaskCreated} />
        
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
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </YStack>
        )}
      </YStack>
    </Card>
  )
}
