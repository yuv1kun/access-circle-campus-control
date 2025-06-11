
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zpgkzyubzxymgrjgxcol.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ2t6eXVienh5bWdyamd4Y29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDYzMjYsImV4cCI6MjA2Mjg4MjMyNn0.WQNrQnjqXoQnmzbGjOlgZjjfXEtZO_z3qSQu7mB9IVY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
