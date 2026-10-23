export const dynamic = 'force-dynamic'

import HeaderServer from '@/components/ui/HeaderServer'
import Footer from '@/components/ui/Footer'
import GolfOutingRegistration from '@/components/events/GolfOutingRegistration'
import { supabaseAdmin } from '@/lib/supabase'

export const metadata = {
  title: 'Golf Outing | Philadelphia Little Quakers',
  description:
    'The Philadelphia Little Quakers Golf Outing at Bluestone Country Club, Monday October 19, 2026. 11am shotgun start, dinner and awards at 4pm.',
}

const SCHEDULE = [
  { time: '10:00 AM', label: 'Breakfast' },
  { time: '11:00 AM', label: 'Shotgun Start' },
  { time: '4:00 PM', label: 'Dinner & Awards' },
]

const INCLUDED = [
  'Green fees',
  'Breakfast',
  'Dinner',
  'Drinks',
  'Awards',
  'Giveaways',
]

export default async function GolfOutingPage() {
  // Admin can close registration between outings. Default: open.
  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('golf_registration_open')
    .single()
  const registrationOpen = settings?.golf_registration_open !== false

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderServer />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-[#0A0A0A] text-white py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1f4d2a] via-[#0e2e18] to-[#0A0A0A]" />
          <div className="relative max-w-6xl mx-auto text-center">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">
              Annual Tradition
            </p>
            <h1 className="text-5xl md:text-7xl font-black mb-5 leading-[0.95]">
              Little Quakers<br />
              <span className="text-[#B8962A]">Golf Outing</span>
            </h1>
            <p className="text-gray-300 text-xl md:text-2xl mb-3 font-light">
              Monday, October 19, 2026
            </p>
            <p className="text-gray-400 text-lg">
              Bluestone Country Club · Blue Bell, Pennsylvania
            </p>
            <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-3">
              <a
                href="#register"
                className="inline-block bg-[#B8962A] hover:bg-[#8B7020] text-white font-bold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                Register
              </a>
              <a
                href="#sponsorships"
                className="inline-block border-2 border-[#B8962A] text-[#B8962A] hover:bg-[#B8962A] hover:text-white font-bold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                Sponsorships
              </a>
            </div>
          </div>
        </section>

        {/* Day-of schedule */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3 text-center">
              Day-Of
            </p>
            <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
              The Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SCHEDULE.map(({ time, label }) => (
                <div
                  key={time}
                  className="border border-gray-100 rounded-xl p-6 text-center bg-[#F5F4F0]"
                >
                  <p className="text-[#B8962A] font-bold text-2xl md:text-3xl mb-1">
                    {time}
                  </p>
                  <p className="text-gray-800 font-semibold uppercase tracking-wider text-sm">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's included */}
        <section className="bg-[#F5F4F0] py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3 text-center">
              For Every Golfer
            </p>
            <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
              What&apos;s Included
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INCLUDED.map(item => (
                <div
                  key={item}
                  className="bg-white border border-gray-100 rounded-xl px-6 py-5 text-gray-800 font-semibold text-center"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sponsorship tiers */}
        <section id="sponsorships" className="bg-white py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3 text-center">
              Partner With Us
            </p>
            <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
              Sponsorship Levels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Levy Platinum — featured */}
              <div className="bg-[#0A0A0A] text-white rounded-2xl p-8 border-2 border-[#B8962A] md:scale-[1.02] md:shadow-xl flex flex-col">
                <p className="text-[#B8962A] font-bold uppercase tracking-widest text-xs mb-2">
                  Top Tier
                </p>
                <h3 className="text-2xl font-black mb-1">Levy Platinum</h3>
                <p className="text-4xl font-black text-[#B8962A] mb-4">$5,000</p>
                <ul className="text-gray-300 space-y-2 mb-6 flex-1">
                  <li>· Premier sponsor recognition</li>
                  <li>· Full foursome included</li>
                  <li>· Hole signage</li>
                  <li>· Dinner &amp; awards recognition</li>
                </ul>
                <a
                  href="#register"
                  data-tier="levy_platinum"
                  className="block text-center bg-[#B8962A] hover:bg-[#8B7020] text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  Become a Platinum Sponsor
                </a>
              </div>

              {/* LQ Legends */}
              <div className="bg-[#F5F4F0] rounded-2xl p-8 border border-gray-200 flex flex-col">
                <p className="text-[#B8962A] font-bold uppercase tracking-widest text-xs mb-2">
                  Second Tier
                </p>
                <h3 className="text-2xl font-black mb-1 text-gray-900">LQ Legends</h3>
                <p className="text-4xl font-black text-[#0A0A0A] mb-4">$2,500</p>
                <ul className="text-gray-700 space-y-2 mb-6 flex-1">
                  <li>· Prominent sponsor recognition</li>
                  <li>· Full foursome included</li>
                  <li>· Hole signage</li>
                  <li>· Dinner &amp; awards recognition</li>
                </ul>
                <a
                  href="#register"
                  data-tier="lq_legends"
                  className="block text-center border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  Become an LQ Legend
                </a>
              </div>

              {/* Hole Sponsor */}
              <div className="bg-[#F5F4F0] rounded-2xl p-8 border border-gray-200 flex flex-col">
                <p className="text-[#B8962A] font-bold uppercase tracking-widest text-xs mb-2">
                  Sign-Only
                </p>
                <h3 className="text-2xl font-black mb-1 text-gray-900">Hole Sponsor</h3>
                <p className="text-4xl font-black text-[#0A0A0A] mb-4">$500</p>
                <ul className="text-gray-700 space-y-2 mb-6 flex-1">
                  <li>· Signage at one course hole</li>
                  <li>· Recognition in event program</li>
                  <li>· Does not include golf participation</li>
                </ul>
                <a
                  href="#register"
                  data-tier="hole_sponsor"
                  className="block text-center border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  Sponsor a Hole
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* Registration form */}
        <section id="register" className="bg-[#F5F4F0] py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3 text-center">
              Reserve Your Spot
            </p>
            <h2 className="text-3xl md:text-4xl font-black mb-3 text-center">
              Register
            </h2>
            {registrationOpen ? (
              <>
                <p className="text-gray-600 text-center mb-10 max-w-xl mx-auto">
                  Choose a tier, fill out your details, and we&apos;ll send you over
                  to Stripe to complete your payment.
                </p>
                <GolfOutingRegistration />
              </>
            ) : (
              <>
                <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl border border-gray-200 shadow-sm px-6 md:px-10 py-12">
                  <p className="text-5xl mb-4">⛳</p>
                  <h3 className="text-2xl md:text-3xl font-black mb-3">
                    Registration Is Closed
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
                    The 2026 Little Quakers Golf Outing is a wrap. Thank you to
                    everyone who played, sponsored, or supported the day. Watch
                    this space next summer for details on the 2027 outing.
                  </p>
                  <p className="text-gray-500 text-sm mt-6">
                    Questions? Email{' '}
                    <a href="mailto:info@littlequakers.us" className="text-[#B8962A] font-semibold hover:underline">
                      info@littlequakers.us
                    </a>
                  </p>
                </div>

                {/* 2026 Recap Gallery */}
                <div className="max-w-6xl mx-auto mt-20">
                  <div className="text-center mb-10">
                    <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">
                      October 19, 2026 · Bluestone Country Club
                    </p>
                    <h3 className="text-3xl md:text-4xl font-black mb-3">
                      Scenes from the 2026 Outing
                    </h3>
                    <p className="text-gray-600 max-w-xl mx-auto">
                      Perfect weather, a packed field, a champion crowned.
                      Here&apos;s a look at the day.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Row 1: hero image, spans 2 cols on large */}
                    <div className="lg:col-span-2 lg:row-span-2 relative aspect-[4/3] lg:aspect-auto overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src="/golf-2026/foursome-tee.jpg"
                        alt="A foursome on the tee at Bluestone Country Club"
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src="/golf-2026/women-group.jpg"
                        alt="Little Quakers crew on the course"
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src="/golf-2026/champions-trophy.jpg"
                        alt="The 2026 winning foursome with the Little Quakers Cup"
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src="/golf-2026/registration-table.jpg"
                        alt="Players checking in at the registration table"
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src="/golf-2026/sunset-cigars.jpg"
                        alt="End of the day on the Bluestone patio"
                        className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  <p className="text-center text-gray-500 text-sm mt-8 italic">
                    Thanks to every golfer, sponsor, and volunteer who made the 2026 outing one for the books.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
