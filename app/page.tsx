import Link from 'next/link'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import Logo from '@/components/ui/Logo'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#0A0A0A] text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <Logo size="lg" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
              <span className="text-[#B8962A]">PHILADELPHIA</span><br />
              LITTLE QUAKERS
            </h1>
            <p className="text-gray-400 text-xl mb-2">All-Star Football · Est. 1953</p>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              One of Philadelphia's most storied youth football programs. Join us for tryouts and be part of the legacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-xl px-12 py-5">
                Register for Tryouts
              </Link>
              <Link href="/calendar" className="btn-secondary text-xl px-12 py-5">
                View Calendar
              </Link>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-4">🏈</div>
              <h3 className="text-xl font-black mb-2">Tryouts</h3>
              <p className="text-gray-600">150 players compete for 35–40 spots on the most elite youth football team in Philadelphia.</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-black mb-2">All-Stars Only</h3>
              <p className="text-gray-600">We scout the best talent from across the region. Compete at the highest level and represent the city with pride.</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-black mb-2">A Winning Tradition</h3>
              <p className="text-gray-600">Since 1953, the Little Quakers have developed young men into champions on and off the field.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#B8962A] py-14 px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Try Out?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Registration takes about 10 minutes. All you need is some basic information and your documents.</p>
          <Link href="/register" className="btn-black text-xl px-12 py-5">
            Register Now
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
