import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import EmailGroupsManager from '@/components/admin/EmailGroupsManager'

export const dynamic = 'force-dynamic'

export default async function EmailGroupsPage() {
  const session = await getSession()
  if (!session) redirect('/admin-login')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Email Groups</h1>
        <p className="text-gray-500 mt-1">
          Named distribution lists for team communications. Use them as BCC targets when sending team emails or broadcasts.
        </p>
      </div>
      <EmailGroupsManager />
    </div>
  )
}
