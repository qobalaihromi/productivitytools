'use client'

import { useState, useEffect, useMemo } from 'react'
import { YStack, XStack, Text, H2, Button, Card, ScrollView, Input } from 'tamagui'
import { 
  DndContext, 
  DragOverlay, 
  useDraggable, 
  useDroppable, 
  DragStartEvent, 
  DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeft, ArrowRight, CheckCircle, Circle } from '@tamagui/lucide-icons'
import { format, addDays, subDays, isToday } from 'date-fns'
import { getDailyPlan, addToPlan, removeFromPlan, updatePlanNotes, PlannedTask, togglePlannedTask } from 'app/lib/api/planner'
import { getTasks, Task } from 'app/lib/api/tasks'
import { useAuth } from 'app/provider/auth'

export function PlannerScreen() {
  const [date, setDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([])
  const [planId, setPlanId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [date, user])

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const { plan, plannedTasks: pts } = await getDailyPlan(dateStr)
      setPlanId(plan.id)
      setNotes(plan.notes || '')
      setPlannedTasks(pts)

      // TODO: Handle project specific or all tasks better
      const allTasks = await getTasks('') 
      setTasks(allTasks)

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const backlogTasks = useMemo(() => {
    const plannedIds = new Set(plannedTasks.map(pt => pt.task_id))
    return tasks.filter(t => !plannedIds.has(t.id) && t.status !== 'done')
  }, [tasks, plannedTasks])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If dropped on Planner
    if (overId === 'planner') {
         // Check if already in plan or drag from plan to plan (reorder - NOT IMPLEMENTED YET)
         // Assuming drag from Backlog
         const task = tasks.find(t => t.id === activeId)
         if (!task) return // Or maybe dragging existing planned task?

         // If dragging existing planned task, do nothing (reorder logic needed)
         if (plannedTasks.find(pt => pt.task_id === activeId)) return

         if (!planId) return

         const newPT: PlannedTask = {
             id: Math.random().toString(), // Optimistic ID
             daily_plan_id: planId,
             task_id: activeId,
             is_completed: false,
             position: plannedTasks.length,
             task: task as any
         }
         
         const newPlanned = [...plannedTasks, newPT]
         setPlannedTasks(newPlanned)
         
         try {
             await addToPlan(planId, activeId)
             fetchData() // Refresh for real ID
         } catch (e) {
             console.error(e)
             setPlannedTasks(plannedTasks) // Revert
         }
    }
  }
  
  const toggleComplete = async (pt: PlannedTask) => {
      const newVal = !pt.is_completed
      const newPlanned = plannedTasks.map(p => p.id === pt.id ? {...p, is_completed: newVal} : p)
      setPlannedTasks(newPlanned)
      try {
          await togglePlannedTask(pt.id, newVal)
      } catch (e) {
          setPlannedTasks(plannedTasks) // Revert
      }
  }

  return (
    <YStack flex={1} padding="$4" gap="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <Button icon={ArrowLeft} onPress={() => setDate(subDays(date, 1))} chromeless />
        <YStack alignItems="center">
            <H2>{isToday(date) ? 'Today' : format(date, 'EEEE')}</H2>
            <Text color="$color10">{format(date, 'MMM d, yyyy')}</Text>
        </YStack>
        <Button icon={ArrowRight} onPress={() => setDate(addDays(date, 1))} chromeless />
      </XStack>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <XStack flex={1} gap="$4">
              {/* Backlog */}
              <YStack flex={1} backgroundColor="$color2" borderRadius="$4" padding="$3" gap="$3">
                  <H2 size="$5">Backlog</H2>
                  <ScrollView>
                      <YStack gap="$2">
                          {backlogTasks.map(task => (
                              <DraggableTask key={task.id} task={task} />
                          ))}
                      </YStack>
                  </ScrollView>
              </YStack>

              {/* Plan */}
              <YStack flex={1} backgroundColor="$background" borderWidth={1} borderColor="$color4" borderRadius="$4" padding="$3" gap="$3">
                  <H2 size="$5">Today's Focus</H2>
                  <DroppableArea id="planner">
                      <ScrollView flex={1}>
                          <YStack gap="$2" minHeight={200}>
                             {plannedTasks.map(pt => (
                                 <PlannedTaskItem key={pt.id} item={pt} onToggle={() => toggleComplete(pt)} />
                             ))}
                             {plannedTasks.length === 0 && (
                                 <YStack padding="$4" alignItems="center" opacity={0.5}>
                                     <Text>Drag tasks here to plan your day</Text>
                                 </YStack>
                             )}
                          </YStack>
                      </ScrollView>
                  </DroppableArea>
                  <YStack gap="$2" borderTopWidth={1} borderColor="$color4" paddingTop="$3">
                      <Text fontWeight="600">Daily Notes</Text>
                      <Input 
                        value={notes} 
                        onChangeText={setNotes} 
                        onBlur={() => planId && updatePlanNotes(planId, notes)}
                        placeholder="Reflections..."
                        numberOfLines={3}
                        multiline
                      />
                  </YStack>
              </YStack>
          </XStack>
          
          <DragOverlay>
              {activeId ? (
                  <Card padding="$3" elevation="$4">
                      <Text>Task</Text> 
                  </Card>
              ) : null}
          </DragOverlay>
      </DndContext>
    </YStack>
  )
}

function DroppableArea({ id, children }: { id: string, children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <YStack ref={setNodeRef as any} flex={1}>
        {children}
    </YStack>
  )
}

function DraggableTask({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
        data: { type: 'Task', task }
    })
    
    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined

    return (
        <Card 
            ref={setNodeRef as any} 
            {...listeners} 
            {...attributes} 
            role={attributes.role as any} 
            style={style as any}
            padding="$3" 
            borderWidth={1}
            borderColor="$color4" 
            hoverStyle={{ borderColor: '$color8' }}
            cursor="grab"
        >
            <Text fontSize="$3">{task.title}</Text>
        </Card>
    )
}

function PlannedTaskItem({ item, onToggle }: { item: PlannedTask, onToggle: () => void }) {
    return (
        <XStack padding="$3" borderWidth={1} borderColor="$color4" borderRadius="$3" alignItems="center" gap="$3" opacity={item.is_completed ? 0.6 : 1}>
            <Button 
                size="$2" 
                circular 
                chromeless 
                icon={item.is_completed ? <CheckCircle color="$green9" /> : <Circle color="$color9" />} 
                onPress={onToggle} 
            />
             <YStack flex={1}>
                 <Text textDecorationLine={item.is_completed ? 'line-through' : 'none'}>{item.task?.title || 'Unknown Task'}</Text>
             </YStack>
        </XStack>
    )
}
