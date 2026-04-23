export function formatNumber(value: unknown): string {
  const numberValue = Number(value || 0)
  if (!Number.isFinite(numberValue)) return '0'
  return numberValue.toLocaleString()
}

export function formatCompactNumber(value: unknown): string {
  const numberValue = Number(value || 0)
  if (!Number.isFinite(numberValue)) return '0'
  if (Math.abs(numberValue) >= 1_000_000_000) return `${(numberValue / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(numberValue) >= 1_000_000) return `${(numberValue / 1_000_000).toFixed(2)}M`
  if (Math.abs(numberValue) >= 1_000) return `${(numberValue / 1_000).toFixed(2)}K`
  return numberValue.toLocaleString()
}

export function formatMoney(value: unknown, digits = 2): string {
  const numberValue = Number(value || 0)
  if (!Number.isFinite(numberValue)) return '$0.00'
  return `$${numberValue.toFixed(digits)}`
}

export function formatDateTime(value: unknown): string {
  if (!value) return '-'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(ms: unknown): string {
  const numberValue = Number(ms || 0)
  if (!Number.isFinite(numberValue)) return '0ms'
  if (numberValue >= 1000) return `${(numberValue / 1000).toFixed(2)}s`
  return `${Math.round(numberValue)}ms`
}

export function statusTone(status: unknown): 'success' | 'warning' | 'danger' | 'neutral' {
  const normalized = String(status || '').toLowerCase()
  if (['active', 'success', 'completed', 'paid', 'healthy', 'normal', 'enabled'].includes(normalized)) {
    return 'success'
  }
  if (['pending', 'recharging', 'warning', 'warn', 'refund_requested', 'refunding'].includes(normalized)) {
    return 'warning'
  }
  if (['disabled', 'inactive', 'failed', 'error', 'expired', 'cancelled', 'revoked'].includes(normalized)) {
    return 'danger'
  }
  return 'neutral'
}

export function extractErrorMessage(error: unknown, fallback = '操作失败'): string {
  if (!error || typeof error !== 'object') return fallback
  const record = error as { message?: string; response?: { data?: { message?: string; detail?: string } } }
  return record.message || record.response?.data?.message || record.response?.data?.detail || fallback
}
