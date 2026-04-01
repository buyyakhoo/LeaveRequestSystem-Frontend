import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import type { Employee } from '$lib/types'

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'manager') redirect(302, '/')

  const res = await fetch(`${env.API_BASE}/employees`, {
    headers: { Authorization: `Bearer ${locals.token}` },
  })

  const all: Employee[] = res.ok
    ? ((await res.json()) as { data: Employee[] }).data
    : []

  const users = all.filter(e => e.role === 'user' && e.status === 'active')

  return { user: locals.user, users }
}

export const actions: Actions = {
  resign: async ({ request, locals, fetch }) => {
    const fd = await request.formData()
    const id = fd.get('id') as string
    if (!id) return fail(400, { error: 'ไม่พบ ID พนักงาน', id: '' })

    const res = await fetch(`${env.API_BASE}/employees/${id}/disable`, {
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

