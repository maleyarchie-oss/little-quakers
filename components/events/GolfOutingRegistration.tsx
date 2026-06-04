'use client'

import { useEffect, useState } from 'react'

type Tier = 'individual' | 'foursome' | 'hole_sponsor' | 'lq_legends' | 'levy_platinum'

const TIERS: { value: Tier; label: string; price: string; producesFoursome: boolean; sponsorshipName: boolean }[] = [
  { value: 'individual',     label: 'Individual Golfer',  price: '$250',   producesFoursome: false, sponsorshipName: false },
  { value: 'foursome',       label: 'Foursome',           price: '$1,000', producesFoursome: true,  sponsorshipName: false },
  { value: 'hole_sponsor',   label: 'Hole Sponsor',       price: '$500',   producesFoursome: false, sponsorshipName: true  },
  { value: 'lq_legends',     label: 'LQ Legends',         price: '$2,500', producesFoursome: true,  sponsorshipName: true  },
  { value: 'levy_platinum',  label: 'Levy Platinum',      price: '$5,000', producesFoursome: true,  sponsorshipName: true  },
]

const TIER_LOOKUP = Object.fromEntries(TIERS.map(t => [t.value, t]))

export default function GolfOutingRegistration() {
  const [tier, setTier] = useState<Tier>('individual')
  const [first_name, setFirst] = useState('')
  const [last_name, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [partner1_name, setP1] = useState('')
  const [partner2_name, setP2] = useState('')
  const [partner3_name, setP3] = useState('')
  const [sponsor_display_name, setSponsorName] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<string | null>(null)

  // Auto-select tier if user clicked a tier button up-page (data-tier attr)
  useEffect(() => {
    function onTierClick(e: MouseEvent) {
      const el = e.target as HTMLElement | null
      const a = el?.closest('a[data-tier]') as HTMLAnchorElement | null
      const t = a?.dataset.tier as Tier | undefined
      if (t && TIER_LOOKUP[t]) {
        setTier(t)
      }
    }
    document.addEventListener('click', onTierClick)
    return () => document.removeEventListener('click', onTierClick)
  }, [])

  const tierInfo = TIER_LOOKUP[tier]

  const validate = () => {
    if (!first_name.trim()) return 'First name is required.'
    if (!last_name.trim()) return 'Last name is required.'
    if (!email.trim()) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email.'
    if (!phone.trim()) return 'Phone is required.'
    return null
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(null)
    const validation = validate()
    if (validation) {
      setError(validation)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/events/golf-outing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          first_name,
          last_name,
          email,
          phone,
          partner1_name: tierInfo.producesFoursome ? partner1_name : undefined,
          partner2_name: tierInfo.producesFoursome ? partner2_name : undefined,
          partner3_name: tierInfo.producesFoursome ? partner3_name : undefined,
          sponsor_display_name: tierInfo.sponsorshipName ? sponsor_display_name : undefined,
          notes,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Registration failed')

      if (json.stripeUrl) {
        // Send the user to Stripe to complete payment.
        window.location.href = json.stripeUrl
        return
      }
      // Payment link not yet configured — registration is still saved.
      setSuccess(
        json.warning ||
          "We received your registration. Stripe payment isn't live yet; we'll follow up directly."
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6"
    >
      {/* Tier selector */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
          Select Your Tier
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIERS.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTier(t.value)}
              className={`text-left rounded-lg border-2 px-4 py-3 transition-colors ${
                tier === t.value
                  ? 'border-[#B8962A] bg-[#B8962A]/10 text-[#0A0A0A]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <p className="font-bold">{t.label}</p>
              <p className="text-sm text-gray-500">{t.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Contact fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={first_name}
            onChange={e => setFirst(e.target.value)}
            className="form-input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={last_name}
            onChange={e => setLast(e.target.value)}
            className="form-input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="form-input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="form-input w-full"
            required
          />
        </div>
      </div>

      {/* Sponsor display name */}
      {tierInfo.sponsorshipName && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Sponsor Display Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={sponsor_display_name}
            onChange={e => setSponsorName(e.target.value)}
            placeholder="The name we&apos;ll print on signage and the program"
            className="form-input w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to use your name. Companies welcome.
          </p>
        </div>
      )}

      {/* Foursome partners */}
      {tierInfo.producesFoursome && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Foursome Partners{' '}
            <span className="text-gray-400 font-normal">(optional — you can send these later)</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={partner1_name}
              onChange={e => setP1(e.target.value)}
              placeholder="Partner 1 name"
              className="form-input w-full"
            />
            <input
              type="text"
              value={partner2_name}
              onChange={e => setP2(e.target.value)}
              placeholder="Partner 2 name"
              className="form-input w-full"
            />
            <input
              type="text"
              value={partner3_name}
              onChange={e => setP3(e.target.value)}
              placeholder="Partner 3 name"
              className="form-input w-full"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Dietary restrictions, special requests, anything else."
          className="form-input w-full"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#B8962A] hover:bg-[#8B7020] disabled:opacity-60 text-white font-bold py-4 rounded-lg text-lg transition-colors"
      >
        {submitting ? 'Submitting…' : `Continue to Payment — ${tierInfo.price}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Payments are processed by Stripe. Your registration is saved before you
        check out.
      </p>
    </form>
  )
}
