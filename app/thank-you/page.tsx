export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import Footer from '@/components/ui/Footer'
import { supabaseAdmin } from '@/lib/supabase'

async function getTryoutInfo() {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('tryout_date, tryout_time, tryout_location')
    .single()
  return data
}

export default async function ThankYouPage() {
  const tryout = await getTryoutInfo()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-[#0A0A0A] py-5 px-4">
        <div className="max-w-2xl mx-auto flex justify-center">
          <Logo size="md" />
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="card max-w-xl w-full text-center">
          <div className="text-6xl mb-5">🏈</div>
          <h1 className="text-3xl font-black mb-3 text-[#0A0A0A]">Registration Complete!</h1>
          <p className="text-[#B8962A] font-bold text-lg mb-2">Welcome to the Little Quakers family!</p>
          <p className="text-gray-600 mb-8 text-base leading-relaxed">
            Thank you for registering. A confirmation email has been sent to your inbox with all the details. We will be in touch!
          </p>

          {tryout && (
            <div className="bg-[#0A0A0A] rounded-xl p-6 mb-8 text-left">
              <p className="text-[#B8962A] font-black text-sm tracking-widest uppercase mb-4">Tryout Information</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Date</p>
                    <p className="text-white font-bold">{tryout.tryout_date || 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🕐</span>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Time</p>
                    <p className="text-white font-bold">{tryout.tryout_time || 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Location</p>
                    <p className="text-white font-bold">{tryout.tryout_location || 'TBD'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#B8962A]/10 border border-[#B8962A]/30 rounded-xl p-4 mb-8">
            <p className="text-[#8B7020] font-semibold text-sm">
              📧 Reminder emails will be sent 2 weeks, 1 week, and 1 day before tryouts.
            </p>
          </div>

          <Link href="/calendar" className="btn-black w-full block">View Team Calendar</Link>
          <div className="mt-4">
            <Link href="/" className="text-gray-400 text-sm underline">Return to Home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
