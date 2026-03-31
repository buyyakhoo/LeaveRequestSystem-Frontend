import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { AUTH_COOKIE } from '$lib/auth'
import { env } from '$env/dynamic/private'

export interface Employee {
  id: string
  employee_code: string | null
  email: string
  first_name: string
  last_name: string
  role: string
  status: string
  created_at: string
  departments: { id: number; name: string } | null
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  delegate_name: string | null
  status: string
  created_at: string
  employee: { first_name: string; last_name: string; department_id: number; email: string } | null
}

export interface EventLogEntry {
  id: string
  actor_role: string
  action: string
  timestamp: string
  actor: { email: string } | null
}

export interface LeaveSummary {
  pending_count: number
  total_days_this_year: number
  by_type: Record<string, number>
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')

  const base = {
    user: locals.user,
    tokenExp: locals.tokenExp,
  }

  const headers = { Authorization: `Bearer ${locals.token}` }

  if (locals.user.role === 'user') {
    const [summaryRes, leavesRes] = await Promise.all([
      fetch(`${env.API_BASE}/leaves/summary`, { headers }),
      fetch(`${env.API_BASE}/leaves`, { headers }),
    ])
    const summary: LeaveSummary = summaryRes.ok
      ? await summaryRes.json()
      : { pending_count: 0, total_days_this_year: 0, by_type: {} }
    const myLeaves: LeaveRequest[] = leavesRes.ok
      ? ((await leavesRes.json()) as { data: LeaveRequest[] }).data
      : []
    return { ...base, summary, myLeaves }
  }

  if (locals.user.role === 'admin') {
    const todayStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const [empRes, logsRes] = await Promise.all([
      fetch(`${env.API_BASE}/employees`, { headers }),
      fetch(`${env.API_BASE}/event-logs?from=${todayStr}&limit=500`, { headers }),
    ])
    const allEmployees: Employee[] = empRes.ok
      ? ((await empRes.json()) as { data: Employee[] }).data
      : []
    const recentLogs: EventLogEntry[] = logsRes.ok
      ? ((await logsRes.json()) as { data: EventLogEntry[] }).data
      : []
    return { ...base, allEmployees, recentLogs }
  }

  if (locals.user.role !== 'manager') return base

  const [empRes, pendingRes, allLeavesRes] = await Promise.all([
    fetch(`${env.API_BASE}/employees`, { headers }),
    fetch(`${env.API_BASE}/leaves?status=pending`, { headers }),
    fetch(`${env.API_BASE}/leaves`, { headers }),
  ])

  const employees: Employee[] = empRes.ok
    ? ((await empRes.json()) as { data: Employee[] }).data
    : []

  const employeeIds = new Set(employees.map(e => e.id))

  const pendingLeaves: LeaveRequest[] = pendingRes.ok
    ? ((await pendingRes.json()) as { data: LeaveRequest[] }).data.filter(
        leave => employeeIds.has(leave.employee_id)
      )
    : []

  const allLeaves: LeaveRequest[] = allLeavesRes.ok
    ? ((await allLeavesRes.json()) as { data: LeaveRequest[] }).data.filter(
        leave => employeeIds.has(leave.employee_id)
      )
    : []

  return { ...base, employees, pendingLeaves, allLeaves }
}

export const actions: Actions = {
  logout: async ({ cookies }) => {
    cookies.delete(AUTH_COOKIE, { path: '/' })
    redirect(302, '/auth')
  },

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
