'use client'

import { useRouter } from 'next/navigation'
import { ProjectCreateScreen } from 'app/features/projects/project-create-screen'

export default function ProjectCreatePage() {
  const router = useRouter()
  return (
    <ProjectCreateScreen
      onBack={() => router.push('/projects')}
      onCreated={(id) => router.push(`/projects/${id}`)}
    />
  )
}
