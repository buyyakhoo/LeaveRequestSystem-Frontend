export const AUTH_COOKIE = 'auth_token'
export const PASSWORD_MIN_LENGTH = 15
export const PASSWORD_MAX_LENGTH = 128

export type PasswordStrength = 'weak' | 'moderate' | 'strong' | 'passphrase'

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  strength: PasswordStrength
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`)
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Must not exceed ${PASSWORD_MAX_LENGTH} characters`)
  }

  if (password.length >= 64) {
    return { valid: errors.length === 0, errors, strength: 'passphrase' }
  }

  let strength: PasswordStrength = 'weak'
  const characterTypes = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const uniqueCharacterTypes = characterTypes.filter(Boolean).length

  if (password.length >= PASSWORD_MIN_LENGTH && uniqueCharacterTypes >= 4) {
    strength = 'strong'
  } else if (password.length >= 10 && uniqueCharacterTypes >= 3) {
    strength = 'moderate'
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

  return { valid: errors.length === 0, errors, strength }
}

export interface AuthUser {
  id: number
  employee_code: string | null
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

export interface JwtPayload {
  sub: number
  email: string
  role: string
  first_name: string
  last_name: string
  employee_code: string | null
  department_id: number | null
  department_name: string | null
  exp: number
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/')
    const bytes = Uint8Array.from(atob(base64), c => c.codePointAt(0)!)
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenValid(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload) return false
  return payload.exp > Math.floor(Date.now() / 1000)
}
