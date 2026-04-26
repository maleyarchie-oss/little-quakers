import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSession, setSessionCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required.' }, { status: 400 })
  }

  const { data: admin, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, name, password_hash')
    .eq('username', username.toLowerCase().trim())
    .single()

  console.log('DB lookup result:', { admin: admin ? 'found' : 'not found', error: error?.message })

  if (!admin) {
    return NextResponse.json({ error: `User not found: ${error?.message}` }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, admin.password_hash)
  console.log('Password valid:', valid)

  if (!valid) {
    return NextResponse.json({ error: 'Password mismatch' }, { status: 401 })
  }

  const token = await createSession(admin.id, admin.name)
  await setSessionCookie(token)

  return NextResponse.json({ success: true, name: admin.name })
}
