'use client'

import { useState } from 'react'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
      } else {
        setError(data.error || 'Failed to send message. Please try again.')
      }
    } catch {
      setError('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#0A0A0A] text-white py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">Reach Out</p>
            <h1 className="text-5xl font-black mb-4">Contact Us</h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Questions about registration, tryouts, or the program? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4 bg-[#F5F4F0]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

            {/* Info */}
            <div>
              <h2 className="text-3xl font-black mb-6">Get In Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0A0A0A] rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-[#B8962A]">✉</span>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Email</p>
                    <a href="mailto:info@littlequakers.us" className="text-[#B8962A] hover:underline">
                      info@littlequakers.us
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0A0A0A] rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-[#B8962A]">📍</span>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Location</p>
                    <p className="text-gray-600">Philadelphia, Pennsylvania</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 bg-[#0A0A0A] rounded-2xl p-6 text-white">
                <p className="text-[#B8962A] font-bold text-sm uppercase tracking-widest mb-3">2026 Tryouts</p>
                <h3 className="text-2xl font-black mb-2">Registration Is Open</h3>
                <p className="text-gray-400 text-sm mb-5">
                  Think you have what it takes? Register now and compete for one of 35–40 spots on Philadelphia's premier youth football team.
                </p>
                <a href="/register" className="btn-primary text-base px-6 py-3 inline-block">
                  Register for Tryouts
                </a>
              </div>
            </div>

            {/* Form */}
            <div>
              {sent ? (
                <div className="card text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-2xl font-black mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thanks for reaching out. We'll get back to you soon at {form.email}.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="card space-y-5">
                  <h2 className="text-2xl font-black mb-1">Send a Message</h2>
                  <div>
                    <label className="form-label">Your Name *</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="First and last name"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="tel"
                      className="form-input"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="(215) 555-0000"
                    />
                  </div>
                  <div>
                    <label className="form-label">Message *</label>
                    <textarea
                      className="form-input min-h-[120px] resize-y"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button type="submit" className="btn-primary w-full py-4" disabled={sending}>
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
