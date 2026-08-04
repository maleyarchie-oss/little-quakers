'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Step1PlayerInfo from './Step1PlayerInfo'
import Step2CaregiverInfo from './Step2CaregiverInfo'
import Step3Documents from './Step3Documents'
import Step4Legal from './Step4Legal'
import Step5Donation from './Step5Donation'
import Logo from '@/components/ui/Logo'

export interface FormData {
  // Player
  player_first_name: string
  player_last_name: string
  birth_date: string
  height: string
  weight: string
  current_school: string
  grade: string
  current_coach_name: string
  current_coach_email: string
  position_desired: string
  // Caregiver
  caregiver_first_name: string
  caregiver_last_name: string
  email: string
  phone: string
  street_address: string
  apt_unit: string
  city: string
  state: string
  zip_code: string
  // Documents
  birth_certificate: File | null
  report_card: File | null
  // Legal
  agreed_code_of_conduct: boolean
  agreed_medical_release: boolean
  agreed_photo_release: boolean
}

const INITIAL: FormData = {
  player_first_name: '', player_last_name: '', birth_date: '', height: '', weight: '',
  current_school: '', grade: '', current_coach_name: '', current_coach_email: '',
  position_desired: '', caregiver_first_name: '', caregiver_last_name: '',
  email: '', phone: '',
  street_address: '', apt_unit: '', city: '', state: 'PA', zip_code: '',
  birth_certificate: null, report_card: null,
  agreed_code_of_conduct: false, agreed_medical_release: false, agreed_photo_release: false,
}

const STEPS = ['Player Info', 'Caregiver Info', 'Documents', 'Legal', 'Donation']

export default function RegistrationForm({ stripeLink }: { stripeLink: string }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const update = (fields: Partial<FormData>) => setData(d => ({ ...d, ...fields }))

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const submit = async (donated: boolean) => {
    setSubmitting(true)
    setError('')
    try {
      const form = new FormData()

      // Compress large image uploads before sending so we stay under
      // Vercel's serverless payload cap and don't waste bandwidth.
      for (const [k, v] of Object.entries(data)) {
        if (v instanceof File) {
          const compressed = await maybeCompressImage(v)
          form.append(k, compressed)
        } else if (v !== null && v !== undefined) {
          form.append(k, String(v))
        }
      }
      form.append('donated', String(donated))

      const res = await fetch('/api/register', { method: 'POST', body: form })

      // Response might be JSON (our API) or plain HTML/text (Vercel platform
      // error before it reached us, e.g. "Request Entity Too Large"). Read as
      // text first, try JSON, fall back to a friendly summary.
      const raw = await res.text()
      let apiError = ''
      try {
        const json = raw ? JSON.parse(raw) : {}
        apiError = json.error || ''
      } catch {
        // Not JSON — likely a platform-level error.
        if (res.status === 413) {
          apiError = 'Your uploaded files are too large. Please retake the photos or use smaller files (under 4 MB each).'
        } else if (res.status >= 500) {
          apiError = 'The server had an error. Please try again in a moment.'
        } else if (res.status === 403) {
          apiError = 'Registration is not open at this time.'
        } else {
          apiError = 'We could not complete your registration. Please try again.'
        }
      }

      if (!res.ok) throw new Error(apiError || 'Registration failed')
      router.push('/thank-you')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      setError(msg)
      setSubmitting(false)
    }
  }

  // Downscale + re-encode large images before upload. HEIC/other formats the
  // browser can't decode pass through untouched.
  async function maybeCompressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) return file
    if (file.size < 1_500_000) return file // already small; leave it alone

    try {
      const bitmap = await createImageBitmap(file)
      const maxDim = 2000
      let { width, height } = bitmap
      const scale = Math.min(1, maxDim / Math.max(width, height))
      width = Math.round(width * scale)
      height = Math.round(height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return file
      ctx.drawImage(bitmap, 0, 0, width, height)

      const blob: Blob | null = await new Promise(resolve =>
        canvas.toBlob(resolve, 'image/jpeg', 0.85)
      )
      if (!blob) return file

      // Only substitute if we actually made it smaller.
      if (blob.size >= file.size) return file

      const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
      return new File([blob], newName, { type: 'image/jpeg' })
    } catch {
      // HEIC, corrupt, or unsupported — send original and let server sort it out.
      return file
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      {/* Header */}
      <div className="bg-[#0A0A0A] text-white py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Logo size="sm" />
          <div>
            <p className="text-[#B8962A] font-black text-base tracking-wide">PHILADELPHIA LITTLE QUAKERS</p>
            <p className="text-gray-400 text-sm">Tryout Registration</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-0">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i < step ? 'bg-[#B8962A] text-white' :
                    i === step ? 'bg-[#0A0A0A] text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-[#0A0A0A]' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded ${i < step ? 'bg-[#B8962A]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {step === 0 && <Step1PlayerInfo data={data} update={update} onNext={next} />}
        {step === 1 && <Step2CaregiverInfo data={data} update={update} onNext={next} onBack={back} />}
        {step === 2 && <Step3Documents data={data} update={update} onNext={next} onBack={back} />}
        {step === 3 && <Step4Legal data={data} update={update} onNext={next} onBack={back} />}
        {step === 4 && (
          <Step5Donation
            stripeLink={stripeLink}
            onDonate={() => submit(true)}
            onDecline={() => submit(false)}
            onBack={back}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  )
}
