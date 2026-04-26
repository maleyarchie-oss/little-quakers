'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'

const NAV = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/registrants', icon: '📋', label: 'Registrants' },
  { href: '/admin/team-selection', icon: '🏈', label: 'Team Selection' },
  { href: '/admin/roster', icon: '📃', label: 'Final Roster' },
  { href: '/admin/broadcast', icon: '📢', label: 'Broadcast Email' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
  { href: '/admin/accounts', icon: '👤', label: 'Admin Accounts' },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin-login')
  }

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-gray-800 flex flex-col min-h-screen shrink-0">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <p className="text-[#B8962A] font-black text-xs tracking-widest uppercase">Little Quakers</p>
            <p className="text-gray-500 text-xs">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`admin-sidebar-link ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-gray-400 text-xs mb-1">Signed in as</p>
        <p className="text-white font-semibold text-sm mb-3">{adminName}</p>
        <button
          onClick={logout}
          className="w-full text-left text-gray-500 hover:text-red-400 text-xs font-medium transition-colors"
        >
          Sign Out →
        </button>
      </div>
    </aside>
  )
}
