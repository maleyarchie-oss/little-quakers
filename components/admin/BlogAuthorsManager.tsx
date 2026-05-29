'use client'

import { useState } from 'react'
import { BlogAuthor } from '@/types'

export default function BlogAuthorsManager({ initialAuthors }: { initialAuthors: BlogAuthor[] }) {
  const [authors, setAuthors] = useState(initialAuthors)
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const create = async () => {
    if (!form.name || !form.username || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    setError('')
    setMessage('')
    const res = await fetch('/api/admin/blog-authors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setAuthors(a => [...a, data.author])
      setForm({ name: '', username: '', email: '', password: '' })
      setMessage('Author created! They can now log in at /author/login')
    } else {
      setError(data.error || 'Failed to create author.')
    }
    setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this blog author? Their posts will remain but they will no longer be able to log in.')) return
    const res = await fetch('/api/admin/blog-authors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setAuthors(a => a.filter(x => x.id !== id))
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Current authors */}
      <div className="card">
        <h2 className="font-black text-xl mb-4">Blog Authors</h2>
        {authors.length === 0 ? (
          <p className="text-gray-400">No blog authors yet.</p>
        ) : (
          <div className="space-y-3">
            {authors.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4">
                <div>
                  <p className="font-bold">{a.name}</p>
                  <p className="text-gray-500 text-sm">@{a.username} · {a.email}</p>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="text-red-400 hover:text-red-600 text-sm font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-gray-400 text-xs mt-3">
          Authors log in at <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">/author/login</span> to write posts.
        </p>
      </div>

      {/* Add author */}
      <div className="card">
        <h2 className="font-black text-xl mb-5">Add Blog Author</h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
          </div>
          <div>
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase() }))} placeholder="jsmith" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Set a strong password" />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-3 font-semibold">✓ {message}</p>}
        <button className="btn-primary w-full mt-5 py-4" onClick={create} disabled={saving}>
          {saving ? 'Creating…' : 'Create Author'}
        </button>
      </div>
    </div>
  )
}
