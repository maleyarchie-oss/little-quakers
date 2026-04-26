'use client'

import { useState } from 'react'
import { FormData } from './RegistrationForm'

interface Props {
  data: FormData
  update: (fields: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

function FileUpload({
  label, hint, file, onFile
}: { label: string; hint: string; file: File | null; onFile: (f: File) => void }) {
  const [drag, setDrag] = useState(false)

  return (
    <div>
      <label className="form-label">{label}</label>
      <p className="text-gray-500 text-sm mb-2">{hint}</p>
      <label
        className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-colors ${
          drag ? 'border-[#B8962A] bg-[#B8962A]/5' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-[#B8962A]'
        }`}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => {
          e.preventDefault(); setDrag(false)
          const f = e.dataTransfer.files[0]
          if (f) onFile(f)
        }}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }}
        />
        {file ? (
          <div className="text-center">
            <div className="text-green-600 text-3xl mb-2">✓</div>
            <p className="font-semibold text-green-700">{file.name}</p>
            <p className="text-gray-500 text-sm mt-1">Click to replace</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-2">📎</div>
            <p className="font-semibold text-gray-700">Drop file here or click to upload</p>
            <p className="text-gray-400 text-sm mt-1">PDF, JPG, or PNG accepted</p>
          </div>
        )}
      </label>
    </div>
  )
}

export default function Step3Documents({ data, update, onNext, onBack }: Props) {
  const valid = !!data.birth_certificate && !!data.report_card

  return (
    <div className="card">
      <h2 className="text-2xl font-black mb-1">Required Documents</h2>
      <p className="text-gray-500 mb-6 text-sm">Both documents are required to complete registration.</p>

      <div className="flex flex-col gap-6">
        <FileUpload
          label="Birth Certificate"
          hint="Upload a photo or scan of the player's birth certificate."
          file={data.birth_certificate}
          onFile={f => update({ birth_certificate: f })}
        />
        <FileUpload
          label="Latest Report Card"
          hint="Upload the most recent report card. Academic eligibility is required."
          file={data.report_card}
          onFile={f => update({ report_card: f })}
        />
      </div>

      <div className="mt-8 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button
          className="btn-primary"
          disabled={!valid}
          onClick={onNext}
          style={{ opacity: valid ? 1 : 0.5 }}
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}
