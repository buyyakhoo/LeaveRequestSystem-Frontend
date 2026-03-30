import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { decodeToken, AUTH_COOKIE } from '$lib/auth'
import { exchangeCodeApi } from '$lib/server/api'

export const load: PageServerLoad = async ({ url, cookies, fetch }) => {
  const code = url.searchParams.get('code')

  if (!code) {
    redirect(302, '/auth?error=invalid_token')
  }

  let token: string

  try {
    const result = await exchangeCodeApi(code, fetch)
    token = result.token
  } catch {
    redirect(302, '/auth?error=server_error')
  }

  const payload = decodeToken(token!)
  if (!payload) redirect(302, '/auth?error=invalid_token')

  const maxAge = payload.exp - Math.floor(Date.now() / 1000)

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }

  cookies.set(AUTH_COOKIE, token!, cookieOpts)

  return {}
}
