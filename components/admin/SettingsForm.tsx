'use client'

import { useState } from 'react'

interface Settings {
  registration_open: boolean
  tryout_date: string
  tryout_time: string
  tryout_location: string
  stripe_link: string
  email_from: string
  made_team_subject: string
  made_team_body: string
  not_made_team_subject: string
  not_made_team_body: string
  google_sheets_calendar_id: string
}

export default function SettingsForm({ settings }: { settings: Settings | null }) {
  const [form, setForm] = useState<Settings>({
    registration_open: settings?.registration_open ?? false,
    tryout_date: settings?.tryout_date ?? '',
    tryout_time: settings?.tryout_time ?? '',
    tryout_location: settings?.tryout_location ?? '',
    stripe_link: settings?.stripe_link ?? '',
    email_from: settings?.email_from ?? 'info@littlequakers.com',
    made_team_subject: settings?.made_team_subject ?? 'Congratulations – You Made the Little Quakers!',
    made_team_body: settings?.made_team_body ?? `Dear [Player Name],\n\nCongratulations! You have been selected to join the Philadelphia Little Quakers!\n\nWe are thrilled to welcome you to the team. More details about next steps will follow soon.\n\nGo Little Quakers!\n\n— The Coaching Staff`,
    not_made_team_subject: settings?.not_made_team_subject ?? 'Thank You for Trying Out – Little Quakers',
    not_made_team_body: settings?.not_made_team_body ?? `Dear [Player Name],\n\nThank you for trying out for the Philadelphia Little Quakers. We were impressed by the effort and heart you showed at tryouts.\n\nWhile we were not able to offer you a spot on this year's roster, we encourage you to keep working hard and try again next year.\n\nGo Little Quakers!\n\n— The Coaching Staff`,
    google_sheets_calendar_id: settings?.google_sheets_calendar_id ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [calendarCreating, setCalendarCreating] = useState(false)

  const set = (k: keyof Settings, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true); setMessage('')
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) setMessage('Settings saved successfully!')
    else setMessage('Error saving settings.')
    setSaving(false)
  }

  const createCalendar = async () => {
    setCalendarCreating(true); setMessage('')
    const res = await fetch('/api/admin/settings', { method: 'PUT' })
    const data = await res.json()
    if (data.spreadsheetId) {
      set('google_sheets_calendar_id', data.spreadsheetId)
      setMessage(`Calendar sheet created! Open it at: ${data.url}`)
    } else {
      setMessage('Error creating calendar sheet.')
    }
    setCalendarCreating(false)
  }

  return (
    <div className="max-w-3xl space-y-6">
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          {message}
        </div>
      )}

      {/* Registration Status */}
      <div className="card">
        <h2 className="font-black text-xl mb-5">Registration</h2>
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => set('registration_open', !form.registration_open)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              form.registration_open ? 'bg-[#B8962A]' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
              form.registration_open ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
          <span className="font-semibold">
            Registration is <span className={form.registration_open ? 'text-green-600' : 'text-gray-500'}>
              {form.registration_open ? 'OPEN' : 'CLOSED'}
            </span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Tryout Date</label>
            <input className="form-input" value={form.tryout_date}
              onChange={e => set('tryout_date', e.target.value)} placeholder="e.g. Saturday, June 14, 2025" />
          </div>
          <div>
            <label className="form-label">Tryout Time</label>
            <input className="form-input" value={form.tryout_time}
              onChange={e => set('tryout_time', e.target.value)} placeholder="e.g. 9:00 AM – 12:00 PM" />
          </div>
          <div>
            <label className="form-label">Tryout Location</label>
            <input className="form-input" value={form.tryout_location}
              onChange={e => set('tryout_location', e.target.value)} placeholder="e.g. Lincoln Field, Philadelphia" />
          </div>
        </div>
      </div>

      {/* Stripe */}
      <div className="card">
        <h2 className="font-black text-xl mb-5">Donation (Stripe)</h2>
        <div>
          <label className="form-label">Stripe Payment Link</label>
          <input className="form-input" value={form.stripe_link}
            onChange={e => set('stripe_link', e.target.value)}
            placeholder="https://buy.stripe.com/…" />
          <p className="text-gray-400 text-xs mt-1">Paste your Stripe payment link. This button appears on the last step of registration.</p>
        </div>
      </div>

      {/* Email */}
      <div className="card">
        <h2 className="font-black text-xl mb-5">Email Settings</h2>
        <div className="mb-5">
          <label className="form-label">From Email Address</label>
          <input className="form-input" value={form.email_from}
            onChange={e => set('email_from', e.target.value)} placeholder="info@littlequakers.com" />
        </div>
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-[#B8962A] mb-3">✅ "Made the Team" Email</h3>
            <div className="mb-3">
              <label className="form-label">Subject</label>
              <input className="form-input" value={form.made_team_subject}
                onChange={e => set('made_team_subject', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Body</label>
              <p className="text-gray-400 text-xs mb-1">Use [Player Name] as a placeholder — it will be replaced automatically.</p>
              <textarea className="form-input" rows={6} value={form.made_team_body}
                onChange={e => set('made_team_body', e.target.value)} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-500 mb-3">❌ "Did Not Make the Team" Email</h3>
            <div className="mb-3">
              <label className="form-label">Subject</label>
              <input className="form-input" value={form.not_made_team_subject}
                onChange={e => set('not_made_team_subject', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Body</label>
              <p className="text-gray-400 text-xs mb-1">Use [Player Name] as a placeholder.</p>
              <textarea className="form-input" rows={6} value={form.not_made_team_body}
                onChange={e => set('not_made_team_body', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        <h2 className="font-black text-xl mb-2">Calendar (Google Sheets)</h2>
        <p className="text-gray-500 text-sm mb-5">
          Create a Google Sheet that coaches can edit. The calendar on the website will sync automatically every 15 minutes.
        </p>
        {form.google_sheets_calendar_id ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex-1">
              <p className="text-green-700 text-sm font-semibold">✓ Calendar sheet connected</p>
              <p className="text-green-600 text-xs mt-0.5">Sheet ID: {form.google_sheets_calendar_id}</p>
            </div>
            <a
              href={`https://docs.google.com/spreadsheets/d/${form.google_sheets_calendar_id}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-secondary py-2 px-4 text-sm"
            >
              Open Sheet ↗
            </a>
          </div>
        ) : (
          <button
            className="btn-primary py-3 px-6 text-sm mb-4"
            onClick={createCalendar}
            disabled={calendarCreating}
          >
            {calendarCreating ? 'Creating…' : '📊 Create Calendar Google Sheet'}
          </button>
        )}
        <div>
          <label className="form-label">Or paste existing Sheet ID</label>
          <input className="form-input text-sm" value={form.google_sheets_calendar_id}
            onChange={e => set('google_sheets_calendar_id', e.target.value)}
            placeholder="Sheet ID from Google Sheets URL" />
        </div>
      </div>

      <button className="btn-primary w-full py-5 text-lg" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save All Settings'}
      </button>
    </div>
  )
}
