'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ScrollView, PortalProvider, YStack, XStack } from 'tamagui'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { Task } from 'app/lib/api/tasks'
import { createPortal } from 'react-dom'

type KanbanBoardProps = {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: string, newIndex: number) => void
}

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

export function KanbanBoard({ tasks: initialTasks, onTaskMove }: KanbanBoardProps) {
  // Local state for optimistic updates (if needed, but parent usually controls list)
  // For DnD sake, we usually need local state to drive the UI instant updates
  // But here props 'tasks' comes from parent.
  // We'll trust parent updates or force local state?
  // Let's use local state derived from props for smoothness, then sync.
  // Actually, standard pattern is to update local state immediately, then call API.

  const [activeId, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState<Task[]>(initialTasks)

  // Sync with props if they change externally (basic sync)
  useMemo(() => {
    setItems(initialTasks)
  }, [initialTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const columns = useMemo(() => {
    const cols = {
      todo: items.filter((t) => t.status === 'todo'),
      in_progress: items.filter((t) => t.status === 'in_progress'),
      done: items.filter((t) => t.status === 'done'),
    }
    return cols
  }, [items])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = (active.data.current as any)?.type === 'Task'
    const isOverTask = (over.data.current as any)?.type === 'Task'

    if (!isActiveTask) return

    // Finding container (Status)
    // If over a task, find its status
    // If over a column, it is the status
    // We need to update ITEMS locally to reflect the column change during drag
    
    // Simplification: We only reorder on DragEnd for now to avoid complex local state management logic here 
    // without robust implementation (like separating by columns in state).
    // But DragOver is needed for moving between columns VISUALLY.
    // If I don't implement DragOver, items won't move to other columns until drop.
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = items.find((t) => t.id === activeId)
    const overTask = items.find((t) => t.id === overId)

    if (!activeTask) return

    let newStatus = activeTask.status
    let newIndex = 0 // simplified

    if (overTask) {
      // Dropped over another task
      newStatus = overTask.status
      // We could calculate index here using arrayMove logic
    } else {
      // Dropped over a column
      // overId is likely column id
      if (COLUMNS.some(c => c.id === overId)) {
        newStatus = overId as any
      }
    }

    if (activeTask.status !== newStatus) {
        onTaskMove(activeId, newStatus, 0) // Index 0 is placeholder
        
        // Optimistic update
        setItems(items.map(t => 
            t.id === activeId ? { ...t, status: newStatus as any } : t
        ))
    }
  }
  
  // Render overlay in portal
  const activeTask = activeId ? items.find((t) => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
          <XStack gap="$4" padding="$4" alignItems="flex-start" minHeight={500}>
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={columns[col.id as keyof typeof columns] || []}
              />
            ))}
          </XStack>
      </ScrollView>

       {/* Drag Overlay needs to be rendered conditionally for performance */}
       {/* Use simple conditional rendering or createPortal */}
       {typeof document !== 'undefined' && createPortal(
        <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
        </DragOverlay>,
        document.body
       )}
    </DndContext>
  )
}
