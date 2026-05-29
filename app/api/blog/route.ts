export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '9')
  const offset = (page - 1) * limit

  const { data, error, count } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, author_name, published_at, created_at', { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posts: data || [], total: count || 0, page, limit })
}
