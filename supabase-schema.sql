-- Philadelphia Little Quakers - Supabase Schema
-- Run this entire file in the Supabase SQL Editor, then click Run.

-- SETTINGS TABLE (one row only, id = 1)
create table if not exists settings (
  id integer primary key default 1,
  registration_open boolean default false,
  tryout_date text default '',
  tryout_time text default '',
  tryout_location text default '',
  stripe_link text default '',
  email_from text default 'info@littlequakers.com',
  made_team_subject text default 'Congratulations - You Made the Little Quakers!',
  made_team_body text default '',
  not_made_team_subject text default 'Thank You for Trying Out - Little Quakers',
  not_made_team_body text default '',
  google_sheets_calendar_id text default ''
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- ADMIN USERS TABLE
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text not null unique,
  email text not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- REGISTRANTS TABLE
create table if not exists registrants (
  id uuid primary key default gen_random_uuid(),
  player_first_name text not null,
  player_last_name text not null,
  birth_date text not null,
  height text not null,
  weight text not null,
  current_school text not null,
  grade text not null,
  current_coach_name text not null,
  current_coach_email text not null,
  position_desired text not null,
  caregiver_first_name text not null,
  caregiver_last_name text not null,
  email text not null,
  phone text not null,
  street_address text not null,
  apt_unit text,
  city text not null,
  state text not null,
  zip_code text not null,
  birth_certificate_url text,
  report_card_url text,
  agreed_code_of_conduct boolean default false,
  agreed_medical_release boolean default false,
  agreed_photo_release boolean default false,
  status text default 'registered',
  jersey_number integer,
  donated boolean default false,
  created_at timestamptz default now(),
  constraint registrants_status_check check (status in ('registered', 'made_team', 'not_made_team'))
);

-- Indexes for faster lookups
create index if not exists idx_registrants_status on registrants(status);
create index if not exists idx_registrants_email on registrants(email);
create index if not exists idx_registrants_created on registrants(created_at desc);

-- ROW LEVEL SECURITY
alter table settings enable row level security;
alter table admin_users enable row level security;
alter table registrants enable row level security;

-- Allow public to read settings (needed to check if registration is open)
create policy "Public can read settings" on settings
  for select using (true);

-- Allow public to insert registrants (registration form)
create policy "Public can insert registrants" on registrants
  for insert with check (true);

-- BLOG AUTHORS TABLE
create table if not exists blog_authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  username text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- BLOG POSTS TABLE
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  cover_image_url text,
  author_id uuid references blog_authors(id) on delete set null,
  author_name text not null,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_blog_posts_slug on blog_posts(slug);
create index if not exists idx_blog_posts_published on blog_posts(published, published_at desc);

alter table blog_authors enable row level security;
alter table blog_posts enable row level security;

create policy "Public can read published posts" on blog_posts
  for select using (published = true);
