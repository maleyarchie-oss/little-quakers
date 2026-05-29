export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getAuthorSession } from '@/lib/author-auth'
import { supabaseAdmin } from '@/lib/supabase'

export default async function AuthorDashboard() {
  const session = await getAuthorSession()
  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, published, published_at, created_at, updated_at')
    .eq('author_id', session!.authorId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">My Posts</h1>
          <p className="text-gray-500 mt-1">Welcome back, {session!.authorName}</p>
        </div>
        <Link href="/author/new" className="btn-primary text-sm px-6 py-3">
          + New Post
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <p className="text-gray-400 text-xl mb-2">No posts yet.</p>
          <p className="text-gray-500 mb-6">Write your first post to get started.</p>
          <Link href="/author/new" className="btn-primary text-base px-8 py-3">
            Write a Post
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Title', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/author/edit/${post.id}`}
                      className="text-[#B8962A] font-semibold hover:underline text-xs"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
