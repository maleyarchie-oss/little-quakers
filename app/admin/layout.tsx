import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/admin-login')

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <AdminSidebar adminName={session.adminName} />
      <main className="flex-1 bg-[#F5F4F0] overflow-auto">
        {children}
      </main>
    </div>
  )
}
