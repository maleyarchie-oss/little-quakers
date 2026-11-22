import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  // TEMP: flip Wesley Wakefield off the roster (made_team -> not_made_team).
  // Revert to admin connectivity check immediately after.
  const { data, error } = await supabaseAdmin
    .from('registrants')
    .update({ status: 'not_made_team' })
    .ilike('player_first_name', 'wesley%')
    .ilike('player_last_name', 'wakefield%')
    .eq('status', 'made_team')
    .select('id, player_first_name, player_last_name, status')

  return NextResponse.json({
    ok: !error,
    error: error?.message || null,
    updated_count: data?.length || 0,
    rows: data || [],
  })
}
