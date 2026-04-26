'use client'

import { useState } from 'react'
import { Registrant } from '@/types'

export default function RosterManager({ roster }: { roster: Registrant[] }) {
  const [jerseys, setJerseys] = useState<Record<string, number | ''>>(() =>
    Object.fromEntries(roster.map(p => [p.id, p.jersey_number || '']))
  )
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')
  const [sheetUrl, setSheetUrl] = useState('')

  const saveJerseys = async () => {
    setSaving(true); setMessage('')
    try {
      const updates = Object.entries(jerseys).map(([id, num]) =>
        fetch('/api/admin/roster', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, jersey_number: num || null }),
        })
      )
      await Promise.all(updates)
      setMessage('Jersey numbers saved!')
    } catch {
      setMessage('Error saving jersey numbers.')
    } finally {
      setSaving(false)
    }
  }

  const exportToSheets = async () => {
    setExporting(true); setMessage('')
    try {
      const res = await fetch('/api/admin/roster', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        setSheetUrl(data.url)
        setMessage('Roster exported to Google Sheets!')
      }
    } catch {
      setMessage('Error exporting roster.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button className="btn-primary py-3 px-6 text-sm" onClick={saveJerseys} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save Jersey Numbers'}
        </button>
        <button className="btn-black py-3 px-6 text-sm" onClick={exportToSheets} disabled={exporting}>
          {exporting ? 'Exporting…' : '📊 Export to Google Sheets'}
        </button>
        {sheetUrl && (
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 px-6 text-sm">
            Open Sheet ↗
          </a>
        )}
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {message}
        </div>
      )}

      {roster.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400">No players on the roster yet. Use Team Selection to build the roster first.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0A]">
              <tr>
                {['#', 'Player', 'Position', 'Height', 'Weight', 'Caregiver', 'Phone', 'Email'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {roster.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1} max={99}
                      className="w-16 border-2 border-gray-200 rounded px-2 py-1 text-center font-bold focus:border-[#B8962A] outline-none"
                      value={jerseys[p.id] ?? ''}
                      onChange={e => setJerseys(j => ({ ...j, [p.id]: e.target.value ? parseInt(e.target.value) : '' }))}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.player_first_name} {p.player_last_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.position_desired}</td>
                  <td className="px-4 py-3 text-gray-600">{p.height}</td>
                  <td className="px-4 py-3 text-gray-600">{p.weight} lbs</td>
                  <td className="px-4 py-3">{p.caregiver_first_name} {p.caregiver_last_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
