'use client'

import { FormData } from './RegistrationForm'

interface Props {
  data: FormData
  update: (fields: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2CaregiverInfo({ data, update, onNext, onBack }: Props) {
  const validate = () => {
    const required: (keyof FormData)[] = ['caregiver_first_name', 'caregiver_last_name', 'email', 'phone', 'home_address']
    return required.every(k => String(data[k] || '').trim() !== '')
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-black mb-1">Caregiver Information</h2>
      <p className="text-gray-500 mb-6 text-sm">All fields are required.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="form-label">Caregiver First Name</label>
          <input className="form-input" value={data.caregiver_first_name}
            onChange={e => update({ caregiver_first_name: e.target.value })} placeholder="First name" />
        </div>
        <div>
          <label className="form-label">Caregiver Last Name</label>
          <input className="form-input" value={data.caregiver_last_name}
            onChange={e => update({ caregiver_last_name: e.target.value })} placeholder="Last name" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" value={data.email}
            onChange={e => update({ email: e.target.value })} placeholder="your@email.com" />
        </div>
        <div>
          <label className="form-label">Phone Number</label>
          <input type="tel" className="form-input" value={data.phone}
            onChange={e => update({ phone: e.target.value })} placeholder="(215) 555-0000" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Home Address</label>
          <textarea className="form-input" rows={3} value={data.home_address}
            onChange={e => update({ home_address: e.target.value })} placeholder="Street, City, State, ZIP" />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
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
