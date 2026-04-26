'use client'

import { useState } from 'react'

interface Recipient {
  id: string
  player_first_name: string
  player_last_name: string
  email: string
  status: string
}

export default function BroadcastForm({ recipients }: { recipients: Recipient[] }) {
  const [group, setGroup] = useState<'all' | 'roster' | 'not_selected' | 'registered'>('all')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const filtered = recipients.filter(r => {
    if (group === 'all') return true
    if (group === 'roster') return r.status === 'made_team'
    if (group === 'not_selected') return r.status === 'not_made_team'
    return r.status === 'registered'
  })

  const send = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and body are required.')
      return
    }
    if (!confirm(`Send this email to ${filtered.length} recipients?`)) return

    setSending(true); setError(''); setMessage('')
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientIds: filtered.map(r => r.id), subject, body }),
    })
    if (res.ok) {
      setMessage(`Email sent to ${filtered.length} recipients!`)
      setSubject('')
      setBody('')
    } else {
      setError('Failed to send emails. Please try again.')
    }
    setSending(false)
  }

  return (
    <div className="max-w-2xl">
      {/* Audience */}
      <div className="card mb-6">
        <h2 className="font-black text-xl mb-4">Select Audience</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: 'all', label: 'All Registrants', count: recipients.length },
            { value: 'roster', label: 'Roster Only', count: recipients.filter(r => r.status === 'made_team').length },
            { value: 'not_selected', label: 'Not Selected', count: recipients.filter(r => r.status === 'not_made_team').length },
            { value: 'registered', label: 'Pending', count: recipients.filter(r => r.status === 'registered').length },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setGroup(opt.value as typeof group)}
              className={`rounded-xl px-4 py-4 text-left transition-all border-2 ${
                group === opt.value ? 'border-[#B8962A] bg-[#B8962A]/10' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <p className="text-2xl font-black">{opt.count}</p>
              <p className="text-xs text-gray-600 font-semibold mt-0.5">{opt.label}</p>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Sending to <strong>{filtered.length} recipients</strong>
        </p>
      </div>

      {/* Compose */}
      <div className="card">
        <h2 className="font-black text-xl mb-5">Compose Email</h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">Subject</label>
            <input className="form-input" value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Email subject…" />
          </div>
          <div>
            <label className="form-label">Message</label>
            <p className="text-gray-400 text-xs mb-1">Use [Player Name] to personalize each email.</p>
            <textarea className="form-input" rows={10} value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message here…" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-3 font-semibold">✓ {message}</p>}

        <button
          className="btn-primary w-full mt-6 py-4 text-base"
          onClick={send}
          disabled={sending || filtered.length === 0}
        >
          {sending ? 'Sending…' : `Send to ${filtered.length} Recipients`}
        </button>
      </div>
    </div>
  )
}
