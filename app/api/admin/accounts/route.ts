import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, username, email, password } = await req.json()

  const { count } = await supabaseAdmin
    .from('admin_users')
    .select('*', { count: 'exact', head: true })

  if ((count || 0) >= 3) {
    return NextResponse.json({ error: 'Maximum 3 admin accounts allowed.' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert({ name, username: username.toLowerCase(), email, password_hash })
    .select('id, name, username, email, created_at')
    .single()

  if (error) {
    console.error('[admin/accounts] insert error:', error)
    if (error.code === '23505') return NextResponse.json({ error: 'Username already exists.' }, { status: 409 })
    return NextResponse.json({ error: `Database error: ${error.message} (code: ${error.code})` }, { status: 500 })
  }

  return NextResponse.json({ success: true, account: data })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('admin_users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
