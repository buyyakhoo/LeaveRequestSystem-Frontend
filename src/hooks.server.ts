import type { Handle } from '@sveltejs/kit'
import { decodeToken, isTokenValid, AUTH_COOKIE, USER_COOKIE } from '$lib/auth'

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(AUTH_COOKIE)

  if (token && isTokenValid(token)) {
    const payload = decodeToken(token)
    const userRaw = event.cookies.get(USER_COOKIE)

    if (payload && userRaw) {
      try {
        event.locals.user = JSON.parse(Buffer.from(userRaw, 'base64').toString('utf-8'))
        event.locals.tokenExp = payload.exp
      } catch {
        event.locals.user = null
        event.locals.tokenExp = null
      }
    } else {
      event.locals.user = null
      event.locals.tokenExp = null
    }
  } else {
    event.locals.user = null
    event.locals.tokenExp = null
    // Clear stale / expired cookies
    if (token) {
      event.cookies.delete(AUTH_COOKIE, { path: '/' })
      event.cookies.delete(USER_COOKIE, { path: '/' })
    }
  }

  return resolve(event)
}
