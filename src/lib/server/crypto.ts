import { env } from '$env/dynamic/private'
import crypto from 'node:crypto'

// Derive a 256-bit key from COOKIE_SECRET once at startup
const KEY = crypto.scryptSync(env.COOKIE_SECRET, 'lrs_cookie_salt_v1', 32)

/**
 * AES-256-GCM authenticated encryption.
 * Output format: base64url(iv) . base64url(authTag) . base64url(ciphertext)
 */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv, tag, enc].map(b => b.toString('base64url')).join('.')
}

/**
 * Decrypts a value produced by encrypt().
 * Throws if the ciphertext is tampered or in an unrecognized format.
 */
export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split('.')
  if (parts.length !== 3) throw new Error('Invalid ciphertext format')
  const [ivB64, tagB64, encB64] = parts
  const iv  = Buffer.from(ivB64,  'base64url')
  const tag = Buffer.from(tagB64, 'base64url')
  const enc = Buffer.from(encB64, 'base64url')
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv)
  decipher.setAuthTag(tag)
  return decipher.update(enc).toString('utf8') + decipher.final('utf8')
}
