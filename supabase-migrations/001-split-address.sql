-- Migration 001: split home_address into structured fields
-- Run in Supabase SQL Editor.
--
-- Pre-conditions:
--   - Existing registrants have been deleted (only 5 test rows, expendable)
--   - If real data exists, this migration will silently lose it. Confirm before running.

-- 1) Add the new columns (nullable for the rollout, then enforce NOT NULL after)
alter table registrants
  add column if not exists street_address text,
  add column if not exists apt_unit text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip_code text;

-- 2) Drop the legacy combined-address column
alter table registrants drop column if exists home_address;

-- 3) Enforce NOT NULL on the required parts (skip apt_unit — it's optional)
alter table registrants alter column street_address set not null;
alter table registrants alter column city set not null;
alter table registrants alter column state set not null;
alter table registrants alter column zip_code set not null;
