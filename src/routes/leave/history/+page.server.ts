import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { API_BASE } from '$env/static/private'
import type { LeaveRequest } from '../../+page.server'

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'user') redirect(302, '/')

  const res = await fetch(`${API_BASE}/leaves`, {
    headers: { Authorization: `Bearer ${locals.token}` },
  })

  const leaves: LeaveRequest[] = res.ok
    ? ((await res.json()) as { data: LeaveRequest[] }).data
    : []

  return { user: locals.user, leaves }
}
