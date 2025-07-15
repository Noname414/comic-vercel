import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aqnpslcsernuqfbccpwr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbnBzbGNzZXJudXFmYmNjcHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Mzc4MDgsImV4cCI6MjA2NjMxMzgwOH0.T9GHgkAD1RE8QCKRX7JFShi5f5VXbiK7lJ2Z5C1JynM'

export const supabase = createClient(supabaseUrl, supabaseKey)
