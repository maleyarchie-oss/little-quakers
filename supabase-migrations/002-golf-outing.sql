-- Migration 002: Golf Outing registrations + Stripe link settings
-- Run in Supabase SQL Editor when ready to launch the golf outing page.

-- 1) Add Stripe Payment Link fields to settings for the 5 golf outing tiers
alter table settings
  add column if not exists golf_stripe_individual text default '',
  add column if not exists golf_stripe_foursome text default '',
  add column if not exists golf_stripe_hole text default '',
  add column if not exists golf_stripe_legends text default '',
  add column if not exists golf_stripe_platinum text default '';

-- 2) New table for golf outing registrations
create table if not exists golf_registrations (
  id uuid primary key default gen_random_uuid(),
  tier text not null,
    -- 'individual' | 'foursome' | 'hole_sponsor' | 'lq_legends' | 'levy_platinum'
  amount integer not null,
    -- in dollars, e.g. 250, 1000, 500, 2500, 5000
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  -- foursome partners (only used when tier produces a foursome)
  partner1_name text,
  partner2_name text,
  partner3_name text,
  -- optional sponsor display name for sponsorship tiers
  sponsor_display_name text,
  -- payment lifecycle
  status text default 'pending',
    -- 'pending' | 'paid' | 'cancelled' | 'refunded'
  stripe_session_id text,
  stripe_paid_at timestamptz,
  -- general
  notes text,
  created_at timestamptz default now(),
  constraint golf_registrations_tier_check check (
    tier in ('individual','foursome','hole_sponsor','lq_legends','levy_platinum')
  ),
  constraint golf_registrations_status_check check (
    status in ('pending','paid','cancelled','refunded')
  )
);

create index if not exists idx_golf_registrations_status on golf_registrations(status);
create index if not exists idx_golf_registrations_tier on golf_registrations(tier);
create index if not exists idx_golf_registrations_created on golf_registrations(created_at desc);

alter table golf_registrations enable row level security;
-- (Admin operations go through the service-role key in our API; no public policies needed.)
