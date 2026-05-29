export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthorSession } from '@/lib/author-auth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function GET() {
  const session = await getAuthorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, published, published_at, created_at, updated_at')
    .eq('author_id', session.authorId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posts: data || [] })
}

export async function POST(req: NextRequest) {
  const session = await getAuthorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, excerpt, content, cover_image_url, published } = await req.json()

  if (!title || !excerpt || !content) {
    return NextResponse.json({ error: 'Title, excerpt, and content are required.' }, { status: 400 })
  }

  const baseSlug = slugify(title)
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const { data: existing } = await supabaseAdmin
      .from('blog_posts').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert({
      title,
      slug,
      excerpt,
      content,
      cover_image_url: cover_image_url || null,
      author_id: session.authorId,
      author_name: session.authorName,
      published: published || false,
      published_at: published ? now : null,
      updated_at: now,
    })
    .select('id, title, slug, published')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, post: data })
}
