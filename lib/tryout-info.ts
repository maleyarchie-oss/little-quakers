// Single source of truth for 2026 tryout details that appear across the site.
// The Supabase `settings` row (tryout_date / tryout_time / tryout_location)
// still drives the registration confirmation email, but the public site
// surfaces the canonical multi-date schedule here.

export const TRYOUT_SESSIONS = [
  { label: 'Tryout #1', day: 'Wed', date: 'Sep 23',  full: 'Wednesday, September 23, 2026' },
  { label: 'Tryout #2', day: 'Tue', date: 'Sep 29',  full: 'Tuesday, September 29, 2026' },
  { label: 'Tryout #3', day: 'Mon', date: 'Oct 5',   full: 'Monday, October 5, 2026' },
] as const

export const TRYOUT_TIME = '6:00 PM'

export const TRYOUT_LOCATION = {
  name: 'William Penn Charter School',
  street: '3000 W. School House Lane',
  city: 'Philadelphia',
  state: 'PA',
  zip: '19144',
  fullAddress: '3000 W. School House Lane, Philadelphia, PA 19144',
  // Google Maps embed URL. No API key required for `output=embed`.
  embedUrl:
    'https://www.google.com/maps?q=William+Penn+Charter+School,+3000+W.+School+House+Lane,+Philadelphia,+PA+19144&output=embed',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=William+Penn+Charter+School+Philadelphia+PA',
}
