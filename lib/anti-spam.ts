// Shared anti-spam defenses used by public-facing form endpoints.
// Same five-layer approach as /api/contact: honeypot, IP rate limit,
// gibberish filter, length cap. Returns { ok, reason, fakeSuccess }
// so callers can respond consistently.

import { NextRequest, NextResponse } from 'next/server'

// Per-endpoint rate limiters. Keyed by endpoint name so contact + golf
// each get their own budget. In-memory \u2014 resets on cold start, which is
// fine for blunting barrage patterns.
const limiters = new Map<string, Map<string, number[]>>()

export interface AntiSpamConfig {
  endpoint: string                // for logging + separate rate buckets
  rateMaxPerWindow?: number       // default 3
  rateWindowMs?: number           // default 10 min
  gibberishCheckFields?: string[] // field names to scan for gibberish
  maxMessageLength?: number       // default 5000
}

export interface AntiSpamResult {
  ok: boolean
  // When blocked, fakeSuccess=true means caller should return 200 success
  // to deceive the bot. false means return a real error (legitimate validation).
  fakeSuccess: boolean
  reason?: string
}

function looksLikeGibberish(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 10) return false
  const hasSpace = /\s/.test(trimmed)
  const hasPunctuation = /[.,!?]/.test(trimmed)
  // Long single-word with no punctuation = almost certainly bot
  if (!hasSpace && !hasPunctuation && trimmed.length >= 10) return true
  // Mostly consonants (<15% vowels) and long = suspicious
  const vowels = (trimmed.match(/[aeiouAEIOU]/g) || []).length
  const letters = (trimmed.match(/[a-zA-Z]/g) || []).length
  if (letters > 20 && vowels / letters < 0.15) return true
  return false
}

function isRateLimited(endpoint: string, ip: string, max: number, windowMs: number): boolean {
  let bucket = limiters.get(endpoint)
  if (!bucket) {
    bucket = new Map()
    limiters.set(endpoint, bucket)
  }
  const now = Date.now()
  const timestamps = (bucket.get(ip) || []).filter(t => now - t < windowMs)
  if (timestamps.length >= max) return true
  timestamps.push(now)
  bucket.set(ip, timestamps)
  return false
}

export function checkAntiSpam(
  req: NextRequest,
  body: Record<string, unknown>,
  cfg: AntiSpamConfig,
): AntiSpamResult {
  const rateMax = cfg.rateMaxPerWindow ?? 3
  const rateWindow = cfg.rateWindowMs ?? 10 * 60 * 1000
  const maxLen = cfg.maxMessageLength ?? 5000

  // 1. Honeypot: 'website' field is CSS-hidden on the form. Any value = bot.
  const website = body.website
  if (typeof website === 'string' && website.trim() !== '') {
    console.log(`[${cfg.endpoint}] blocked bot via honeypot`)
    return { ok: false, fakeSuccess: true, reason: 'honeypot' }
  }

  // 2. Rate limit by IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (ip !== 'unknown' && isRateLimited(cfg.endpoint, ip, rateMax, rateWindow)) {
    console.log(`[${cfg.endpoint}] rate-limited:`, ip)
    return { ok: false, fakeSuccess: true, reason: 'rate_limit' }
  }

  // 3. Gibberish scan on configured fields
  for (const field of cfg.gibberishCheckFields || []) {
    const v = body[field]
    if (typeof v === 'string' && looksLikeGibberish(v)) {
      console.log(`[${cfg.endpoint}] blocked gibberish in field ${field}:`, String(v).slice(0, 60))
      return { ok: false, fakeSuccess: true, reason: `gibberish:${field}` }
    }
  }

  // 4. Length cap on all string fields
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === 'string' && v.length > maxLen) {
      return { ok: false, fakeSuccess: false, reason: `${k}_too_long` }
    }
  }

  return { ok: true, fakeSuccess: false }
}

// Convenience helper for the common "block => return response" flow.
// Returns a NextResponse to return, or null if the request passed checks.
export function antiSpamGuard(
  req: NextRequest,
  body: Record<string, unknown>,
  cfg: AntiSpamConfig,
): NextResponse | null {
  const result = checkAntiSpam(req, body, cfg)
  if (result.ok) return null
  if (result.fakeSuccess) {
    // Fake success so bots don't learn they're being blocked
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: result.reason || 'Invalid request' }, { status: 400 })
}
