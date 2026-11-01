'use client'

import { useEffect, useState } from 'react'

interface LogEntry {
  id: string
  registrant_id: string
  player_name: string
  from_status: string | null
  to_status: string
  changed_by: string
  changed_at: string
  source: string | null
  note: string | null
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-gray-400 text-xs italic">new</span>
  const map: Record<string, string> = {
    registered: 'bg-blue-100 text-blue-700',
    made_team: 'bg-green-100 text-green-700',
    not_made_team: 'bg-amber-100 text-amber-700',
  }
  const cls = map[status] || 'bg-gray-100 text-gray-700'
  const label = status === 'made_team' ? 'Made Team' : status === 'not_made_team' ? 'Not Made Team' : status
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>{label}</span>
}

export default function StatusLogViewer() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async (playerFilter = '') => {
    setLoading(true); setError('')
    try {
      const url = playerFilter
        ? `/api/admin/status-log?player=${encodeURIComponent(playerFilter)}&limit=500`
        : '/api/admin/status-log?limit=200'
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setEntries(data.entries || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    load(search.trim())
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2 max-w-md">
        <input
          className="form-input flex-1 text-sm"
          placeholder="Search by player name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-black px-5 text-sm">Search</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); load() }} className="text-sm text-gray-500 px-3">Clear</button>
        )}
      </form>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {loading && <p className="text-gray-500">Loading…</p>}

      {!loading && entries.length === 0 && (
        <p className="text-gray-500 text-sm">No log entries{search && ' matching that search'}.</p>
      )}

      {!loading && entries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">When</th>
                <th className="text-left px-4 py-3">Player</th>
                <th className="text-left px-4 py-3">Change</th>
                <th className="text-left px-4 py-3">By</th>
                <th className="text-left px-4 py-3">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(e => {
                const date = new Date(e.changed_at)
                const when = date.toLocaleString('en-US', {
                  timeZone: 'America/New_York',
                  month: 'short', day: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{when}</td>
                    <td className="px-4 py-3 font-semibold">{e.player_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={e.from_status} />
                        <span className="text-gray-400">→</span>
                        <StatusBadge status={e.to_status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.changed_by}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {e.source && <span className="font-mono mr-2">{e.source}</span>}
                      {e.note && <span>{e.note}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 italic">
        Showing newest first, up to 200 entries by default (500 when a player filter is active).
      </p>
    </div>
  )
}
