import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Existing admin connectivity check
  const { data, error, count } = await supabaseAdmin
    .from('admin_users')
    .select('id, name, username', { count: 'exact' })

  // TEMP DIAGNOSTIC: probe the registrants table to see which columns exist
  // and surface the actual db error if an insert fails.
  let registrantsProbe: Record<string, unknown> = {}
  try {
    const { data: oneRow, error: probeErr } = await supabaseAdmin
      .from('registrants')
      .select('*')
      .limit(1)
    registrantsProbe = {
      probe_ok: !probeErr,
      probe_error: probeErr?.message || null,
      sample_columns: oneRow && oneRow[0] ? Object.keys(oneRow[0]) : [],
    }
  } catch (e) {
    registrantsProbe = { probe_threw: e instanceof Error ? e.message : String(e) }
  }

  // TEMP DIAGNOSTIC: count rows + show street_address null status for cleanup planning
  let cleanup: Record<string, unknown> = {}
  try {
    const { count: totalCount } = await supabaseAdmin
      .from('registrants')
      .select('*', { count: 'exact', head: true })
    // The column may or may not exist depending on partial migration state.
    // Just dump the two existing rows in full so PJ can decide.
    const { data: allRows, error: allErr } = await supabaseAdmin
      .from('registrants')
      .select('*')
      .order('created_at', { ascending: true })
    cleanup = {
      total_rows: totalCount,
      all_rows: allRows || [],
      query_error: allErr?.message || null,
    }
  } catch (e) {
    cleanup = { cleanup_threw: e instanceof Error ? e.message : String(e) }
  }

  // TEMP DIAGNOSTIC: attempt the exact insert the registration form does
  let insertProbe: Record<string, unknown> = {}
  try {
    const { error: insertErr } = await supabaseAdmin
      .from('registrants')
      .insert({
        player_first_name: 'DIAGNOSTIC',
        player_last_name: 'TEST',
        birth_date: '2015-01-01',
        email: 'diagnostic@test.invalid',
        street_address: '123 Diagnostic',
        apt_unit: null,
        city: 'Phila',
        state: 'PA',
        zip_code: '19103',
        phone: '2155550000',
        height: "5'5",
        weight: '130',
        current_school: 'Diag',
        grade: '8th',
        current_coach_name: 'Coach',
        current_coach_email: 'coach@test.invalid',
        position_desired: 'Quarterback',
        caregiver_first_name: 'Parent',
        caregiver_last_name: 'Diag',
        agreed_code_of_conduct: true,
        agreed_medical_release: true,
        agreed_photo_release: true,
        status: 'registered',
        donated: false,
      })
      .select('id')
      .single()
    insertProbe = {
      insert_ok: !insertErr,
      insert_error: insertErr
        ? { code: insertErr.code, message: insertErr.message, details: insertErr.details, hint: insertErr.hint }
        : null,
    }
    // Clean up the diagnostic row if it actually got in
    if (!insertErr) {
      await supabaseAdmin.from('registrants').delete().eq('email', 'diagnostic@test.invalid')
      insertProbe.cleaned_up = true
    }
  } catch (e) {
    insertProbe = { insert_threw: e instanceof Error ? e.message : String(e) }
  }

  return NextResponse.json({
    connected: !error,
    error: error?.message || null,
    count,
    users: data?.map(u => ({ id: u.id, name: u.name, username: u.username })) || [],
    url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    diagnostics: { registrants: registrantsProbe, registrants_insert: insertProbe, cleanup_state: cleanup },
  })
}
