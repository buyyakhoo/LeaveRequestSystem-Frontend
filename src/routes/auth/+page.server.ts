import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { loginApi, decodeToken, AUTH_COOKIE, USER_COOKIE } from '$lib/auth'

export const load: PageServerLoad = ({ locals }) => {
  if (locals.user) redirect(302, '/')
  return {}
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData()
    const email = data.get('email') as string
    const password = data.get('password') as string

    let token: string
    let user: Awaited<ReturnType<typeof loginApi>>['user']

    try {
      const result = await loginApi(email, password)
      token = result.token
      user = result.user
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
    cookies.set(USER_COOKIE, Buffer.from(JSON.stringify(user)).toString('base64'), cookieOpts)

    redirect(302, '/')
  },
}
