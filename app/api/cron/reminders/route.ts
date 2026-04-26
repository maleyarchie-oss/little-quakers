import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { supabaseAdmin } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggering
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('tryout_date, tryout_time, tryout_location, registration_open')
    .single()

  if (!settings?.tryout_date || !settings.registration_open) {
    return NextResponse.json({ skipped: true, reason: 'No tryout date set or registration closed' })
  }

  const tryoutDate = new Date(settings.tryout_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.round((tryoutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (![14, 7, 1].includes(diffDays)) {
    return NextResponse.json({ skipped: true, reason: `${diffDays} days out — no reminder needed` })
  }

  const { data: registrants } = await supabaseAdmin
    .from('registrants')
    .select('email, player_first_name, player_last_name')
    .eq('status', 'registered')

  if (!registrants || registrants.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'No pending registrants' })
  }

  const tryout = {
    date: settings.tryout_date,
    time: settings.tryout_time || 'TBD',
    location: settings.tryout_location || 'TBD',
  }

  const sends = registrants.map(r =>
    sendReminderEmail(
      r.email,
      `${r.player_first_name} ${r.player_last_name}`,
      tryout,
      diffDays
    ).catch(console.error)
  )

  await Promise.allSettled(sends)

  return NextResponse.json({
    success: true,
    daysOut: diffDays,
    sent: registrants.length,
  })
}
