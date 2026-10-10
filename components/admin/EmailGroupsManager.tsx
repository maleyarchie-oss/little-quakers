'use client'

import { useEffect, useState } from 'react'

type Contact = { id: string; name: string; email: string }
type Group = { id: string; name: string; contacts: Contact[] }

export default function EmailGroupsManager() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  // Per-group inline state for adding contacts
  const [addDrafts, setAddDrafts] = useState<Record<string, { name: string; email: string }>>({})
  // Bulk-paste modal state
  const [bulkOpenFor, setBulkOpenFor] = useState<string | null>(null)
  const [bulkText, setBulkText] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/email-groups')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load groups')
      setGroups(data.groups || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createGroup = async () => {
    const name = newGroupName.trim()
    if (!name) return
    setError(''); setMessage('')
    try {
      const res = await fetch('/api/admin/email-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Create failed')
      setNewGroupName('')
      setMessage(`Created group "${name}".`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    }
  }

  const deleteGroup = async (id: string, name: string) => {
    if (!confirm(`Delete group "${name}"? This removes all contacts in it. This cannot be undone.`)) return
    setError(''); setMessage('')
    try {
      const res = await fetch(`/api/admin/email-groups/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }
      setMessage(`Deleted group "${name}".`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const renameGroup = async (id: string, oldName: string) => {
    const newName = prompt('Rename group:', oldName)
    if (!newName || newName.trim() === oldName) return
    setError(''); setMessage('')
    try {
      const res = await fetch(`/api/admin/email-groups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Rename failed')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rename failed')
    }
  }

  const addContact = async (groupId: string) => {
    const draft = addDrafts[groupId] || { name: '', email: '' }
    if (!draft.name.trim() || !draft.email.trim()) return
    setError(''); setMessage('')
    try {
      const res = await fetch(`/api/admin/email-groups/${groupId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: draft.name.trim(), email: draft.email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Add failed')
      setAddDrafts(d => ({ ...d, [groupId]: { name: '', email: '' } }))
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Add failed')
    }
  }

  const deleteContact = async (contactId: string, name: string) => {
    if (!confirm(`Remove ${name} from this group?`)) return
    setError(''); setMessage('')
    try {
      const res = await fetch(`/api/admin/email-groups/contacts/${contactId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Remove failed')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Remove failed')
    }
  }

  const openBulk = (groupId: string) => {
    setBulkOpenFor(groupId)
    setBulkText('')
  }

  const submitBulk = async () => {
    if (!bulkOpenFor) return
    // Parse lines like: "Name, email@example.com" or "Name <email@example.com>"
    const parsed = bulkText.split('\n').map(line => {
      const l = line.trim()
      if (!l) return null
      const angle = l.match(/^(.+?)\s*<([^>]+)>$/)
      if (angle) return { name: angle[1].trim(), email: angle[2].trim() }
      const comma = l.split(',')
      if (comma.length >= 2) {
        const email = comma[comma.length - 1].trim()
        const name = comma.slice(0, -1).join(',').trim()
        return { name, email }
      }
      return null
    }).filter(Boolean) as { name: string; email: string }[]

    if (parsed.length === 0) {
      setError('No valid lines parsed. Use format: Name, email@example.com')
      return
    }

    setError(''); setMessage('')
    try {
      const res = await fetch(`/api/admin/email-groups/${bulkOpenFor}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: parsed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Bulk add failed')
      setMessage(`Added ${data.added} contact(s).`)
      setBulkOpenFor(null)
      setBulkText('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bulk add failed')
    }
  }

  if (loading) return <p className="text-gray-500">Loading…</p>

  return (
    <div className="space-y-6 max-w-4xl">
      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{message}</div>}

      {/* Create group */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Create a new group</h2>
        <div className="flex gap-2">
          <input
            className="form-input flex-1"
            placeholder="e.g. Coaching Staff, 2026 Roster Parents"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createGroup() }}
          />
          <button onClick={createGroup} className="btn-black px-5 whitespace-nowrap" disabled={!newGroupName.trim()}>
            Create group
          </button>
        </div>
      </div>

      {/* Groups list */}
      {groups.length === 0 ? (
        <p className="text-gray-500 text-sm">No groups yet. Create one above to get started.</p>
      ) : (
        groups.map(g => (
          <div key={g.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="font-black text-lg">{g.name}</h3>
                <p className="text-xs text-gray-500">{g.contacts.length} contact{g.contacts.length === 1 ? '' : 's'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => renameGroup(g.id, g.name)} className="text-xs text-blue-600 hover:underline">Rename</button>
                <button onClick={() => deleteGroup(g.id, g.name)} className="text-xs text-red-600 hover:underline">Delete group</button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Contacts */}
              {g.contacts.length === 0 ? (
                <p className="text-sm text-gray-500">No contacts yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {g.contacts.map(c => (
                    <li key={c.id} className="py-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500 break-all">{c.email}</p>
                      </div>
                      <button
                        onClick={() => deleteContact(c.id, c.name)}
                        className="text-xs text-red-600 hover:underline shrink-0"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add contact */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <input
                  className="form-input flex-1 text-sm"
                  placeholder="Name"
                  value={addDrafts[g.id]?.name || ''}
                  onChange={e => setAddDrafts(d => ({ ...d, [g.id]: { ...(d[g.id] || { email: '' }), name: e.target.value } }))}
                />
                <input
                  type="email"
                  className="form-input flex-1 text-sm"
                  placeholder="email@example.com"
                  value={addDrafts[g.id]?.email || ''}
                  onChange={e => setAddDrafts(d => ({ ...d, [g.id]: { ...(d[g.id] || { name: '' }), email: e.target.value } }))}
                  onKeyDown={e => { if (e.key === 'Enter') addContact(g.id) }}
                />
                <button onClick={() => addContact(g.id)} className="bg-black text-white font-bold px-4 rounded-lg text-sm whitespace-nowrap">
                  Add
                </button>
                <button onClick={() => openBulk(g.id)} className="bg-gray-200 text-gray-700 font-semibold px-3 rounded-lg text-xs whitespace-nowrap">
                  Bulk paste
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Bulk paste modal */}
      {bulkOpenFor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setBulkOpenFor(null)}>
          <div className="bg-white rounded-xl w-full max-w-xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg">Bulk add contacts</h3>
            <p className="text-sm text-gray-600">
              One per line. Format: <code className="bg-gray-100 px-1 rounded">Name, email@example.com</code> or <code className="bg-gray-100 px-1 rounded">Name &lt;email@example.com&gt;</code>
            </p>
            <textarea
              className="form-input w-full font-mono text-sm"
              rows={10}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="Chris Rahill, crahill@penncharter.com&#10;Joe Spera, jspera@crsd.org"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setBulkOpenFor(null)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={submitBulk} className="btn-black px-5 py-2 text-sm" disabled={!bulkText.trim()}>Add contacts</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
