import React, { useEffect } from 'react'
import { useAuthStore } from '../stores/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize)
  const initialized = useAuthStore((state) => state.initialized)
  const loading = useAuthStore((state) => state.loading)

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialize, initialized])

  if (loading && !initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
} 