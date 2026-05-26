import { createClient, SupabaseClient } from '@supabase/supabase-js'

function makeLazy(urlKey: string, keyKey: string, serviceRole = false): SupabaseClient {
  let client: SupabaseClient | null = null
  return new Proxy({} as SupabaseClient, {
    get(_, prop: string | symbol) {
      if (!client) {
        client = createClient(
          process.env[urlKey] as string,
          process.env[keyKey] as string,
          serviceRole ? { auth: { autoRefreshToken: false, persistSession: false } } : undefined
        )
      }
      return (client as unknown as Record<string | symbol, unknown>)[prop]
    },
  })
}

export const supabase = makeLazy('NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
export const supabaseAdmin = makeLazy('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', true)
