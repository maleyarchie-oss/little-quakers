'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface Player {
  id: string
  player_first_name: string
  player_last_name: string
  position_desired: string
  height: string
  weight: string
  grade: string
  current_school: string
  status: string
}

function PlayerCard({ player, index, isDragging }: { player: Player; index: number; isDragging?: boolean }) {
  return (
    <Draggable draggableId={player.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg px-4 py-3 border-2 transition-all select-none cursor-grab active:cursor-grabbing ${
            snapshot.isDragging
              ? 'border-[#B8962A] shadow-xl rotate-1'
              : 'border-gray-100 hover:border-[#B8962A]/50 shadow-sm'
          }`}
        >
          <p className="font-bold text-sm">{player.player_first_name} {player.player_last_name}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="text-xs bg-[#B8962A]/10 text-[#8B7020] px-2 py-0.5 rounded font-semibold">{player.position_desired}</span>
            <span className="text-xs text-gray-400">{player.height} · {player.weight}lbs</span>
            <span className="text-xs text-gray-400">{player.grade} grade</span>
          </div>
        </div>
      )}
    </Draggable>
  )
}

export default function TeamSelector({ registrants }: { registrants: Player[] }) {
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sendingEmails, setSendingEmails] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Preview-before-send state
  type PreviewRow = { id: string; name: string; email: string }
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewMade, setPreviewMade] = useState<PreviewRow[]>([])
  const [previewNotMade, setPreviewNotMade] = useState<PreviewRow[]>([])
  const [recipients, setRecipients] = useState<'made_only' | 'not_made_only' | 'both'>('made_only')
  const [confirmText, setConfirmText] = useState('')
  // Per-recipient opt-in checkboxes (default: all checked). Lets PJ send
  // only to a subset (e.g., the 28 who missed yesterday's send).
  const [selectedMade, setSelectedMade] = useState<Set<string>>(new Set())
  const [selectedNotMade, setSelectedNotMade] = useState<Set<string>>(new Set())
  // Custom one-off copy (overrides settings for this send only)
  const [customMadeSubject, setCustomMadeSubject] = useState('')
  const [customMadeBody, setCustomMadeBody] = useState('')
  const [customNotMadeSubject, setCustomNotMadeSubject] = useState('')
  const [customNotMadeBody, setCustomNotMadeBody] = useState('')
  // Test-send state
  const [testEmail, setTestEmail] = useState('')
  const [testSending, setTestSending] = useState(false)
  // Email groups to BCC (fetched on modal open)
  type GroupSummary = { id: string; name: string; count: number }
  const [bccGroups, setBccGroups] = useState<GroupSummary[]>([])
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set())

  const existing = registrants.filter(r => r.status === 'made_team').map(r => r.id)

  const [pool, setPool] = useState<Player[]>(
    registrants.filter(r => r.status !== 'made_team')
  )
  const [roster, setRoster] = useState<Player[]>(
    registrants.filter(r => r.status === 'made_team')
  )

  const filteredPool = pool.filter(p => {
    const name = `${p.player_first_name} ${p.player_last_name} ${p.position_desired}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (source.droppableId === 'pool' && destination.droppableId === 'roster') {
      const player = pool[source.index]
      setPool(p => p.filter((_, i) => i !== source.index))
      setRoster(r => {
        const next = [...r]
        next.splice(destination.index, 0, player)
        return next
      })
    } else if (source.droppableId === 'roster' && destination.droppableId === 'pool') {
      const player = roster[source.index]
      setRoster(r => r.filter((_, i) => i !== source.index))
      setPool(p => {
        const next = [...p]
        next.splice(destination.index, 0, player)
        return next
      })
    } else if (source.droppableId === 'roster' && destination.droppableId === 'roster') {
      setRoster(r => {
        const next = [...r]
        const [moved] = next.splice(source.index, 1)
        next.splice(destination.index, 0, moved)
        return next
      })
    }
    setSaved(false)
  }, [pool, roster])

  const saveRoster = async () => {
    setSaving(true); setError(''); setMessage('')
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rosterIds: roster.map(p => p.id),
          poolIds: pool.map(p => p.id),
        }),
      })
      // Try to parse JSON for a real error message; fall back if server
      // returned HTML (e.g. 413 Request Entity Too Large).
      let serverMessage = ''
      const raw = await res.text()
      try {
        const parsed = raw ? JSON.parse(raw) : {}
        serverMessage = parsed.error || ''
      } catch {
        serverMessage = `HTTP ${res.status}`
      }
      if (!res.ok) throw new Error(serverMessage || 'Failed to save')
      setSaved(true)
      setMessage('Roster saved successfully!')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save roster'
      setError(`Failed to save roster: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  // Open the preview modal: fetch the actual recipient lists from the server
  // so what PJ sees matches reality (not just what's in client state).
  const openPreview = async () => {
    setError(''); setMessage('')
    setPreviewLoading(true)
    setPreviewOpen(true)
    try {
      const [previewRes, groupsRes] = await Promise.all([
        fetch('/api/admin/team?preview=1'),
        fetch('/api/admin/email-groups'),
      ])
      if (!previewRes.ok) throw new Error('preview failed')
      const data = await previewRes.json()
      const made: PreviewRow[] = data.made || []
      const notMade: PreviewRow[] = data.notMade || []
      setPreviewMade(made)
      setPreviewNotMade(notMade)
      // Default: everyone checked. PJ can uncheck anyone he doesn't want to email.
      setSelectedMade(new Set(made.map(r => r.id)))
      setSelectedNotMade(new Set(notMade.map(r => r.id)))
      if (groupsRes.ok) {
        const gData = await groupsRes.json()
        type GroupResp = { id: string; name: string; contacts?: { id: string }[] }
        const list: GroupSummary[] = ((gData.groups as GroupResp[]) || []).map((g) => ({
          id: g.id,
          name: g.name,
          count: (g.contacts || []).length,
        }))
        setBccGroups(list)
      }
    } catch {
      setError('Could not load preview. Please try again.')
      setPreviewOpen(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  const toggleOne = (id: string, list: 'made' | 'notMade') => {
    if (list === 'made') {
      setSelectedMade(s => {
        const next = new Set(s)
        if (next.has(id)) next.delete(id); else next.add(id)
        return next
      })
    } else {
      setSelectedNotMade(s => {
        const next = new Set(s)
        if (next.has(id)) next.delete(id); else next.add(id)
        return next
      })
    }
  }

  const checkAll = (list: 'made' | 'notMade', all: boolean) => {
    if (list === 'made') {
      setSelectedMade(all ? new Set(previewMade.map(r => r.id)) : new Set())
    } else {
      setSelectedNotMade(all ? new Set(previewNotMade.map(r => r.id)) : new Set())
    }
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setConfirmText('')
    setRecipients('made_only')
    setSelectedMade(new Set())
    setSelectedNotMade(new Set())
    setSelectedGroupIds(new Set())
  }

  const toggleGroup = (id: string) => {
    setSelectedGroupIds(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // What IDs we'd actually send to given current UI selections
  const effectiveIds = (() => {
    if (recipients === 'made_only') return Array.from(selectedMade)
    if (recipients === 'not_made_only') return Array.from(selectedNotMade)
    return [...Array.from(selectedMade), ...Array.from(selectedNotMade)]
  })()

  const buildPayload = (extra: Record<string, unknown> = {}) => ({
    rosterIds: previewMade.map(p => p.id),
    recipients,
    onlyIds: effectiveIds,
    customMadeSubject: customMadeSubject.trim() || undefined,
    customMadeBody: customMadeBody.trim() || undefined,
    customNotMadeSubject: customNotMadeSubject.trim() || undefined,
    customNotMadeBody: customNotMadeBody.trim() || undefined,
    bccGroupIds: Array.from(selectedGroupIds),
    ...extra,
  })

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      setError('Enter an email address for the test.')
      return
    }
    setTestSending(true); setError(''); setMessage('')
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload({ testEmail: testEmail.trim() })),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.error || 'Test send failed')
      if (result.failed > 0) {
        setError(`Test send failed: ${(result.failures?.[0]?.reason) || 'unknown error'}`)
        return
      }
      setMessage(`Test email sent to ${testEmail.trim()}. Check your inbox before firing the full batch.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test send failed.')
    } finally {
      setTestSending(false)
    }
  }

  const sendTeamEmails = async () => {
    setSendingEmails(true); setError(''); setMessage('')
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.error || 'Failed to send emails')
      const sent = result.sent ?? 0
      const failed = result.failed ?? 0
      const failures = (result.failures || []) as { label?: string; reason: string }[]
      let msg = `Sent ${sent} email${sent === 1 ? '' : 's'}.`
      if (failed > 0) {
        const previewNames = failures
          .slice(0, 5)
          .map(f => `${f.label || '(unknown)'}: ${f.reason}`)
          .join('; ')
        msg += ` ${failed} failed${failures.length ? ` — ${previewNames}` : ''}${failures.length > 5 ? `; +${failures.length - 5} more` : ''}.`
        setError(msg)
        return
      }
      setMessage(msg)
      closePreview()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send emails. Please try again.')
    } finally {
      setSendingEmails(false)
    }
  }

  const positionCounts = roster.reduce<Record<string, number>>((acc, p) => {
    acc[p.position_desired] = (acc[p.position_desired] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      {/* Status bar */}
      <div className={`rounded-xl px-5 py-3 mb-6 flex items-center justify-between ${
        roster.length >= 35 && roster.length <= 40 ? 'bg-green-50 border border-green-200' :
        roster.length > 40 ? 'bg-red-50 border border-red-200' :
        'bg-blue-50 border border-blue-100'
      }`}>
        <div>
          <span className="font-bold">Roster: {roster.length} players</span>
          <span className="text-gray-500 text-sm ml-3">Target: 35–40</span>
          {roster.length > 40 && <span className="text-red-600 text-sm ml-2 font-semibold">⚠ Over limit</span>}
          {roster.length >= 35 && roster.length <= 40 && <span className="text-green-600 text-sm ml-2 font-semibold">✓ Good</span>}
        </div>
        <div className="flex gap-3">
          <button
            className="btn-primary py-2 px-5 text-sm"
            onClick={saveRoster}
            disabled={saving}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Roster'}
          </button>
          <button
            className="btn-black py-2 px-5 text-sm"
            onClick={openPreview}
            disabled={sendingEmails || !saved}
            title={!saved ? 'Save roster first' : ''}
          >
            {sendingEmails ? 'Sending…' : 'Send Team Emails…'}
          </button>
        </div>
      </div>

      {(error || message) && (
        <div className={`rounded-lg px-4 py-3 mb-4 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {error || message}
        </div>
      )}

      {/* Preview + confirm modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-2xl font-black">Review before sending</h2>
              <p className="text-sm text-gray-500 mt-1">
                These lists come from the live database, not local state. Verify every name.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {previewLoading ? (
                <p className="text-gray-500">Loading recipients…</p>
              ) : (
                <>
                  {/* Who to email */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Who gets emailed</p>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="recipients"
                          value="made_only"
                          checked={recipients === 'made_only'}
                          onChange={() => setRecipients('made_only')}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-semibold">Only players on the roster</span>{' '}
                          <span className="text-green-700">({selectedMade.size} of {previewMade.length} checked)</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="recipients"
                          value="not_made_only"
                          checked={recipients === 'not_made_only'}
                          onChange={() => setRecipients('not_made_only')}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-semibold">Only players NOT on the roster</span>{' '}
                          <span className="text-amber-700">({selectedNotMade.size} of {previewNotMade.length} checked)</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="recipients"
                          value="both"
                          checked={recipients === 'both'}
                          onChange={() => setRecipients('both')}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-semibold">Both lists</span>{' '}
                          <span className="text-gray-500">({selectedMade.size + selectedNotMade.size} total checked)</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Custom email copy for Made Team (shown when sending Made Team) */}
                  {(recipients === 'made_only' || recipients === 'both') && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-700">Made Team email</p>
                        <p className="text-xs text-gray-500">Leave blank to use default from Settings</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Subject</label>
                        <input
                          className="form-input w-full text-sm"
                          value={customMadeSubject}
                          onChange={e => setCustomMadeSubject(e.target.value)}
                          placeholder="(uses Settings default if blank)"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Body</label>
                        <textarea
                          className="form-input w-full text-sm font-mono"
                          rows={12}
                          value={customMadeBody}
                          onChange={e => setCustomMadeBody(e.target.value)}
                          placeholder="(uses Settings default if blank)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Line breaks are preserved. HTML is not supported in the body.</p>
                      </div>
                    </div>
                  )}

                  {/* Custom email copy for Not Made Team (shown when sending Not Made Team) */}
                  {(recipients === 'not_made_only' || recipients === 'both') && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-700">Not Made Team email</p>
                        <p className="text-xs text-gray-500">Leave blank to use default from Settings</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Subject</label>
                        <input
                          className="form-input w-full text-sm"
                          value={customNotMadeSubject}
                          onChange={e => setCustomNotMadeSubject(e.target.value)}
                          placeholder="(uses Settings default if blank)"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Body</label>
                        <textarea
                          className="form-input w-full text-sm font-mono"
                          rows={10}
                          value={customNotMadeBody}
                          onChange={e => setCustomNotMadeBody(e.target.value)}
                          placeholder="(uses Settings default if blank)"
                        />
                      </div>
                    </div>
                  )}

                  {/* BCC: email groups */}
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-800">BCC email groups (optional)</p>
                      <a href="/admin/email-groups" target="_blank" rel="noopener" className="text-xs text-purple-700 hover:underline">Manage groups ↗</a>
                    </div>
                    <p className="text-xs text-purple-700">Everyone in the selected groups will be BCC'd on every email in this batch.</p>
                    {bccGroups.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No groups yet. Create one on the Email Groups page.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {bccGroups.map(g => {
                          const active = selectedGroupIds.has(g.id)
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => toggleGroup(g.id)}
                              className={`text-xs px-3 py-1.5 rounded-full border ${active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-800 border-purple-300 hover:bg-purple-100'}`}
                            >
                              {active ? '✓ ' : ''}{g.name} ({g.count})
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Test send: fire one copy to an email address for preview */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-800">Send a test first (recommended)</p>
                    <p className="text-xs text-blue-700">We'll send one copy of the rendered email to the address below. Nothing goes to real recipients.</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        className="form-input flex-1 text-sm"
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                      <button
                        type="button"
                        onClick={sendTestEmail}
                        disabled={testSending || !testEmail.trim()}
                        className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-40 whitespace-nowrap"
                      >
                        {testSending ? 'Sending…' : 'Send Test'}
                      </button>
                    </div>
                  </div>

                  {/* The actual names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-green-700">
                          Made Team — {selectedMade.size} / {previewMade.length}
                        </p>
                        <div className="flex gap-2 text-xs">
                          <button type="button" onClick={() => checkAll('made', true)} className="text-green-700 hover:underline">All</button>
                          <span className="text-gray-300">|</span>
                          <button type="button" onClick={() => checkAll('made', false)} className="text-green-700 hover:underline">None</button>
                        </div>
                      </div>
                      <div className="border border-green-200 rounded-lg bg-green-50 max-h-64 overflow-y-auto">
                        {previewMade.length === 0 ? (
                          <p className="text-sm text-gray-500 p-3">No players on the roster yet.</p>
                        ) : (
                          <ul className="divide-y divide-green-200">
                            {previewMade.map(r => (
                              <li key={r.id} className="px-3 py-2 text-sm flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedMade.has(r.id)}
                                  onChange={() => toggleOne(r.id, 'made')}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold">{r.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{r.email}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                          Not Made Team — {selectedNotMade.size} / {previewNotMade.length}
                        </p>
                        <div className="flex gap-2 text-xs">
                          <button type="button" onClick={() => checkAll('notMade', true)} className="text-amber-700 hover:underline">All</button>
                          <span className="text-gray-300">|</span>
                          <button type="button" onClick={() => checkAll('notMade', false)} className="text-amber-700 hover:underline">None</button>
                        </div>
                      </div>
                      <div className="border border-amber-200 rounded-lg bg-amber-50 max-h-64 overflow-y-auto">
                        {previewNotMade.length === 0 ? (
                          <p className="text-sm text-gray-500 p-3">No players marked as not-made-team yet.</p>
                        ) : (
                          <ul className="divide-y divide-amber-200">
                            {previewNotMade.map(r => (
                              <li key={r.id} className="px-3 py-2 text-sm flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedNotMade.has(r.id)}
                                  onChange={() => toggleOne(r.id, 'notMade')}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold">{r.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{r.email}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Typed confirmation */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Type <code className="bg-gray-100 px-1 rounded">SEND</code> to confirm
                    </p>
                    <input
                      className="form-input"
                      value={confirmText}
                      onChange={e => setConfirmText(e.target.value)}
                      placeholder="SEND"
                      autoFocus
                    />
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={closePreview}
                disabled={sendingEmails}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={sendTeamEmails}
                disabled={
                  sendingEmails ||
                  previewLoading ||
                  confirmText.trim().toUpperCase() !== 'SEND' ||
                  effectiveIds.length === 0
                }
                className="bg-black text-white font-bold px-6 py-3 rounded-lg text-sm disabled:opacity-40"
              >
                {sendingEmails ? 'Sending…' : `Send ${effectiveIds.length} email${effectiveIds.length === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pool */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-lg">Player Pool</h2>
                <span className="text-sm text-gray-500">{pool.length} players</span>
              </div>
              <input
                className="form-input text-sm py-2"
                placeholder="Search players…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Droppable droppableId="pool">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 space-y-2 min-h-64 max-h-[calc(100vh-340px)] overflow-y-auto transition-colors ${
                    snapshot.isDraggingOver ? 'bg-gray-50' : ''
                  }`}
                >
                  {filteredPool.map((player, index) => (
                    <PlayerCard key={player.id} player={player} index={index} />
                  ))}
                  {provided.placeholder}
                  {filteredPool.length === 0 && (
                    <p className="text-center text-gray-400 py-12">
                      {search ? 'No players match your search.' : 'All players are on the roster!'}
                    </p>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Roster */}
          <div className="bg-[#0A0A0A] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-lg text-white">
                  Final Roster <span className="text-[#B8962A]">({roster.length})</span>
                </h2>
                <div className="flex gap-1 flex-wrap justify-end">
                  {Object.entries(positionCounts).slice(0, 4).map(([pos, count]) => (
                    <span key={pos} className="text-xs bg-[#B8962A]/20 text-[#B8962A] px-2 py-0.5 rounded">
                      {pos.split(' ').map(w => w[0]).join('')}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Droppable droppableId="roster">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 space-y-2 min-h-64 max-h-[calc(100vh-340px)] overflow-y-auto transition-colors ${
                    snapshot.isDraggingOver ? 'bg-[#1a1a1a]' : ''
                  }`}
                >
                  {roster.map((player, index) => (
                    <PlayerCard key={player.id} player={player} index={index} />
                  ))}
                  {provided.placeholder}
                  {roster.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-gray-600 text-3xl mb-3">🏈</p>
                      <p className="text-gray-500">Drag players here to add them to the roster.</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}
