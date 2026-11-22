import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// TEMP: fix school capitalization. Revert after.
const FIXES: Array<{ match: [string, string]; school: string }> = [
  { match: ['nasir', 'grant'], school: 'St. Malachy' },
  { match: ['rashee', 'hickerson'], school: 'Sharon Hill Elementary School' },
  { match: ['takai', 'jones'], school: 'DePaul Catholic School' },
  { match: ['aiden', 'kostick'], school: 'Franklin Towne Charter' },
  { match: ['liam', 'maloney'], school: 'Gwynedd Mercy Elementary' },
  { match: ['ryan', 'panebianco'], school: 'Council Rock North' },
  { match: ['david', 'remolde'], school: 'Immaculate Heart of Mary' },
  { match: ['braylon', 'tygh'], school: 'Council Rock South' },
  { match: ['benjamin', 'thomas'], school: 'William Tennent' },
  { match: ['bryant', 'powell'], school: 'Spring-Ford' },
]

export async function GET() {
  const results: unknown[] = []
  for (const fix of FIXES) {
    const { data, error } = await supabaseAdmin
      .from('registrants')
      .update({ current_school: fix.school })
      .ilike('player_first_name', `${fix.match[0]}%`)
      .ilike('player_last_name', `${fix.match[1]}%`)
      .select('id, player_first_name, player_last_name, current_school')
    results.push({ fix: fix.school, error: error?.message || null, rows: data })
  }
  return NextResponse.json({ ok: true, results })
}
