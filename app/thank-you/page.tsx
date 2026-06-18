export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Logo from '@/components/ui/Logo'

import Footer from '@/components/ui/Footer'
import TryoutScheduleBlock from '@/components/TryoutScheduleBlock'
import TryoutLocationMap from '@/components/TryoutLocationMap'

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

          {/* Headline */}
          <div className="card text-center mb-8">
            <div className="text-6xl mb-5">🏈</div>
            <h1 className="text-3xl font-black mb-3 text-[#0A0A0A]">Registration Complete!</h1>
            <p className="text-[#B8962A] font-bold text-lg mb-2">
              We look forward to meeting you!
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              Thank you for registering. A confirmation email is on its way to your inbox.
              See the tryout details below. We&apos;ll see you on the field.
            </p>
          </div>

          {/* Tryout schedule */}
          <div className="card mb-8">
            <p className="text-[#B8962A] font-black text-sm tracking-widest uppercase mb-4">
              2026 Tryouts
            </p>
            <TryoutScheduleBlock variant="light" />
          </div>

          {/* Map */}
          <div className="mb-8">
            <p className="text-[#B8962A] font-black text-sm tracking-widest uppercase mb-3">
              Where to find us
            </p>
            <TryoutLocationMap />
          </div>

          {/* Reminder */}
          <div className="bg-[#B8962A]/10 border border-[#B8962A]/30 rounded-xl p-4 mb-8">
            <p className="text-[#8B7020] font-semibold text-sm">
              📧 Reminder emails will be sent 2 weeks, 1 week, and 1 day before tryouts.
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
