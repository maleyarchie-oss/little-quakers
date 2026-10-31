import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Broader search for Hickerson and Thompson plus Nuri + Spurlark
  const { data, error } = await supabaseAdmin
    .from('registrants')
    .select('player_first_name, player_last_name, caregiver_first_name, caregiver_last_name, email, phone, status')
    .or(
      'player_last_name.ilike.%hickerson%,player_last_name.ilike.%thompson%,player_last_name.ilike.%nuri%,player_last_name.ilike.%spurlark%,player_first_name.ilike.%rashee%,player_first_name.ilike.%mekhi%,player_first_name.ilike.%nabi%,player_first_name.ilike.%royal%'
    )

  return NextResponse.json({
    error: error?.message || null,
    count: data?.length ?? 0,
    players: data,
  })
}
