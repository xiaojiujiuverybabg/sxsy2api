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
import type {
  BillingMode,
  PricingInterval,
  ChannelModelPricing,
  AccountStatsPricingRule,
  Channel,
  CreateChannelRequest,
  UpdateChannelRequest,
  ModelDefaultPricing,
} from '@/types'

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
    async create(data: {
      email: string
      username?: string
      password: string
      role: 'admin' | 'user'
      balance?: number
      concurrency?: number
      notes?: string
    }): Promise<AdminUser> {
      const response = await apiClient.post<AdminUser>('/admin/users', data)
      return response.data
    },
    async update(id: number, data: {
      username?: string
      password?: string
      role?: 'admin' | 'user'
      status?: 'active' | 'disabled'
      concurrency?: number
      notes?: string
      allowed_groups?: number[]
      group_rates?: Record<number, number | null>
    }): Promise<AdminUser> {
      const response = await apiClient.put<AdminUser>(`/admin/users/${id}`, data)
      return response.data
    },
    async delete(id: number): Promise<void> {
      await apiClient.delete(`/admin/users/${id}`)
    },
    async toggleStatus(id: number, status: 'active' | 'disabled'): Promise<AdminUser> {
      const { data } = await apiClient.put<AdminUser>(`/admin/users/${id}`, { status })
      return data
    },
    async updateBalance(id: number, balance: number, operation: 'set' | 'add' | 'subtract' = 'add', notes?: string): Promise<void> {
      await apiClient.post(`/admin/users/${id}/balance`, {
        balance,
        operation,
        notes: notes || ''
      })
    },
    async getBalanceHistory(id: number, page = 1, pageSize = 10, type?: string): Promise<PaginatedResponse<any>> {
      const params: Record<string, any> = { page, page_size: pageSize }
      if (type) params.type = type
      const response = await apiClient.get<PaginatedResponse<any>>(`/admin/users/${id}/balance-history`, {
        params
      })
      return response.data
    },
    async getApiKeys(id: number): Promise<PaginatedResponse<any>> {
      const response = await apiClient.get<PaginatedResponse<any>>(`/admin/users/${id}/api-keys`)
      return response.data
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
    async getById(id: number): Promise<AdminGroup> {
      const { data } = await apiClient.get<AdminGroup>(`/admin/groups/${id}`)
      return data
    },
    async create(groupData: any): Promise<AdminGroup> {
      const { data } = await apiClient.post<AdminGroup>('/admin/groups', groupData)
      return data
    },
    async update(id: number, updates: any): Promise<AdminGroup> {
      const { data } = await apiClient.put<AdminGroup>(`/admin/groups/${id}`, updates)
      return data
    },
    async delete(id: number): Promise<{ message: string }> {
      const { data } = await apiClient.delete<{ message: string }>(`/admin/groups/${id}`)
      return data
    },
    async toggleStatus(id: number, status: 'active' | 'inactive'): Promise<AdminGroup> {
      const { data } = await apiClient.put<AdminGroup>(`/admin/groups/${id}`, { status })
      return data
    },
    async getGroupRateMultipliers(id: number): Promise<any[]> {
      const { data } = await apiClient.get<any[]>(`/admin/groups/${id}/rate-multipliers`)
      return data
    },
    async batchSetGroupRateMultipliers(
      id: number,
      entries: Array<{ user_id: number; rate_multiplier: number }>
    ): Promise<{ message: string }> {
      const { data } = await apiClient.put<{ message: string }>(
        `/admin/groups/${id}/rate-multipliers`,
        { entries }
      )
      return data
    },
    async updateSortOrder(
      updates: Array<{ id: number; sort_order: number }>
    ): Promise<{ message: string }> {
      const { data } = await apiClient.put<{ message: string }>('/admin/groups/sort-order', {
        updates
      })
      return data
    },
    async getUsageSummary(
      timezone?: string
    ): Promise<{ group_id: number; today_cost: number; total_cost: number }[]> {
      const { data } = await apiClient.get<
        { group_id: number; today_cost: number; total_cost: number }[]
      >('/admin/groups/usage-summary', {
        params: timezone ? { timezone } : undefined
      })
      return data
    },
  },
  channels: {
    list: (
      page = 1,
      pageSize = 20,
      filters?: {
        status?: string
        search?: string
        sort_by?: string
        sort_order?: 'asc' | 'desc'
      },
      options?: { signal?: AbortSignal },
    ) =>
      apiClient
        .get<PaginatedResponse<Channel>>('/admin/channels', {
          params: { page, page_size: pageSize, ...filters },
          signal: options?.signal,
        })
        .then((response) => response.data),
    async getById(id: number): Promise<Channel> {
      const { data } = await apiClient.get<Channel>(`/admin/channels/${id}`)
      return data
    },
    async create(req: CreateChannelRequest): Promise<Channel> {
      const { data } = await apiClient.post<Channel>('/admin/channels', req)
      return data
    },
    async update(id: number, req: UpdateChannelRequest): Promise<Channel> {
      const { data } = await apiClient.put<Channel>(`/admin/channels/${id}`, req)
      return data
    },
    async delete(id: number): Promise<void> {
      await apiClient.delete(`/admin/channels/${id}`)
    },
    async getModelDefaultPricing(model: string): Promise<ModelDefaultPricing> {
      const { data } = await apiClient.get<ModelDefaultPricing>('/admin/channels/model-pricing', {
        params: { model },
      })
      return data
    },
  },
  accounts: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<Account>('/admin/accounts', page, pageSize, filters, options),
    async getById(id: number): Promise<Account> {
      const { data } = await apiClient.get<Account>(`/admin/accounts/${id}`)
      return data
    },
    async clearError(id: number): Promise<Account> {
      const { data } = await apiClient.post<Account>(`/admin/accounts/${id}/clear-error`)
      return data
    },
  },
  proxies: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<Proxy>('/admin/proxies', page, pageSize, filters, options),
    create(data: Record<string, unknown>) {
      return apiClient.post<Proxy>('/admin/proxies', data)
    },
    update(id: number, data: Record<string, unknown>) {
      return apiClient.put<Proxy>(`/admin/proxies/${id}`, data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/proxies/${id}`)
    },
    test(id: number) {
      return apiClient.post(`/admin/proxies/${id}/test`)
    },
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
    updateSettings(data: Record<string, unknown>) {
      return apiClient.put('/admin/settings', data)
    },
    async getWebSearchEmulationConfig(): Promise<{ enabled: boolean; providers: any[] }> {
      const { data } = await apiClient.get<{ enabled: boolean; providers: any[] }>('/admin/settings/web-search-emulation')
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
    generate(data: Record<string, unknown>) {
      return apiClient.post('/admin/redeem-codes/generate', data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/redeem-codes/${id}`)
    },
  },
  promo: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<PromoCode>('/admin/promo-codes', page, pageSize, filters, options),
    create(data: Record<string, unknown>) {
      return apiClient.post<PromoCode>('/admin/promo-codes', data)
    },
    update(id: number, data: Record<string, unknown>) {
      return apiClient.put<PromoCode>(`/admin/promo-codes/${id}`, data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/promo-codes/${id}`)
    },
  },
  announcements: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      apiClient
        .get<BasePaginationResponse<Announcement>>('/admin/announcements', {
          params: { page, page_size: pageSize, ...filters },
          signal: options?.signal,
        })
        .then((response) => response.data),
    async create(data: Record<string, unknown>): Promise<Announcement> {
      const response = await apiClient.post<Announcement>('/admin/announcements', data)
      return response.data
    },
    async update(id: number, data: Record<string, unknown>): Promise<Announcement> {
      const response = await apiClient.put<Announcement>(`/admin/announcements/${id}`, data)
      return response.data
    },
    async delete(id: number): Promise<void> {
      await apiClient.delete(`/admin/announcements/${id}`)
    },
    async getReadStatus(id: number): Promise<BasePaginationResponse<any>> {
      const response = await apiClient.get<BasePaginationResponse<any>>(`/admin/announcements/${id}/read-status`)
      return response.data
    },
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
