'use client'

interface Props {
  stripeLink: string
  onDonate: () => void
  onDecline: () => void
  onBack: () => void
  submitting: boolean
}

export default function Step5Donation({ stripeLink, onDonate, onDecline, onBack, submitting }: Props) {
  const handleDonate = () => {
    onDonate()
    if (stripeLink) {
      setTimeout(() => {
        window.open(stripeLink, '_blank', 'noopener,noreferrer')
      }, 500)
    }
  }

  return (
    <div className="card text-center">
      <div className="text-5xl mb-4">🏈</div>
      <h2 className="text-2xl font-black mb-3">Support the Little Quakers</h2>
      <p className="text-gray-600 mb-2 text-base max-w-md mx-auto">
        Your registration is almost complete! Would you like to make a donation to help support the Philadelphia Little Quakers Football Program?
      </p>
      <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
        Donations help fund equipment, travel, and resources for our student-athletes.
      </p>

      <div className="bg-[#B8962A]/10 border border-[#B8962A]/30 rounded-xl p-5 mb-8 max-w-sm mx-auto">
        <p className="text-[#B8962A] font-bold text-sm">Every dollar makes a difference for our kids.</p>
      </div>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <button
          className="btn-primary text-xl py-5 w-full"
          onClick={handleDonate}
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Donate Now 🙌'}
        </button>
        <button
          className="btn-secondary w-full"
          onClick={onDecline}
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'No thank you'}
        </button>
      </div>

      <div className="mt-6">
        <button className="text-gray-400 text-sm underline" onClick={onBack}>← Go Back</button>
      </div>
    </div>
  )
}
