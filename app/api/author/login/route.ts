import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createAuthorSession, setAuthorSessionCookie } from '@/lib/author-auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required.' }, { status: 400 })
    }

    const { data: author, error } = await supabaseAdmin
      .from('blog_authors')
      .select('id, name, password_hash')
      .eq('username', username.toLowerCase().trim())
      .single()

    if (error || !author) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, author.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    const token = await createAuthorSession(author.id, author.name)
    await setAuthorSessionCookie(token)

    return NextResponse.json({ success: true, name: author.name })
  } catch (e) {
    console.error('[author/login]', e)
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
