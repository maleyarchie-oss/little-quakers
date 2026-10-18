import { NextRequest, NextResponse } from 'next/server'
import { antiSpamGuard } from '@/lib/anti-spam'

function getResend() {
  const { Resend } = require('resend')
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Shared defenses: honeypot, IP rate limit, gibberish filter, length cap
    const blocked = antiSpamGuard(req, body, {
      endpoint: 'contact',
      gibberishCheckFields: ['name', 'message'],
    })
    if (blocked) return blocked

    const { name, email, phone, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
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
