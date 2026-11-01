-- 005-status-audit-log.sql
-- Audit log for registrant status changes.
-- Captures WHO changed WHAT status WHEN, so no more mystery
-- promotions/demotions. First reason it exists: on 2026-11-01 we
-- couldn't tell how Jamil Albarran ended up as made_team.

create table if not exists registrant_status_log (
  id uuid primary key default gen_random_uuid(),
  registrant_id uuid not null references registrants(id) on delete cascade,
  player_name text not null, -- denormalized snapshot in case registrant row is later deleted
  from_status text,          -- null on first insert (new registrant)
  to_status text not null,
  changed_by text not null,  -- admin username, or 'public_registration' / 'system'
  changed_at timestamptz not null default now(),
  source text,               -- e.g. 'team_selection_save', 'registrants_create', 'manual_sql'
  note text                  -- freeform context, e.g. 'bulk via Save Roster'
);

create index if not exists registrant_status_log_registrant_idx on registrant_status_log(registrant_id);
create index if not exists registrant_status_log_changed_at_idx on registrant_status_log(changed_at desc);

-- Admin-only. RLS enabled, no policies (service role bypasses).
alter table registrant_status_log enable row level security;
