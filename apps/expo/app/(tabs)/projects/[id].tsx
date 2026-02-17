import { ProjectDetailScreen } from 'app/features/projects/project-detail-screen'
import { createParam } from 'solito'

const { useParam } = createParam<{ id: string }>()

export default function ProjectDetail() {
  const [id] = useParam('id')
  return <ProjectDetailScreen projectId={id!} onBack={() => {}} /> // Add onBack if needed or update component to make it optional
}
