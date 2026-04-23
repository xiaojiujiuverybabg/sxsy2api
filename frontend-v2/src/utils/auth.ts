export function buildAuthErrorMessage(error: unknown, fallback: string): string {
  const candidate = error as {
    response?: { data?: { detail?: unknown; message?: unknown; error?: unknown } }
    message?: unknown
  }

  const detail = candidate?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  const dataMessage = candidate?.response?.data?.message
  if (typeof dataMessage === 'string' && dataMessage.trim()) {
    return dataMessage
  }

  const dataError = candidate?.response?.data?.error
  if (typeof dataError === 'string' && dataError.trim()) {
    return dataError
  }

  if (typeof candidate?.message === 'string' && candidate.message.trim()) {
    return candidate.message
  }

  return fallback
}

export function normalizeEmailSuffixWhitelist(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return []
  }

  return raw
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((item) => (item.startsWith('@') ? item : `@${item}`))
}

export function isEmailSuffixAllowed(email: string, whitelist: string[]): boolean {
  const normalized = normalizeEmailSuffixWhitelist(whitelist)
  if (!normalized.length) {
    return true
  }

  const domain = email.trim().toLowerCase().split('@')[1]
  if (!domain) {
    return false
  }

  return normalized.includes(`@${domain}`)
}

export function buildEmailSuffixMessage(whitelist: string[]): string {
  const normalized = normalizeEmailSuffixWhitelist(whitelist)
  if (!normalized.length) {
    return '当前邮箱域名不允许注册。'
  }

  return `当前邮箱域名不允许注册，可用域名：${normalized.join('、')}`
}
