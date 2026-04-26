import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { createRosterSheet } from '@/lib/google'

// Update jersey number
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, jersey_number } = await req.json()
  const { error } = await supabaseAdmin
    .from('registrants')
    .update({ jersey_number })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// Export roster to Google Sheets
export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roster } = await supabaseAdmin
    .from('registrants')
    .select('*')
    .eq('status', 'made_team')
    .order('jersey_number', { ascending: true, nullsFirst: false })

  if (!roster || roster.length === 0) {
    return NextResponse.json({ error: 'No roster players found' }, { status: 404 })
  }

  const url = await createRosterSheet(roster)
  return NextResponse.json({ success: true, url })
}
