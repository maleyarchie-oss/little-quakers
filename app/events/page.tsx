import Link from 'next/link'
import Image from 'next/image'
import HeaderServer from '@/components/ui/HeaderServer'
import Footer from '@/components/ui/Footer'

export const metadata = {
  title: 'Events | Philadelphia Little Quakers',
  description:
    'Little Quakers events: the annual Golf Outing at Bluestone Country Club and the season-end Banquet.',
}

export default function EventsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderServer />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-[#0A0A0A] text-white py-20 px-4 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/hero.jpg"
              alt="Little Quakers"
              fill
              className="object-cover object-center opacity-25"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-[#0A0A0A]" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">
              The Calendar Beyond the Field
            </p>
            <h1 className="text-5xl md:text-6xl font-black mb-5 leading-tight">
              Little Quakers Events
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              The events that bring our families, alumni, and community together
              outside of game days.
            </p>
          </div>
        </section>

        {/* Headline event: Golf Outing */}
        <section className="py-20 px-4 bg-[#F5F4F0]">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden grid md:grid-cols-2">
              {/* Visual side */}
              <div className="relative bg-[#0A0A0A] min-h-[280px] md:min-h-[420px]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1f4d2a] via-[#0e2e18] to-[#0A0A0A]" />
                <div className="relative h-full flex flex-col justify-between p-8 md:p-10 text-white">
                  <p className="text-[#B8962A] font-bold uppercase tracking-widest text-xs mb-3">
                    Annual Tradition
                  </p>
                  <div>
                    <p className="text-white/70 text-sm font-semibold uppercase tracking-wide">
                      Monday
                    </p>
                    <p className="text-5xl md:text-6xl font-black leading-none mb-2">
                      Oct 19
                    </p>
                    <p className="text-white/70">2026</p>
                  </div>
                  <p className="text-white font-semibold text-lg mt-6">
                    Bluestone Country Club
                  </p>
                  <p className="text-white/70 text-sm">Blue Bell, Pennsylvania</p>
                </div>
              </div>

              {/* Content side */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-2">
                  Event 01
                </p>
                <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                  The Little Quakers<br />Golf Outing
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Our annual golf outing brings together alumni, families,
                  coaches, and corporate partners for a day on one of the
                  region&apos;s premier courses. It is one of the largest
                  fundraising events of our year and a core reason the program
                  remains free for every family.
                </p>
                <div className="border-t border-gray-100 pt-5 mb-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">
                      Date
                    </p>
                    <p className="text-gray-800 font-semibold">October 19, 2026</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">
                      Venue
                    </p>
                    <p className="text-gray-800 font-semibold">
                      Bluestone Country Club
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">
                      Location
                    </p>
                    <p className="text-gray-800 font-semibold">Blue Bell, PA</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">
                      Format
                    </p>
                    <p className="text-gray-800 font-semibold">Coming soon</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <span className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-500 font-bold px-6 py-3 rounded-lg text-sm cursor-not-allowed">
                    Registration opening soon
                  </span>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center text-[#B8962A] hover:text-[#8B7020] font-bold text-sm px-6 py-3 rounded-lg border-2 border-[#B8962A] hover:border-[#8B7020] transition-colors"
                  >
                    Sponsor Inquiry
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary event: Banquet */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">
              Also on the Calendar
            </p>
            <div className="bg-[#0A0A0A] rounded-2xl p-8 md:p-12 text-white grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <p className="text-[#B8962A] font-bold uppercase tracking-widest text-xs mb-2">
                  Event 02
                </p>
                <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
                  The Season Banquet
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Our season-end banquet brings the entire Little Quakers family
                  together one last time. Guest speakers, the season highlight
                  video, and a photo yearbook for every family. Details for the
                  2026 season banquet will be shared here.
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[#B8962A] font-bold uppercase tracking-widest text-xs mb-1">
                  Spring
                </p>
                <p className="text-4xl md:text-5xl font-black mb-1">March</p>
                <p className="text-gray-400">2027</p>
                <p className="text-gray-500 text-xs mt-3">Details coming soon</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0A0A0A] py-16 px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-3">
            Interested in supporting an event?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Sponsorship opportunities are available for both the Golf Outing
            and the Banquet. We&apos;d love to talk through what might fit your
            organization.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#B8962A] hover:bg-[#8B7020] text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Get in Touch
          </Link>
        </section>

      </main>
      <Footer />
    </div>
  )
}
