import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Temporary: pull contact info for players missing from sizing form.
// Will revert after.
export async function GET() {
  const names = [
    { first: 'Idris', last: 'Ahmad' },
    { first: 'Jamil', last: 'Albarran' },
    { first: 'Massimo', last: 'Gargano' },
    { first: 'Rashee', last: 'Hickerson' },
    { first: 'Mekhi', last: 'Thompson' },
  ]

  const { data, error } = await supabaseAdmin
    .from('registrants')
    .select('player_first_name, player_last_name, caregiver_first_name, caregiver_last_name, email, phone, status')
    .in('player_last_name', names.map(n => n.last))

  return NextResponse.json({
    error: error?.message || null,
    count: data?.length ?? 0,
    players: data,
  })
}
