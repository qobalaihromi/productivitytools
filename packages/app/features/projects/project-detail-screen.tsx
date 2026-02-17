'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  YStack,
  XStack,
  H2,
  H3,
  Text,
  Button,
  Card,
  Spinner,
  Paragraph,
  Separator,
} from 'tamagui'
import { ArrowLeft, Trash2, Calendar, Clock, LayoutGrid, List as LayoutList } from '@tamagui/lucide-icons'
import { getProject, deleteProject, type Project } from 'app/lib/api/projects'
import { TaskList } from 'app/features/tasks/task-list'
import { useProjectTasks } from 'app/features/tasks/use-project-tasks'
import { KanbanBoard } from 'app/features/kanban/kanban-board'

export function ProjectDetailScreen({
  projectId,
  onBack,
}: {
  projectId: string
  onBack: () => void
}) {
  const [project, setProject] = useState<Project | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  const [view, setView] = useState<'list' | 'board'>('list')
  const { tasks, loading: loadingTasks, addTask, updateTask, toggleTask, deleteTask: removeTask } = useProjectTasks(projectId)

  const fetchProject = useCallback(async () => {
    try {
      setLoadingProject(true)
      const data = await getProject(projectId)
      setProject(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingProject(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const handleDelete = async () => {
    if (!project) return
    const confirmed = window.confirm(`Delete "${project.name}"? This cannot be undone.`)
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteProject(project.id)
      onBack()
    } catch (err: any) {
      setError(err.message)
      setDeleting(false)
    }
  }

  const handleTaskMove = (taskId: string, newStatus: string, newIndex: number) => {
      if (['todo', 'in_progress', 'done'].includes(newStatus)) {
        updateTask(taskId, { status: newStatus as any, position: newIndex })
      }
  }

  if (loadingProject) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh">
        <Spinner size="large" color="$blue9" />
      </YStack>
    )
  }

  if (error || !project) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh" gap="$3">
        <Text color="$red10">Error: {error || 'Project not found'}</Text>
        <Button size="$3" onPress={onBack} icon={ArrowLeft}>
          <Button.Text>Back to Projects</Button.Text>
        </Button>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background" minHeight="100vh">
      {/* Header */}
      <XStack
        paddingHorizontal="$5"
        paddingVertical="$4"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="$color4"
      >
        <XStack alignItems="center" gap="$3">
          <Button
            size="$3"
            chromeless
            icon={ArrowLeft}
            onPress={onBack}
          />
          <XStack
            width={12}
            height={12}
            borderRadius="$10"
            backgroundColor={project.color as any}
          />
          <H2 size="$6" fontWeight="700" color="$color12">
            {project.name}
          </H2>
        </XStack>
        <XStack gap="$2">
          <Button
            size="$3"
            chromeless
            icon={Trash2}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Button.Text color="$red10">{deleting ? 'Deleting...' : 'Delete'}</Button.Text>
          </Button>
        </XStack>
      </XStack>

      <YStack padding="$5" gap="$5" maxWidth={1200} width="100%" alignSelf="center">
        {/* Project Info */}
        <Card padding="$4" borderRadius="$4" borderWidth={1} borderColor="$color4">
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontWeight="600" color="$color11" fontSize="$3">Details</Text>
              <XStack
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$3"
                backgroundColor={
                  project.status === 'active' ? '$green3' :
                  project.status === 'completed' ? '$blue3' : '$color3'
                }
              >
                <Text
                  fontSize="$2"
                  fontWeight="500"
                  color={
                    project.status === 'active' ? '$green10' :
                    project.status === 'completed' ? '$blue10' : '$color9'
                  }
                >
                  {project.status}
                </Text>
              </XStack>
            </XStack>

            {project.description && (
              <Paragraph color="$color10" fontSize="$3">
                {project.description}
              </Paragraph>
            )}

            <Separator />

            <XStack gap="$6" flexWrap="wrap">
              {project.start_date && (
                <XStack alignItems="center" gap="$2">
                  <Calendar size={14} color="$color9" />
                  <Text color="$color9" fontSize="$2">Start: {project.start_date}</Text>
                </XStack>
              )}
              {project.end_date && (
                <XStack alignItems="center" gap="$2">
                  <Calendar size={14} color="$color9" />
                  <Text color="$color9" fontSize="$2">End: {project.end_date}</Text>
                </XStack>
              )}
              <XStack alignItems="center" gap="$2">
                <Clock size={14} color="$color9" />
                <Text color="$color9" fontSize="$2">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </Text>
              </XStack>
            </XStack>
          </YStack>
        </Card>

        {/* Views Toggle */}
        <XStack gap="$3" alignItems="center" justifyContent="space-between">
            <H3 size="$5" fontWeight="600" color="$color12">Tasks</H3>
            <XStack backgroundColor="$color3" borderRadius="$4" padding="$1">
                <Button 
                    size="$2" 
                    chromeless={view !== 'list'} 
                    onPress={() => setView('list')}
                    backgroundColor={view === 'list' ? '$background' : 'transparent'}
                    icon={LayoutList}
                >
                    List
                </Button>
                <Button 
                    size="$2" 
                    chromeless={view !== 'board'} 
                    onPress={() => setView('board')}
                    backgroundColor={view === 'board' ? '$background' : 'transparent'}
                    icon={LayoutGrid}
                >
                    Board
                </Button>
            </XStack>
        </XStack>

        {/* Content */}
        {view === 'list' ? (
             <TaskList 
                projectId={projectId} 
                tasks={tasks} 
                loading={loadingTasks} 
                addTask={addTask}
                onToggle={toggleTask}
                onDelete={removeTask}
             />
        ) : (
             <KanbanBoard 
                tasks={tasks} 
                onTaskMove={handleTaskMove}
             />
        )}
      </YStack>
    </YStack>
  )
}
