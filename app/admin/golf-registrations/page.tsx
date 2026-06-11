export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import GolfRegistrationsTable from '@/components/admin/GolfRegistrationsTable'
import type { GolfRegistration } from '@/types'

export default async function GolfRegistrationsPage() {
  const { data } = await supabaseAdmin
    .from('golf_registrations')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (data || []) as GolfRegistration[]

  // Stats
  const totalRegistered = rows.length
  const paid = rows.filter(r => r.status === 'paid')
  const pending = rows.filter(r => r.status === 'pending')
  const cancelledRefunded = rows.filter(r => r.status === 'cancelled' || r.status === 'refunded')

  const dollarsCommitted = rows
    .filter(r => r.status !== 'cancelled' && r.status !== 'refunded')
    .reduce((sum, r) => sum + (r.amount || 0), 0)

  const dollarsCollected = paid.reduce((sum, r) => sum + (r.amount || 0), 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Golf Outing Registrations</h1>
        <p className="text-gray-500 mt-1">
          {totalRegistered} total registration{totalRegistered === 1 ? '' : 's'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
            Registered
          </p>
          <p className="text-3xl font-black text-gray-900">{totalRegistered}</p>
          <p className="text-gray-400 text-xs mt-1">
            {paid.length} paid · {pending.length} pending
            {cancelledRefunded.length > 0 ? ` · ${cancelledRefunded.length} cancelled` : ''}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
            Paid
          </p>
          <p className="text-3xl font-black text-green-600">{paid.length}</p>
          <p className="text-gray-400 text-xs mt-1">Confirmed payments</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
            Committed
          </p>
          <p className="text-3xl font-black text-gray-900">
            ${dollarsCommitted.toLocaleString()}
          </p>
          <p className="text-gray-400 text-xs mt-1">All active registrations</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
            Collected
          </p>
          <p className="text-3xl font-black text-green-600">
            ${dollarsCollected.toLocaleString()}
          </p>
          <p className="text-gray-400 text-xs mt-1">Marked paid</p>
        </div>
      </div>

      <GolfRegistrationsTable rows={rows} />
    </div>
  )
}
