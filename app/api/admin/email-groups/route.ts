import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET /api/admin/email-groups
// Returns all groups with their contacts.
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: groups, error: gErr } = await supabaseAdmin
    .from('email_groups')
    .select('id, name, created_at')
    .order('name')

  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 500 })

  const { data: contacts, error: cErr } = await supabaseAdmin
    .from('email_group_contacts')
    .select('id, group_id, name, email')
    .order('name')

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 })

  const groupsWithContacts = (groups || []).map(g => ({
    ...g,
    contacts: (contacts || []).filter(c => c.group_id === g.id),
  }))

  return NextResponse.json({ groups: groupsWithContacts })
}

// POST /api/admin/email-groups
// Create a new group.
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'Group name required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('email_groups')
    .insert({ name })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'A group with that name already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, group: data })
}
