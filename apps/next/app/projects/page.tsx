'use client'

import { useRouter } from 'next/navigation'
import { ProjectListScreen } from 'app/features/projects/project-list-screen'

export default function ProjectsPage() {
  const router = useRouter()
  return (
    <ProjectListScreen
      onNavigateToCreate={() => router.push('/projects/new')}
      onNavigateToDetail={(id) => router.push(`/projects/${id}`)}
    />
  )
}
