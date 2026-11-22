import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  // TEMP: pull roster data for PDF generation. Revert to admin connectivity check after.
  const { data, error } = await supabaseAdmin
    .from('registrants')
    .select('player_first_name, player_last_name, height, weight, current_school, grade, status')
    .eq('status', 'made_team')
    .order('player_last_name', { ascending: true })

  return NextResponse.json({
    ok: !error,
    error: error?.message || null,
    count: data?.length || 0,
    players: data || [],
  })
}
