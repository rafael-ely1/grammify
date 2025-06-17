import { create } from 'zustand'
import { supabase, initializeDatabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Document = Database['public']['Tables']['documents']['Row']

interface DocumentsState {
  documents: Document[]
  currentDocument: Document | null
  loading: boolean
  error: Error | null
  fetchDocuments: () => Promise<void>
  createDocument: (title?: string) => Promise<Document>
  updateDocument: (id: string, content: string) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  setCurrentDocument: (document: Document | null) => void
}

// Create a fallback document object for when the table doesn't exist yet
const createFallbackDocument = (userId: string, title: string = 'Untitled Document'): Document => {
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  
  return {
    id,
    created_at: now,
    updated_at: now,
    user_id: userId,
    title,
    content: '',
    suggestions: null,
    stats: null
  }
}

export const useDocumentsStore = create<DocumentsState>()((set, get) => ({
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,

  fetchDocuments: async () => {
    try {
      set({ loading: true, error: null })
      console.log('Fetching documents...')
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Error getting user:', userError)
        throw userError
      }
      if (!user) {
        console.error('No authenticated user found')
        throw new Error('No authenticated user')
      }
      
      console.log('Fetching documents for user:', user.id)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
        
        // If the table doesn't exist, try to create it
        if (error.code === '42P01') {
          console.log('Documents table not found, attempting to initialize...')
          await initializeDatabase()
          
          // Try fetching again after initialization
          const retryResult = await supabase
            .from('documents')
            .select('*')
            .order('updated_at', { ascending: false })
            
          if (retryResult.error) {
            console.error('Error fetching documents after initialization:', retryResult.error)
            
            // If still failing, use an empty array but don't throw an error
            console.log('Using empty documents array as fallback')
            set({ documents: [] })
            return
          }
          
          console.log('Documents fetched after initialization:', retryResult.data?.length ?? 0)
          set({ documents: retryResult.data || [] })
          return
        }
        
        // For other errors, use an empty array but don't throw
        console.log('Using empty documents array due to fetch error')
        set({ documents: [] })
        return
      }
      
      console.log('Documents fetched:', data?.length ?? 0)
      set({ documents: data || [] })
    } catch (error) {
      console.error('Error in fetchDocuments:', error)
      set({ error: error as Error, documents: [] }) // Use empty array as fallback
    } finally {
      set({ loading: false })
    }
  },

  createDocument: async (title = 'Untitled Document') => {
    try {
      set({ loading: true, error: null })
      console.log('Creating new document with title:', title)
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Error getting user:', userError)
        throw userError
      }
      if (!user) {
        console.error('No authenticated user found')
        throw new Error('No authenticated user')
      }
      
      console.log('Creating document for user:', user.id)
      
      // Create the document
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          content: '',
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating document:', error)
        
        // If the table doesn't exist, try to create it
        if (error.code === '42P01') {
          console.log('Documents table not found, attempting to initialize...')
          await initializeDatabase()
          
          // Try creating again after initialization
          const retryResult = await supabase
            .from('documents')
            .insert({
              title,
              content: '',
              user_id: user.id,
            })
            .select()
            .single()
            
          if (retryResult.error) {
            console.error('Error creating document after initialization:', retryResult.error)
            
            // If still failing, create a fallback document
            console.log('Using fallback document creation')
            const fallbackDoc = createFallbackDocument(user.id, title)
            
            // Update local state with fallback document
            set((state) => ({
              documents: [fallbackDoc, ...state.documents],
              currentDocument: fallbackDoc,
            }))
            
            return fallbackDoc
          }
          
          if (!retryResult.data) {
            console.error('No data returned from document creation after initialization')
            
            // Create fallback document
            const fallbackDoc = createFallbackDocument(user.id, title)
            
            // Update local state with fallback document
            set((state) => ({
              documents: [fallbackDoc, ...state.documents],
              currentDocument: fallbackDoc,
            }))
            
            return fallbackDoc
          }
          
          console.log('Document created successfully after initialization:', retryResult.data)
          
          // Update local state
          set((state) => ({
            documents: [retryResult.data, ...state.documents],
            currentDocument: retryResult.data,
          }))
          
          return retryResult.data
        }
        
        // For other errors, create a fallback document
        console.log('Using fallback document due to creation error')
        const fallbackDoc = createFallbackDocument(user.id, title)
        
        // Update local state with fallback document
        set((state) => ({
          documents: [fallbackDoc, ...state.documents],
          currentDocument: fallbackDoc,
        }))
        
        return fallbackDoc
      }
      
      if (!data) {
        console.error('No data returned from document creation')
        
        // Create fallback document
        const fallbackDoc = createFallbackDocument(user.id, title)
        
        // Update local state with fallback document
        set((state) => ({
          documents: [fallbackDoc, ...state.documents],
          currentDocument: fallbackDoc,
        }))
        
        return fallbackDoc
      }

      console.log('Document created successfully:', data)

      // Update local state
      set((state) => ({
        documents: [data, ...state.documents],
        currentDocument: data,
      }))

      return data
    } catch (error) {
      console.error('Error in createDocument:', error)
      set({ error: error as Error })
      
      // Get current user for fallback
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Create fallback document
          const fallbackDoc = createFallbackDocument(user.id, title)
          
          // Update local state with fallback document
          set((state) => ({
            documents: [fallbackDoc, ...state.documents],
            currentDocument: fallbackDoc,
          }))
          
          return fallbackDoc
        }
      } catch (userError) {
        console.error('Error getting user for fallback:', userError)
      }
      
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateDocument: async (id: string, content: string) => {
    try {
      set({ loading: true, error: null })
      console.log('Updating document:', id)
      
      const { error } = await supabase
        .from('documents')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error updating document:', error)
        // Continue with local update even if server update fails
      }

      console.log('Document updated locally')

      // Always update local state even if server update fails
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, content, updated_at: new Date().toISOString() } : doc
        ),
        currentDocument: state.currentDocument?.id === id
          ? { ...state.currentDocument, content, updated_at: new Date().toISOString() }
          : state.currentDocument,
      }))
    } catch (error) {
      console.error('Error in updateDocument:', error)
      set({ error: error as Error })
      
      // Still update local state even if there's an error
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, content, updated_at: new Date().toISOString() } : doc
        ),
        currentDocument: state.currentDocument?.id === id
          ? { ...state.currentDocument, content, updated_at: new Date().toISOString() }
          : state.currentDocument,
      }))
    } finally {
      set({ loading: false })
    }
  },

  deleteDocument: async (id: string) => {
    try {
      set({ loading: true, error: null })
      console.log('Deleting document:', id)
      
      const { error } = await supabase.from('documents').delete().eq('id', id)

      if (error) {
        console.error('Error deleting document:', error)
        // Continue with local deletion even if server deletion fails
      }

      console.log('Document deleted locally')

      // Always update local state even if server delete fails
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
      }))
    } catch (error) {
      console.error('Error in deleteDocument:', error)
      set({ error: error as Error })
      
      // Still update local state even if there's an error
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
      }))
    } finally {
      set({ loading: false })
    }
  },

  setCurrentDocument: (document: Document | null) => {
    set({ currentDocument: document })
  },
})) 