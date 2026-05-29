export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthorSession } from '@/lib/author-auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .eq('author_id', session.authorId)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  return NextResponse.json({ post: data })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { title, excerpt, content, cover_image_url, published } = await req.json()

  const existing = await supabaseAdmin
    .from('blog_posts').select('id, published, published_at').eq('id', id).eq('author_id', session.authorId).single()

  if (!existing.data) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const now = new Date().toISOString()
  const wasPublished = existing.data.published
  const publishedAt = published && !wasPublished ? now : existing.data.published_at

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update({
      title,
      excerpt,
      content,
      cover_image_url: cover_image_url || null,
      published,
      published_at: publishedAt,
      updated_at: now,
    })
    .eq('id', id)
    .select('id, title, slug, published')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, post: data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthorSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin
    .from('blog_posts').delete().eq('id', id).eq('author_id', session.authorId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
