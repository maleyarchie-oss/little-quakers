import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/status-log?player=<query>&limit=100
// Returns the status-change audit log, newest first.
// Optional ?player= substring filter on player_name.
// Optional ?registrantId= exact match.
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const player = url.searchParams.get('player')?.trim() || ''
  const registrantId = url.searchParams.get('registrantId')?.trim() || ''
  const limitRaw = parseInt(url.searchParams.get('limit') || '200', 10)
  const limit = Math.min(Math.max(limitRaw, 1), 500)

  let q = supabaseAdmin
    .from('registrant_status_log')
    .select('id, registrant_id, player_name, from_status, to_status, changed_by, changed_at, source, note')
    .order('changed_at', { ascending: false })
    .limit(limit)

  if (registrantId) q = q.eq('registrant_id', registrantId)
  if (player) q = q.ilike('player_name', `%${player}%`)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ count: data?.length ?? 0, entries: data || [] })
}
