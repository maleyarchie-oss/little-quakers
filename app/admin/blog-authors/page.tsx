export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import BlogAuthorsManager from '@/components/admin/BlogAuthorsManager'

export default async function AdminBlogAuthorsPage() {
  const { data: authors } = await supabaseAdmin
    .from('blog_authors')
    .select('id, name, email, username, created_at')
    .order('created_at')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Blog Authors</h1>
        <p className="text-gray-500 mt-1">
          Create accounts for staff members who need to write blog posts.
          Authors only have access to the blog — not registrants or admin tools.
        </p>
      </div>
      <BlogAuthorsManager initialAuthors={authors || []} />
    </div>
  )
}
