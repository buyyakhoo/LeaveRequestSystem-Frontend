// ─── Cookie names ─────────────────────────────────────────────────────────────
export const AUTH_COOKIE = 'auth_token'
export const USER_COOKIE = 'auth_user'

// ─── OWASP Password Policy ────────────────────────────────────────────────────
// https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`)
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Must not exceed ${PASSWORD_MAX_LENGTH} characters`)
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter (A–Z)')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter (a–z)')
  }
  if (!/\d/.test(password)) {
    errors.push('At least one digit (0–9)')
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('At least one special character (e.g. !@#$%)')
  }

  return { valid: errors.length === 0, errors }
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number
  employee_code: string
  email: string
  first_name: string
  last_name: string
  role: string
  departments?: { id: number; name: string } | null
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

// ─── JWT decode (no signature verification — trust the backend) ───────────────
export interface JwtPayload {
  sub: number
  email: string
  role: string
  exp: number
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/')
    return JSON.parse(atob(base64)) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenValid(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload) return false
  return payload.exp > Math.floor(Date.now() / 1000)
}
