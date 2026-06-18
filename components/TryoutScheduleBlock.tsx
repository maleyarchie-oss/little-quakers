import { TRYOUT_SESSIONS, TRYOUT_TIME, TRYOUT_LOCATION } from '@/lib/tryout-info'

type Variant = 'light' | 'dark'

// Compact tryout schedule block reused across the public site.
// Renders the three sessions + time + location in a consistent format.
export default function TryoutScheduleBlock({
  variant = 'light',
  className = '',
}: {
  variant?: Variant
  className?: string
}) {
  const isDark = variant === 'dark'
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'
  const labelColor = isDark ? 'text-[#B8962A]' : 'text-[#B8962A]'
  const dayColor = isDark ? 'text-gray-300' : 'text-gray-500'
  const dateColor = isDark ? 'text-white' : 'text-gray-900'
  const footerLabelColor = isDark ? 'text-[#B8962A]' : 'text-[#B8962A]'
  const footerValueColor = isDark ? 'text-gray-200' : 'text-gray-700'

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {TRYOUT_SESSIONS.map(s => (
          <div
            key={s.label}
            className={`rounded-xl border px-5 py-4 ${cardBg}`}
          >
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${labelColor}`}>
              {s.label}
            </p>
            <p className={`text-sm font-semibold ${dayColor}`}>{s.day}</p>
            <p className={`text-2xl md:text-3xl font-black ${dateColor}`}>{s.date}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${footerLabelColor}`}>
            Time
          </p>
          <p className={`font-semibold ${footerValueColor}`}>
            {TRYOUT_TIME} (all three nights)
          </p>
        </div>
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${footerLabelColor}`}>
            Location
          </p>
          <p className={`font-semibold ${footerValueColor}`}>
            {TRYOUT_LOCATION.name}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {TRYOUT_LOCATION.street} · {TRYOUT_LOCATION.city}, {TRYOUT_LOCATION.state}
          </p>
        </div>
      </div>
    </div>
  )
}
