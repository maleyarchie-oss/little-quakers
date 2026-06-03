import Header from './Header'
import { supabaseAdmin } from '@/lib/supabase'

// Server wrapper around the client Header. Fetches the Stripe donate link from
// settings once per request and hands it down so the client component doesn't
// have to know about Supabase.
export default async function HeaderServer() {
  let donateUrl: string | undefined
  try {
    const { data } = await supabaseAdmin
      .from('settings')
      .select('stripe_link')
      .single()
    const link = data?.stripe_link?.trim()
    if (link) donateUrl = link
  } catch {
    // If settings can't be read for any reason, just render the header
    // without the Donate button. Don't break the site.
  }
  return <Header donateUrl={donateUrl} />
}
