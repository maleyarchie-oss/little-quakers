export type Position =
  | 'Quarterback'
  | 'Running Back'
  | 'Wide Receiver'
  | 'Tight End'
  | 'Offensive Lineman'
  | 'Defensive Lineman'
  | 'Linebacker'
  | 'Cornerback'
  | 'Safety'
  | 'Kicker'
  | 'Punter'
  | 'Long Snapper'

export type RegistrantStatus = 'registered' | 'made_team' | 'not_made_team'

export interface Registrant {
  id: string
  player_first_name: string
  player_last_name: string
  birth_date: string
  email: string
  street_address: string
  apt_unit: string | null
  city: string
  state: string
  zip_code: string
  phone: string
  height: string
  weight: string
  current_school: string
  grade: string
  current_coach_name: string
  current_coach_email: string
  position_desired: Position
  caregiver_first_name: string
  caregiver_last_name: string
  birth_certificate_url: string | null
  report_card_url: string | null
  agreed_code_of_conduct: boolean
  agreed_medical_release: boolean
  agreed_photo_release: boolean
  status: RegistrantStatus
  jersey_number: number | null
  created_at: string
}

export interface RosterPlayer extends Registrant {
  jersey_number: number
}

export interface Settings {
  registration_open: boolean
  tryout_date: string
  tryout_time: string
  tryout_location: string
  stripe_link: string
  email_from: string
  made_team_subject: string
  made_team_body: string
  not_made_team_subject: string
  not_made_team_body: string
  google_sheets_calendar_id: string
}

export interface CalendarEvent {
  id: string
  type: 'Practice' | 'Game' | 'Other' | 'Banquet'
  title: string
  location: string
  date: string
  time: string
  description?: string
}

export interface AdminUser {
  id: string
  name: string
  username: string
  email: string
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  author_id: string | null
  author_name: string
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface BlogAuthor {
  id: string
  name: string
  email: string
  username: string
  created_at: string
}

export type GolfTier =
  | 'individual'
  | 'foursome'
  | 'hole_sponsor'
  | 'lq_legends'
  | 'levy_platinum'

export type GolfStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'

export interface GolfRegistration {
  id: string
  tier: GolfTier
  amount: number
  first_name: string
  last_name: string
  email: string
  phone: string
  partner1_name: string | null
  partner2_name: string | null
  partner3_name: string | null
  sponsor_display_name: string | null
  status: GolfStatus
  stripe_session_id: string | null
  stripe_paid_at: string | null
  notes: string | null
  created_at: string
}
