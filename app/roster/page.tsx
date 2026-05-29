export const dynamic = 'force-dynamic'

import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import { supabaseAdmin } from '@/lib/supabase'
import { Registrant } from '@/types'

export const metadata = {
  title: '2026 Roster | Philadelphia Little Quakers',
  description: 'The official 2026 Philadelphia Little Quakers roster.',
}

const POSITION_ORDER = [
  'Quarterback', 'Running Back', 'Wide Receiver', 'Tight End',
  'Offensive Lineman', 'Defensive Lineman', 'Linebacker',
  'Cornerback', 'Safety', 'Kicker', 'Punter', 'Long Snapper',
]

export default async function RosterPage() {
  const { data: players } = await supabaseAdmin
    .from('registrants')
    .select('id, player_first_name, player_last_name, position_desired, grade, jersey_number')
    .eq('status', 'made_team')
    .order('jersey_number', { ascending: true })

  const byPosition: Record<string, Registrant[]> = {}
  if (players) {
    for (const p of players as Registrant[]) {
      if (!byPosition[p.position_desired]) byPosition[p.position_desired] = []
      byPosition[p.position_desired].push(p)
    }
  }

  const hasRoster = players && players.length > 0

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#0A0A0A] text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">Philadelphia Little Quakers</p>
            <h1 className="text-5xl font-black mb-4">2026 Roster</h1>
            <p className="text-gray-400 text-lg">
              {hasRoster
                ? `${players!.length} players selected for the 2026 season.`
                : 'Tryouts are underway. The 2026 roster will be posted here once selections are finalized.'}
            </p>
          </div>
        </section>

        {/* Roster */}
        <section className="py-16 px-4 bg-[#F5F4F0]">
          <div className="max-w-6xl mx-auto">
            {!hasRoster ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <div className="text-6xl mb-4">🏈</div>
                <h2 className="text-2xl font-black mb-2">Roster Coming Soon</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  The coaching staff is evaluating players during tryouts. Check back here once selections are announced.
                </p>
                <a href="/register" className="btn-primary text-base px-8 py-3 inline-block">
                  Register for Tryouts
                </a>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {[
                    { value: players!.length, label: 'Players Selected' },
                    { value: Object.keys(byPosition).length, label: 'Positions Represented' },
                    { value: '2026', label: 'Season' },
                    { value: 'Philadelphia', label: 'Representing' },
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <p className="text-3xl font-black text-[#B8962A]">{value}</p>
                      <p className="text-gray-500 text-sm font-semibold">{label}</p>
                    </div>
                  ))}
                </div>

                {/* By position */}
                <div className="space-y-8">
                  {POSITION_ORDER
                    .filter(pos => byPosition[pos]?.length > 0)
                    .map(position => (
                      <div key={position} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-[#0A0A0A] px-6 py-3">
                          <h2 className="text-white font-black uppercase tracking-wide text-sm">{position}</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {byPosition[position].map(player => (
                            <div key={player.id} className="px-6 py-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {player.jersey_number && (
                                  <span className="w-10 h-10 rounded-full bg-[#B8962A] text-white font-black text-lg flex items-center justify-center shrink-0">
                                    {player.jersey_number}
                                  </span>
                                )}
                                <div>
                                  <p className="font-bold">{player.player_first_name} {player.player_last_name}</p>
                                  <p className="text-gray-400 text-sm">{player.grade} grade</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
