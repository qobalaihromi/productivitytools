'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to projects page (main dashboard)
    router.replace('/projects')
  }, [router])

  return null
}
