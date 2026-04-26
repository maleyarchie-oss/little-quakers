import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { createCalendarSheet } from '@/lib/google'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { error } = await supabaseAdmin
    .from('settings')
    .upsert({ id: 1, ...body }, { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// Create new calendar sheet
export async function PUT() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { spreadsheetId, url } = await createCalendarSheet()

  await supabaseAdmin
    .from('settings')
    .upsert({ id: 1, google_sheets_calendar_id: spreadsheetId }, { onConflict: 'id' })

  return NextResponse.json({ spreadsheetId, url })
}
