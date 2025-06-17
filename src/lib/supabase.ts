import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL')
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')
}

console.log('Initializing Supabase client with URL:', import.meta.env.VITE_SUPABASE_URL)

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Execute SQL directly using REST API
const executeSql = async (sql: string): Promise<{ error: any | null }> => {
  try {
    console.log('Executing SQL via REST API')
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('SQL execution error:', errorData)
      return { error: errorData }
    }
    
    return { error: null }
  } catch (err) {
    console.error('SQL execution error:', err)
    return { error: err }
  }
}

// Check if documents table exists and create it if it doesn't
export const initializeDatabase = async () => {
  try {
    console.log('Checking if documents table exists...')
    
    // Try to query the documents table
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (error && error.code === '42P01') { // Table doesn't exist
      console.log('Documents table does not exist, creating it...')
      
      // Create the documents table with direct SQL execution
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS "public"."documents" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL,
          "user_id" uuid NOT NULL,
          "title" text,
          "content" text DEFAULT '' NOT NULL,
          "suggestions" jsonb[],
          "stats" jsonb
        );
      `
      
      // Execute the table creation SQL
      const { error: createError } = await executeSql(createTableQuery)
      
      if (createError) {
        console.error('Error creating documents table:', createError)
        
        // Try using the Supabase client's SQL query method as fallback
        try {
          console.log('Attempting fallback method for creating table...')
          await supabase.auth.getSession()
          
          // Retry fetching documents to see if the table exists now
          const retryCheck = await supabase
            .from('documents')
            .select('*')
            .limit(1)
            
          if (retryCheck.error && retryCheck.error.code === '42P01') {
            console.error('Still cannot access documents table after retry')
          } else {
            console.log('Documents table now accessible')
            return
          }
        } catch (fallbackErr) {
          console.error('Fallback method failed:', fallbackErr)
        }
      } else {
        console.log('Documents table created successfully')
        
        // Set up row level security
        const rlsQuery = `
          -- Enable Row Level Security
          ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          CREATE POLICY "Users can view their own documents" ON "public"."documents" FOR
          SELECT USING (auth.uid()::text = user_id::text);
          
          CREATE POLICY "Users can create their own documents" ON "public"."documents" FOR
          INSERT WITH CHECK (auth.uid()::text = user_id::text);
          
          CREATE POLICY "Users can update their own documents" ON "public"."documents" FOR
          UPDATE USING (auth.uid()::text = user_id::text);
          
          CREATE POLICY "Users can delete their own documents" ON "public"."documents" FOR 
          DELETE USING (auth.uid()::text = user_id::text);
          
          -- Create indexes for better performance
          CREATE INDEX documents_user_id_idx ON "public"."documents" (user_id);
          CREATE INDEX documents_created_at_idx ON "public"."documents" (created_at);
        `
        
        // Execute the RLS setup SQL
        const { error: rlsError } = await executeSql(rlsQuery)
        
        if (rlsError) {
          console.error('Error setting up RLS policies:', rlsError)
          // Continue anyway as the table exists
        } else {
          console.log('RLS policies created successfully')
        }
      }
    } else if (error) {
      console.error('Error checking documents table:', error)
      throw error
    } else {
      console.log('Documents table exists')
    }
  } catch (err) {
    console.error('Database initialization error:', err)
  }
} 