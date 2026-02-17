import { ProjectCreateScreen } from 'app/features/projects/project-create-screen'
import { useRouter } from 'expo-router'

export default function ProjectCreate() {
  const router = useRouter()
  return <ProjectCreateScreen onCreated={() => router.back()} onBack={() => router.back()} />
}
