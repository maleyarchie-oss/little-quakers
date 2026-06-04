import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type Tier = 'individual' | 'foursome' | 'hole_sponsor' | 'lq_legends' | 'levy_platinum'

const TIER_AMOUNT: Record<Tier, number> = {
  individual: 250,
  foursome: 1000,
  hole_sponsor: 500,
  lq_legends: 2500,
  levy_platinum: 5000,
}

const SPONSOR_TIERS: Tier[] = ['lq_legends', 'levy_platinum']
const FOURSOME_TIERS: Tier[] = ['foursome', 'lq_legends', 'levy_platinum']

const VALID_TIERS = Object.keys(TIER_AMOUNT) as Tier[]

function isValidTier(v: unknown): v is Tier {
  return typeof v === 'string' && (VALID_TIERS as string[]).includes(v)
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

// POST /api/events/golf-outing
// Saves a golf outing registration as 'pending' and returns the matching
// Stripe Payment Link from settings. Client redirects the user there.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const tier = body.tier
  if (!isValidTier(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const first_name = str(body.first_name)
  const last_name = str(body.last_name)
  const email = str(body.email)
  const phone = str(body.phone)

  if (!first_name || !last_name || !email || !phone) {
    return NextResponse.json(
      { error: 'Name, email, and phone are required' },
      { status: 400 }
    )
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Foursome partners — only meaningful when the tier produces a foursome
  const partner1_name = FOURSOME_TIERS.includes(tier) ? str(body.partner1_name) || null : null
  const partner2_name = FOURSOME_TIERS.includes(tier) ? str(body.partner2_name) || null : null
  const partner3_name = FOURSOME_TIERS.includes(tier) ? str(body.partner3_name) || null : null

  // Sponsor display name — only meaningful on sponsorship tiers (and hole)
  const sponsor_display_name =
    SPONSOR_TIERS.includes(tier) || tier === 'hole_sponsor'
      ? str(body.sponsor_display_name) || null
      : null

  const notes = str(body.notes) || null

  // Save as pending
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('golf_registrations')
    .insert({
      tier,
      amount: TIER_AMOUNT[tier],
      first_name,
      last_name,
      email,
      phone,
      partner1_name,
      partner2_name,
      partner3_name,
      sponsor_display_name,
      notes,
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[golf-outing] insert failed:', insertError)
    return NextResponse.json({ error: 'Failed to save registration' }, { status: 500 })
  }

  // Look up the right Stripe Payment Link for this tier
  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select(
      'golf_stripe_individual,golf_stripe_foursome,golf_stripe_hole,golf_stripe_legends,golf_stripe_platinum'
    )
    .single()

  const stripeMap: Record<Tier, string> = {
    individual: settings?.golf_stripe_individual?.trim() || '',
    foursome: settings?.golf_stripe_foursome?.trim() || '',
    hole_sponsor: settings?.golf_stripe_hole?.trim() || '',
    lq_legends: settings?.golf_stripe_legends?.trim() || '',
    levy_platinum: settings?.golf_stripe_platinum?.trim() || '',
  }

  const stripeUrl = stripeMap[tier]
  if (!stripeUrl) {
    // Registration is still saved; admin just hasn't configured the link yet.
    return NextResponse.json(
      {
        success: true,
        registrationId: inserted.id,
        stripeUrl: null,
        warning: 'Payment link not yet configured. Your registration is saved; we will follow up.',
      },
      { status: 200 }
    )
  }

  return NextResponse.json({
    success: true,
    registrationId: inserted.id,
    stripeUrl,
  })
}
