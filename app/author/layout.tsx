import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthorSession } from '@/lib/author-auth'
import Logo from '@/components/ui/Logo'
import AuthorNav from '@/components/author/AuthorNav'

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthorSession()
  if (!session) redirect('/author/login')

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <aside className="w-56 border-r border-gray-800 flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-3 no-underline" aria-label="Little Quakers home">
            <Logo size="sm" />
            <div>
              <p className="text-[#B8962A] font-black text-xs tracking-widest uppercase">Little Quakers</p>
              <p className="text-gray-500 text-xs">Author Portal</p>
            </div>
          </Link>
        </div>
        <AuthorNav authorName={session.authorName} />
      </aside>
      <main className="flex-1 bg-[#F5F4F0] overflow-auto">{children}</main>
    </div>
  )
}
