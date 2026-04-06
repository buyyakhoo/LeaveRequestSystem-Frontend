import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { decodeToken, AUTH_COOKIE } from '$lib/auth'
import { loginApi } from '$lib/server/api'

const oauthErrorMessages: Record<string, string> = {
  not_employee: 'สิทธิ์การใช้งานของคุณไม่ถูกต้อง',
  account_disabled: 'บัญชีนี้ไม่สามารถเข้าใช้งานได้ในขณะนี้ โปรดติดต่อผู้ดูแลระบบ',
  google_mismatch: 'ข้อมูลบัญชีไม่ถูกต้อง',
  oauth_denied: 'การยืนยันตัวตนถูกยกเลิก โปรดลองอีกครั้ง',
  invalid_callback: 'เกิดข้อผิดพลาดในขั้นตอนการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง',
  invalid_state: 'เซสชันหมดอายุหรือเกิดข้อผิดพลาดด้านความปลอดภัย กรุณาลองใหม่อีกครั้ง',
  invalid_token: 'ข้อมูลการยืนยันตัวตนไม่ถูกต้อง',
  server_error: 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้งในภายหลัง',
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
