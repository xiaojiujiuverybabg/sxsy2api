import { apiClient } from './client'
import type {
  Account,
  AdminGroup,
  AdminUsageLog,
  AdminUser,
  Announcement,
  BasePaginationResponse,
  DashboardStats,
  GroupPlatform,
  PaginatedResponse,
  PromoCode,
  Proxy,
  RedeemCode,
  RedeemCodeType,
  SubscriptionProgress,
  TrendDataPoint,
  UserSubscription,
} from '@/types'
import type {
  PaymentChannel,
  PaymentDashboardStats,
  PaymentOrder,
  ProviderInstance,
  SubscriptionPlan,
} from '@/types/payment'

export interface AdminSnapshot {
  generated_at?: string
  stats?: DashboardStats
  trend?: TrendDataPoint[]
}

export interface AdminPaymentConfig {
  enabled: boolean
  min_amount: number
  max_amount: number
  daily_limit: number
  order_timeout_minutes: number
  max_pending_orders: number
  enabled_payment_types: string[]
  balance_disabled: boolean
  balance_recharge_multiplier: number
  load_balance_strategy: string
  product_name_prefix: string
  product_name_suffix: string
  help_image_url: string
  help_text: string
}

function listEndpoint<T>(
  endpoint: string,
  page = 1,
  pageSize = 20,
  filters?: Record<string, unknown>,
  options?: { signal?: AbortSignal },
): Promise<PaginatedResponse<T>> {
  return apiClient
    .get<PaginatedResponse<T>>(endpoint, {
      params: { page, page_size: pageSize, ...filters },
      signal: options?.signal,
    })
    .then((response) => response.data)
}

export const adminAPI = {
  dashboard: {
    async getStats(): Promise<DashboardStats> {
      const { data } = await apiClient.get<DashboardStats>('/admin/dashboard/stats')
      return data
    },
    async getSnapshotV2(params?: Record<string, unknown>): Promise<AdminSnapshot> {
      const { data } = await apiClient.get<AdminSnapshot>('/admin/dashboard/snapshot-v2', { params })
      return data
    },
    async getBatchUsersUsage(userIds: number[]): Promise<{
      stats: Record<string, { user_id: number; today_actual_cost: number; total_actual_cost: number }>
    }> {
      const { data } = await apiClient.post('/admin/dashboard/users-usage', { user_ids: userIds })
      return data
    },
  },
  users: {
    list: (
      page = 1,
      pageSize = 20,
      filters?: {
        status?: 'active' | 'disabled'
        role?: 'admin' | 'user'
        search?: string
        group_name?: string
        include_subscriptions?: boolean
        sort_by?: string
        sort_order?: 'asc' | 'desc'
      },
      options?: { signal?: AbortSignal },
    ) => listEndpoint<AdminUser>('/admin/users', page, pageSize, filters, options),
    async toggleStatus(id: number, status: 'active' | 'disabled'): Promise<AdminUser> {
      const { data } = await apiClient.put<AdminUser>(`/admin/users/${id}`, { status })
      return data
    },
  },
  groups: {
    list: (
      page = 1,
      pageSize = 20,
      filters?: {
        platform?: GroupPlatform
        status?: 'active' | 'inactive'
        is_exclusive?: boolean
        search?: string
        sort_by?: string
        sort_order?: 'asc' | 'desc'
      },
      options?: { signal?: AbortSignal },
    ) => listEndpoint<AdminGroup>('/admin/groups', page, pageSize, filters, options),
    async getAll(platform?: GroupPlatform): Promise<AdminGroup[]> {
      const { data } = await apiClient.get<AdminGroup[]>('/admin/groups/all', {
        params: platform ? { platform } : undefined,
      })
      return data
    },
    async toggleStatus(id: number, status: 'active' | 'inactive'): Promise<AdminGroup> {
      const { data } = await apiClient.put<AdminGroup>(`/admin/groups/${id}`, { status })
      return data
    },
  },
  channels: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<Record<string, unknown>>('/admin/channels', page, pageSize, filters, options),
  },
  accounts: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<Account>('/admin/accounts', page, pageSize, filters, options),
    async clearError(id: number): Promise<Account> {
      const { data } = await apiClient.post<Account>(`/admin/accounts/${id}/clear-error`)
      return data
    },
  },
  proxies: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<Proxy>('/admin/proxies', page, pageSize, filters, options),
  },
  subscriptions: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<UserSubscription>('/admin/subscriptions', page, pageSize, filters, options),
    async getProgress(id: number): Promise<SubscriptionProgress> {
      const { data } = await apiClient.get<SubscriptionProgress>(`/admin/subscriptions/${id}/progress`)
      return data
    },
  },
  usage: {
    list: (params: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      apiClient
        .get<PaginatedResponse<AdminUsageLog>>('/admin/usage', { params, signal: options?.signal })
        .then((response) => response.data),
    async getStats(params?: Record<string, unknown>): Promise<Record<string, number>> {
      const { data } = await apiClient.get('/admin/usage/stats', { params })
      return data
    },
  },
  settings: {
    async getSettings(): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get('/admin/settings')
      return data
    },
  },
  redeem: {
    list: (
      page = 1,
      pageSize = 20,
      filters?: { type?: RedeemCodeType; status?: string; search?: string },
      options?: { signal?: AbortSignal },
    ) => listEndpoint<RedeemCode>('/admin/redeem-codes', page, pageSize, filters, options),
    async getStats(): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get('/admin/redeem-codes/stats')
      return data
    },
  },
  promo: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<PromoCode>('/admin/promo-codes', page, pageSize, filters, options),
  },
  announcements: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      apiClient
        .get<BasePaginationResponse<Announcement>>('/admin/announcements', {
          params: { page, page_size: pageSize, ...filters },
          signal: options?.signal,
        })
        .then((response) => response.data),
  },
  payment: {
    getConfig() {
      return apiClient.get<AdminPaymentConfig>('/admin/payment/config')
    },
    getDashboard(days?: number) {
      return apiClient.get<PaymentDashboardStats>('/admin/payment/dashboard', {
        params: days ? { days } : undefined,
      })
    },
    getOrders(params?: Record<string, unknown>) {
      return apiClient.get<BasePaginationResponse<PaymentOrder>>('/admin/payment/orders', { params })
    },
    getPlans() {
      return apiClient.get<SubscriptionPlan[]>('/admin/payment/plans')
    },
    getChannels() {
      return apiClient.get<PaymentChannel[]>('/admin/payment/channels')
    },
    getProviders() {
      return apiClient.get<ProviderInstance[]>('/admin/payment/providers')
    },
  },
  ops: {
    async getDashboardSnapshotV2(params?: Record<string, unknown>): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get('/admin/ops/dashboard/snapshot-v2', { params })
      return data
    },
    async listErrorLogs(params?: Record<string, unknown>): Promise<PaginatedResponse<Record<string, unknown>>> {
      const { data } = await apiClient.get('/admin/ops/errors', { params })
      return data
    },
  },
}

export default adminAPI
