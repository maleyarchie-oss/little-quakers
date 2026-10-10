import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/admin/email-groups/[id]/contacts
// Add a contact to a group. Supports single or bulk via `contacts` array.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: groupId } = await params
  if (!UUID_RE.test(groupId)) return NextResponse.json({ error: 'Invalid group id' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const inputs: Array<{ name: string; email: string }> = Array.isArray(body.contacts)
    ? body.contacts
    : [{ name: body.name, email: body.email }]

  const rows: Array<{ group_id: string; name: string; email: string }> = []
  for (const c of inputs) {
    const name = typeof c?.name === 'string' ? c.name.trim() : ''
    const email = typeof c?.email === 'string' ? c.email.trim() : ''
    if (!name || !email || !EMAIL_RE.test(email)) continue
    rows.push({ group_id: groupId, name, email })
  }

  if (rows.length === 0) return NextResponse.json({ error: 'No valid contacts to add' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('email_group_contacts')
    .upsert(rows, { onConflict: 'group_id,email', ignoreDuplicates: false })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, added: data?.length || 0, contacts: data })
}
