import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'

export const GET: RequestHandler = () => {
  // Redirect to backend's Google OAuth endpoint
  // The backend will handle the OAuth flow and redirect to Google
  redirect(302, `${env.API_BASE}/auth/google`)
}
