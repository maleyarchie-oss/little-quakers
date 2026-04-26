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
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
      setMessage('Roster saved successfully!')
    } catch {
      setError('Failed to save roster. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const sendTeamEmails = async () => {
    if (!confirm('This will send "Made the Team" emails to all players on the roster and "Thank you for trying out" emails to all others. Continue?')) return
    setSendingEmails(true); setError(''); setMessage('')
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rosterIds: roster.map(p => p.id) }),
      })
      if (!res.ok) throw new Error('Failed to send emails')
      setMessage('Emails sent to all registrants!')
    } catch {
      setError('Failed to send emails. Please try again.')
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
            onClick={sendTeamEmails}
            disabled={sendingEmails || !saved}
            title={!saved ? 'Save roster first' : ''}
          >
            {sendingEmails ? 'Sending…' : 'Send Team Emails'}
          </button>
        </div>
      </div>

      {(error || message) && (
        <div className={`rounded-lg px-4 py-3 mb-4 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {error || message}
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
