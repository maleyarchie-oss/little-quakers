'use client'

import { FormData } from './RegistrationForm'

interface Props {
  data: FormData
  update: (fields: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
]

const ZIP_RE = /^\d{5}(-\d{4})?$/

export default function Step2CaregiverInfo({ data, update, onNext, onBack }: Props) {
  const validate = () => {
    const required: (keyof FormData)[] = [
      'caregiver_first_name', 'caregiver_last_name', 'email', 'phone',
      'street_address', 'city', 'state', 'zip_code',
    ]
    if (!required.every(k => String(data[k] || '').trim() !== '')) return false
    if (!ZIP_RE.test(data.zip_code.trim())) return false
    return true
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-black mb-1">Caregiver Information</h2>
      <p className="text-gray-500 mb-6 text-sm">All fields are required (apt/unit is optional).</p>

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

        {/* ───── Address block ───── */}
        <div className="sm:col-span-2">
          <label className="form-label">Street Address</label>
          <input className="form-input" value={data.street_address}
            onChange={e => update({ street_address: e.target.value })}
            placeholder="123 Main Street" autoComplete="address-line1" />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Apt / Unit <span className="text-gray-400 font-normal">(optional)</span></label>
          <input className="form-input" value={data.apt_unit}
            onChange={e => update({ apt_unit: e.target.value })}
            placeholder="Apt 4B" autoComplete="address-line2" />
        </div>
        <div>
          <label className="form-label">City</label>
          <input className="form-input" value={data.city}
            onChange={e => update({ city: e.target.value })}
            placeholder="Philadelphia" autoComplete="address-level2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">State</label>
            <select className="form-input" value={data.state}
              onChange={e => update({ state: e.target.value })}
              autoComplete="address-level1">
              {US_STATES.map(s => (
                <option key={s.code} value={s.code}>{s.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">ZIP</label>
            <input className="form-input" value={data.zip_code}
              onChange={e => update({ zip_code: e.target.value })}
              placeholder="19103" autoComplete="postal-code" maxLength={10} />
          </div>
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
