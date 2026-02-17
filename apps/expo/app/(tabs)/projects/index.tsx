import { ProjectListScreen } from 'app/features/projects/project-list-screen'
import { useRouter } from 'expo-router'

export default function ProjectsIndex() {
  const router = useRouter()
  return (
    <ProjectListScreen
      onNavigateToCreate={() => router.push('/(tabs)/projects/new')}
      onNavigateToDetail={(id) => router.push(`/(tabs)/projects/${id}`)}
    />
  )
}
