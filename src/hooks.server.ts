import type { Handle } from '@sveltejs/kit'
import { decodeToken, isTokenValid, AUTH_COOKIE } from '$lib/auth'

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(AUTH_COOKIE) ?? null

  if (token && isTokenValid(token)) {
    const payload = decodeToken(token)
    if (payload) {
      event.locals.user = {
        id: payload.sub,
        employee_code: payload.employee_code,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        role: payload.role,
        departments: payload.department_id
          ? { id: payload.department_id, name: payload.department_name ?? '' }
          : null,
      }
      event.locals.tokenExp = payload.exp
      event.locals.token = token
    } else {
      event.locals.user = null
      event.locals.tokenExp = null
      event.locals.token = null
    }
  } else {
    event.locals.user = null
    event.locals.tokenExp = null
    event.locals.token = null
    if (token) {
      event.cookies.delete(AUTH_COOKIE, { path: '/' })
    }
  }

  return resolve(event)
}
