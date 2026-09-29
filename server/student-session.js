import crypto from 'node:crypto'

const b64url = value => Buffer.from(value).toString('base64url')

export function createStudentSession(studentId, secret, ttlSeconds = 60 * 60 * 8) {
  const payload = { sid: studentId, exp: Math.floor(Date.now() / 1000) + ttlSeconds }
  const encoded = b64url(JSON.stringify(payload))
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

export function verifyStudentSession(token, secret) {
  if (!token || typeof token !== 'string') return null
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null
  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
    if (!payload?.sid || !payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch { return null }
}
