export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const { data: settings } = await supabaseAdmin.from('settings').select('*').single()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="text-gray-500 mt-1">Manage tryout details, registration, email templates, and more.</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
