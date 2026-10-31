import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Temporary diagnostic for sizing-list reconciliation. Will revert after use.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('registrants')
    .select('player_first_name, player_last_name, status')
    .eq('status', 'made_team')
    .order('player_last_name', { ascending: true })

  return NextResponse.json({
    connected: !error,
    error: error?.message || null,
    count: data?.length ?? 0,
    players: data?.map(p => `${p.player_first_name.trim()} ${p.player_last_name.trim()}`) ?? [],
  })
}
