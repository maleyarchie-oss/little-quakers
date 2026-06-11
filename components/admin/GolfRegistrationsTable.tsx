'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GolfRegistration, GolfStatus, GolfTier } from '@/types'

const TIER_LABEL: Record<GolfTier, string> = {
  individual: 'Individual',
  foursome: 'Foursome',
  hole_sponsor: 'Hole Sponsor',
  lq_legends: 'LQ Legends',
  levy_platinum: 'Levy Platinum',
}

const STATUS_STYLES: Record<GolfStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-600',
  refunded: 'bg-red-100 text-red-700',
}

const STATUS_LABEL: Record<GolfStatus, string> = {
  pending: 'Pending',
  paid: '✓ Paid',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export default function GolfRegistrationsTable({ rows }: { rows: GolfRegistration[] }) {
  const router = useRouter()
  const [items, setItems] = useState<GolfRegistration[]>(rows)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<'all' | GolfTier>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | GolfStatus>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<GolfRegistration | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const filtered = items.filter(r => {
    const haystack = `${r.first_name} ${r.last_name} ${r.email} ${r.sponsor_display_name ?? ''}`.toLowerCase()
    const matchesSearch = haystack.includes(search.toLowerCase())
    const matchesTier = tierFilter === 'all' || r.tier === tierFilter
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesTier && matchesStatus
  })

  async function patchStatus(r: GolfRegistration, status: GolfStatus) {
    setErrorMsg(null)
    setBusyId(r.id)
    try {
      const res = await fetch(`/api/admin/golf-registrations/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Update failed')
      }
      setItems(prev =>
        prev.map(x =>
          x.id === r.id
            ? {
                ...x,
                status,
                stripe_paid_at: status === 'paid' ? new Date().toISOString() : x.stripe_paid_at,
              }
            : x
        )
      )
      router.refresh()
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteRow(r: GolfRegistration) {
    setErrorMsg(null)
    setBusyId(r.id)
    try {
      const res = await fetch(`/api/admin/golf-registrations/${r.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Delete failed')
      }
      setItems(prev => prev.filter(x => x.id !== r.id))
      setConfirmDelete(null)
      router.refresh()
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  function exportCSV() {
    const headers = [
      'Created',
      'Tier',
      'Amount',
      'Status',
      'Paid At',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Sponsor Display Name',
      'Partner 1',
      'Partner 2',
      'Partner 3',
      'Notes',
    ]
    const csvRows = filtered.map(r => [
      new Date(r.created_at).toLocaleString(),
      TIER_LABEL[r.tier],
      r.amount,
      STATUS_LABEL[r.status].replace(/^[^A-Za-z]+/, ''),
      r.stripe_paid_at ? new Date(r.stripe_paid_at).toLocaleString() : '',
      r.first_name,
      r.last_name,
      r.email,
      r.phone,
      r.sponsor_display_name || '',
      r.partner1_name || '',
      r.partner2_name || '',
      r.partner3_name || '',
      r.notes || '',
    ])
    const csv = [headers, ...csvRows]
      .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `little-quakers-golf-registrations-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          className="form-input max-w-xs"
          placeholder="Search name, email, sponsor…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-input max-w-xs"
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value as 'all' | GolfTier)}
        >
          <option value="all">All Tiers</option>
          <option value="individual">Individual</option>
          <option value="foursome">Foursome</option>
          <option value="hole_sponsor">Hole Sponsor</option>
          <option value="lq_legends">LQ Legends</option>
          <option value="levy_platinum">Levy Platinum</option>
        </select>
        <select
          className="form-input max-w-xs"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | GolfStatus)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="btn-black py-3 px-5 text-sm" onClick={exportCSV}>
          ⬇ Export CSV
        </button>
      </div>

      {errorMsg && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Registrant', 'Tier', 'Amount', 'Foursome / Sponsor', 'Contact', 'Status', 'Registered', ''].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold">
                    {r.first_name} {r.last_name}
                  </p>
                  <p className="text-gray-400 text-xs">{r.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-700 font-medium">{TIER_LABEL[r.tier]}</td>
                <td className="px-4 py-3 text-gray-900 font-bold">${r.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {r.sponsor_display_name && (
                    <p>
                      <span className="text-gray-400">Sponsor:</span> {r.sponsor_display_name}
                    </p>
                  )}
                  {(r.partner1_name || r.partner2_name || r.partner3_name) && (
                    <p>
                      <span className="text-gray-400">Partners:</span>{' '}
                      {[r.partner1_name, r.partner2_name, r.partner3_name]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {r.notes && (
                    <p className="italic">
                      <span className="text-gray-400">Notes:</span> {r.notes}
                    </p>
                  )}
                  {!r.sponsor_display_name &&
                    !r.partner1_name &&
                    !r.partner2_name &&
                    !r.partner3_name &&
                    !r.notes && <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  <p>{r.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${STATUS_STYLES[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                  {r.stripe_paid_at && (
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(r.stripe_paid_at).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {r.status !== 'paid' && (
                    <button
                      onClick={() => patchStatus(r, 'paid')}
                      disabled={busyId === r.id}
                      className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline disabled:opacity-40 mr-3"
                    >
                      Mark Paid
                    </button>
                  )}
                  {r.status === 'paid' && (
                    <button
                      onClick={() => patchStatus(r, 'refunded')}
                      disabled={busyId === r.id}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-800 hover:underline disabled:opacity-40 mr-3"
                    >
                      Mark Refunded
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(r)}
                    disabled={busyId === r.id}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline disabled:opacity-40"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">No golf registrations found.</div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-black mb-2">Delete golf registration?</h2>
            <p className="text-gray-600 mb-6">
              Delete{' '}
              <strong>
                {confirmDelete.first_name} {confirmDelete.last_name}
              </strong>
              &apos;s {TIER_LABEL[confirmDelete.tier]} registration? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={busyId === confirmDelete.id}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRow(confirmDelete)}
                disabled={busyId === confirmDelete.id}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busyId === confirmDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
