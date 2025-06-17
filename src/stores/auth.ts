import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase, initializeDatabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
  initialized: boolean
  signIn: (credentials: { email: string; password: string }) => Promise<void>
  signUp: (credentials: { email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendConfirmationEmail: (email: string) => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true, error: null })
      
      // Get initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      
      set({ 
        session,
        user: session?.user ?? null,
        initialized: true 
      })

      // If user is authenticated, initialize the database
      if (session?.user) {
        console.log('User is authenticated, initializing database...')
        try {
          await initializeDatabase()
        } catch (dbError) {
          console.error('Database initialization error:', dbError)
          // Don't throw the error as auth can still proceed
        }
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id)
          set({ 
            session,
            user: session?.user ?? null
          })
          
          // Initialize database on sign in
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in, initializing database...')
            try {
              await initializeDatabase()
            } catch (dbError) {
              console.error('Database initialization error on sign in:', dbError)
            }
          }
        }
      )
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      set({ error: error as Error })
    } finally {
      set({ loading: false })
    }
  },

  signIn: async ({ email, password }) => {
    try {
      set({ loading: true, error: null })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      set({ 
        session: data.session,
        user: data.user
      })
      
      // Initialize database after sign in
      try {
        await initializeDatabase()
      } catch (dbError) {
        console.error('Database initialization error after sign in:', dbError)
        // Don't throw the error as auth succeeded
      }
    } catch (error) {
      console.error('Sign in error:', error)
      set({ error: error as Error })
      throw error // Re-throw to handle in component
    } finally {
      set({ loading: false })
    }
  },

  signUp: async ({ email, password }) => {
    try {
      set({ loading: true, error: null })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
      set({ 
        session: data.session,
        user: data.user
      })
      
      // Initialize database after sign up if session exists
      if (data.session) {
        try {
          await initializeDatabase()
        } catch (dbError) {
          console.error('Database initialization error after sign up:', dbError)
          // Don't throw the error as auth succeeded
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      set({ error: error as Error })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null })
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ 
        user: null,
        session: null
      })
    } catch (error) {
      console.error('Sign out error:', error)
      set({ error: error as Error })
    } finally {
      set({ loading: false })
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null })
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    } catch (error) {
      console.error('Reset password error:', error)
      set({ error: error as Error })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  resendConfirmationEmail: async (email: string) => {
    try {
      set({ loading: true, error: null })
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Resend confirmation email error:', error)
      set({ error: error as Error })
      throw error
    } finally {
      set({ loading: false })
    }
  }
})) 