'use client'

import { useState } from 'react'
import { BlogPost } from '@/types'

export default function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const toggle = async (id: string, published: boolean) => {
    setLoading(id)
    setError('')
    const res = await fetch('/api/admin/blog', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, published: !published }),
    })
    if (res.ok) {
      setPosts(p => p.map(post =>
        post.id === id
          ? { ...post, published: !published, published_at: !published ? new Date().toISOString() : null }
          : post
      ))
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to update post.')
    }
    setLoading(null)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setLoading(id)
    const res = await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setPosts(p => p.filter(post => post.id !== id))
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to delete post.')
    }
    setLoading(null)
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
          <p className="text-gray-400 text-xl">No blog posts yet.</p>
          <p className="text-gray-500 mt-2 text-sm">Authors can write posts from the Author Portal at /author</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Title', 'Author', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5 truncate max-w-xs">{post.excerpt}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{post.author_name}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => toggle(post.id, post.published)}
                        disabled={loading === post.id}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-40"
                      >
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                      >
                        View
                      </a>
                      <button
                        onClick={() => remove(post.id)}
                        disabled={loading === post.id}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
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
