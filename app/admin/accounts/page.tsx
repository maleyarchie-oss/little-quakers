export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import AccountsManager from '@/components/admin/AccountsManager'

export default async function AccountsPage() {
  const { data: accounts } = await supabaseAdmin
    .from('admin_users')
    .select('id, name, username, email, created_at')
    .order('created_at')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Admin Accounts</h1>
        <p className="text-gray-500 mt-1">Manage who has access to this admin portal. Maximum 3 accounts.</p>
      </div>
      <AccountsManager accounts={accounts || []} />
    </div>
  )
}
