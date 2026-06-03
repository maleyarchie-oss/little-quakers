export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import HeaderServer from '@/components/ui/HeaderServer'
import Footer from '@/components/ui/Footer'
import { supabaseAdmin } from '@/lib/supabase'
import { BlogPost } from '@/types'

export const metadata = {
  title: 'News | Philadelphia Little Quakers',
  description: 'Latest news and updates from the Philadelphia Little Quakers football program.',
}

export default async function BlogPage() {
  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, author_name, published_at, created_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderServer />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#0A0A0A] text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">Little Quakers</p>
            <h1 className="text-5xl font-black mb-4">News &amp; Updates</h1>
            <p className="text-gray-400 text-lg">The latest from the program: tryout updates, season recaps, and more.</p>
          </div>
        </section>

        {/* Posts */}
        <section className="py-16 px-4 bg-[#F5F4F0]">
          <div className="max-w-6xl mx-auto">
            {!posts || posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-xl mb-2">No posts yet.</p>
                <p className="text-gray-500">Check back soon for program updates.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(posts as BlogPost[]).map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group no-underline">
                    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
                      <div className="bg-[#0A0A0A] h-48 relative shrink-0">
                        {post.cover_image_url ? (
                          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover opacity-80" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[#B8962A] text-5xl font-black opacity-20">LQ</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <p className="text-xs text-gray-400 mb-3">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          {' · '}{post.author_name}
                        </p>
                        <h2 className="font-black text-xl mb-3 group-hover:text-[#B8962A] transition-colors leading-tight flex-1">
                          {post.title}
                        </h2>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                        <span className="text-[#B8962A] font-bold text-sm">Read More →</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
