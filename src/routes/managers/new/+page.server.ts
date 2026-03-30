import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { API_BASE } from '$env/static/private'

interface Department {
  id: number
  name: string
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'admin') redirect(302, '/')

  const res = await fetch(`${API_BASE}/departments`)
  const departments: Department[] = res.ok
    ? ((await res.json()) as { data: Department[] }).data
    : []

  return { user: locals.user, departments }
}

export const actions: Actions = {
  default: async ({ request, locals, fetch }) => {
    const fd = await request.formData()

    const firstName = fd.get('firstName') as string
    const lastName = fd.get('lastName') as string
    const email = fd.get('email') as string
    const employeeCode = (fd.get('employeeCode') as string).trim()
    const departmentId = fd.get('departmentId') as string
    const password = fd.get('password') as string

    if (!firstName || !lastName || !email || !departmentId || !password) {
      return fail(400, {
        success: false as const,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
        firstName, lastName, email, employeeCode, departmentId,
      })
    }

    const body: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      password,
      role: 'manager',
      departmentId: Number(departmentId),
    }
    if (employeeCode) body.employeeCode = employeeCode

    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${locals.token}`,
      },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      return { success: true as const }
    }

    let errorMsg = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    try {
      const json = await res.json() as { error?: string }
      if (json.error) errorMsg = json.error
    } catch { /* ignore */ }

    return fail(res.status, {
      success: false as const,
      error: errorMsg,
      firstName, lastName, email, employeeCode, departmentId,
    })
  },
}
