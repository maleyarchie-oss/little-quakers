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

// Send team notification emails
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rosterIds } = await req.json()

  const { data: settings } = await supabaseAdmin.from('settings').select('*').single()
  const { data: allRegistrants } = await supabaseAdmin
    .from('registrants')
    .select('id, email, player_first_name, player_last_name, status')

  if (!allRegistrants) return NextResponse.json({ error: 'No registrants found' }, { status: 404 })

  const rosterSet = new Set(rosterIds)

  const sends = allRegistrants.map(async r => {
    const playerName = `${r.player_first_name} ${r.player_last_name}`
    if (rosterSet.has(r.id)) {
      await sendMadeTeamEmail(
        r.email,
        playerName,
        settings?.made_team_subject || 'Congratulations – You Made the Little Quakers!',
        settings?.made_team_body || `Dear ${playerName},\n\nCongratulations! You have been selected to join the Philadelphia Little Quakers!\n\nWe are thrilled to welcome you to the team. More details about next steps will follow soon.\n\nGo Little Quakers!\n\n— The Coaching Staff`
      )
    } else {
      await sendNotMadeTeamEmail(
        r.email,
        playerName,
        settings?.not_made_team_subject || 'Thank You for Trying Out – Little Quakers',
        settings?.not_made_team_body || `Dear ${playerName},\n\nThank you for trying out for the Philadelphia Little Quakers. We were impressed by the effort and heart you showed.\n\nWhile we were not able to offer you a spot on this year's roster, we encourage you to keep working hard and try again next year.\n\nGo Little Quakers!\n\n— The Coaching Staff`
      )
    }
  })

  await Promise.allSettled(sends)
  return NextResponse.json({ success: true })
}
