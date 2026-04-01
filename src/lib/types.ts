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