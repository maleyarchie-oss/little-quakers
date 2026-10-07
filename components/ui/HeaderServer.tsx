import Header from './Header'
import { supabaseAdmin } from '@/lib/supabase'

// Server wrapper around the client Header. Fetches the Stripe donate link +
// registration-open flag from settings once per request and hands them down
// so the client component doesn't have to know about Supabase.
export default async function HeaderServer() {
  let donateUrl: string | undefined
  let registrationOpen = false
  try {
    const { data } = await supabaseAdmin
      .from('settings')
      .select('stripe_link, registration_open')
      .single()
    const link = data?.stripe_link?.trim()
    if (link) donateUrl = link
    registrationOpen = Boolean(data?.registration_open)
  } catch {
    // If settings can't be read for any reason, render the header with safe
    // defaults (no Donate, registration closed). Don't break the site.
  }
  return <Header donateUrl={donateUrl} registrationOpen={registrationOpen} />
}
