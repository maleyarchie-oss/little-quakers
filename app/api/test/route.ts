import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Temporary: dig into Jamil Albarran's registration + status history.
export async function GET() {
  const { data: player } = await supabaseAdmin
    .from('registrants')
    .select('*')
    .ilike('player_last_name', '%Albarran%')

  // Any coach-added vs public-registered marker? Check for completeness.
  // Public-registered players would have birth_cert_url + report_card_url
  // populated; admin-added players would have those blank.
  return NextResponse.json({
    count: player?.length ?? 0,
    player,
  })
}
