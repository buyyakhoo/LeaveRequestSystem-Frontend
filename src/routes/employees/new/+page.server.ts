import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { AUTH_COOKIE } from '$lib/auth'
import { API_BASE } from '$env/static/private'

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'manager' && locals.user.role !== 'admin') {
    redirect(302, '/')
  }

  // Fetch fresh profile to get department info (cookie may not have it yet)
  const token = cookies.get(AUTH_COOKIE)
  let department: { id: number; name: string } | null = null
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const profile = await res.json() as { departments?: { id: number; name: string } | null }
      department = profile.departments ?? null
    }
  } catch { /* silently ignore — form still works, dept field just shows "ไม่ทราบ" */ }

  return { user: locals.user, department }
}

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const token = cookies.get(AUTH_COOKIE)
    const form = await request.formData()

    const firstName = (form.get('firstName') as string)?.trim()
    const lastName = (form.get('lastName') as string)?.trim()
    const email = (form.get('email') as string)?.trim()
    const password = form.get('password') as string
    const employeeCode = (form.get('employeeCode') as string)?.trim() || undefined

    if (!firstName || !lastName || !email || !password) {
      return fail(400, { error: 'กรุณากรอกข้อมูลให้ครบถ้วน', details: undefined, firstName, lastName, email, employeeCode })
    }

    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName, email, password, employeeCode }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>
      if (res.status === 409) {
        const msg = (body.error as string) ?? 'ข้อมูลนี้มีในระบบแล้ว'
        return fail(409, { error: msg, details: undefined, firstName, lastName, email, employeeCode })
      }
      if (res.status === 400 && body.details) {
        return fail(400, {
          error: 'รหัสผ่านไม่ผ่านนโยบายความปลอดภัย',
          details: body.details as string[],
          firstName, lastName, email, employeeCode,
        })
      }
      return fail(500, { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่', details: undefined, firstName, lastName, email, employeeCode })
    }

    return { success: true }
  },
}
