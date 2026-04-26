import { createClient, SupabaseClient } from '@supabase/supabase-js'

function makeLazy(urlKey: string, anonKey: string): SupabaseClient {
  let client: SupabaseClient | null = null
  return new Proxy({} as SupabaseClient, {
    get(_, prop: string | symbol) {
      if (!client) {
        client = createClient(
          process.env[urlKey] as string,
          process.env[anonKey] as string
        )
      }
      return (client as unknown as Record<string | symbol, unknown>)[prop]
    },
  })
}

export const supabase = makeLazy('NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
export const supabaseAdmin = makeLazy('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')
