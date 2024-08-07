import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test the connection
supabase.from('companies').select('count', { count: 'exact' }).then(
  ({ count, error }) => {
    if (error) {
      console.error('Error connecting to Supabase:', error)
    } else {
      console.log(`Successfully connected to Supabase. Found ${count} companies.`)
    }
  }
)