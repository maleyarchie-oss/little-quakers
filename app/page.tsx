export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import { supabaseAdmin } from '@/lib/supabase'
import { BlogPost } from '@/types'

export default async function Home() {
  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, author_name, published_at, cover_image_url')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  const { data: settings } = await supabaseAdmin.from('settings').select('*').single()
  const registrationOpen = settings?.registration_open

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative bg-[#0A0A0A] text-white overflow-hidden min-h-[90vh] flex items-center">
          {/* Background image — replace /hero.jpg with your uploaded photo */}
          <div className="absolute inset-0">
            <Image
              src="/hero.jpg"
              alt="Philadelphia Little Quakers"
              fill
              className="object-cover opacity-30"
              priority
              onError={() => {}}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0A0A0A]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-24 text-center w-full">
            <div className="inline-block border border-[#B8962A]/40 text-[#B8962A] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
              Philadelphia · Est. 1953
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.95] tracking-tight">
              PHILADELPHIA<br />
              <span className="text-[#B8962A]">LITTLE QUAKERS</span>
            </h1>
            <p className="text-gray-300 text-xl md:text-2xl mb-4 font-light">
              All-Star Youth Football
            </p>
            <p className="text-gray-400 text-base md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              One of Philadelphia's most storied youth football programs. 70+ years of developing champions on and off the field.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {registrationOpen ? (
                <Link href="/register" className="btn-primary text-lg px-10 py-4">
                  Register for Tryouts →
                </Link>
              ) : (
                <Link href="/contact" className="btn-primary text-lg px-10 py-4">
                  Get Notified for 2026
                </Link>
              )}
              <Link href="/about" className="btn-secondary text-lg px-10 py-4">
                Meet the Staff
              </Link>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="bg-[#B8962A] py-6">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { value: '1953', label: 'Established' },
                { value: '70+', label: 'Years of Football' },
                { value: '10+', label: 'Coaches on Staff' },
                { value: '35–40', label: 'Spots Per Season' },
              ].map(({ value, label }) => (
                <div key={label} className="text-white">
                  <p className="text-3xl font-black">{value}</p>
                  <p className="text-white/70 text-sm font-semibold uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT SECTION ── */}
        <section className="py-20 px-4 bg-[#F5F4F0]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">Who We Are</p>
              <h2 className="text-4xl font-black mb-6 leading-tight">More Than<br />Just Football</h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                The Philadelphia Little Quakers are the city's premier all-star youth football program. Each year, 150 players compete for 35–40 spots on a team that represents Philadelphia at the highest level of youth competition.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Coached by former college and pro-affiliated coaches',
                  'Award-winning strength & conditioning program',
                  '70+ years of alumni who went on to play at every level',
                  'Once a Little Quaker, always a Little Quaker',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-[#B8962A] font-black text-lg leading-tight">—</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="btn-black text-base px-8 py-3">
                Meet Our Staff
              </Link>
            </div>
            <div className="relative">
              <div className="bg-[#0A0A0A] rounded-2xl overflow-hidden aspect-[4/3] relative">
                <Image
                  src="/team-photo.jpg"
                  alt="Little Quakers team"
                  fill
                  className="object-cover opacity-80"
                  onError={() => {}}
                />
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="bg-[#B8962A] text-white px-4 py-2 rounded-lg">
                    <p className="font-black text-sm">Philadelphia Little Quakers</p>
                    <p className="text-white/80 text-xs">All-Star Football · Est. 1953</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LATEST NEWS ── */}
        {posts && posts.length > 0 && (
          <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-2">Updates</p>
                  <h2 className="text-4xl font-black">Latest News</h2>
                </div>
                <Link href="/blog" className="text-[#B8962A] font-bold hover:underline text-sm hidden sm:block">
                  All Posts →
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {(posts as BlogPost[]).map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group no-underline">
                    <div className="bg-[#F5F4F0] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="bg-[#0A0A0A] h-40 relative">
                        {post.cover_image_url ? (
                          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover opacity-80" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[#B8962A] text-4xl font-black opacity-30">LQ</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-gray-400 mb-2">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                          {' · '}{post.author_name}
                        </p>
                        <h3 className="font-black text-lg mb-2 group-hover:text-[#B8962A] transition-colors leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8 sm:hidden">
                <Link href="/blog" className="btn-secondary text-base px-8 py-3">
                  View All Posts
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── REGISTRATION CTA ── */}
        <section className="bg-[#0A0A0A] py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#B8962A]/5" />
          <div className="relative max-w-3xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-4">2026 Season</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Think You Have What<br />It Takes?
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              150 players compete for 35–40 spots. Register for tryouts and earn your place on Philadelphia's finest youth football team.
            </p>
            {registrationOpen ? (
              <Link href="/register" className="btn-primary text-xl px-14 py-5">
                Register for Tryouts
              </Link>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">Registration is currently closed.</p>
                <Link href="/contact" className="btn-secondary text-lg px-10 py-4">
                  Get Notified When It Opens
                </Link>
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
