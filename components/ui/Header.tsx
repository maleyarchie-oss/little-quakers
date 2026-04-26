import Logo from './Logo'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-[#0A0A0A] text-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <Logo size="sm" />
          <div>
            <p className="text-[#B8962A] font-black text-lg leading-tight tracking-wide">PHILADELPHIA</p>
            <p className="text-white font-black text-lg leading-tight tracking-widest">LITTLE QUAKERS</p>
          </div>
        </Link>
        <nav className="flex gap-6">
          <Link href="/register" className="text-gray-300 hover:text-[#B8962A] font-semibold transition-colors text-sm no-underline">
            Register
          </Link>
          <Link href="/calendar" className="text-gray-300 hover:text-[#B8962A] font-semibold transition-colors text-sm no-underline">
            Calendar
          </Link>
        </nav>
      </div>
    </header>
  )
}
