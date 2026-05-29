'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'

export default function AuthorLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/author/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/author')
    } else {
      setError(data.error || 'Login failed.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <p className="text-[#B8962A] font-black text-sm tracking-widest uppercase">Little Quakers</p>
              <p className="text-gray-500 text-xs">Author Portal</p>
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="bg-[#111] border border-gray-800 rounded-2xl p-8 space-y-5">
          <h1 className="text-white text-2xl font-black text-center mb-2">Sign In</h1>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Username</label>
            <input
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:border-[#B8962A] outline-none transition-colors"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:border-[#B8962A] outline-none transition-colors"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#B8962A] hover:bg-[#8B7020] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
