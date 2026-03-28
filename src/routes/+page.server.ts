import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { AUTH_COOKIE, USER_COOKIE } from '$lib/auth'

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user) redirect(302, '/auth')
  return {
    user: locals.user,
    tokenExp: locals.tokenExp,
  }
}

export const actions: Actions = {
  logout: async ({ cookies }) => {
    cookies.delete(AUTH_COOKIE, { path: '/' })
    cookies.delete(USER_COOKIE, { path: '/' })
    redirect(302, '/auth')
  },
}
