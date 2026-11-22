import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error, count } = await supabaseAdmin
    .from('admin_users')
    .select('id, name, username', { count: 'exact' })

  return NextResponse.json({
    connected: !error,
    error: error?.message || null,
    count,
    users: data?.map(u => ({ id: u.id, name: u.name, username: u.username })) || [],
    url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
}
