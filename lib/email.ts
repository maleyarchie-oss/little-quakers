import { Resend } from 'resend'
import { TRYOUT_SESSIONS, TRYOUT_TIME, TRYOUT_LOCATION } from '@/lib/tryout-info'
import { GOLF_OUTING, TIER_LABEL, type GolfTier } from '@/lib/golf-outing-info'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = () => process.env.EMAIL_FROM || 'info@littlequakers.us'
const REPLY_TO = () => process.env.EMAIL_REPLY_TO || FROM()

// Coaches / staff who should be BCC'd on team-selection emails so they can
// track who got what. Email-list envvar, comma-separated.
const MADE_TEAM_BCC = () =>
  (process.env.MADE_TEAM_BCC || 'crahill@penncharter.com')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

export async function sendConfirmationEmail(
  to: string,
  playerName: string,
) {
  await getResend().emails.send({
    from: FROM(),
    to,
    subject: 'Philadelphia Little Quakers – Tryout Confirmation',
    html: buildConfirmationHtml(playerName),
  })
}

export async function sendReminderEmail(
  to: string,
  playerName: string,
  daysOut: number
) {
  const label = daysOut === 1 ? 'Tomorrow' : `${daysOut} Days Away`
  await getResend().emails.send({
    from: FROM(),
    to,
    subject: `Little Quakers Tryout – ${label}!`,
    html: buildReminderHtml(playerName, daysOut),
  })
}

export async function sendMadeTeamEmail(
  to: string,
  playerName: string,
  subject: string,
  body: string
) {
  await getResend().emails.send({
    from: FROM(),
    to,
    bcc: MADE_TEAM_BCC(),
    replyTo: REPLY_TO(),
    subject,
    html: wrapInTemplate(playerName, body),
  })
}

export async function sendNotMadeTeamEmail(
  to: string,
  playerName: string,
  subject: string,
  body: string
) {
  await getResend().emails.send({
    from: FROM(),
    to,
    subject,
    html: wrapInTemplate(playerName, body),
  })
}

export async function sendBroadcastEmail(
  recipients: { email: string; name: string }[],
  subject: string,
  body: string
) {
  const sends = recipients.map(({ email, name }) =>
    getResend().emails.send({
      from: FROM(),
      to: email,
      subject,
      html: wrapInTemplate(name, body),
    })
  )
  await Promise.allSettled(sends)
}

