import { NextResponse } from 'next/server'
import { clearAuthorSessionCookie } from '@/lib/author-auth'

export async function POST() {
  await clearAuthorSessionCookie()
  return NextResponse.json({ success: true })
}
