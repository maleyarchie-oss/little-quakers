export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCalendarEvents } from '@/lib/google'
import ical from 'ical-generator'

export async function GET() {
  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('google_sheets_calendar_id')
    .single()

  const events = settings?.google_sheets_calendar_id
    ? await getCalendarEvents(settings.google_sheets_calendar_id)
    : []

  const cal = ical({ name: 'Philadelphia Little Quakers', timezone: 'America/New_York' })

  for (const event of events) {
    if (!event.date) continue
    try {
      const dateStr = event.date.trim()
      const timeStr = event.time?.trim() || '09:00 AM'

      const dateTimeStr = `${dateStr} ${timeStr}`
      const start = new Date(dateTimeStr)
      if (isNaN(start.getTime())) continue

      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // 2 hours default

      cal.createEvent({
        summary: event.title || event.type,
        location: event.location,
        description: event.description,
        start,
        end,
      })
    } catch {
      continue
    }
  }

  return new NextResponse(cal.toString(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="little-quakers.ics"',
      'Cache-Control': 'max-age=900',
    },
  })
}
