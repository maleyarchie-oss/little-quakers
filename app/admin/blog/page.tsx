export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import BlogManager from '@/components/admin/BlogManager'

export default async function AdminBlogPage() {
  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, author_name, published, published_at, created_at, updated_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Blog Posts</h1>
        <p className="text-gray-500 mt-1">
          Manage all posts. Authors write from{' '}
          <a href="/author/login" target="_blank" className="text-[#B8962A] hover:underline font-semibold">
            /author/login
          </a>
          . You can publish, unpublish, or delete any post here.
        </p>
      </div>
      <BlogManager initialPosts={(posts || []) as any} />
    </div>
  )
}
