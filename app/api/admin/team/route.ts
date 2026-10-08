import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { bulkSend, wrapInTemplate, FROM, REPLY_TO, MADE_TEAM_BCC } from '@/lib/email'

// Save roster selections
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { rosterIds?: unknown; poolIds?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const rosterIds = Array.isArray(body.rosterIds) ? (body.rosterIds as string[]) : []
  const poolIds = Array.isArray(body.poolIds) ? (body.poolIds as string[]) : []

  // Supabase .in() with an empty array matches nothing (works), but can also
  // produce odd behavior across client versions. Short-circuit the no-op case
  // explicitly so we never issue the empty UPDATE.
  const ops: PromiseLike<{ error: unknown }>[] = []
  if (rosterIds.length > 0) {
    ops.push(
      supabaseAdmin
        .from('registrants')
        .update({ status: 'made_team' })
        .in('id', rosterIds) as unknown as PromiseLike<{ error: unknown }>
    )
  }
  if (poolIds.length > 0) {
    ops.push(
      supabaseAdmin
        .from('registrants')
        .update({ status: 'not_made_team' })
        .in('id', poolIds) as unknown as PromiseLike<{ error: unknown }>
    )
  }

  if (ops.length === 0) {
    return NextResponse.json({
      success: true,
      note: 'No changes: both roster and pool were empty',
    })
  }

  const results = await Promise.all(ops)
  const firstErr = results.find(r => r.error)?.error
  if (firstErr) {
    // Surface the real Supabase error so we're not debugging blind in the UI.
    const msg = typeof firstErr === 'object' && firstErr !== null && 'message' in firstErr
      ? String((firstErr as { message: unknown }).message)
      : 'Unknown database error'
    console.error('[admin/team] save failed:', firstErr)
    return NextResponse.json({ error: `Database error: ${msg}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    rosterUpdated: rosterIds.length,
    poolUpdated: poolIds.length,
  })
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
//
// Supports:
// - rosterIds: full current roster (required for context; identifies who's on the team)
// - recipients: 'made_only' | 'not_made_only' | 'both' (default 'both')
// - onlyIds (optional): send only to these specific registrant IDs. Used by the
//   targeted-resend tool to retry players who missed the original batch.
// - customMadeSubject / customMadeBody (optional): one-off override of the
//   Made Team email copy. If present, used instead of settings for this send only.
// - customNotMadeSubject / customNotMadeBody (optional): same for Not Made Team.
// - testEmail (optional): if present, send the rendered email ONCE to this
//   address instead of the real recipients. Lets PJ preview before mass-send.
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { rosterIds } = body as { rosterIds?: unknown }
  const recipients: Recipients = isValidRecipients(body.recipients) ? body.recipients : 'both'
  const onlyIds =
    Array.isArray((body as { onlyIds?: unknown }).onlyIds)
      ? ((body as { onlyIds: unknown[] }).onlyIds as string[])
      : null
  const customMadeSubject = typeof body.customMadeSubject === 'string' && body.customMadeSubject.trim() ? body.customMadeSubject.trim() : null
  const customMadeBody = typeof body.customMadeBody === 'string' && body.customMadeBody.trim() ? body.customMadeBody : null
  const customNotMadeSubject = typeof body.customNotMadeSubject === 'string' && body.customNotMadeSubject.trim() ? body.customNotMadeSubject.trim() : null
  const customNotMadeBody = typeof body.customNotMadeBody === 'string' && body.customNotMadeBody.trim() ? body.customNotMadeBody : null
  const testEmail = typeof body.testEmail === 'string' && body.testEmail.trim() ? body.testEmail.trim() : null

  if (!Array.isArray(rosterIds)) {
    return NextResponse.json({ error: 'rosterIds array required' }, { status: 400 })
  }

  const { data: settings } = await supabaseAdmin.from('settings').select('*').single()
  const { data: allRegistrants } = await supabaseAdmin
    .from('registrants')
    .select('id, email, player_first_name, player_last_name, status')

  if (!allRegistrants) return NextResponse.json({ error: 'No registrants found' }, { status: 404 })

  const rosterSet = new Set(rosterIds as string[])
  const onlySet = onlyIds ? new Set(onlyIds) : null

  const items: Array<import('@/lib/email').BulkSendItem & { kind: 'made' | 'notMade' }> = []

  for (const r of allRegistrants) {
    if (onlySet && !onlySet.has(r.id)) continue
    const playerName = `${r.player_first_name} ${r.player_last_name}`
    const onRoster = rosterSet.has(r.id)

    if (onRoster && (recipients === 'made_only' || recipients === 'both')) {
      const subject =
        customMadeSubject ||
        settings?.made_team_subject ||
        'Congratulations – You Made the Little Quakers!'
      const bodyText =
        customMadeBody ||
        settings?.made_team_body ||
        `Dear ${playerName},\n\nCongratulations! You have been selected to join the Philadelphia Little Quakers!\n\nWe are thrilled to welcome you to the team. More details about next steps will follow soon.\n\nGo Little Quakers!\n\n— The Coaching Staff`
      items.push({
        email: r.email,
        label: playerName,
        kind: 'made' as const,
        payload: {
          from: FROM(),
          to: r.email,
          bcc: MADE_TEAM_BCC(),
          replyTo: REPLY_TO(),
          subject,
          html: wrapInTemplate(playerName, bodyText),
        },
      })
    } else if (!onRoster && (recipients === 'not_made_only' || recipients === 'both')) {
      const subject =
        customNotMadeSubject ||
        settings?.not_made_team_subject ||
        'Thank You for Trying Out – Little Quakers'
      const bodyText =
        customNotMadeBody ||
        settings?.not_made_team_body ||
        `Dear ${playerName},\n\nThank you for trying out for the Philadelphia Little Quakers. We were impressed by the effort and heart you showed.\n\nWhile we were not able to offer you a spot on this year's roster, we encourage you to keep working hard and try again next year.\n\nGo Little Quakers!\n\n— The Coaching Staff`
      items.push({
        email: r.email,
        label: playerName,
        kind: 'notMade' as const,
        payload: {
          from: FROM(),
          to: r.email,
          replyTo: REPLY_TO(),
          subject,
          html: wrapInTemplate(playerName, bodyText),
        },
      })
    }
  }

  // TEST MODE: redirect every send to testEmail, strip BCC, send only the
  // first unique kind so PJ gets one preview email per template type.
  if (testEmail) {
    const seenKinds = new Set<string>()
    const previewItems = items
      .filter(it => {
        if (seenKinds.has(it.kind)) return false
        seenKinds.add(it.kind)
        return true
      })
      .map(it => ({
        email: testEmail,
        label: `[TEST → ${it.label}]`,
        payload: {
          ...it.payload,
          to: testEmail,
          bcc: undefined,
          subject: `[TEST] ${it.payload.subject}`,
        },
      }))
    const testResult = await bulkSend(previewItems)
    return NextResponse.json({
      success: true,
      test: true,
      sent: testResult.succeeded,
      failed: testResult.failed,
      failures: testResult.failures,
      previewOf: previewItems.length,
    })
  }

  const result = await bulkSend(items)

  const madeAttempted = items.filter(i => i.kind === 'made').length
  const notMadeAttempted = items.filter(i => i.kind === 'notMade').length

  return NextResponse.json({
    success: true,
    madeAttempted,
    notMadeAttempted,
    sent: result.succeeded,
    failed: result.failed,
    failures: result.failures,
  })
}
