import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { AUTH_COOKIE } from '$lib/auth'
import { env } from '$env/dynamic/private'
import type { Employee, LeaveRequest, EventLog, LeaveSummary } from '$lib/types';

async function fetchUserData(fetchFn: typeof fetch, headers: HeadersInit) {
  const [summaryRes, leavesRes, currentUserEmpRes] = await Promise.all([
    fetchFn(`${env.API_BASE}/leaves/summary`, { headers }),
    fetchFn(`${env.API_BASE}/leaves`, { headers }),
    fetchFn(`${env.API_BASE}/employees/me`, { headers }),
  ])
  const summary: LeaveSummary = summaryRes.ok
    ? await summaryRes.json()
    : { pending_count: 0, total_days_this_year: 0, by_type: {} }
  const myLeaves: LeaveRequest[] = leavesRes.ok
    ? ((await leavesRes.json()) as { data: LeaveRequest[] }).data
    : []
  const currentUserEmployee: Employee | null = currentUserEmpRes.ok
    ? ((await currentUserEmpRes.json()) as Employee)
    : null
  return { summary, myLeaves, currentUserEmployee }
}

async function fetchAdminData(fetchFn: typeof fetch, headers: HeadersInit) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const [empRes, logsRes] = await Promise.all([
    fetchFn(`${env.API_BASE}/employees`, { headers }),
    fetchFn(`${env.API_BASE}/event-logs?from=${todayStr}&limit=500`, { headers }),
  ])
  const allEmployees: Employee[] = empRes.ok
    ? ((await empRes.json()) as { data: Employee[] }).data
    : []
  const recentLogs: EventLog[] = logsRes.ok
    ? ((await logsRes.json()) as { data: EventLog[] }).data
    : []
  return { allEmployees, recentLogs }
}

async function fetchManagerData(fetchFn: typeof fetch, headers: HeadersInit) {
  const [empRes, pendingRes, allLeavesRes, currentManagerEmpRes] = await Promise.all([
    fetchFn(`${env.API_BASE}/employees`, { headers }),
    fetchFn(`${env.API_BASE}/leaves?status=pending`, { headers }),
    fetchFn(`${env.API_BASE}/leaves`, { headers }),
    fetchFn(`${env.API_BASE}/employees/me`, { headers }),
  ])

  const employees: Employee[] = empRes.ok
    ? ((await empRes.json()) as { data: Employee[] }).data
    : []

  const employeeIds = new Set(employees.map((e) => e.id))

  const pendingLeaves: LeaveRequest[] = pendingRes.ok
    ? ((await pendingRes.json()) as { data: LeaveRequest[] }).data.filter((leave) =>
        employeeIds.has(leave.employee_id)
      )
    : []

  const allLeaves: LeaveRequest[] = allLeavesRes.ok
    ? ((await allLeavesRes.json()) as { data: LeaveRequest[] }).data.filter((leave) =>
        employeeIds.has(leave.employee_id)
      )
    : []

  const currentManagerEmployee: Employee | null = currentManagerEmpRes.ok
    ? ((await currentManagerEmpRes.json()) as Employee)
    : null

  return { employees, pendingLeaves, allLeaves, currentManagerEmployee }
}

async function updateLeaveStatus(
  request: Request,
  token: string,
  fetchFn: typeof fetch,
  action: 'approve' | 'reject'
) {
  const fd = await request.formData()
  const id = fd.get('id') as string
  await fetchFn(`${env.API_BASE}/leaves/${id}/${action}`, { 
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) redirect(302, '/auth')

  const base = {
    user: locals.user,
    tokenExp: locals.tokenExp,
  }

  const headers = { Authorization: `Bearer ${locals.token}` }

  switch (locals.user.role) {
    case 'user':
      return { ...base, ...(await fetchUserData(fetch, headers)) }
    case 'admin':
      return { ...base, ...(await fetchAdminData(fetch, headers)) }
    case 'manager':
      return { ...base, ...(await fetchManagerData(fetch, headers)) }
    default:
      return base
  }
}

export const actions: Actions = {
  logout: async ({ cookies }) => {
    cookies.delete(AUTH_COOKIE, { path: '/' })
    redirect(302, '/auth')
  },
  approve: async ({ request, locals, fetch }) => {
    if (!locals.token) throw redirect(302, 
      '/auth'
    );
    await updateLeaveStatus(request, locals.token, fetch, 'approve')
  },

  reject: async ({ request, locals, fetch }) => {
    if (!locals.token) throw redirect(302, 
      '/auth'
    );
    await updateLeaveStatus(request, locals.token, fetch, 'reject')
  },
}
