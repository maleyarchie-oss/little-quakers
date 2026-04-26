'use client'

import { useState } from 'react'

interface Account {
  id: string
  name: string
  username: string
  email: string
  created_at: string
}

export default function AccountsManager({ accounts }: { accounts: Account[] }) {
  const [list, setList] = useState(accounts)
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const create = async () => {
    if (!form.name || !form.username || !form.password || !form.email) {
      setError('All fields are required.')
      return
    }
    if (list.length >= 3) {
      setError('Maximum 3 admin accounts allowed.')
      return
    }
    setSaving(true); setError(''); setMessage('')
    const res = await fetch('/api/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setList(l => [...l, data.account])
      setForm({ name: '', username: '', email: '', password: '' })
      setMessage('Account created successfully!')
    } else {
      setError(data.error || 'Failed to create account.')
    }
    setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this admin account?')) return
    const res = await fetch('/api/admin/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setList(l => l.filter(a => a.id !== id))
  }

  return (
    <div className="max-w-2xl">
      {/* Current Accounts */}
      <div className="card mb-6">
        <h2 className="font-black text-xl mb-4">Current Admins</h2>
        {list.length === 0 ? (
          <p className="text-gray-400">No admin accounts yet.</p>
        ) : (
          <div className="space-y-3">
            {list.map(a => (
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
        <p className="text-gray-400 text-xs mt-3">{list.length}/3 accounts used</p>
      </div>

      {/* Create Account */}
      {list.length < 3 && (
        <div className="card">
          <h2 className="font-black text-xl mb-5">Add Admin Account</h2>
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
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Strong password" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-3 font-semibold">✓ {message}</p>}

          <button className="btn-primary w-full mt-5 py-4" onClick={create} disabled={saving}>
            {saving ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      )}
    </div>
  )
}
