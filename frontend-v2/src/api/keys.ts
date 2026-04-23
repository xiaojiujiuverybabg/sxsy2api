import { apiClient } from './client'
import type { ApiKey, CreateApiKeyRequest, PaginatedResponse, UpdateApiKeyRequest } from '@/types'

export async function list(
  page = 1,
  pageSize = 20,
  filters?: {
    search?: string
    status?: string
    group_id?: number | string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  },
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<ApiKey>> {
  const { data } = await apiClient.get<PaginatedResponse<ApiKey>>('/keys', {
    params: { page, page_size: pageSize, ...filters },
    signal: options?.signal,
  })
  return data
}

export async function create(
  name: string,
  groupId?: number | null,
  customKey?: string,
  ipWhitelist?: string[],
  ipBlacklist?: string[],
  quota?: number,
  expiresInDays?: number,
  rateLimitData?: { rate_limit_5h?: number; rate_limit_1d?: number; rate_limit_7d?: number },
): Promise<ApiKey> {
  const payload: CreateApiKeyRequest = { name }
  if (groupId !== undefined) payload.group_id = groupId
  if (customKey) payload.custom_key = customKey
  if (ipWhitelist?.length) payload.ip_whitelist = ipWhitelist
  if (ipBlacklist?.length) payload.ip_blacklist = ipBlacklist
  if (quota !== undefined) payload.quota = quota
  if (expiresInDays !== undefined) payload.expires_in_days = expiresInDays
  if (rateLimitData) Object.assign(payload, rateLimitData)

  const { data } = await apiClient.post<ApiKey>('/keys', payload)
  return data
}

export async function update(id: number, updates: UpdateApiKeyRequest): Promise<ApiKey> {
  const { data } = await apiClient.put<ApiKey>(`/keys/${id}`, updates)
  return data
}

export async function deleteKey(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/keys/${id}`)
  return data
}

export async function toggleStatus(id: number, status: 'active' | 'inactive'): Promise<ApiKey> {
  return update(id, { status })
}

export const keysAPI = { list, create, update, delete: deleteKey, toggleStatus }
export default keysAPI
