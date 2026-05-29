export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('blog_authors')
    .select('id, name, email, username, created_at')
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ authors: data || [] })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, username, email, password } = await req.json()

  if (!name || !username || !email || !password) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { data, error } = await supabaseAdmin
    .from('blog_authors')
    .insert({ name, username: username.toLowerCase(), email, password_hash })
    .select('id, name, username, email, created_at')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Username already exists.' }, { status: 409 })
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ success: true, author: data })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('blog_authors').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
