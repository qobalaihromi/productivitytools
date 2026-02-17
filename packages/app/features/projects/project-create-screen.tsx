'use client'

import { useState } from 'react'
import {
  YStack,
  XStack,
  H2,
  Text,
  Button,
  Input,
  TextArea,
  Label,
  Separator,
} from 'tamagui'
import { ArrowLeft, Save } from '@tamagui/lucide-icons'
import { createProject, type CreateProjectInput } from 'app/lib/api/projects'

const PROJECT_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
  '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#06B6D4',
]

export function ProjectCreateScreen({
  onBack,
  onCreated,
}: {
  onBack: () => void
  onCreated: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Project name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const input: CreateProjectInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }
      const project = await createProject(input)
      onCreated(project.id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack flex={1} backgroundColor="$background" minHeight="100vh">
      {/* Header */}
      <XStack
        paddingHorizontal="$5"
        paddingVertical="$4"
        alignItems="center"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor="$color4"
      >
        <Button
          size="$3"
          chromeless
          icon={ArrowLeft}
          onPress={onBack}
        />
        <H2 size="$6" fontWeight="700" color="$color12">
          New Project
        </H2>
      </XStack>

      <YStack padding="$5" gap="$5" maxWidth={600} width="100%" alignSelf="center">
        {error && (
          <XStack backgroundColor="$red3" paddingHorizontal="$3" paddingVertical="$2" borderRadius="$4">
            <Text color="$red10" fontSize="$2">{error}</Text>
          </XStack>
        )}

        {/* Project Name */}
        <YStack gap="$2">
          <Label htmlFor="name" color="$color11" fontWeight="600">
            Project Name *
          </Label>
          <Input
            id="name"
            size="$4"
            placeholder="e.g. Website Redesign"
            value={name}
            onChangeText={setName}
            borderWidth={1}
            borderColor="$color6"
            focusStyle={{ borderColor: '$blue8' }}
          />
        </YStack>

        {/* Description */}
        <YStack gap="$2">
          <Label htmlFor="description" color="$color11" fontWeight="600">
            Description
          </Label>
          <TextArea
            id="description"
            size="$4"
            placeholder="Brief description of this project..."
            value={description}
            onChangeText={setDescription}
            numberOfLines={3}
            borderWidth={1}
            borderColor="$color6"
            focusStyle={{ borderColor: '$blue8' }}
          />
        </YStack>

        {/* Color */}
        <YStack gap="$2">
          <Label color="$color11" fontWeight="600">
            Color
          </Label>
          <XStack flexWrap="wrap" gap="$2">
            {PROJECT_COLORS.map((c) => (
              <XStack
                key={c}
                width={36}
                height={36}
                borderRadius="$10"
                backgroundColor={c as any}
                cursor="pointer"
                onPress={() => setColor(c)}
                borderWidth={3}
                borderColor={color === c ? '$color12' : 'transparent'}
              />
            ))}
          </XStack>
        </YStack>

        <Separator />

        {/* Dates */}
        <XStack gap="$4" flexWrap="wrap">
          <YStack gap="$2" flex={1} minWidth={200}>
            <Label htmlFor="start_date" color="$color11" fontWeight="600">
              Start Date
            </Label>
            <Input
              id="start_date"
              size="$4"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              borderWidth={1}
              borderColor="$color6"
              focusStyle={{ borderColor: '$blue8' }}
            />
          </YStack>
          <YStack gap="$2" flex={1} minWidth={200}>
            <Label htmlFor="end_date" color="$color11" fontWeight="600">
              End Date
            </Label>
            <Input
              id="end_date"
              size="$4"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
              borderWidth={1}
              borderColor="$color6"
              focusStyle={{ borderColor: '$blue8' }}
            />
          </YStack>
        </XStack>

        {/* Submit */}
        <Button
          size="$4"
          backgroundColor="$blue9"
          icon={Save}
          onPress={handleSubmit}
          disabled={loading || !name.trim()}
          opacity={loading || !name.trim() ? 0.6 : 1}
          pressStyle={{ backgroundColor: '$blue10' }}
          marginTop="$2"
        >
          <Button.Text color="white" fontWeight="600">
            {loading ? 'Creating...' : 'Create Project'}
          </Button.Text>
        </Button>
      </YStack>
    </YStack>
  )
}
