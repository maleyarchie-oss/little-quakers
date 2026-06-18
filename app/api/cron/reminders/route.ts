import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { supabaseAdmin } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'
import { TRYOUT_SESSIONS } from '@/lib/tryout-info'

// Parse each session's full date string ("Wednesday, September 23, 2026") into
// a JS Date at start-of-day. Centralized so the cron + any future use shares
// one source of truth.
function getTryoutDates(): Date[] {
  return TRYOUT_SESSIONS.map(s => {
    const d = new Date(s.full)
    d.setHours(0, 0, 0, 0)
    return d
  })
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggering
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('registration_open')
    .single()

  if (!settings?.registration_open) {
    return NextResponse.json({ skipped: true, reason: 'Registration closed' })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find the next upcoming tryout date that's exactly 14, 7, or 1 day(s) away.
  const dates = getTryoutDates()
  const REMINDER_OFFSETS = [14, 7, 1]
  let triggerDays: number | null = null
  for (const d of dates) {
    const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (REMINDER_OFFSETS.includes(diff)) {
      triggerDays = diff
      break
    }
  }

  if (triggerDays === null) {
    return NextResponse.json({
      skipped: true,
      reason: 'No tryout dates are 14, 7, or 1 day(s) away',
    })
  }

  const { data: registrants } = await supabaseAdmin
    .from('registrants')
    .select('email, player_first_name, player_last_name')
    .eq('status', 'registered')

  if (!registrants || registrants.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'No pending registrants' })
  }

  const sends = registrants.map(r =>
    sendReminderEmail(
      r.email,
      `${r.player_first_name} ${r.player_last_name}`,
      triggerDays as number
    ).catch(console.error)
  )

  await Promise.allSettled(sends)

  return NextResponse.json({
    success: true,
    daysOut: triggerDays,
    sent: registrants.length,
  })
}
