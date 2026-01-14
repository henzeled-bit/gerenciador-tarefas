import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pjxvvhtsinqzjieiraff.supabase.co'
const supabaseAnonKey = 'sb_publishable_zIG8mavtXJxutTUQp5PlUg_LHwMun9I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
