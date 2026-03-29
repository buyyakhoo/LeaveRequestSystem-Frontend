import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { AUTH_COOKIE } from '$lib/auth'
import { API_BASE } from '$env/static/private'

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user) redirect(302, '/auth')
  if (locals.user.role !== 'user') redirect(302, '/')
  return { user: locals.user }
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const token = cookies.get(AUTH_COOKIE)
    const fd = await request.formData()

    const leaveType = fd.get('leaveType') as string
    const startDate = fd.get('startDate') as string
    const endDate = fd.get('endDate') as string
    const reason = fd.get('reason') as string
    const delegateName = (fd.get('delegateName') as string).trim()

    // Basic validation
    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      return fail(400, {
        success: false as const,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
        leaveType,
        startDate,
        endDate,
        reason,
        delegateName,
      })
    }

    if (new Date(endDate) < new Date(startDate)) {
      return fail(400, {
        success: false as const,
        error: 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มลา',
        leaveType,
        startDate,
        endDate,
        reason,
        delegateName,
      })
    }

    const body: Record<string, string> = { leaveType, startDate, endDate, reason }
    if (delegateName) body.delegateName = delegateName

    const res = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      return { success: true as const }
    }

    let errorMsg = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    try {
      const json = await res.json() as { error?: string; message?: string }
      if (json.error === 'ไม่สามารถยื่นลาย้อนหลังได้') {
        errorMsg = 'ไม่สามารถยื่นลาย้อนหลังได้'
      } else if (json.error === 'มีคำร้องที่ช่วงเวลานี้อยู่แล้ว') {
        errorMsg = 'ช่วงวันที่ที่เลือกซ้อนทับกับการลาที่มีอยู่แล้ว'
      } else if (res.status === 401) {
        errorMsg = 'Session หมดอายุ กรุณา Login ใหม่อีกครั้ง'
      } else if (res.status === 403) {
        errorMsg = 'ไม่มีสิทธิ์ดำเนินการนี้'
      } else if (json.error || json.message) {
        errorMsg = json.error ?? json.message ?? errorMsg
      }
    } catch { /* ignore */ }

    return fail(res.status, {
      success: false as const,
      error: errorMsg,
      leaveType,
      startDate,
      endDate,
      reason,
      delegateName,
    })
  },
}
