import { redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { env } from '$env/dynamic/private'
import type { LeaveRequest } from '$lib/types'

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'manager' && locals.user.role !== 'admin') redirect(302, '/')

  const res = await fetch(`${env.API_BASE}/leaves?status=pending`, {
    headers: { Authorization: `Bearer ${locals.token}` },
  })

  const pendingLeaves: LeaveRequest[] = res.ok
    ? ((await res.json()) as { data: LeaveRequest[] }).data
    : []

  return { user: locals.user, pendingLeaves }
}

export const actions: Actions = {
  approve: async ({ request, locals, fetch }) => {
    const fd = await request.formData()
    const id = fd.get('id') as string
    await fetch(`${env.API_BASE}/leaves/${id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${locals.token}` },
    })
  },

  reject: async ({ request, locals, fetch }) => {
    const fd = await request.formData()
    const id = fd.get('id') as string
    await fetch(`${env.API_BASE}/leaves/${id}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${locals.token}` },
    })
  },
}
