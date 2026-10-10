'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Registrant } from '@/types'

export default function RegistrantsTable({ registrants }: { registrants: Registrant[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [rows, setRows] = useState<Registrant[]>(registrants)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // Inline email editing
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  // Add-player modal
  const [addOpen, setAddOpen] = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const emptyAdd = {
    player_first_name: '', player_last_name: '',
    email: '', phone: '',
    caregiver_first_name: '', caregiver_last_name: '',
    grade: '', position_desired: '',
    status: 'made_team' as 'made_team' | 'registered' | 'not_made_team',
  }
  const [addDraft, setAddDraft] = useState(emptyAdd)

  async function createPlayer() {
    setErrorMsg(null)
    setAddSaving(true)
    try {
      const res = await fetch('/api/admin/registrants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addDraft),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error || 'Create failed')
      // Add to local state so it shows up immediately
      setRows(prev => [body.registrant, ...prev])
      setAddOpen(false)
      setAddDraft(emptyAdd)
      router.refresh()
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setAddSaving(false)
    }
  }

  async function saveEmail(id: string) {
    setErrorMsg(null)
    const trimmed = emailDraft.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }
    setSavingEmail(true)
    try {
      const res = await fetch(`/api/admin/registrants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error || 'Update failed')
      setRows(prev => prev.map(r => (r.id === id ? { ...r, email: trimmed } : r)))
      setEditingEmailId(null)
      setEmailDraft('')
      router.refresh()
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSavingEmail(false)
    }
  }

  async function deleteRegistrant(id: string) {
    setErrorMsg(null)
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/registrants/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Delete failed')
      }
      setRows(prev => prev.filter(r => r.id !== id))
      setConfirmId(null)
      router.refresh()
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = rows.filter(r => {
    const name = `${r.player_first_name} ${r.player_last_name}`.toLowerCase()
    const matchesSearch = name.includes(search.toLowerCase()) || r.position_desired.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || r.status === filter
    return matchesSearch && matchesFilter
  })

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Position', 'Height', 'Weight', 'School', 'Grade', 'Caregiver', 'Email', 'Phone', 'Street', 'Apt/Unit', 'City', 'State', 'ZIP', 'Coach', 'Coach Email', 'Status', 'Registered']
    const csvRows = filtered.map(r => [
      r.player_first_name, r.player_last_name, r.position_desired, r.height, r.weight,
      r.current_school, r.grade, `${r.caregiver_first_name} ${r.caregiver_last_name}`,
      r.email, r.phone,
      r.street_address, r.apt_unit || '', r.city, r.state, r.zip_code,
      r.current_coach_name, r.current_coach_email,
      r.status, new Date(r.created_at).toLocaleDateString(),
    ])
    const csv = [headers, ...csvRows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'little-quakers-registrants.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          className="form-input max-w-xs"
          placeholder="Search by name or position…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-input max-w-xs" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="registered">Registered</option>
          <option value="made_team">Made the Team</option>
          <option value="not_made_team">Not Selected</option>
        </select>
        <button className="btn-black py-3 px-5 text-sm" onClick={exportCSV}>
          ⬇ Export CSV
        </button>
        <button className="bg-green-600 text-white font-bold py-3 px-5 text-sm rounded-lg" onClick={() => { setErrorMsg(null); setAddOpen(true) }}>
          + Add Player
        </button>
      </div>

      {addOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setAddOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div>
              <h2 className="text-xl font-black">Add Player</h2>
              <p className="text-sm text-gray-500 mt-1">For players who skipped the public registration (e.g., invited directly). They'll be added as Made Team by default.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Player first name *</label>
                <input className="form-input w-full" value={addDraft.player_first_name} onChange={e => setAddDraft(d => ({ ...d, player_first_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Player last name *</label>
                <input className="form-input w-full" value={addDraft.player_last_name} onChange={e => setAddDraft(d => ({ ...d, player_last_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Grade *</label>
                <select className="form-input w-full" value={addDraft.grade} onChange={e => setAddDraft(d => ({ ...d, grade: e.target.value }))}>
                  <option value="">— pick —</option>
                  <option value="5th">5th</option>
                  <option value="6th">6th</option>
                  <option value="7th">7th</option>
                  <option value="8th">8th</option>
                  <option value="9th">9th</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Position *</label>
                <select className="form-input w-full" value={addDraft.position_desired} onChange={e => setAddDraft(d => ({ ...d, position_desired: e.target.value }))}>
                  <option value="">— pick —</option>
                  <option>Quarterback</option>
                  <option>Running Back</option>
                  <option>Wide Receiver</option>
                  <option>Tight End</option>
                  <option>Offensive Lineman</option>
                  <option>Defensive Lineman</option>
                  <option>Linebacker</option>
                  <option>Cornerback</option>
                  <option>Safety</option>
                  <option>Kicker</option>
                  <option>Punter</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Caregiver first name *</label>
                <input className="form-input w-full" value={addDraft.caregiver_first_name} onChange={e => setAddDraft(d => ({ ...d, caregiver_first_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Caregiver last name *</label>
                <input className="form-input w-full" value={addDraft.caregiver_last_name} onChange={e => setAddDraft(d => ({ ...d, caregiver_last_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Caregiver email *</label>
                <input type="email" className="form-input w-full" value={addDraft.email} onChange={e => setAddDraft(d => ({ ...d, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Caregiver phone *</label>
                <input type="tel" className="form-input w-full" value={addDraft.phone} onChange={e => setAddDraft(d => ({ ...d, phone: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Initial status</label>
                <select className="form-input w-full" value={addDraft.status} onChange={e => setAddDraft(d => ({ ...d, status: e.target.value as 'made_team' | 'registered' | 'not_made_team' }))}>
                  <option value="made_team">Made Team (default)</option>
                  <option value="registered">Registered (not yet selected)</option>
                  <option value="not_made_team">Not Made Team</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={createPlayer} disabled={addSaving} className="btn-black px-5 py-2 text-sm disabled:opacity-40">
                {addSaving ? 'Adding…' : 'Add player'}
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Player', 'Position', 'Height/Weight', 'School', 'Caregiver', 'Email', 'Docs', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold">{r.player_first_name} {r.player_last_name}</p>
                  <p className="text-gray-400 text-xs">{r.grade} grade · DOB: {r.birth_date}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{r.position_desired}</td>
                <td className="px-4 py-3 text-gray-600">{r.height} / {r.weight} lbs</td>
                <td className="px-4 py-3 text-gray-600">{r.current_school}</td>
                <td className="px-4 py-3">
                  <p>{r.caregiver_first_name} {r.caregiver_last_name}</p>
                  <p className="text-gray-400 text-xs">{r.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {editingEmailId === r.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="email"
                        value={emailDraft}
                        onChange={e => setEmailDraft(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs flex-1 min-w-0"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEmail(r.id)
                          if (e.key === 'Escape') { setEditingEmailId(null); setEmailDraft('') }
                        }}
                      />
                      <button
                        onClick={() => saveEmail(r.id)}
                        disabled={savingEmail}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded disabled:opacity-40"
                        title="Save"
                      >✓</button>
                      <button
                        onClick={() => { setEditingEmailId(null); setEmailDraft('') }}
                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                        title="Cancel"
                      >✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="break-all">{r.email}</span>
                      <button
                        onClick={() => { setEditingEmailId(r.id); setEmailDraft(r.email); setErrorMsg(null) }}
                        className="text-xs text-blue-600 hover:underline shrink-0"
                        title="Edit email"
                      >edit</button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {r.birth_certificate_url ? (
                      <a href={r.birth_certificate_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">BC ✓</a>
                    ) : <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-semibold">BC ✗</span>}
                    {r.report_card_url ? (
                      <a href={r.report_card_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">RC ✓</a>
                    ) : <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-semibold">RC ✗</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    r.status === 'made_team' ? 'bg-green-100 text-green-700' :
                    r.status === 'not_made_team' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {r.status === 'made_team' ? '✓ Team' : r.status === 'not_made_team' ? '✗ No' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setConfirmId(r.id)}
                    disabled={deletingId === r.id}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline disabled:opacity-40"
                    aria-label={`Delete ${r.player_first_name} ${r.player_last_name}`}
                  >
                    {deletingId === r.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">No registrants found.</div>
        )}
      </div>

      {/* Confirm modal */}
      {confirmId && (() => {
        const target = rows.find(r => r.id === confirmId)
        if (!target) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-black mb-2">Delete registration?</h2>
              <p className="text-gray-600 mb-6">
                Delete <strong>{target.player_first_name} {target.player_last_name}</strong>'s registration?
                This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmId(null)}
                  disabled={deletingId === confirmId}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteRegistrant(confirmId)}
                  disabled={deletingId === confirmId}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === confirmId ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
