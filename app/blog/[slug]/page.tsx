export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import { supabaseAdmin } from '@/lib/supabase'
import { renderMarkdown } from '@/lib/markdown'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !post) notFound()

  const html = renderMarkdown(post.content)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">

        {/* Header */}
        <section className="bg-[#0A0A0A] text-white py-16 px-4">
          {post.cover_image_url && (
            <div className="max-w-4xl mx-auto mb-8 rounded-2xl overflow-hidden h-64 relative">
              <Image src={post.cover_image_url} alt={post.title} fill className="object-cover opacity-70" />
            </div>
          )}
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="text-[#B8962A] text-sm font-semibold hover:underline no-underline mb-6 inline-block">
              ← Back to News
            </Link>
            <p className="text-gray-500 text-sm mb-4">
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : ''}
              {' · By '}{post.author_name}
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">{post.title}</h1>
            <p className="text-gray-400 text-xl">{post.excerpt}</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose-lq"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </section>

        {/* Back link */}
        <section className="py-8 px-4 bg-[#F5F4F0] text-center">
          <Link href="/blog" className="btn-black text-base px-8 py-3">
            ← Back to All News
          </Link>
        </section>

      </main>
      <Footer />
    </div>
  )
}
