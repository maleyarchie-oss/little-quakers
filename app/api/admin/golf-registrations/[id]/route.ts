import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VALID_STATUSES = ['pending', 'paid', 'cancelled', 'refunded'] as const
type Status = (typeof VALID_STATUSES)[number]

function isValidStatus(v: unknown): v is Status {
  return typeof v === 'string' && (VALID_STATUSES as readonly string[]).includes(v)
}

// PATCH /api/admin/golf-registrations/[id]
// Update a single golf registration's status. Used to mark paid / refunded / etc.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const status = body.status
  if (!isValidStatus(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // If we're marking paid for the first time, also stamp the paid timestamp.
  const update: Record<string, unknown> = { status }
  if (status === 'paid') {
    update.stripe_paid_at = new Date().toISOString()
  }

  const { error } = await supabaseAdmin
    .from('golf_registrations')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('[admin/golf-registrations/patch] failed:', error)
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/admin/golf-registrations/[id]
// Hard-delete a golf registration. Useful for the test row + spam/cancellations.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('golf_registrations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[admin/golf-registrations/delete] failed:', error)
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
