'use client'

import Logo from './Logo'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export interface HeaderProps {
  donateUrl?: string
  registrationOpen?: boolean
}

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/roster', label: 'Roster' },
  { href: '/calendar', label: 'Schedule' },
  { href: '/events', label: 'Events' },
  { href: '/blog', label: 'News' },
  { href: '/contact', label: 'Contact' },
]

const TEAM_STORE_URL = 'https://store.travelchamps.com/philadelphia_little_quakers/shop/home'

export default function Header({ donateUrl, registrationOpen = true }: HeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-[#0A0A0A] text-white sticky top-0 z-40 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline shrink-0" onClick={() => setOpen(false)}>
          <Logo size="sm" />
          <div>
            <p className="text-[#B8962A] font-black text-sm leading-tight tracking-widest uppercase">Philadelphia</p>
            <p className="text-white font-black text-sm leading-tight tracking-widest uppercase">Little Quakers</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors no-underline ${
                pathname === href || pathname.startsWith(href + '/')
                  ? 'text-[#B8962A]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href={TEAM_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition-colors no-underline"
          >
            Team Store
          </a>
          {donateUrl && (
            <a
              href={donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 border border-[#B8962A] text-[#B8962A] hover:bg-[#B8962A] hover:text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors no-underline"
            >
              Donate
            </a>
          )}
          {registrationOpen ? (
            <Link
              href="/register"
              className="ml-2 bg-[#B8962A] hover:bg-[#8B7020] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors no-underline"
            >
              Register
            </Link>
          ) : (
            <Link
              href="/events/golf-outing"
              className="ml-2 bg-[#B8962A] hover:bg-[#8B7020] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors no-underline"
            >
              Golf Outing
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0A] px-4 pb-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block py-3 text-base font-semibold border-b border-white/5 no-underline ${
                pathname === href ? 'text-[#B8962A]' : 'text-gray-300'
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href={TEAM_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block py-3 text-base font-semibold border-b border-white/5 text-gray-300 no-underline"
          >
            Team Store
          </a>
          {registrationOpen ? (
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="mt-4 block text-center bg-[#B8962A] text-white font-bold py-3 px-6 rounded-lg no-underline"
            >
              Register for Tryouts
            </Link>
          ) : (
            <Link
              href="/events/golf-outing"
              onClick={() => setOpen(false)}
              className="mt-4 block text-center bg-[#B8962A] text-white font-bold py-3 px-6 rounded-lg no-underline"
            >
              Golf Outing
            </Link>
          )}
          {donateUrl && (
            <a
              href={donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-3 block text-center border border-[#B8962A] text-[#B8962A] font-bold py-3 px-6 rounded-lg no-underline"
            >
              Donate
            </a>
          )}
        </div>
      )}
    </header>
  )
}
