// ─── Date utilities ───────────────────────────────────────────────────────────

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit',
  })
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return (
    d.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
    '\n' +
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  )
}

export function calcDays(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ─── Label maps ───────────────────────────────────────────────────────────────

export const leaveTypeLabel: Record<string, string> = {
  sick:      'ลาป่วย',
  vacation:  'ลาพักร้อน',
  personal:  'ลากิจ',
  maternity: 'ลาคลอด',
  ordain:    'ลาอุปสมบท',
  other:     'อื่นๆ',
}

export const roleLabel: Record<string, string> = {
  admin:   'Administrator',
  manager: 'Manager',
  user:    'Employee',
}

export const actionLabel: Record<string, string> = {
  ADD_USER:       'เพิ่มพนักงาน',
  DISABLE_USER:   'ปิดบัญชีพนักงาน',
  UPDATE_PROFILE: 'แก้ไขโปรไฟล์',
  LEAVE_REQUEST:  'แจ้งลา',
  LEAVE_APPROVE:  'อนุมัติการลา',
  LEAVE_REJECT:   'ปฏิเสธการลา',
}
