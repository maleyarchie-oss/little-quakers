import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Existing admin connectivity check
  const { data: adminUsers, error: adminErr, count: adminCount } = await supabaseAdmin
    .from('admin_users')
    .select('id, name, username', { count: 'exact' })

  // TEMP DIAGNOSTIC: dump registrant status breakdown so we can see
  // exactly how many players are flagged as made_team vs not_made_team
  // vs still registered. This should reveal why only 10 of 38 emails
  // went out from today's team-selection flow.
  let registrantStatus: Record<string, unknown> = {}
  try {
    const { data: all, error: allErr } = await supabaseAdmin
      .from('registrants')
      .select('id, player_first_name, player_last_name, email, status')
      .order('status')
      .order('player_last_name')

    if (allErr) {
      registrantStatus = { error: allErr.message }
    } else {
      const made = (all || []).filter(r => r.status === 'made_team')
      const notMade = (all || []).filter(r => r.status === 'not_made_team')
      const other = (all || []).filter(
        r => r.status !== 'made_team' && r.status !== 'not_made_team'
      )
      registrantStatus = {
        total: all?.length || 0,
        made_team: made.length,
        not_made_team: notMade.length,
        other: other.length,
        made_team_names: made.map(r => `${r.player_first_name} ${r.player_last_name}`),
        other_names: other.map(
          r => `${r.player_first_name} ${r.player_last_name} (status=${r.status})`
        ),
      }
    }
  } catch (e) {
    registrantStatus = { threw: e instanceof Error ? e.message : String(e) }
  }

  return NextResponse.json({
    connected: !adminErr,
    error: adminErr?.message || null,
    count: adminCount,
    users:
      adminUsers?.map(u => ({ id: u.id, name: u.name, username: u.username })) || [],
    url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    registrants: registrantStatus,
  })
}
