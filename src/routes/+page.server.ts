import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { AUTH_COOKIE } from '$lib/auth'
import { env } from '$env/dynamic/private'

import type { Employee, LeaveRequest, EventLog, LeaveSummary } from '$lib/types';
export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')

  const base = {
    user: locals.user,
    tokenExp: locals.tokenExp,
  }

  const headers = { Authorization: `Bearer ${locals.token}` }

  if (locals.user.role === 'user') {
    const [summaryRes, leavesRes, currentUserEmpRes] = await Promise.all([
      fetch(`${env.API_BASE}/leaves/summary`, { headers }),
      fetch(`${env.API_BASE}/leaves`, { headers }),
      fetch(`${env.API_BASE}/employees/me`, { headers }),
    ])
    const summary: LeaveSummary = summaryRes.ok
      ? await summaryRes.json()
      : { pending_count: 0, total_days_this_year: 0, by_type: {} }
    const myLeaves: LeaveRequest[] = leavesRes.ok
      ? ((await leavesRes.json()) as { data: LeaveRequest[] }).data
      : []
    const currentUserEmployee: Employee | null = currentUserEmpRes.ok
      ? (await currentUserEmpRes.json()) as Employee
      : null;
    return { ...base, summary, myLeaves, currentUserEmployee }
  }

  if (locals.user.role === 'admin') {
    const todayStr = new Date().toISOString().slice(0, 10)
    const [empRes, logsRes] = await Promise.all([
      fetch(`${env.API_BASE}/employees`, { headers }),
      fetch(`${env.API_BASE}/event-logs?from=${todayStr}&limit=500`, { headers }),
    ])
    const allEmployees: Employee[] = empRes.ok
      ? ((await empRes.json()) as { data: Employee[] }).data
      : []
    const recentLogs: EventLog[] = logsRes.ok
      ? ((await logsRes.json()) as { data: EventLog[] }).data
      : []
    return { ...base, allEmployees, recentLogs }
  }

  if (locals.user.role !== 'manager') return base

  const [empRes, pendingRes, allLeavesRes, currentManagerEmpRes] = await Promise.all([
    fetch(`${env.API_BASE}/employees`, { headers }),
    fetch(`${env.API_BASE}/leaves?status=pending`, { headers }),
    fetch(`${env.API_BASE}/leaves`, { headers }),
    fetch(`${env.API_BASE}/employees/me`, { headers }), // Fetch current manager's full employee data
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

  const currentManagerEmployee: Employee | null = currentManagerEmpRes.ok // Added currentManagerEmployee
    ? (await currentManagerEmpRes.json()) as Employee
    : null;

  return { ...base, employees, pendingLeaves, allLeaves, currentManagerEmployee }
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
