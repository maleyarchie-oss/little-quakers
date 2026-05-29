'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthorNav({ authorName }: { authorName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/author/logout', { method: 'POST' })
    router.push('/author/login')
  }

  const links = [
    { href: '/author', label: '📝 My Posts', exact: true },
    { href: '/author/new', label: '✏️ New Post', exact: false },
  ]

  return (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`admin-sidebar-link ${active ? 'active' : ''}`}
            >
              <span className="text-sm">{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-gray-400 text-xs mb-1">Signed in as</p>
        <p className="text-white font-semibold text-sm mb-3">{authorName}</p>
        <button
          onClick={logout}
          className="text-gray-500 hover:text-red-400 text-xs font-medium transition-colors"
        >
          Sign Out →
        </button>
      </div>
    </>
  )
}
