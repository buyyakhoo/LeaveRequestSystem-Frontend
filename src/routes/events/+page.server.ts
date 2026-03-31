import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'

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
  // enriched on server
  target_email?: string | null
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'manager' && locals.user.role !== 'admin') {
    redirect(302, '/')
  }

  const headers = { Authorization: `Bearer ${locals.token}` }

  const [logsRes, leavesRes] = await Promise.all([
    fetch(`${env.API_BASE}/event-logs?limit=100`, { headers }),
    fetch(`${env.API_BASE}/leaves`, { headers }),
  ])

  let logs: EventLog[] = []
  if (logsRes.ok) {
    const body = await logsRes.json() as { data: EventLog[] }
    logs = body.data
  } else {
    console.error('[/events] logs API error:', logsRes.status, await logsRes.text())
  }

  // Build leaveId → employee email map
  const leaveEmailMap = new Map<string, string>()
  if (leavesRes.ok) {
    const body = await leavesRes.json() as {
      data: { id: string; employee: { email: string } | null }[]
    }
    for (const leave of body.data) {
      if (leave.employee?.email) {
        leaveEmailMap.set(leave.id, leave.employee.email)
      }
    }
  }

  // Enrich logs: for leave actions, resolve email from detail or leaveEmailMap
  logs = logs.map(log => {
    let email = (log.detail?.email as string | undefined) ?? null

    if (!email && log.target_type === 'leave_request' && log.target_id) {
      email = leaveEmailMap.get(log.target_id) ?? null
    }

    return { ...log, target_email: email }
  })

  return { user: locals.user, logs }
}
