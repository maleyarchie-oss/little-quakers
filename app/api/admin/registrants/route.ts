import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/admin/registrants
// Create a registrant directly, bypassing the public registration flow.
// For admins to add players who were selected but never registered online.
// Only requires minimum fields; everything else is defaulted to empty string
// (DB NOT NULLs demand strings, not nulls). Status defaults to 'made_team'
// so the new player appears immediately in team-selection / final roster.
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  const player_first_name = str(body.player_first_name)
  const player_last_name = str(body.player_last_name)
  const email = str(body.email).toLowerCase()
  const phone = str(body.phone)
  const grade = str(body.grade)
  const position_desired = str(body.position_desired)
  const caregiver_first_name = str(body.caregiver_first_name)
  const caregiver_last_name = str(body.caregiver_last_name)

  const missing: string[] = []
  if (!player_first_name) missing.push('player_first_name')
  if (!player_last_name) missing.push('player_last_name')
  if (!email) missing.push('email')
  if (!phone) missing.push('phone')
  if (!grade) missing.push('grade')
  if (!position_desired) missing.push('position_desired')
  if (!caregiver_first_name) missing.push('caregiver_first_name')
  if (!caregiver_last_name) missing.push('caregiver_last_name')
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing required: ${missing.join(', ')}` }, { status: 400 })
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  // Status defaults to made_team for admin-added players (the whole point of
  // this flow is adding someone who skipped tryouts but is on the team).
  const statusRaw = str(body.status) || 'made_team'
  if (!['registered', 'made_team', 'not_made_team'].includes(statusRaw)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const insert = {
    player_first_name,
    player_last_name,
    birth_date: str(body.birth_date), // optional at admin level
    height: str(body.height),
    weight: str(body.weight),
    current_school: str(body.current_school),
    grade,
    current_coach_name: str(body.current_coach_name),
    current_coach_email: str(body.current_coach_email),
    position_desired,
    caregiver_first_name,
    caregiver_last_name,
    email,
    phone,
    street_address: str(body.street_address),
    apt_unit: str(body.apt_unit) || null,
    city: str(body.city),
    state: str(body.state),
    zip_code: str(body.zip_code),
    agreed_code_of_conduct: true, // admin add implies these are handled off-platform
    agreed_medical_release: true,
    agreed_photo_release: true,
    status: statusRaw,
  }

  const { data, error } = await supabaseAdmin
    .from('registrants')
    .insert(insert)
    .select()
    .single()

  if (error) {
    console.error('[admin/registrants/create] failed:', error)
    return NextResponse.json({ error: error.message || 'Failed to create registrant' }, { status: 500 })
  }

  return NextResponse.json({ success: true, registrant: data })
}
