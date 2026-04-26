'use client'

import { useState } from 'react'
import { Registrant } from '@/types'

export default function RegistrantsTable({ registrants }: { registrants: Registrant[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = registrants.filter(r => {
    const name = `${r.player_first_name} ${r.player_last_name}`.toLowerCase()
    const matchesSearch = name.includes(search.toLowerCase()) || r.position_desired.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || r.status === filter
    return matchesSearch && matchesFilter
  })

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Position', 'Height', 'Weight', 'School', 'Grade', 'Caregiver', 'Email', 'Phone', 'Address', 'Coach', 'Coach Email', 'Status', 'Registered']
    const rows = filtered.map(r => [
      r.player_first_name, r.player_last_name, r.position_desired, r.height, r.weight,
      r.current_school, r.grade, `${r.caregiver_first_name} ${r.caregiver_last_name}`,
      r.email, r.phone, r.home_address, r.current_coach_name, r.current_coach_email,
      r.status, new Date(r.created_at).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n')
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Player', 'Position', 'Height/Weight', 'School', 'Caregiver', 'Email', 'Docs', 'Status'].map(h => (
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
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">No registrants found.</div>
        )}
      </div>
    </div>
  )
}
