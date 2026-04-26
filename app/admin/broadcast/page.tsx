export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import BroadcastForm from '@/components/admin/BroadcastForm'

export default async function BroadcastPage() {
  const { data: registrants } = await supabaseAdmin
    .from('registrants')
    .select('id, player_first_name, player_last_name, email, status')
    .order('player_last_name')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Broadcast Email</h1>
        <p className="text-gray-500 mt-1">Send an announcement to all registrants, roster players, or a custom group.</p>
      </div>
      <BroadcastForm recipients={registrants || []} />
    </div>
  )
}
