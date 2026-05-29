export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getAuthorSession } from '@/lib/author-auth'
import { supabaseAdmin } from '@/lib/supabase'
import PostEditor from '@/components/author/PostEditor'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getAuthorSession()

  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, excerpt, content, cover_image_url, published')
    .eq('id', id)
    .eq('author_id', session!.authorId)
    .single()

  if (error || !post) notFound()

  return (
    <PostEditor
      mode="edit"
      initial={{
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image_url: post.cover_image_url || '',
        published: post.published,
      }}
    />
  )
}
