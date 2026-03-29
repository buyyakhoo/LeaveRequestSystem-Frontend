import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { decodeToken, isTokenValid, AUTH_COOKIE, USER_COOKIE } from '$lib/auth'
import { getMeApi } from '$lib/server/api'

export const load: PageServerLoad = async ({ url, cookies, fetch }) => {
  const token = url.searchParams.get('token')

  if (!token || !isTokenValid(token)) {
    redirect(302, '/auth?error=invalid_token')
  }

  const payload = decodeToken(token!)!
  const maxAge = payload.exp - Math.floor(Date.now() / 1000)

  let user
  try {
    user = await getMeApi(token!, fetch)
  } catch (err) {
    console.error('[/auth/callback] getMeApi failed:', err)
    redirect(302, '/auth?error=server_error')
  }

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }

  cookies.set(AUTH_COOKIE, token!, cookieOpts)
  cookies.set(USER_COOKIE, Buffer.from(JSON.stringify(user)).toString('base64'), cookieOpts)

  // Don't redirect here — let the page render first so cookies are included
  // in the page response. Client-side goto('/') then navigates as same-origin.
  return {}
}
