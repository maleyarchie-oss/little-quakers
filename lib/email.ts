import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM = () => process.env.EMAIL_FROM || 'info@littlequakers.com'

interface TryoutInfo {
  date: string
  time: string
  location: string
}

export async function sendConfirmationEmail(
  to: string,
  playerName: string,
  tryout: TryoutInfo
) {
  await getResend().emails.send({
    from: FROM(),
    to,
    subject: 'Philadelphia Little Quakers – Tryout Confirmation',
    html: buildConfirmationHtml(playerName, tryout),
  })
}

export async function sendReminderEmail(
  to: string,
  playerName: string,
  tryout: TryoutInfo,
  daysOut: number
) {
  const label = daysOut === 1 ? 'Tomorrow' : `${daysOut} Days Away`
  await getResend().emails.send({
    from: FROM(),
    to,
    subject: `Little Quakers Tryout – ${label}!`,
    html: buildReminderHtml(playerName, tryout, daysOut),
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

function buildConfirmationHtml(playerName: string, tryout: TryoutInfo) {
  return wrapInTemplate(
    playerName,
    `Dear ${playerName} and Family,\n\nThank you for registering for the Philadelphia Little Quakers tryout! We are excited to see you on the field.\n\n<strong>Tryout Details:</strong>\n📅 Date: ${tryout.date}\n🕐 Time: ${tryout.time}\n📍 Location: ${tryout.location}\n\nPlease arrive 15 minutes early, dressed and ready to play. Bring proper football gear if you have it.\n\nWe look forward to seeing you there!\n\nGo Little Quakers!\n\n— The Little Quakers Coaching Staff`
  )
}

function buildReminderHtml(playerName: string, tryout: TryoutInfo, daysOut: number) {
  const when = daysOut === 1 ? 'TOMORROW' : `in ${daysOut} days`
  return wrapInTemplate(
    playerName,
    `Dear ${playerName} and Family,\n\nJust a reminder that your Little Quakers tryout is <strong>${when}!</strong>\n\n<strong>Tryout Details:</strong>\n📅 Date: ${tryout.date}\n🕐 Time: ${tryout.time}\n📍 Location: ${tryout.location}\n\nPlease arrive 15 minutes early. We look forward to seeing you!\n\nGo Little Quakers!\n\n— The Little Quakers Coaching Staff`
  )
}
