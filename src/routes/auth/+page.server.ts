import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { decodeToken, AUTH_COOKIE } from '$lib/auth'
import { loginApi } from '$lib/server/api'

const oauthErrorMessages: Record<string, string> = {
  not_employee: 'This Google account is not registered as an employee.',
  account_disabled: 'Your account has been disabled. Contact HR.',
  google_mismatch: 'This Google account does not match the one linked to your email.',
  oauth_denied: 'Google sign-in was cancelled.',
  invalid_callback: 'Invalid sign-in callback. Please try again.',
  invalid_state: 'Security check failed. Please try again.',
  invalid_token: 'Authentication failed. Please try again.',
  server_error: 'An error occurred. Please try again.',
}

export const load: PageServerLoad = ({ locals, url }) => {
  if (locals.user) redirect(302, '/')
  const errorKey = url.searchParams.get('error')
  return {
    oauthError: errorKey ? (oauthErrorMessages[errorKey] ?? oauthErrorMessages.server_error) : null,
  }
}

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const data = await request.formData()
    const email = data.get('email') as string
    const password = data.get('password') as string

    let token: string

    try {
      const result = await loginApi(email, password, fetch)
      token = result.token
    } catch (err) {
      return fail(400, {
        error: err instanceof Error ? err.message : 'Login failed',
        email,
      })
    }

    const payload = decodeToken(token)
    // maxAge = seconds until JWT expiry, fallback to 8 hours
    const maxAge = payload ? payload.exp - Math.floor(Date.now() / 1000) : 60 * 60 * 8

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge,
    }

    cookies.set(AUTH_COOKIE, token, cookieOpts)

    redirect(302, '/')
  },
}
