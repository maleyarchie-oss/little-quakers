'use client'

import { FormData } from './RegistrationForm'

const POSITIONS = [
  'Quarterback', 'Running Back', 'Wide Receiver', 'Tight End',
  'Offensive Lineman', 'Defensive Lineman', 'Linebacker',
  'Cornerback', 'Safety', 'Kicker', 'Punter', 'Long Snapper',
]

const GRADES = ['5th', '6th', '7th', '8th']

interface Props {
  data: FormData
  update: (fields: Partial<FormData>) => void
  onNext: () => void
}

export default function Step1PlayerInfo({ data, update, onNext }: Props) {
  const validate = () => {
    const required: (keyof FormData)[] = [
      'player_first_name', 'player_last_name', 'birth_date', 'height', 'weight',
      'current_school', 'grade', 'current_coach_name', 'current_coach_email', 'position_desired',
    ]
    return required.every(k => String(data[k] || '').trim() !== '')
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-black mb-1">Player Information</h2>
      <p className="text-gray-500 mb-6 text-sm">All fields are required.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="form-label">Player First Name</label>
          <input className="form-input" value={data.player_first_name}
            onChange={e => update({ player_first_name: e.target.value })} placeholder="First name" />
        </div>
        <div>
          <label className="form-label">Player Last Name</label>
          <input className="form-input" value={data.player_last_name}
            onChange={e => update({ player_last_name: e.target.value })} placeholder="Last name" />
        </div>
        <div>
          <label className="form-label">Date of Birth</label>
          <input type="date" className="form-input" value={data.birth_date}
            onChange={e => update({ birth_date: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Position Desired</label>
          <select className="form-input" value={data.position_desired}
            onChange={e => update({ position_desired: e.target.value })}>
            <option value="">Select a position…</option>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Height (e.g. 5&apos;8&quot;)</label>
          <input className="form-input" value={data.height}
            onChange={e => update({ height: e.target.value })} placeholder="5'8&quot;" />
        </div>
        <div>
          <label className="form-label">Weight (lbs)</label>
          <input type="number" className="form-input" value={data.weight}
            onChange={e => update({ weight: e.target.value })} placeholder="145" />
        </div>
        <div>
          <label className="form-label">Current School</label>
          <input className="form-input" value={data.current_school}
            onChange={e => update({ current_school: e.target.value })} placeholder="School name" />
        </div>
        <div>
          <label className="form-label">Grade Going Into This Fall</label>
          <select className="form-input" value={data.grade}
            onChange={e => update({ grade: e.target.value })}>
            <option value="">Select grade…</option>
            {GRADES.map(g => <option key={g} value={g}>{g} Grade</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Current Football Coach Name</label>
          <input className="form-input" value={data.current_coach_name}
            onChange={e => update({ current_coach_name: e.target.value })} placeholder="Coach name" />
        </div>
        <div>
          <label className="form-label">Current Football Coach Email</label>
          <input type="email" className="form-input" value={data.current_coach_email}
            onChange={e => update({ current_coach_email: e.target.value })} placeholder="coach@example.com" />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          className="btn-primary"
          disabled={!validate()}
          onClick={onNext}
          style={{ opacity: validate() ? 1 : 0.5 }}
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}
