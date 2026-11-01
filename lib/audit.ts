// Shared logger for registrant status changes.
// Every endpoint that writes a registrants.status column should call this
// so we never have mystery promotions/demotions again.

import { supabaseAdmin } from './supabase'

export type StatusChangeSource =
  | 'team_selection_save'
  | 'registrants_create'
  | 'registrants_edit'
  | 'public_registration'
  | 'manual_sql'
  | 'unknown'

export interface StatusChangeInput {
  registrantId: string
  playerName: string         // denormalized snapshot
  fromStatus: string | null  // null on first insert
  toStatus: string
  changedBy: string          // admin username, or 'public_registration' / 'system'
  source: StatusChangeSource
  note?: string
}

export async function logStatusChange(input: StatusChangeInput): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('registrant_status_log').insert({
      registrant_id: input.registrantId,
      player_name: input.playerName,
      from_status: input.fromStatus,
      to_status: input.toStatus,
      changed_by: input.changedBy,
      source: input.source,
      note: input.note || null,
    })
    if (error) console.error('[audit] logStatusChange failed:', error.message)
  } catch (e) {
    // Audit failures should NEVER block the real status change
    console.error('[audit] logStatusChange threw:', e)
  }
}

// Batch helper for team-selection save where many registrants change at once
export async function logStatusChangeBatch(
  rows: StatusChangeInput[],
): Promise<void> {
  if (rows.length === 0) return
  try {
    const { error } = await supabaseAdmin.from('registrant_status_log').insert(
      rows.map(r => ({
        registrant_id: r.registrantId,
        player_name: r.playerName,
        from_status: r.fromStatus,
        to_status: r.toStatus,
        changed_by: r.changedBy,
        source: r.source,
        note: r.note || null,
      })),
    )
    if (error) console.error('[audit] logStatusChangeBatch failed:', error.message)
  } catch (e) {
    console.error('[audit] logStatusChangeBatch threw:', e)
  }
}
