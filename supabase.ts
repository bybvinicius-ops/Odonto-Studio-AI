import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://owawqlypvddnauejhdch.supabase.co"
const supabaseAnonKey = "sb_publishable_bPLOKI5U_hQF7GUAe0ldQA_OSmHCZ6K"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)