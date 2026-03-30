import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { API_BASE } from '$env/static/private'

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'manager' && locals.user.role !== 'admin') redirect(302, '/')

  const [empRes, deptRes] = await Promise.all([
    fetch(`${API_BASE}/employees/${params.id}`, {
      headers: { Authorization: `Bearer ${locals.token}` },
    }),
    fetch(`${API_BASE}/departments`),
  ])

  if (empRes.status === 403) redirect(302, '/employees')
  if (!empRes.ok) redirect(302, '/employees')

  const employee = await empRes.json() as {
    id: string
    employee_code: string | null
    email: string
    first_name: string
    last_name: string
    role: string
    status: string
    departments: { id: number; name: string } | null
  }

  const departments: { id: number; name: string }[] = deptRes.ok
    ? ((await deptRes.json()) as { data: { id: number; name: string }[] }).data
    : []

  return { user: locals.user, employee, departments }
}

export const actions: Actions = {
  default: async ({ params, request, locals, fetch }) => {
    const fd = await request.formData()
    const employeeCode = (fd.get('employeeCode') as string)?.trim() || null
    const departmentId = fd.get('departmentId') ? Number(fd.get('departmentId')) : null

    const body: Record<string, unknown> = {}
    if (employeeCode) body.employeeCode = employeeCode
    if (departmentId) body.departmentId = departmentId

    if (Object.keys(body).length === 0) {
      return fail(400, { error: 'ไม่มีข้อมูลที่ต้องการแก้ไข', employeeCode: '', departmentId: '' })
    }

    const res = await fetch(`${API_BASE}/employees/${params.id}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${locals.token}`,
      },
      body: JSON.stringify(body),
    })

    if (res.ok) redirect(302, '/')

    let errorMsg = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
    try {
      const json = await res.json() as { error?: string }
      if (json.error) errorMsg = json.error
    } catch { /* ignore */ }

    return fail(res.status, { error: errorMsg, employeeCode, departmentId: String(departmentId ?? '') })
  },
}
