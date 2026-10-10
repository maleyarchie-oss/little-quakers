-- 003-email-groups.sql
-- Email distribution groups for team communications.
-- Groups are named lists of (name, email) contacts. Used as BCC targets on
-- team-selection emails and broadcasts.

create table if not exists email_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists email_group_contacts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references email_groups(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists email_group_contacts_group_id_idx on email_group_contacts(group_id);
create unique index if not exists email_group_contacts_group_email_uniq on email_group_contacts(group_id, lower(email));

-- Admin-only access. We check admin status in the API layer via getSession(),
-- so RLS is enabled with no policies (service role bypasses it).
alter table email_groups enable row level security;
alter table email_group_contacts enable row level security;
