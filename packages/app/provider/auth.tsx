'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type User = {
  id: string
  email?: string
  app_metadata: {
    provider?: string
    [key: string]: any
  }
  user_metadata: {
    [key: string]: any
  }
  aud: string
  created_at: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for offline-first mode
const ANONYMOUS_USER: User = {
  id: 'local-user',
  aud: 'authenticated',
  app_metadata: { provider: 'local' },
  user_metadata: {},
  created_at: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(ANONYMOUS_USER)
  const [loading, setLoading] = useState(false)

  // In offline mode, we're always "logged in" as the local user
  useEffect(() => {
    setUser(ANONYMOUS_USER)
    setLoading(false)
  }, [])

  const signInWithMagicLink = async (email: string) => {
    console.log('Online login disabled in offline-first mode')
    return { error: null }
  }

  const signOut = async () => {
    console.log('Sign out disabled in offline-first mode')
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithMagicLink, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
