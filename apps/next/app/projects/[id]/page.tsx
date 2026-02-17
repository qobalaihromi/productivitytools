'use client'

import { useRouter, useParams } from 'next/navigation'
import { ProjectDetailScreen } from 'app/features/projects/project-detail-screen'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  return (
    <ProjectDetailScreen
      projectId={projectId}
      onBack={() => router.push('/projects')}
    />
  )
}
