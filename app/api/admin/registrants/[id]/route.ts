import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// PATCH /api/admin/registrants/[id]
// Updates a single registrant. Admin-only. Whitelisted fields only.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const updates: Record<string, string> = {}

  // Whitelist of fields admins can edit from the table.
  const ALLOWED = ['email', 'phone', 'player_first_name', 'player_last_name', 'caregiver_first_name', 'caregiver_last_name'] as const
  for (const key of ALLOWED) {
    if (typeof body[key] === 'string' && body[key].trim()) {
      updates[key] = body[key].trim()
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  if (updates.email && !EMAIL_RE.test(updates.email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  const { error, data } = await supabaseAdmin
    .from('registrants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/registrants/patch] failed:', error)
    return NextResponse.json({ error: 'Failed to update registrant' }, { status: 500 })
  }

  return NextResponse.json({ success: true, registrant: data })
}

// DELETE /api/admin/registrants/[id]
// Removes a single registrant. Admin-only.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('registrants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[admin/registrants/delete] failed:', error)
    return NextResponse.json({ error: 'Failed to delete registrant' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
