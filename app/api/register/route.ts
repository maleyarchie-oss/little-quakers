import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendConfirmationEmail } from '@/lib/email'
import { uploadDocument } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()

    const get = (k: string) => form.get(k) as string | null
    const playerName = `${get('player_first_name')} ${get('player_last_name')}`

    const { data: settings } = await supabaseAdmin.from('settings').select('*').single()
    if (!settings?.registration_open) {
      return NextResponse.json({ error: 'Registration is currently closed.' }, { status: 403 })
    }

    // Upload documents to Supabase Storage
    let birthCertUrl = null
    let reportCardUrl = null

    const bcFile = form.get('birth_certificate') as File | null
    if (bcFile && bcFile.size > 0) {
      try {
        const buf = Buffer.from(await bcFile.arrayBuffer())
        birthCertUrl = await uploadDocument(buf, `${playerName} - Birth Certificate - ${bcFile.name}`, bcFile.type)
      } catch (e) {
        console.error('Birth cert upload failed:', e)
      }
    }

    const rcFile = form.get('report_card') as File | null
    if (rcFile && rcFile.size > 0) {
      try {
        const buf = Buffer.from(await rcFile.arrayBuffer())
        reportCardUrl = await uploadDocument(buf, `${playerName} - Report Card - ${rcFile.name}`, rcFile.type)
      } catch (e) {
        console.error('Report card upload failed:', e)
      }
    }

    const { error } = await supabaseAdmin.from('registrants').insert({
      player_first_name: get('player_first_name'),
      player_last_name: get('player_last_name'),
      birth_date: get('birth_date'),
      email: get('email'),
      home_address: get('home_address'),
      phone: get('phone'),
      height: get('height'),
      weight: get('weight'),
      current_school: get('current_school'),
      grade: get('grade'),
      current_coach_name: get('current_coach_name'),
      current_coach_email: get('current_coach_email'),
      position_desired: get('position_desired'),
      caregiver_first_name: get('caregiver_first_name'),
      caregiver_last_name: get('caregiver_last_name'),
      birth_certificate_url: birthCertUrl,
      report_card_url: reportCardUrl,
      agreed_code_of_conduct: get('agreed_code_of_conduct') === 'true',
      agreed_medical_release: get('agreed_medical_release') === 'true',
      agreed_photo_release: get('agreed_photo_release') === 'true',
      status: 'registered',
      donated: get('donated') === 'true',
    })

    if (error) {
      console.error('DB insert error:', error)
      return NextResponse.json({ error: 'Failed to save registration.' }, { status: 500 })
    }

    const email = get('email')
    if (email) {
      await sendConfirmationEmail(email, playerName, {
        date: settings.tryout_date || 'TBD',
        time: settings.tryout_time || 'TBD',
        location: settings.tryout_location || 'TBD',
      }).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Registration error:', e)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
