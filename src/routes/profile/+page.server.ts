import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user) redirect(302, '/auth')
  return {
    user: locals.user,
    tokenExp: locals.tokenExp,
  }
}
