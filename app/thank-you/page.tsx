export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Footer from '@/components/ui/Footer'

export default function ThankYouPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-[#0A0A0A] py-5 px-4">
        <div className="max-w-2xl mx-auto flex justify-center">
          <Link href="/" aria-label="Little Quakers home">
            <Logo size="md" />
          </Link>
        </div>
      </div>

      <main className="flex-1 px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center mb-8">
            <div className="text-6xl mb-5">🏈</div>
            <h1 className="text-3xl font-black mb-3 text-[#0A0A0A]">Thank you.</h1>
            <p className="text-[#B8962A] font-bold text-lg mb-2">We&apos;ll be in touch.</p>
            <p className="text-gray-600 text-base leading-relaxed">
              A confirmation email is on its way to your inbox with next steps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/calendar" className="btn-black w-full block text-center">
              View Team Calendar
            </Link>
            <Link
              href="/"
              className="w-full block text-center py-3 px-5 rounded-lg border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
