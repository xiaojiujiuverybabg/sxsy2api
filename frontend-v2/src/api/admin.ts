import { apiClient } from './client'
import type {
  Account,
  AdminGroup,
  AdminUsageLog,
  AdminUser,
  Announcement,
  AnnouncementUserReadStatus,
  AssignSubscriptionRequest,
  BasePaginationResponse,
  DashboardStats,
  ExtendSubscriptionRequest,
  GroupPlatform,
  PaginatedResponse,
  PromoCode,
  Proxy,
  RedeemCode,
  RedeemCodeType,
  SimpleUser,
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
    async create(data: Record<string, unknown>): Promise<Account> {
      const { data: result } = await apiClient.post<Account>('/admin/accounts', data)
      return result
    },
    async update(id: number, data: Record<string, unknown>): Promise<Account> {
      const { data: result } = await apiClient.put<Account>(`/admin/accounts/${id}`, data)
      return result
    },
    async delete(id: number): Promise<void> {
      await apiClient.delete(`/admin/accounts/${id}`)
    },
    async toggleStatus(id: number, status: string): Promise<Account> {
      const { data } = await apiClient.put<Account>(`/admin/accounts/${id}`, { status })
      return data
    },
    async clearError(id: number): Promise<Account> {
      const { data } = await apiClient.post<Account>(`/admin/accounts/${id}/clear-error`)
      return data
    },
    async batchClearError(ids: number[]): Promise<void> {
      await apiClient.post('/admin/accounts/batch-clear-error', { ids })
    },
    async testAccount(id: number, model?: string): Promise<Record<string, unknown>> {
      const { data } = await apiClient.post<Record<string, unknown>>(`/admin/accounts/${id}/test`, model ? { model } : undefined)
      return data
    },
    async getStats(id: number, days = 30): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get<Record<string, unknown>>(`/admin/accounts/${id}/stats`, { params: { days } })
      return data
    },
    async getUsage(id: number, source?: string): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get<Record<string, unknown>>(`/admin/accounts/${id}/usage`, { params: source ? { source } : undefined })
      return data
    },
    async clearRateLimit(id: number): Promise<void> {
      await apiClient.post(`/admin/accounts/${id}/clear-rate-limit`)
    },
    async recoverState(id: number): Promise<void> {
      await apiClient.post(`/admin/accounts/${id}/recover-state`)
    },
    async setSchedulable(id: number, schedulable: boolean): Promise<void> {
      await apiClient.post(`/admin/accounts/${id}/schedulable`, { schedulable })
    },
    async refreshCredentials(id: number): Promise<Account> {
      const { data } = await apiClient.post<Account>(`/admin/accounts/${id}/refresh`)
      return data
    },
    async getBatchTodayStats(ids: number[]): Promise<Record<string, unknown>> {
      const { data } = await apiClient.post<Record<string, unknown>>('/admin/accounts/today-stats/batch', { ids })
      return data
    },
  },
  proxies: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<Proxy>('/admin/proxies', page, pageSize, filters, options),
    async getAll(): Promise<Proxy[]> {
      const { data } = await apiClient.get<Proxy[]>('/admin/proxies/all')
      return data
    },
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
      return apiClient.post<Record<string, unknown>>(`/admin/proxies/${id}/test`)
    },
    async batchCreate(proxies: Record<string, unknown>[]): Promise<{ created: number; skipped: number }> {
      const { data } = await apiClient.post<{ created: number; skipped: number }>('/admin/proxies/batch', { proxies })
      return data
    },
    async batchDelete(ids: number[]): Promise<{ deleted_ids: number[]; skipped: Array<{ id: number; reason: string }> }> {
      const { data } = await apiClient.post<{ deleted_ids: number[]; skipped: Array<{ id: number; reason: string }> }>('/admin/proxies/batch-delete', { ids })
      return data
    },
    async checkQuality(id: number): Promise<Record<string, unknown>> {
      const { data } = await apiClient.post<Record<string, unknown>>(`/admin/proxies/${id}/quality-check`)
      return data
    },
    async getProxyAccounts(id: number): Promise<Record<string, unknown>[]> {
      const { data } = await apiClient.get<Record<string, unknown>[]>(`/admin/proxies/${id}/accounts`)
      return data
    },
    async exportData(params?: Record<string, unknown>): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get<Record<string, unknown>>('/admin/proxies/data', { params })
      return data
    },
    async importData(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
      const { data } = await apiClient.post<Record<string, unknown>>('/admin/proxies/data', payload)
      return data
    },
  },
  subscriptions: {
    list: (page = 1, pageSize = 20, filters?: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
      listEndpoint<UserSubscription>('/admin/subscriptions', page, pageSize, filters, options),
    async getProgress(id: number): Promise<SubscriptionProgress> {
      const { data } = await apiClient.get<SubscriptionProgress>(`/admin/subscriptions/${id}/progress`)
      return data
    },
    async assign(data: AssignSubscriptionRequest): Promise<UserSubscription> {
      const { data: result } = await apiClient.post<UserSubscription>('/admin/subscriptions/assign', data)
      return result
    },
    async extend(id: number, data: ExtendSubscriptionRequest): Promise<UserSubscription> {
      const { data: result } = await apiClient.post<UserSubscription>(`/admin/subscriptions/${id}/extend`, data)
      return result
    },
    async revoke(id: number): Promise<void> {
      await apiClient.delete(`/admin/subscriptions/${id}`)
    },
    async resetQuota(id: number, options: { daily?: boolean; weekly?: boolean; monthly?: boolean }): Promise<void> {
      await apiClient.post(`/admin/subscriptions/${id}/reset-quota`, options)
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
    async searchUsers(keyword: string): Promise<SimpleUser[]> {
      const { data } = await apiClient.get<SimpleUser[]>('/admin/usage/search-users', {
        params: { q: keyword }
      })
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
    // SMTP
    testSmtpConnection(config: Record<string, unknown>) {
      return apiClient.post<{ message: string }>('/admin/settings/test-smtp', config)
    },
    sendTestEmail(request: Record<string, unknown>) {
      return apiClient.post<{ message: string }>('/admin/settings/send-test-email', request)
    },
    // Admin API Key
    async getAdminApiKey(): Promise<{ exists: boolean; masked_key: string }> {
      const { data } = await apiClient.get<{ exists: boolean; masked_key: string }>('/admin/settings/admin-api-key')
      return data
    },
    async regenerateAdminApiKey(): Promise<{ key: string }> {
      const { data } = await apiClient.post<{ key: string }>('/admin/settings/admin-api-key/regenerate')
      return data
    },
    async deleteAdminApiKey(): Promise<{ message: string }> {
      const { data } = await apiClient.delete<{ message: string }>('/admin/settings/admin-api-key')
      return data
    },
    // Overload Cooldown
    async getOverloadCooldownSettings(): Promise<import('@/types').OverloadCooldownSettings> {
      const { data } = await apiClient.get<import('@/types').OverloadCooldownSettings>('/admin/settings/overload-cooldown')
      return data
    },
    updateOverloadCooldownSettings(data: import('@/types').OverloadCooldownSettings) {
      return apiClient.put('/admin/settings/overload-cooldown', data)
    },
    // Stream Timeout
    async getStreamTimeoutSettings(): Promise<import('@/types').StreamTimeoutSettings> {
      const { data } = await apiClient.get<import('@/types').StreamTimeoutSettings>('/admin/settings/stream-timeout')
      return data
    },
    updateStreamTimeoutSettings(data: import('@/types').StreamTimeoutSettings) {
      return apiClient.put('/admin/settings/stream-timeout', data)
    },
    // Rectifier
    async getRectifierSettings(): Promise<import('@/types').RectifierSettings> {
      const { data } = await apiClient.get<import('@/types').RectifierSettings>('/admin/settings/rectifier')
      return data
    },
    updateRectifierSettings(data: import('@/types').RectifierSettings) {
      return apiClient.put('/admin/settings/rectifier', data)
    },
    // Beta Policy
    async getBetaPolicySettings(): Promise<import('@/types').BetaPolicySettings> {
      const { data } = await apiClient.get<import('@/types').BetaPolicySettings>('/admin/settings/beta-policy')
      return data
    },
    updateBetaPolicySettings(data: import('@/types').BetaPolicySettings) {
      return apiClient.put('/admin/settings/beta-policy', data)
    },
    // Web Search Emulation
    async getWebSearchEmulationConfig(): Promise<import('@/types').WebSearchEmulationConfig> {
      const { data } = await apiClient.get<import('@/types').WebSearchEmulationConfig>('/admin/settings/web-search-emulation')
      return data
    },
    updateWebSearchEmulationConfig(data: import('@/types').WebSearchEmulationConfig) {
      return apiClient.put('/admin/settings/web-search-emulation', data)
    },
    testWebSearchEmulation(query: string) {
      return apiClient.post('/admin/settings/web-search-emulation/test', { query })
    },
    resetWebSearchUsage(payload: { provider_type: string }) {
      return apiClient.post('/admin/settings/web-search-emulation/reset-usage', payload)
    },
  },
  backup: {
    async getS3Config(): Promise<import('@/types').BackupS3Config> {
      const { data } = await apiClient.get<import('@/types').BackupS3Config>('/admin/backups/s3-config')
      return data
    },
    updateS3Config(config: import('@/types').BackupS3Config) {
      return apiClient.put('/admin/backups/s3-config', config)
    },
    testS3Connection(config: import('@/types').BackupS3Config) {
      return apiClient.post('/admin/backups/s3-config/test', config)
    },
    async getSchedule(): Promise<import('@/types').BackupScheduleConfig> {
      const { data } = await apiClient.get<import('@/types').BackupScheduleConfig>('/admin/backups/schedule')
      return data
    },
    updateSchedule(config: import('@/types').BackupScheduleConfig) {
      return apiClient.put('/admin/backups/schedule', config)
    },
    async createBackup(expireDays?: number): Promise<import('@/types').BackupRecord> {
      const { data } = await apiClient.post<import('@/types').BackupRecord>('/admin/backups', expireDays ? { expire_days: expireDays } : {})
      return data
    },
    async listBackups(): Promise<{ items: import('@/types').BackupRecord[] }> {
      const { data } = await apiClient.get<{ items: import('@/types').BackupRecord[] }>('/admin/backups')
      return data
    },
    async getBackup(id: string): Promise<import('@/types').BackupRecord> {
      const { data } = await apiClient.get<import('@/types').BackupRecord>(`/admin/backups/${id}`)
      return data
    },
    deleteBackup(id: string) {
      return apiClient.delete(`/admin/backups/${id}`)
    },
    async getDownloadURL(id: string): Promise<{ url: string }> {
      const { data } = await apiClient.get<{ url: string }>(`/admin/backups/${id}/download-url`)
      return data
    },
    async restoreBackup(id: string, password: string): Promise<import('@/types').BackupRecord> {
      const { data } = await apiClient.post<import('@/types').BackupRecord>(`/admin/backups/${id}/restore`, { password })
      return data
    },
  },
  system: {
    async getVersion(): Promise<{ version: string }> {
      const { data } = await apiClient.get<{ version: string }>('/admin/system/version')
      return data
    },
    async checkUpdates(force = false): Promise<import('@/types').VersionInfo> {
      const { data } = await apiClient.get<import('@/types').VersionInfo>('/admin/system/check-updates', {
        params: force ? { force: 'true' } : undefined,
      })
      return data
    },
    async performUpdate(): Promise<import('@/types').UpdateResult> {
      const { data } = await apiClient.post<import('@/types').UpdateResult>('/admin/system/update')
      return data
    },
    async rollback(): Promise<import('@/types').UpdateResult> {
      const { data } = await apiClient.post<import('@/types').UpdateResult>('/admin/system/rollback')
      return data
    },
    async restartService(): Promise<{ message: string }> {
      const { data } = await apiClient.post<{ message: string }>('/admin/system/restart')
      return data
    },
  },
  redeem: {
    list: (
      page = 1,
      pageSize = 20,
      filters?: { type?: RedeemCodeType; status?: string; search?: string; sort_by?: string; sort_order?: string },
      options?: { signal?: AbortSignal },
    ) => listEndpoint<RedeemCode>('/admin/redeem-codes', page, pageSize, filters, options),
    async getStats(): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get('/admin/redeem-codes/stats')
      return data
    },
    generate(data: Record<string, unknown>) {
      return apiClient.post<RedeemCode[]>('/admin/redeem-codes/generate', data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/redeem-codes/${id}`)
    },
    async batchDelete(ids: number[]): Promise<{ deleted: number }> {
      const { data } = await apiClient.post<{ deleted: number }>('/admin/redeem-codes/batch-delete', { ids })
      return data
    },
    async expire(id: number): Promise<RedeemCode> {
      const { data } = await apiClient.post<RedeemCode>(`/admin/redeem-codes/${id}/expire`)
      return data
    },
    async exportCodes(filters?: Record<string, unknown>): Promise<Blob> {
      const response = await apiClient.get('/admin/redeem-codes/export', { params: filters, responseType: 'blob' })
      return response.data
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
    getUsages: (id: number, page = 1, pageSize = 20, options?: { signal?: AbortSignal }) =>
      listEndpoint<Record<string, unknown>>(`/admin/promo-codes/${id}/usages`, page, pageSize, {}, options),
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
    async getReadStatus(id: number, params?: Record<string, unknown>, signal?: AbortSignal): Promise<BasePaginationResponse<AnnouncementUserReadStatus>> {
      const response = await apiClient.get<BasePaginationResponse<AnnouncementUserReadStatus>>(`/admin/announcements/${id}/read-status`, { params, signal })
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
    createPlan(data: Record<string, unknown>) {
      return apiClient.post<SubscriptionPlan>('/admin/payment/plans', data)
    },
    updatePlan(id: number, data: Record<string, unknown>) {
      return apiClient.put<SubscriptionPlan>(`/admin/payment/plans/${id}`, data)
    },
    deletePlan(id: number) {
      return apiClient.delete(`/admin/payment/plans/${id}`)
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
    async getRealtimeTrafficSummary(params?: Record<string, unknown>): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get('/admin/ops/realtime-traffic', { params })
      return data
    },
    async getConcurrencyStats(params?: Record<string, unknown>): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get('/admin/ops/concurrency', { params })
      return data
    },
    async getThroughputTrend(params?: Record<string, unknown>): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get('/admin/ops/dashboard/throughput-trend', { params })
      return data
    },
    async getErrorDistribution(params?: Record<string, unknown>): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get('/admin/ops/dashboard/error-distribution', { params })
      return data
    },
    async listErrorLogs(params?: Record<string, unknown>): Promise<PaginatedResponse<Record<string, unknown>>> {
      const { data } = await apiClient.get('/admin/ops/errors', { params })
      return data
    },
    async getErrorLogDetail(id: string): Promise<Record<string, unknown>> {
      const { data } = await apiClient.get(`/admin/ops/errors/${id}`)
      return data
    },
    async listAlertEvents(params?: Record<string, unknown>): Promise<PaginatedResponse<Record<string, unknown>>> {
      const { data } = await apiClient.get('/admin/ops/alert-events', { params })
      return data
    },
    async listAlertRules(): Promise<Array<Record<string, unknown>>> {
      const { data } = await apiClient.get('/admin/ops/alert-rules')
      return data
    },
  },
}

export default adminAPI
