import type { Handle } from '@sveltejs/kit'
import { decodeToken, isTokenValid, AUTH_COOKIE } from '$lib/auth'
import { env } from '$env/dynamic/private'

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(AUTH_COOKIE) ?? null

  if (token && isTokenValid(token)) {
    const payload = decodeToken(token)
    if (payload) {
      try {
        const res = await fetch(`${env.API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.ok) {
          const freshUser = await res.json()   
          event.locals.user = {
            id: freshUser.id,
            employee_code: freshUser.employee_code,
            email: freshUser.email,
            first_name: freshUser.first_name,
            last_name: freshUser.last_name,
            role: freshUser.role, 
            departments: freshUser.departments
          }
          event.locals.tokenExp = payload.exp
          event.locals.token = token
        } else {
          throw new Error('Session invalid or account disabled')
        }
      } catch {
        event.locals.user = null
        event.locals.tokenExp = null
        event.locals.token = null
        event.cookies.delete(AUTH_COOKIE, { path: '/' })
      }
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