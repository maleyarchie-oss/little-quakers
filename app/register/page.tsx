export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import RegistrationForm from '@/components/registration/RegistrationForm'
import HeaderServer from '@/components/ui/HeaderServer'
import Footer from '@/components/ui/Footer'
import Link from 'next/link'

async function getSettings() {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('registration_open, stripe_link, tryout_date, tryout_time, tryout_location')
    .single()
  return data
}

export default async function RegisterPage() {
  const settings = await getSettings()

  if (!settings?.registration_open) {
    return (
      <div className="flex flex-col min-h-screen">
        <HeaderServer />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="card max-w-md w-full text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl font-black mb-3">Registration Closed</h1>
            <p className="text-gray-500 mb-6">
              Tryout registration is not currently open. Check back soon for updates!
            </p>
            <Link href="/" className="btn-black">Return Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return <RegistrationForm stripeLink={settings.stripe_link || ''} />
}
