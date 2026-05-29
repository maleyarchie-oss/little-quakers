import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo size="sm" />
              <div>
                <p className="text-[#B8962A] font-black text-sm tracking-widest uppercase leading-tight">Philadelphia</p>
                <p className="text-white font-black text-sm tracking-widest uppercase leading-tight">Little Quakers</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Philadelphia's most storied youth all-star football program. Developing champions on and off the field since 1953.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/roster', label: '2026 Roster' },
                { href: '/calendar', label: 'Schedule' },
                { href: '/blog', label: 'News' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#B8962A] transition-colors no-underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Registration */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Players</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-[#B8962A] transition-colors no-underline">
                  Register for Tryouts
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-[#B8962A] transition-colors no-underline">
                  Tryout Schedule
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#B8962A] transition-colors no-underline">
                  Contact Us
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/register" className="bg-[#B8962A] hover:bg-[#8B7020] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors no-underline inline-block">
                Register Now →
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Philadelphia Little Quakers · Est. 1953 · littlequakers.us</p>
          <p>
            <a href="mailto:info@littlequakers.us" className="hover:text-[#B8962A] transition-colors no-underline">
              info@littlequakers.us
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
