export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import TeamSelector from '@/components/admin/TeamSelector'

export default async function TeamSelectionPage() {
  const { data: registrants } = await supabaseAdmin
    .from('registrants')
    .select('id, player_first_name, player_last_name, position_desired, height, weight, grade, current_school, status')
    .order('player_last_name', { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Team Selection</h1>
        <p className="text-gray-500 mt-1">
          Drag players from the pool on the left to the roster on the right. Select 35–40 players.
        </p>
      </div>
      <TeamSelector registrants={registrants || []} />
    </div>
  )
}
