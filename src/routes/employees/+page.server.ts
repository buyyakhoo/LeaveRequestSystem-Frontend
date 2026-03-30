import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { API_BASE } from '$env/static/private'
import type { Employee } from '../+page.server'

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'manager' && locals.user.role !== 'admin') redirect(302, '/')

  const res = await fetch(`${API_BASE}/employees`, {
    headers: { Authorization: `Bearer ${locals.token}` },
  })

  const employees: Employee[] = res.ok
    ? ((await res.json()) as { data: Employee[] }).data
    : []

  return { user: locals.user, employees }
}

export {type Employee} from '../+page.server'