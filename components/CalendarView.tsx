'use client'

import { useState } from 'react'

interface CalendarEvent {
  id: string
  type: 'Practice' | 'Game' | 'Other' | 'Banquet'
  title: string
  date: string
  time: string
  location: string
  description?: string
}

const TYPE_COLORS = {
  Game: 'bg-red-100 text-red-700 border-red-200',
  Practice: 'bg-blue-100 text-blue-700 border-blue-200',
  Banquet: 'bg-[#B8962A]/15 text-[#8B7020] border-[#B8962A]/30',
  Other: 'bg-gray-100 text-gray-700 border-gray-200',
}

const TYPE_DOT = {
  Game: 'bg-red-500',
  Practice: 'bg-blue-500',
  Banquet: 'bg-[#B8962A]',
  Other: 'bg-gray-400',
}

export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [filter, setFilter] = useState<string>('all')

  const sorted = [...events]
    .filter(e => filter === 'all' || e.type === filter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const upcoming = sorted.filter(e => new Date(e.date) >= new Date())
  const past = sorted.filter(e => new Date(e.date) < new Date())

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch { return dateStr }
  }

  return (
    <div>
      {/* Legend + Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'Game', 'Practice', 'Banquet', 'Other'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              filter === type
                ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {type !== 'all' && (
              <span className={`w-2.5 h-2.5 rounded-full ${TYPE_DOT[type as keyof typeof TYPE_DOT]}`} />
            )}
            {type === 'all' ? 'All Events' : type}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-4xl mb-4">📅</p>
          <h3 className="font-black text-xl mb-2">No Events Yet</h3>
          <p className="text-gray-400">Check back soon for the season schedule.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-black text-lg text-gray-800 mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map(event => (
                  <EventCard key={event.id} event={event} formatDate={formatDate} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-black text-lg text-gray-400 mb-3">Past Events</h2>
              <div className="space-y-3 opacity-60">
                {past.map(event => (
                  <EventCard key={event.id} event={event} formatDate={formatDate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EventCard({ event, formatDate }: { event: CalendarEvent; formatDate: (d: string) => string }) {
  const colors = TYPE_COLORS[event.type] || TYPE_COLORS.Other
  const dot = TYPE_DOT[event.type] || TYPE_DOT.Other

  return (
    <div className={`bg-white rounded-xl border-2 px-6 py-5 flex items-start gap-5 ${colors.split(' ').find(c => c.startsWith('border')) || 'border-gray-200'}`}>
      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors}`}>
            {event.type}
          </span>
          <h3 className="font-black text-base">{event.title}</h3>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
          <span>📅 {formatDate(event.date)}</span>
          {event.time && <span>🕐 {event.time}</span>}
          {event.location && <span>📍 {event.location}</span>}
        </div>
        {event.description && (
          <p className="text-gray-500 text-sm mt-2">{event.description}</p>
        )}
      </div>
    </div>
  )
}
