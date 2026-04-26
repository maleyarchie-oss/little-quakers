export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import RegistrantsTable from '@/components/admin/RegistrantsTable'

export default async function RegistrantsPage() {
  const { data: registrants } = await supabaseAdmin
    .from('registrants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Registrants</h1>
        <p className="text-gray-500 mt-1">{registrants?.length || 0} total registrations</p>
      </div>
      <RegistrantsTable registrants={registrants || []} />
    </div>
  )
}
