export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import RosterManager from '@/components/admin/RosterManager'

export default async function RosterPage() {
  const { data: roster } = await supabaseAdmin
    .from('registrants')
    .select('*')
    .eq('status', 'made_team')
    .order('player_last_name', { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Final Roster</h1>
        <p className="text-gray-500 mt-1">Assign jersey numbers and export to Google Sheets.</p>
      </div>
      <RosterManager roster={roster || []} />
    </div>
  )
}
