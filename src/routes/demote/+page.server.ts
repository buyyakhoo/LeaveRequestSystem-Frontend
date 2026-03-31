import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import type { Employee } from '../+page.server'

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'admin') redirect(302, '/')

  const res = await fetch(`${env.API_BASE}/employees`, {
    headers: { Authorization: `Bearer ${locals.token}` },
  })

  const all: Employee[] = res.ok
    ? ((await res.json()) as { data: Employee[] }).data
    : []

  // แสดงเฉพาะ manager + active
  const managers = all.filter(e => e.role === 'manager' && e.status === 'active')

  return { user: locals.user, managers }
}

export const actions: Actions = {
  demote: async ({ request, locals, fetch }) => {
    const fd = await request.formData()
    const id = fd.get('id') as string
    if (!id) return fail(400, { error: 'ไม่พบ ID พนักงาน', id: '' })

    const res = await fetch(`${env.API_BASE}/employees/${id}/demote`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${locals.token}` },
    })

    if (res.ok) return { success: true, id }

    let errorMsg = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
    try {
      const json = await res.json() as { error?: string }
      if (json.error) errorMsg = json.error
    } catch { /* ignore */ }

    return fail(res.status, { error: errorMsg, id })
  },
}

export {type Employee} from '../+page.server'