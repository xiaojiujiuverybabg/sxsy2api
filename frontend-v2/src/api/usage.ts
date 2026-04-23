import { apiClient } from './client'
import type { ModelStat, PaginatedResponse, TrendDataPoint, UsageLog, UsageStatsResponse } from '@/types'

export interface UserDashboardStats {
  total_api_keys: number
  active_api_keys: number
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
  total_cache_creation_tokens: number
  total_cache_read_tokens: number
  total_tokens: number
  total_cost: number
  total_actual_cost: number
  today_requests: number
  today_input_tokens: number
  today_output_tokens: number
  today_cache_creation_tokens: number
  today_cache_read_tokens: number
  today_tokens: number
  today_cost: number
  today_actual_cost: number
  average_duration_ms: number
  rpm: number
  tpm: number
}

export interface TrendResponse {
  trend: TrendDataPoint[]
  start_date: string
  end_date: string
  granularity: string
}

export interface ModelStatsResponse {
  models: ModelStat[]
  start_date: string
  end_date: string
}

export async function query(
  params: {
    page?: number
    page_size?: number
    api_key_id?: number
    start_date?: string
    end_date?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  },
  options: { signal?: AbortSignal } = {},
): Promise<PaginatedResponse<UsageLog>> {
  const { data } = await apiClient.get<PaginatedResponse<UsageLog>>('/usage', {
    params,
    signal: options.signal,
  })
  return data
}

export async function getStatsByDateRange(
  startDate: string,
  endDate: string,
  apiKeyId?: number,
): Promise<UsageStatsResponse> {
  const { data } = await apiClient.get<UsageStatsResponse>('/usage/stats', {
    params: { start_date: startDate, end_date: endDate, api_key_id: apiKeyId },
  })
  return data
}

export async function getDashboardStats(): Promise<UserDashboardStats> {
  const { data } = await apiClient.get<UserDashboardStats>('/usage/dashboard/stats')
  return data
}

export async function getDashboardTrend(params?: {
  start_date?: string
  end_date?: string
  granularity?: 'day' | 'hour'
}): Promise<TrendResponse> {
  const { data } = await apiClient.get<TrendResponse>('/usage/dashboard/trend', { params })
  return data
}

export async function getDashboardModels(params?: {
  start_date?: string
  end_date?: string
}): Promise<ModelStatsResponse> {
  const { data } = await apiClient.get<ModelStatsResponse>('/usage/dashboard/models', { params })
  return data
}

export async function getDashboardApiKeysUsage(
  apiKeyIds: number[],
  options?: { signal?: AbortSignal },
): Promise<{ stats: Record<string, { api_key_id: number; today_actual_cost: number; total_actual_cost: number }> }> {
  const { data } = await apiClient.post(
    '/usage/dashboard/api-keys-usage',
    { api_key_ids: apiKeyIds },
    { signal: options?.signal },
  )
  return data
}

export const usageAPI = {
  query,
  getStatsByDateRange,
  getDashboardStats,
  getDashboardTrend,
  getDashboardModels,
  getDashboardApiKeysUsage,
}
export default usageAPI
