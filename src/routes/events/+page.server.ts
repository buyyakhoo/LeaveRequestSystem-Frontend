import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { AUTH_COOKIE } from '$lib/auth'

const API_BASE = 'http://localhost:3000'

export interface EventLog {
  id: string
  actor_id: string | null
  actor_role: string
  action: string
  target_id: string | null
  target_type: string | null
  detail: Record<string, unknown> | null
  result: string
  timestamp: string
  actor: { email: string } | null
}

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'manager' && locals.user.role !== 'admin') {
    redirect(302, '/')
  }

  const token = cookies.get(AUTH_COOKIE)
  let logs: EventLog[] = []

  const res = await fetch(`${API_BASE}/event-logs?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) {
    const body = await res.json() as { data: EventLog[] }
    logs = body.data
  } else {
    console.error('[/events] API error:', res.status, await res.text())
  }

  return { user: locals.user, logs }
}
