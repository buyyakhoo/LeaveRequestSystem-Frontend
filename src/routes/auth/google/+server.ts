import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'

export const GET: RequestHandler = () => {
  redirect(302, `${env.API_BASE}/auth/google`)
}
