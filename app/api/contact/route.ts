import { NextRequest, NextResponse } from 'next/server'

function getResend() {
  const { Resend } = require('resend')
  return new Resend(process.env.RESEND_API_KEY)
}

// In-memory rate limiter keyed by IP. Resets when the serverless function
// cold-starts, which is fine — we're trying to blunt barrage patterns, not
// enforce a strict quota. Max 3 submissions per IP per 10 minutes.
const rateLimit = new Map<string, number[]>()
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 3

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (rateLimit.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS)
  if (timestamps.length >= RATE_MAX) return true
  timestamps.push(now)
  rateLimit.set(ip, timestamps)
  return false
}

// Heuristic: does this look like keyboard-mashing / bot gibberish?
// Bots like the one PJ caught send things like 'IWZZUiXuFyrxEIcIzYbjBKb'
// — single word, 15+ chars, no spaces, mixed case, no vowels pattern.
function looksLikeGibberish(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 10) return false // short messages are fine
  const hasSpace = /\s/.test(trimmed)
  const hasPunctuation = /[.,!?]/.test(trimmed)
  // Long single-word, no punctuation, mixed case = almost certainly a bot
  if (!hasSpace && !hasPunctuation && trimmed.length >= 10) return true
  // Mostly consonants (<20% vowels) and long = also suspicious
  const vowels = (trimmed.match(/[aeiouAEIOU]/g) || []).length
  const letters = (trimmed.match(/[a-zA-Z]/g) || []).length
  if (letters > 20 && vowels / letters < 0.15) return true
  return false
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, message, website } = body

    // --- Defense 1: Honeypot field ---
    // The 'website' field is hidden in the form via CSS. Real users never
    // see or touch it. Bots blindly fill every input they find. If it's
    // non-empty, silently 'succeed' so the bot thinks it worked and moves on.
    if (typeof website === 'string' && website.trim() !== '') {
      console.log('[contact] blocked bot via honeypot:', { name, email })
      return NextResponse.json({ success: true }) // fake success, don't send
    }

    // --- Defense 2: Rate limiting by IP ---
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    if (ip !== 'unknown' && isRateLimited(ip)) {
      console.log('[contact] rate-limited:', ip)
      // Fake success here too — don't give bots signal that they hit a limit
      return NextResponse.json({ success: true })
    }

    // --- Defense 3: Basic required-field validation ---
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    // --- Defense 4: Gibberish heuristic ---
    if (looksLikeGibberish(message) || looksLikeGibberish(name)) {
      console.log('[contact] blocked gibberish:', { name, email, message: message.slice(0, 50) })
      return NextResponse.json({ success: true }) // fake success
    }

    // --- Defense 5: Length cap ---
    if (typeof message === 'string' && message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
    }

    const resend = getResend()
    await resend.emails.send({
      from: 'Little Quakers Website <noreply@littlequakers.us>',
      to: 'info@littlequakers.us',
      replyTo: email,
      subject: `Website Contact: ${name}`,
      html: `
        <h2>New message from littlequakers.us</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[contact] error:', e)
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
  }
}
