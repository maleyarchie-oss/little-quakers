export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

async function getStats() {
  const [
    { count: total },
    { count: made },
    { count: notMade },
  ] = await Promise.all([
    supabaseAdmin.from('registrants').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('registrants').select('*', { count: 'exact', head: true }).eq('status', 'made_team'),
    supabaseAdmin.from('registrants').select('*', { count: 'exact', head: true }).eq('status', 'not_made_team'),
  ])
  return { total: total || 0, made: made || 0, notMade: notMade || 0, pending: (total || 0) - (made || 0) - (notMade || 0) }
}

async function getSettings() {
  const { data } = await supabaseAdmin.from('settings').select('*').single()
  return data
}

async function getRecentRegistrants() {
  const { data } = await supabaseAdmin
    .from('registrants')
    .select('id, player_first_name, player_last_name, position_desired, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export default async function DashboardPage() {
  const [stats, settings, recent] = await Promise.all([
    getStats(),
    getSettings(),
    getRecentRegistrants(),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Philadelphia Little Quakers – Season Overview</p>
      </div>

      {/* Registration Status Banner */}
      <div className={`rounded-xl px-6 py-4 mb-8 flex items-center justify-between ${
        settings?.registration_open ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'
      }`}>
        <div>
          <p className="font-bold text-sm">
            Registration is currently{' '}
            <span className={settings?.registration_open ? 'text-green-600' : 'text-gray-500'}>
              {settings?.registration_open ? 'OPEN' : 'CLOSED'}
            </span>
          </p>
          {settings?.tryout_date && (
            <p className="text-gray-500 text-sm mt-0.5">Tryout: {settings.tryout_date} at {settings.tryout_time} · {settings.tryout_location}</p>
          )}
        </div>
        <Link href="/admin/settings" className="text-sm font-semibold text-[#B8962A] hover:underline">
          Manage Settings →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Registrants', value: stats.total, color: 'text-gray-900' },
          { label: 'Pending Review', value: stats.pending, color: 'text-blue-600' },
          { label: 'Made the Team', value: stats.made, color: 'text-green-600' },
          { label: 'Not Selected', value: stats.notMade, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm">
            <p className={`text-4xl font-black ${color}`}>{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <Link href="/admin/registrants" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-black text-lg group-hover:text-[#B8962A] transition-colors">View Registrants</h3>
          <p className="text-gray-500 text-sm mt-1">Browse, search, and download all {stats.total} registrants.</p>
        </Link>
        <Link href="/admin/team-selection" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-3">🏈</div>
          <h3 className="font-black text-lg group-hover:text-[#B8962A] transition-colors">Select the Team</h3>
          <p className="text-gray-500 text-sm mt-1">Drag and drop players to build the final roster.</p>
        </Link>
        <Link href="/admin/broadcast" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="text-3xl mb-3">📢</div>
          <h3 className="font-black text-lg group-hover:text-[#B8962A] transition-colors">Broadcast Email</h3>
          <p className="text-gray-500 text-sm mt-1">Send announcements to all registrants or the roster.</p>
        </Link>
      </div>

      {/* Recent Registrants */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-lg">Recent Registrations</h2>
          <Link href="/admin/registrants" className="text-sm text-[#B8962A] font-semibold hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.map(r => (
            <div key={r.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.player_first_name} {r.player_last_name}</p>
                <p className="text-gray-400 text-sm">{r.position_desired}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                r.status === 'made_team' ? 'bg-green-100 text-green-700' :
                r.status === 'not_made_team' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {r.status === 'made_team' ? 'Made Team' : r.status === 'not_made_team' ? 'Not Selected' : 'Registered'}
              </span>
            </div>
          ))}
          {recent.length === 0 && (
            <div className="px-6 py-10 text-center text-gray-400">No registrations yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
