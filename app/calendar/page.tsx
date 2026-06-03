import HeaderServer from '@/components/ui/HeaderServer'
import Footer from '@/components/ui/Footer'
import CalendarView from '@/components/CalendarView'
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
          <CalendarView events={events} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
