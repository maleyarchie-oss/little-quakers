import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { sendBroadcastEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipientIds, subject, body } = await req.json()

  const { data: registrants } = await supabaseAdmin
    .from('registrants')
    .select('email, player_first_name, player_last_name')
    .in('id', recipientIds)

  if (!registrants || registrants.length === 0) {
    return NextResponse.json({ error: 'No recipients found' }, { status: 404 })
  }

  const recipients = registrants.map(r => ({
    email: r.email,
    name: `${r.player_first_name} ${r.player_last_name}`,
  }))

  await sendBroadcastEmail(recipients, subject, body)
  return NextResponse.json({ success: true, count: recipients.length })
}
