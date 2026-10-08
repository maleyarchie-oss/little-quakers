import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { sendMadeTeamEmail, sendNotMadeTeamEmail } from '@/lib/email'

// Save roster selections
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rosterIds, poolIds } = await req.json()

  const [madeResult, notResult] = await Promise.all([
    supabaseAdmin
      .from('registrants')
      .update({ status: 'made_team' })
      .in('id', rosterIds),
    supabaseAdmin
      .from('registrants')
      .update({ status: 'not_made_team' })
      .in('id', poolIds),
  ])

  if (madeResult.error || notResult.error) {
    return NextResponse.json({ error: 'Failed to update roster' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

type Recipients = 'made_only' | 'not_made_only' | 'both'

function isValidRecipients(v: unknown): v is Recipients {
  return v === 'made_only' || v === 'not_made_only' || v === 'both'
}

// GET /api/admin/team?preview=1 — returns the lists we WOULD email, no sending.
// Lets the admin UI show PJ exactly who's about to get what before firing.
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  if (url.searchParams.get('preview') !== '1') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const { data: all } = await supabaseAdmin
    .from('registrants')
    .select('id, email, player_first_name, player_last_name, status')

  const made = (all || []).filter(r => r.status === 'made_team')
  const notMade = (all || []).filter(r => r.status === 'not_made_team')

  return NextResponse.json({
    made: made.map(r => ({
      id: r.id,
      name: `${r.player_first_name} ${r.player_last_name}`,
      email: r.email,
    })),
    notMade: notMade.map(r => ({
      id: r.id,
      name: `${r.player_first_name} ${r.player_last_name}`,
      email: r.email,
    })),
  })
}

// Send team notification emails
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { rosterIds } = body as { rosterIds?: unknown }
  const recipients: Recipients = isValidRecipients(body.recipients) ? body.recipients : 'both'

  if (!Array.isArray(rosterIds)) {
    return NextResponse.json({ error: 'rosterIds array required' }, { status: 400 })
  }

  const { data: settings } = await supabaseAdmin.from('settings').select('*').single()
  const { data: allRegistrants } = await supabaseAdmin
    .from('registrants')
    .select('id, email, player_first_name, player_last_name, status')

  if (!allRegistrants) return NextResponse.json({ error: 'No registrants found' }, { status: 404 })

  const rosterSet = new Set(rosterIds as string[])

  let madeCount = 0
  let notMadeCount = 0

  const sends = allRegistrants.map(async r => {
    const playerName = `${r.player_first_name} ${r.player_last_name}`
    const onRoster = rosterSet.has(r.id)

    if (onRoster && (recipients === 'made_only' || recipients === 'both')) {
      madeCount++
      await sendMadeTeamEmail(
        r.email,
        playerName,
        settings?.made_team_subject || 'Congratulations – You Made the Little Quakers!',
        settings?.made_team_body || `Dear ${playerName},\n\nCongratulations! You have been selected to join the Philadelphia Little Quakers!\n\nWe are thrilled to welcome you to the team. More details about next steps will follow soon.\n\nGo Little Quakers!\n\n— The Coaching Staff`
      )
    } else if (!onRoster && (recipients === 'not_made_only' || recipients === 'both')) {
      notMadeCount++
      await sendNotMadeTeamEmail(
        r.email,
        playerName,
        settings?.not_made_team_subject || 'Thank You for Trying Out – Little Quakers',
        settings?.not_made_team_body || `Dear ${playerName},\n\nThank you for trying out for the Philadelphia Little Quakers. We were impressed by the effort and heart you showed.\n\nWhile we were not able to offer you a spot on this year's roster, we encourage you to keep working hard and try again next year.\n\nGo Little Quakers!\n\n— The Coaching Staff`
      )
    }
  })

  await Promise.allSettled(sends)
  return NextResponse.json({ success: true, madeCount, notMadeCount })
}
