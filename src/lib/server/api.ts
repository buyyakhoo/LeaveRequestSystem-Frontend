import { env } from '$env/dynamic/private'
import type { AuthUser, LoginResponse } from '$lib/auth'

export async function getMeApi(
  token: string,
  fetchFn: typeof fetch = fetch,
): Promise<AuthUser> {
  const res = await fetchFn(`${env.API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`GET /auth/me failed: ${res.status}`)
  return res.json() as Promise<AuthUser>
}

export async function exchangeCodeApi(
  code: string,
  fetchFn: typeof fetch = fetch,
): Promise<LoginResponse> {
  const res = await fetchFn(`${env.API_BASE}/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error('Exchange failed or code expired')
  return res.json() as Promise<LoginResponse>
}

export async function loginApi(
  email: string,
  password: string,
  fetchFn: typeof fetch = fetch,
): Promise<LoginResponse> {
  const res = await fetchFn(`${env.API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? 'Login failed')
  }

  return res.json() as Promise<LoginResponse>
}
