
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yxocwtjeedyzgylgciwp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4b2N3dGplZWR5emd5bGdjaXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NDU1NzYsImV4cCI6MjA2NTIyMTU3Nn0.cBlQB1NYr3G7VSQCaUtfg0k-JWSGBWaC_ioNQ8rso1U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
