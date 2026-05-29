'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { renderMarkdown } from '@/lib/markdown'

interface PostForm {
  title: string
  excerpt: string
  content: string
  cover_image_url: string
  published: boolean
}

interface Props {
  initial?: PostForm & { id?: string }
  mode: 'new' | 'edit'
}

const EMPTY: PostForm = { title: '', excerpt: '', content: '', cover_image_url: '', published: false }

export default function PostEditor({ initial, mode }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<PostForm>(initial || EMPTY)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (publish?: boolean) => {
    if (!form.title || !form.excerpt || !form.content) {
      setError('Title, excerpt, and content are required.')
      return
    }
    setSaving(true)
    setError('')
    const body = { ...form, published: publish !== undefined ? publish : form.published }

    const url = mode === 'edit' ? `/api/author/posts/${initial!.id}` : '/api/author/posts'
    const method = mode === 'edit' ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/author')
    } else {
      setError(data.error || 'Save failed.')
      setSaving(false)
    }
  }

  const deletePost = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await fetch(`/api/author/posts/${initial!.id}`, { method: 'DELETE' })
    router.push('/author')
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">{mode === 'new' ? 'New Post' : 'Edit Post'}</h1>
        {mode === 'edit' && (
          <button onClick={deletePost} className="text-red-500 hover:text-red-700 text-sm font-semibold">
            Delete Post
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div className="card">
          <label className="form-label">Post Title *</label>
          <input
            className="form-input text-xl font-bold"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Enter post title…"
          />
        </div>

        {/* Excerpt */}
        <div className="card">
          <label className="form-label">Excerpt * <span className="text-gray-400 font-normal">(1–2 sentence summary shown on blog listing)</span></label>
          <textarea
            className="form-input min-h-[80px] resize-none"
            value={form.excerpt}
            onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            placeholder="Short description of this post…"
          />
        </div>

        {/* Content */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <label className="form-label mb-0">Content *</label>
            <div className="flex gap-1 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setTab('write')}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${tab === 'write' ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Write
              </button>
              <button
                onClick={() => setTab('preview')}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${tab === 'preview' ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Preview
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            Tip: Use **bold**, *italic*, # Heading, ## Subheading, and - for bullet lists.
          </p>

          {tab === 'write' ? (
            <textarea
              className="form-input min-h-[400px] resize-y font-mono text-sm"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your post here…"
            />
          ) : (
            <div
              className="prose-lq min-h-[400px] border-2 border-gray-200 rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) || '<p class="text-gray-400">Nothing to preview yet.</p>' }}
            />
          )}
        </div>

        {/* Cover Image */}
        <div className="card">
          <label className="form-label">Cover Image URL <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            className="form-input"
            value={form.cover_image_url}
            onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))}
            placeholder="https://…"
          />
          <p className="text-xs text-gray-400 mt-2">Paste a URL to an image. Leave blank for the default LQ cover.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="btn-secondary text-base px-8 py-3"
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="btn-primary text-base px-8 py-3"
          >
            {saving ? 'Publishing…' : form.published ? 'Save & Keep Published' : 'Publish Post'}
          </button>
          <button
            onClick={() => router.push('/author')}
            className="text-gray-500 hover:text-gray-700 text-sm font-semibold px-4"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
