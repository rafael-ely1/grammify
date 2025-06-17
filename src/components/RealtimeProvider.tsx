import React, { useEffect } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

interface RealtimeProviderProps {
  children: React.ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    if (user) {
      // Subscribe to real-time updates for the user's profile
      channel = supabase
        .channel(`public:profiles:id=eq.${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time update:', payload)
            // Handle the update here
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status)
        })
    }

    return () => {
      if (channel) {
        console.log('Unsubscribing from real-time updates')
        channel.unsubscribe()
      }
    }
  }, [user])

  return <>{children}</>
} 