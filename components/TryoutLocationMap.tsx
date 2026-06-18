import { TRYOUT_LOCATION } from '@/lib/tryout-info'

// Interactive Google Maps embed for the tryout location.
// Pure server-rendered iframe — no API key needed for the public `output=embed`
// flavor.
export default function TryoutLocationMap({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 ${className}`}>
      <iframe
        src={TRYOUT_LOCATION.embedUrl}
        width="100%"
        height="320"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map of ${TRYOUT_LOCATION.name}`}
      />
      <div className="bg-white px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-bold text-gray-900">{TRYOUT_LOCATION.name}</p>
          <p className="text-sm text-gray-500">
            {TRYOUT_LOCATION.street} · {TRYOUT_LOCATION.city}, {TRYOUT_LOCATION.state} {TRYOUT_LOCATION.zip}
          </p>
        </div>
        <a
          href={TRYOUT_LOCATION.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-[#B8962A] hover:bg-[#8B7020] text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shrink-0"
        >
          Get Directions
        </a>
      </div>
    </div>
  )
}
