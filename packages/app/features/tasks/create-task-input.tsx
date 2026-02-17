'use client'

import { useState } from 'react'
import { XStack, Input, Button } from 'tamagui'
import { Plus } from '@tamagui/lucide-icons'
import { createTask, type Task } from 'app/lib/api/tasks'

export function CreateTaskInput({
  projectId,
  onCreated,
}: {
  projectId: string
  onCreated: (task: Task) => void
}) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      const newTask = await createTask({
        project_id: projectId,
        title: title.trim(),
        priority: 'medium',
        status: 'todo',
      })
      onCreated(newTask)
      setTitle('')
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <XStack alignItems="center" gap="$2" paddingVertical="$2">
      <Plus size={20} color="$color8" />
      <Input
        flex={1}
        size="$3"
        borderWidth={0}
        placeholder="Add a task..."
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleSubmit} // Submit on Enter
        backgroundColor="transparent"
        focusStyle={{
          borderColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: '$blue8',
        }}
      />
      {title.length > 0 && (
        <Button
          size="$2"
          chromeless
          disabled={loading}
          onPress={handleSubmit}
        >
          <Button.Text color="$blue10" fontWeight="600">Add</Button.Text>
        </Button>
      )}
    </XStack>
  )
}
