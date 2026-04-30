import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
