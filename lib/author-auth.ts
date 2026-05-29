import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'little-quakers-secret-change-me')
const COOKIE_NAME = 'lq_author_session'

export async function createAuthorSession(authorId: string, authorName: string) {
  return new SignJWT({ authorId, authorName })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(SECRET)
}

export async function verifyAuthorSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { authorId: string; authorName: string }
  } catch {
    return null
  }
}

export async function getAuthorSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAuthorSession(token)
}

export async function setAuthorSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
    path: '/',
  })
}

export async function clearAuthorSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
