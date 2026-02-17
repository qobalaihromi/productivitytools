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
  ScrollView,
} from 'tamagui'
import { Plus, FolderOpen, ChevronRight, LogOut } from '@tamagui/lucide-icons'
import { getProjects, deleteProject, type Project } from 'app/lib/api/projects'
import { useAuth } from 'app/provider/auth'

const PROJECT_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
  '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#06B6D4',
]

export function ProjectListScreen({
  onNavigateToCreate,
  onNavigateToDetail,
}: {
  onNavigateToCreate: () => void
  onNavigateToDetail: (id: string) => void
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, signOut } = useAuth()

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

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
          <XStack
            backgroundColor="$blue6"
            width={36}
            height={36}
            borderRadius="$4"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontWeight="800" fontSize="$3">T</Text>
          </XStack>
          <H2 size="$7" fontWeight="700" color="$color12">
            Projects
          </H2>
        </XStack>
        <XStack gap="$2" alignItems="center">
          <Text color="$color9" fontSize="$2">{user?.email}</Text>
          <Button
            size="$3"
            chromeless
            icon={LogOut}
            onPress={signOut}
          />
        </XStack>
      </XStack>

      <ScrollView>
        <YStack padding="$5" gap="$4" maxWidth={960} width="100%" alignSelf="center">
          {/* Action bar */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text color="$color10" fontSize="$3">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </Text>
            <Button
              size="$3"
              backgroundColor="$blue9"
              icon={Plus}
              onPress={onNavigateToCreate}
              pressStyle={{ backgroundColor: '$blue10' }}
            >
              <Button.Text color="white" fontWeight="600">New Project</Button.Text>
            </Button>
          </XStack>

          {/* Content */}
          {loading && (
            <YStack alignItems="center" paddingVertical="$8">
              <Spinner size="large" color="$blue9" />
            </YStack>
          )}

          {error && (
            <Card padding="$4" backgroundColor="$red3" borderRadius="$4">
              <Text color="$red10">{error}</Text>
            </Card>
          )}

          {!loading && !error && projects.length === 0 && (
            <YStack alignItems="center" paddingVertical="$10" gap="$3">
              <FolderOpen size={48} color="$color7" />
              <H3 color="$color9" fontWeight="500">No projects yet</H3>
              <Paragraph color="$color8" textAlign="center" maxWidth={300}>
                Create your first project to start tracking tasks and time.
              </Paragraph>
              <Button
                size="$4"
                backgroundColor="$blue9"
                icon={Plus}
                onPress={onNavigateToCreate}
                pressStyle={{ backgroundColor: '$blue10' }}
                marginTop="$2"
              >
                <Button.Text color="white" fontWeight="600">Create Project</Button.Text>
              </Button>
            </YStack>
          )}

          {!loading && !error && projects.length > 0 && (
            <YStack gap="$3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  padding="$4"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor="$color4"
                  pressStyle={{ backgroundColor: '$color2' }}
                  onPress={() => onNavigateToDetail(project.id)}
                  cursor="pointer"
                >
                  <XStack alignItems="center" gap="$3">
                    <XStack
                      width={12}
                      height={12}
                      borderRadius="$10"
                      backgroundColor={project.color as any || '#3B82F6'}
                    />
                    <YStack flex={1} gap="$1">
                      <Text fontWeight="600" color="$color12" fontSize="$4">
                        {project.name}
                      </Text>
                      {project.description && (
                        <Text color="$color9" fontSize="$2" numberOfLines={1}>
                          {project.description}
                        </Text>
                      )}
                    </YStack>
                    <XStack alignItems="center" gap="$2">
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
                          fontSize="$1"
                          fontWeight="500"
                          color={
                            project.status === 'active' ? '$green10' :
                            project.status === 'completed' ? '$blue10' : '$color9'
                          }
                        >
                          {project.status}
                        </Text>
                      </XStack>
                      <ChevronRight size={16} color="$color8" />
                    </XStack>
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