function wrapInTemplate(name: string, body: string) {
  const escaped = body.replace(/\n/g, '<br>')
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:#0A0A0A;padding:30px;text-align:center;border-radius:12px 12px 0 0;">
              <p style="color:#B8962A;font-size:28px;font-weight:900;margin:0;letter-spacing:2px;">PHILADELPHIA LITTLE QUAKERS</p>
              <p style="color:#888;font-size:12px;margin:6px 0 0;">EST. 1953</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fff;padding:40px;border-radius:0 0 12px 12px;">
              <p style="font-size:16px;color:#333;line-height:1.7;">${escaped}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
              <p style="font-size:13px;color:#999;text-align:center;">Philadelphia Little Quakers Football · Est. 1953<br>littlequakers.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Canonical tryout details from lib/tryout-info.ts, formatted for email bodies.
function tryoutDetailsHtml() {
  const datesLines = TRYOUT_SESSIONS.map(
    s => `   • ${s.label}: ${s.full}`
  ).join('\n')
  return (
    `<strong>Tryout Details:</strong>\n` +
    `📅 Dates:\n${datesLines}\n` +
    `🕐 Time: ${TRYOUT_TIME} (all three nights)\n` +
    `📍 Location: ${TRYOUT_LOCATION.name}\n` +
    `   ${TRYOUT_LOCATION.fullAddress}`
  )
}

function buildConfirmationHtml(playerName: string) {
  return wrapInTemplate(
    playerName,
    `Dear ${playerName} and Family,\n\nThank you for registering for the Philadelphia Little Quakers tryout! We are excited to see you on the field.\n\n${tryoutDetailsHtml()}\n\nPlease arrive 15 minutes early in full pads, including helmet, shoulder pads, hip, knee, and thigh pads. Email us at info@littlequakers.us if you have any questions.\n\nWe look forward to seeing you there!\n\nGo Little Quakers!\n\n— The Little Quakers Coaching Staff`
  )
}

function buildReminderHtml(playerName: string, daysOut: number) {
  const when = daysOut === 1 ? 'TOMORROW' : `in ${daysOut} days`
  return wrapInTemplate(
    playerName,
    `Dear ${playerName} and Family,\n\nJust a reminder that your Little Quakers tryout is <strong>${when}!</strong>\n\n${tryoutDetailsHtml()}\n\nPlease arrive 15 minutes early. We look forward to seeing you!\n\nGo Little Quakers!\n\n— The Little Quakers Coaching Staff`
  )
}

// -----------------------------------------------------------------------
// GOLF OUTING
// Email #1: fires immediately when someone submits the registration form.
//   Payment may or may not have completed yet.
// Email #2: fires when their payment is confirmed (via 'Mark Paid' in admin
//   for now; webhook later).
// -----------------------------------------------------------------------

interface GolfRegistrantSummary {
  firstName: string
  lastName: string
  email: string
  tier: GolfTier
  amount: number
  partner1_name?: string | null
  partner2_name?: string | null
  partner3_name?: string | null
  sponsor_display_name?: string | null
}

function golfDetailsHtml() {
  const scheduleLines = GOLF_OUTING.schedule
    .map(s => `   • ${s.time} — ${s.label}`)
    .join('\n')
  const includedInline = GOLF_OUTING.included.join(', ')
  return (
    `<strong>Event Details:</strong>\n` +
    `📅 Date: ${GOLF_OUTING.date}\n` +
    `📍 Venue: ${GOLF_OUTING.venue.name}, ${GOLF_OUTING.venue.city}, ${GOLF_OUTING.venue.state}\n\n` +
    `<strong>Schedule:</strong>\n${scheduleLines}\n\n` +
    `<strong>Included for every golfer:</strong>\n   ${includedInline}`
  )
}

function hasFoursome(tier: GolfTier) {
  return tier === 'foursome' || tier === 'lq_legends' || tier === 'levy_platinum'
}

function missingPartners(r: GolfRegistrantSummary): number {
  if (!hasFoursome(r.tier)) return 0
  let n = 0
  if (!r.partner1_name) n++
  if (!r.partner2_name) n++
  if (!r.partner3_name) n++
  return n
}

export async function sendGolfRegistrationReceivedEmail(r: GolfRegistrantSummary) {
  const displayName = r.firstName || 'Golfer'
  const amountLine = `$${r.amount.toLocaleString()} — ${TIER_LABEL[r.tier]}`
  const paymentBlurb = `You should have been redirected to Stripe to complete your payment. If you did not finish, you can return to ${GOLF_OUTING.registrationUrl} to complete it. We will send a separate confirmation once your payment is received.`

  await getResend().emails.send({
    from: FROM(),
    to: r.email,
    subject: 'Little Quakers Golf Outing — Registration Received',
    html: wrapInTemplate(
      displayName,
      `Hi ${displayName},\n\n` +
        `We've received your registration for the Little Quakers Golf Outing.\n\n` +
        `<strong>Your Tier:</strong> ${amountLine}\n\n` +
        `${golfDetailsHtml()}\n\n` +
        `<strong>Payment:</strong>\n${paymentBlurb}\n\n` +
        `Questions? Email us at ${GOLF_OUTING.contactEmail}.\n\n` +
        `Thanks for supporting the Little Quakers.\n\n— Philadelphia Little Quakers`
    ),
  })
}

export async function sendGolfPaymentConfirmedEmail(r: GolfRegistrantSummary) {
  const displayName = r.firstName || 'Golfer'
  const amountLine = `$${r.amount.toLocaleString()} — ${TIER_LABEL[r.tier]}`

  const partnerLines = hasFoursome(r.tier)
    ? (() => {
        const missing = missingPartners(r)
        if (missing === 0) {
          const names = [r.partner1_name, r.partner2_name, r.partner3_name]
            .filter(Boolean)
            .join(', ')
          return `\n\n<strong>Your foursome:</strong> ${displayName}, ${names}.`
        }
        return `\n\n<strong>Foursome reminder:</strong> we still need ${missing} partner name${missing === 1 ? '' : 's'} for your foursome. Please email ${GOLF_OUTING.contactEmail} with the names as soon as you have them.`
      })()
    : ''

  await getResend().emails.send({
    from: FROM(),
    to: r.email,
    subject: 'Little Quakers Golf Outing — Payment Confirmed',
    html: wrapInTemplate(
      displayName,
      `Hi ${displayName},\n\n` +
        `Your payment has been received. You're officially in for October 19.\n\n` +
        `<strong>Paid:</strong> ${amountLine}\n\n` +
        `${golfDetailsHtml()}${partnerLines}\n\n` +
        `We will email you closer to the date with any last details. Questions in the meantime? ${GOLF_OUTING.contactEmail}.\n\n` +
        `See you at Bluestone.\n\n— Philadelphia Little Quakers`
    ),
  })
}
