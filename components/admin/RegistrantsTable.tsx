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
      </div>

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
                <td className="px-4 py-3 text-gray-600 text-xs">{r.email}</td>
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
