// Single source of truth for 2026 Golf Outing details that appear in emails
// (and eventually anywhere else the outing info shows up). Same pattern as
// lib/tryout-info.ts.

export const GOLF_OUTING = {
  date: 'Monday, October 19, 2026',
  venue: {
    name: 'Bluestone Country Club',
    city: 'Blue Bell',
    state: 'PA',
  },
  schedule: [
    { time: '10:00 AM', label: 'Breakfast' },
    { time: '11:00 AM', label: 'Shotgun Start' },
    { time: '4:00 PM', label: 'Dinner & Awards' },
  ],
  included: [
    'Green fees',
    'Breakfast',
    'Dinner',
    'Drinks',
    'Awards',
    'Giveaways',
  ],
  contactEmail: 'info@littlequakers.us',
  registrationUrl: 'https://little-quakers.vercel.app/events/golf-outing',
} as const

export type GolfTier =
  | 'individual'
  | 'foursome'
  | 'hole_sponsor'
  | 'lq_legends'
  | 'levy_platinum'

export const TIER_LABEL: Record<GolfTier, string> = {
  individual: 'Individual Golfer',
  foursome: 'Foursome',
  hole_sponsor: 'Hole Sponsor',
  lq_legends: 'LQ Legends',
  levy_platinum: 'Levy Platinum',
}
