-- 004-golf-registration-toggle.sql
-- Adds a toggle PJ can flip to close the Golf Outing registration page
-- out of season (currently needs: closed after Oct 2026 outing until
-- summer 2027 when the next year's outing goes live).

alter table settings
  add column if not exists golf_registration_open boolean not null default true;

-- Explicitly flip to CLOSED now since the 2026 outing has passed.
update settings set golf_registration_open = false;
