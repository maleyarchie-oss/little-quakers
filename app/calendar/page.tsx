import HeaderServer from '@/components/ui/HeaderServer'
import Footer from '@/components/ui/Footer'
import CalendarView from '@/components/CalendarView'
import TryoutScheduleBlock from '@/components/TryoutScheduleBlock'
import { supabaseAdmin } from '@/lib/supabase'
import { getCalendarEvents } from '@/lib/google'

async function getEvents() {
  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('google_sheets_calendar_id')
    .single()

  if (!settings?.google_sheets_calendar_id) return []

  return getCalendarEvents(settings.google_sheets_calendar_id)
}

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const events = await getEvents()

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderServer />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Team Calendar</h1>
              <p className="text-gray-500 mt-1">All practices, games, and team events. Updates automatically.</p>
            </div>
            <a
              href="/api/ical"
              className="btn-black py-3 px-6 text-sm"
              download="little-quakers.ics"
            >
              📅 Subscribe to Calendar
            </a>
          </div>

          {/* 2026 Tryouts — surfaced at the top, ahead of the broader calendar */}
          <section className="mb-10 bg-[#0A0A0A] rounded-2xl p-6 md:p-8 text-white">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-2">
              First Up
            </p>
            <h2 className="text-2xl md:text-3xl font-black mb-5">2026 Tryouts</h2>
            <TryoutScheduleBlock variant="dark" />
          </section>

          <CalendarView events={events} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
