import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import StatusLogViewer from '@/components/admin/StatusLogViewer'

export const dynamic = 'force-dynamic'

export default async function StatusLogPage() {
  const session = await getSession()
  if (!session) redirect('/admin-login')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Status Change Log</h1>
        <p className="text-gray-500 mt-1">
          Who changed what, when. Every status change (made the team, not made the team, new registration) is recorded here.
        </p>
      </div>
      <StatusLogViewer />
    </div>
  )
}
