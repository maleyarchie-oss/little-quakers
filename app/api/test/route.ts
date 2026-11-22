import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  // TEMP: fill in Nate Glowacki's missing height/school. Revert after.
  const { data, error } = await supabaseAdmin
    .from('registrants')
    .update({ height: '6\u20190\u201d', current_school: 'Strath Haven' })
    .ilike('player_first_name', 'nate%')
    .ilike('player_last_name', 'glowacki%')
    .select('id, player_first_name, player_last_name, height, weight, current_school')

  return NextResponse.json({
    ok: !error,
    error: error?.message || null,
    updated_count: data?.length || 0,
    rows: data || [],
  })
}
