import { useState, useEffect, useCallback } from 'react'
import {
  getTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput
} from 'app/lib/api/tasks'

export function useProjectTasks(projectId: string) {
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

  const createTask = async (input: CreateTaskInput) => {
    // Optimistic update? Hard for creation since we need ID.
    // We'll wait for API.
    try {
      const newTask = await apiCreateTask(input)
      setTasks((prev) => [newTask, ...prev])
      return newTask
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  }

  const updateTask = async (id: string, input: UpdateTaskInput) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...input } : t))
    )
    try {
      const updated = await apiUpdateTask(id, input)
      // Sync with real data (optional, but good for ID/timestamps)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (error) {
      console.error('Failed to update task:', error)
      fetchTasks() // Revert
    }
  }

  const toggleTask = async (id: string, currentStatus: Task['status']) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    updateTask(id, { status: newStatus })
  }

  const deleteTask = async (id: string) => {
    // Optimistic
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await apiDeleteTask(id)
    } catch (error) {
      console.error('Failed to delete task:', error)
      fetchTasks() // Revert
    }
  }

  const addTask = (task: Task) => {
    setTasks((prev) => [task, ...prev])
  }

  return {
    tasks,
    loading,
    refresh: fetchTasks,
    createTask,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  }
}
