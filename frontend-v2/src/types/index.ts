export interface BasePaginationResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> extends BasePaginationResponse<T> {}

export interface NotifyEmailEntry {
  email: string
  disabled: boolean
  verified: boolean
}

export type UserAuthProvider = 'email' | 'linuxdo' | 'oidc' | 'wechat'
export type GroupPlatform = 'anthropic' | 'openai' | 'gemini' | 'antigravity'
export type SubscriptionType = 'standard' | 'subscription'
export type AccountPlatform = 'anthropic' | 'openai' | 'gemini' | 'antigravity'
export type AccountType = 'oauth' | 'setup-token' | 'apikey' | 'upstream' | 'bedrock'
export type ProxyProtocol = 'http' | 'https' | 'socks5' | 'socks5h'
export type RedeemCodeType = 'balance' | 'concurrency' | 'subscription' | 'invitation'
export type UsageRequestType = 'unknown' | 'sync' | 'stream' | 'ws_v2'

export interface PublicSettings {
  registration_enabled: boolean
  email_verify_enabled: boolean
  force_email_on_third_party_signup: boolean
  registration_email_suffix_whitelist: string[]
  promo_code_enabled: boolean
  password_reset_enabled: boolean
  invitation_code_enabled: boolean
  turnstile_enabled: boolean
  turnstile_site_key: string
  site_name: string
  site_logo: string
  site_subtitle: string
  api_base_url: string
  contact_info: string
  doc_url: string
  home_content: string
  hide_ccs_import_button: boolean
  payment_enabled: boolean
  table_default_page_size: number
  table_page_size_options: number[]
  custom_menu_items: CustomMenuItem[]
  custom_endpoints: CustomEndpoint[]
  linuxdo_oauth_enabled: boolean
  wechat_oauth_enabled: boolean
  wechat_oauth_open_enabled?: boolean
  wechat_oauth_mp_enabled?: boolean
  wechat_oauth_mobile_enabled?: boolean
  oidc_oauth_enabled: boolean
  oidc_oauth_provider_name: string
  backend_mode_enabled: boolean
  version: string
  balance_low_notify_enabled: boolean
  account_quota_notify_enabled: boolean
  balance_low_notify_threshold: number
}

export interface CustomMenuItem {
  id: string
  label: string
  icon_svg: string
  url: string
  visibility: 'user' | 'admin'
  sort_order: number
}

export interface CustomEndpoint {
  name: string
  endpoint: string
  description: string
}

export interface User {
  id: number
  username: string
  email: string
  avatar_url?: string | null
  role: 'admin' | 'user'
  balance: number
  concurrency: number
  status: 'active' | 'disabled'
  allowed_groups: number[] | null
  balance_notify_enabled: boolean
  balance_notify_threshold: number | null
  balance_notify_extra_emails: NotifyEmailEntry[]
  subscriptions?: UserSubscription[]
  created_at: string
  updated_at: string
  auth_bindings?: Partial<Record<UserAuthProvider, boolean | Record<string, unknown>>>
  identity_bindings?: Partial<Record<UserAuthProvider, boolean | Record<string, unknown>>>
}

export interface AdminUser extends User {
  notes: string
  last_used_at?: string | null
  current_concurrency?: number
  group_rates?: Record<number, number>
}

export interface Group {
  id: number
  name: string
  description: string | null
  platform: GroupPlatform
  rate_multiplier: number
  is_exclusive: boolean
  status: 'active' | 'inactive'
  subscription_type: SubscriptionType
  daily_limit_usd: number | null
  weekly_limit_usd: number | null
  monthly_limit_usd: number | null
  claude_code_only: boolean
  fallback_group_id: number | null
  fallback_group_id_on_invalid_request: number | null
  allow_messages_dispatch?: boolean
  default_mapped_model?: string
  require_oauth_only: boolean
  require_privacy_set: boolean
  created_at: string
  updated_at: string
}

export interface AdminGroup extends Group {
  model_routing: Record<string, number[]> | null
  model_routing_enabled: boolean
  mcp_xml_inject: boolean
  supported_model_scopes?: string[]
  account_count?: number
  active_account_count?: number
  rate_limited_account_count?: number
  sort_order: number
}

export interface ApiKey {
  id: number
  user_id: number
  key: string
  name: string
  group_id: number | null
  status: 'active' | 'inactive' | 'quota_exhausted' | 'expired'
  ip_whitelist: string[]
  ip_blacklist: string[]
  last_used_at: string | null
  quota: number
  quota_used: number
  expires_at: string | null
  created_at: string
  updated_at: string
  group?: Group
  rate_limit_5h: number
  rate_limit_1d: number
  rate_limit_7d: number
  usage_5h: number
  usage_1d: number
  usage_7d: number
  reset_5h_at: string | null
  reset_1d_at: string | null
  reset_7d_at: string | null
}

export interface CreateApiKeyRequest {
  name: string
  group_id?: number | null
  custom_key?: string
  ip_whitelist?: string[]
  ip_blacklist?: string[]
  quota?: number
  expires_in_days?: number
  rate_limit_5h?: number
  rate_limit_1d?: number
  rate_limit_7d?: number
}

export interface UpdateApiKeyRequest {
  name?: string
  group_id?: number | null
  status?: 'active' | 'inactive'
  ip_whitelist?: string[]
  ip_blacklist?: string[]
  quota?: number
  expires_at?: string | null
  reset_quota?: boolean
  rate_limit_5h?: number
  rate_limit_1d?: number
  rate_limit_7d?: number
  reset_rate_limit_usage?: boolean
}

export interface UsageLog {
  id: number
  user_id: number
  api_key_id: number
  account_id: number | null
  request_id: string
  model: string
  service_tier?: string | null
  reasoning_effort?: string | null
  inbound_endpoint?: string | null
  upstream_endpoint?: string | null
  group_id: number | null
  subscription_id: number | null
  input_tokens: number
  output_tokens: number
  cache_creation_tokens: number
  cache_read_tokens: number
  cache_creation_5m_tokens: number
  cache_creation_1h_tokens: number
  input_cost: number
  output_cost: number
  cache_creation_cost: number
  cache_read_cost: number
  total_cost: number
  actual_cost: number
  rate_multiplier: number
  billing_type: number
  request_type?: UsageRequestType
  stream: boolean
  duration_ms: number
  first_token_ms: number | null
  image_count: number
  image_size: string | null
  user_agent: string | null
  cache_ttl_overridden: boolean
  billing_mode?: string | null
  created_at: string
  user?: User
  api_key?: ApiKey
  group?: Group
  subscription?: UserSubscription
}

export interface AdminUsageLog extends UsageLog {
  upstream_model?: string | null
  model_mapping_chain?: string | null
  account_rate_multiplier?: number | null
  account_stats_cost?: number | null
  channel_id?: number | null
  billing_tier?: string | null
  ip_address?: string | null
  account?: { id: number; name: string }
}

export interface DashboardStats {
  total_users: number
  today_new_users: number
  active_users: number
  hourly_active_users: number
  stats_updated_at: string
  stats_stale: boolean
  total_api_keys: number
  active_api_keys: number
  total_accounts: number
  normal_accounts: number
  error_accounts: number
  ratelimit_accounts: number
  overload_accounts: number
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
  total_cache_creation_tokens: number
  total_cache_read_tokens: number
  total_tokens: number
  total_cost: number
  total_actual_cost: number
  total_account_cost: number
  today_requests: number
  today_input_tokens: number
  today_output_tokens: number
  today_cache_creation_tokens: number
  today_cache_read_tokens: number
  today_tokens: number
  today_cost: number
  today_actual_cost: number
  today_account_cost: number
  average_duration_ms: number
  uptime: number
  rpm: number
  tpm: number
}

export interface UsageStatsResponse {
  period?: string
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
  total_cache_tokens: number
  total_tokens: number
  total_cost: number
  total_actual_cost: number
  average_duration_ms: number
  models?: Record<string, number>
}

export interface TrendDataPoint {
  date: string
  requests: number
  input_tokens: number
  output_tokens: number
  cache_creation_tokens: number
  cache_read_tokens: number
  total_tokens: number
  cost: number
  actual_cost: number
}

export interface ModelStat {
  model: string
  requests: number
  input_tokens: number
  output_tokens: number
  cache_creation_tokens: number
  cache_read_tokens: number
  total_tokens: number
  cost: number
  actual_cost: number
  account_cost: number
}

export interface GroupStat {
  group_id: number
  group_name: string
  requests: number
  total_tokens: number
  cost: number
  actual_cost: number
  account_cost: number
}

export interface UserBreakdownItem {
  user_id: number
  email: string
  requests: number
  total_tokens: number
  cost: number
  actual_cost: number
  account_cost: number
}

export interface UserUsageTrendPoint {
  date: string
  user_id: number
  email: string
  username: string
  requests: number
  tokens: number
  cost: number
  actual_cost: number
}

export interface UserSpendingRankingItem {
  user_id: number
  email: string
  actual_cost: number
  requests: number
  tokens: number
}

export interface UserSpendingRankingResponse {
  ranking: UserSpendingRankingItem[]
  total_actual_cost: number
  total_requests: number
  total_tokens: number
  start_date: string
  end_date: string
}

export interface ApiKeyUsageTrendPoint {
  date: string
  api_key_id: number
  key_name: string
  requests: number
  tokens: number
}

export interface UserSubscription {
  id: number
  user_id: number
  group_id: number
  status: 'active' | 'expired' | 'revoked'
  daily_usage_usd: number
  weekly_usage_usd: number
  monthly_usage_usd: number
  daily_window_start: string | null
  weekly_window_start: string | null
  monthly_window_start: string | null
  created_at: string
  updated_at: string
  expires_at: string | null
  user?: User
  group?: Group
}

export interface SubscriptionProgress {
  subscription_id: number
  daily: { used: number; limit: number | null; percentage: number; reset_in_seconds: number | null } | null
  weekly: { used: number; limit: number | null; percentage: number; reset_in_seconds: number | null } | null
  monthly: { used: number; limit: number | null; percentage: number; reset_in_seconds: number | null } | null
  expires_at: string | null
  days_remaining: number | null
}

export interface AnnouncementCondition {
  type: 'subscription' | 'balance'
  operator: 'in' | 'gt' | 'gte' | 'lt' | 'lte' | 'eq'
  group_ids?: number[]
  value?: number
}

export interface AnnouncementConditionGroup {
  all_of?: AnnouncementCondition[]
}

export interface AnnouncementTargeting {
  any_of?: AnnouncementConditionGroup[]
}

export interface Announcement {
  id: number
  title: string
  content: string
  status: 'draft' | 'active' | 'archived'
  notify_mode: 'silent' | 'popup'
  targeting: AnnouncementTargeting
  starts_at?: string
  ends_at?: string
  created_by?: number
  updated_by?: number
  created_at: string
  updated_at: string
}

export interface UserAnnouncement {
  id: number
  title: string
  content: string
  notify_mode: 'silent' | 'popup'
  starts_at?: string
  ends_at?: string
  read_at?: string
  created_at: string
  updated_at: string
}

export interface AnnouncementUserReadStatus {
  user_id: number
  email: string
  username: string
  balance: number
  eligible: boolean
  read_at?: string
}

export interface PromoCode {
  id: number
  code: string
  bonus_amount: number
  max_uses: number
  used_count: number
  status: 'active' | 'disabled'
  expires_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PromoCodeUsage {
  id: number
  promo_code_id: number
  user_id: number
  bonus_amount: number
  used_at: string
  user?: User
}

export interface RedeemCode {
  id: number
  code: string
  type: RedeemCodeType
  value: number
  status: 'active' | 'used' | 'expired' | 'unused'
  used_by: number | null
  used_at: string | null
  created_at: string
  updated_at?: string
  group_id?: number | null
  validity_days?: number
  user?: User
  group?: Group
}

export interface Proxy {
  id: number
  name: string
  protocol: ProxyProtocol
  host: string
  port: number
  username: string | null
  password?: string | null
  status: 'active' | 'inactive'
  account_count?: number
  latency_ms?: number
  latency_status?: 'success' | 'failed'
  latency_message?: string
  ip_address?: string
  country?: string
  country_code?: string
  region?: string
  city?: string
  quality_status?: 'healthy' | 'warn' | 'challenge' | 'failed'
  quality_score?: number
  quality_grade?: string
  quality_summary?: string
  quality_checked?: number
  created_at: string
  updated_at: string
}

export interface ProxyAccountSummary {
  id: number
  name: string
  platform: AccountPlatform
  type: AccountType
  notes?: string | null
}

export interface ProxyQualityCheckItem {
  target: string
  status: 'pass' | 'warn' | 'fail' | 'challenge'
  http_status?: number
  latency_ms?: number
  message?: string
  cf_ray?: string
}

export interface ProxyQualityCheckResult {
  proxy_id: number
  score: number
  grade: string
  summary: string
  exit_ip?: string
  country?: string
  country_code?: string
  base_latency_ms?: number
  passed_count: number
  warn_count: number
  failed_count: number
  challenge_count: number
  checked_at: number
  items: ProxyQualityCheckItem[]
}

export interface Account {
  id: number
  name: string
  notes?: string | null
  platform: AccountPlatform
  type: AccountType
  credentials?: Record<string, unknown>
  extra?: Record<string, unknown>
  proxy_id: number | null
  concurrency: number
  load_factor?: number | null
  current_concurrency?: number
  priority: number
  rate_multiplier?: number
  group_ids?: number[]
  schedulable?: boolean
  status?: 'active' | 'inactive' | 'error'
  expires_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface WindowStats {
  requests: number
  tokens: number
  cost: number
  actual_cost: number
  user_cost?: number
}

export interface AccountUsageHistory {
  date: string
  label: string
  requests: number
  tokens: number
  cost: number
  actual_cost: number
  user_cost: number
}

export interface AccountUsageSummary {
  days: number
  actual_days_used: number
  total_cost: number
  total_user_cost: number
  total_standard_cost: number
  total_requests: number
  total_tokens: number
  avg_daily_cost: number
  avg_daily_user_cost: number
  avg_daily_requests: number
  avg_daily_tokens: number
  avg_duration_ms: number
  today: { date: string; cost: number; user_cost: number; requests: number; tokens: number } | null
}

export interface AccountUsageStatsResponse {
  history: AccountUsageHistory[]
  summary: AccountUsageSummary
  models: ModelStat[]
  endpoints: EndpointStat[]
  upstream_endpoints: EndpointStat[]
}

export interface EndpointStat {
  endpoint: string
  requests: number
  total_tokens: number
  cost: number
  actual_cost: number
}

export interface AccountUsageInfo {
  primary?: WindowStats
  secondary?: WindowStats
  canonical_5h?: WindowStats
  canonical_7d?: WindowStats
  updated_at?: string
}

export interface CreateGroupRequest {
  name: string
  description?: string | null
  platform?: GroupPlatform
  rate_multiplier?: number
  is_exclusive?: boolean
  subscription_type?: SubscriptionType
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {
  status?: 'active' | 'inactive'
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  username?: string
  notes?: string
  role?: 'admin' | 'user'
  balance?: number
  concurrency?: number
  status?: 'active' | 'disabled'
  allowed_groups?: number[] | null
  group_rates?: Record<number, number | null>
}

export interface CreateAnnouncementRequest {
  title: string
  content: string
  status?: 'draft' | 'active' | 'archived'
  notify_mode?: 'silent' | 'popup'
  targeting: AnnouncementTargeting
  starts_at?: number
  ends_at?: number
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {}

export interface CreatePromoCodeRequest {
  code?: string
  bonus_amount: number
  max_uses?: number
  expires_at?: number | null
  notes?: string
}

export interface UpdatePromoCodeRequest extends Partial<CreatePromoCodeRequest> {
  status?: 'active' | 'disabled'
}

export interface GenerateRedeemCodesRequest {
  count: number
  type: RedeemCodeType
  value: number
  group_id?: number | null
  validity_days?: number
}

export interface AssignSubscriptionRequest {
  user_id: number
  group_id: number
  validity_days?: number
}

export interface BulkAssignSubscriptionRequest {
  user_ids: number[]
  group_id: number
  validity_days?: number
}

export interface ExtendSubscriptionRequest {
  days: number
}

export interface SimpleUser {
  id: number
  email: string
}

export interface CreateProxyRequest {
  name: string
  protocol: ProxyProtocol
  host: string
  port: number
  username?: string | null
  password?: string | null
}

export interface UpdateProxyRequest extends Partial<CreateProxyRequest> {
  status?: 'active' | 'inactive'
}

export interface CreateAccountRequest {
  name: string
  notes?: string | null
  platform: AccountPlatform
  type: AccountType
  credentials: Record<string, unknown>
  extra?: Record<string, unknown>
  proxy_id?: number | null
  concurrency?: number
  load_factor?: number | null
  priority?: number
  rate_multiplier?: number
  group_ids?: number[]
  expires_at?: number | null
  auto_pause_on_expired?: boolean
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {
  schedulable?: boolean
  status?: 'active' | 'inactive' | 'error'
}

export interface AdminDataPayload {
  type?: string
  version?: number
  exported_at: string
  proxies?: unknown[]
  accounts?: unknown[]
}

export interface AdminDataImportResult {
  proxy_created?: number
  proxy_reused?: number
  proxy_failed?: number
  account_created?: number
  account_failed?: number
  errors?: Array<{ kind: string; message: string }>
}

export interface CheckMixedChannelRequest {
  platform: AccountPlatform
  group_ids: number[]
  account_id?: number
}

export interface CheckMixedChannelResponse {
  has_risk: boolean
  error?: string
  message?: string
}

export interface TempUnschedulableStatus {
  active: boolean
  state?: {
    until_unix: number
    triggered_at_unix: number
    status_code: number
    matched_keyword: string
    rule_index: number
    error_message: string
  }
}

export interface ClaudeModel {
  id: string
  type: string
  display_name: string
  created_at: string
}

export interface UserAttributeOption {
  value: string
  label: string
  [key: string]: unknown
}

export interface UserAttributeValidation {
  min_length?: number
  max_length?: number
  min?: number
  max?: number
  pattern?: string
  message?: string
}

export interface UserAttributeDefinition {
  id: number
  key: string
  name: string
  description: string
  type: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'date' | 'select' | 'multi_select'
  options: UserAttributeOption[]
  required: boolean
  validation: UserAttributeValidation
  placeholder: string
  display_order: number
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface PaymentRecoverySnapshot {
  orderId: number
  amount: number
  qrCode: string
  expiresAt: string
  paymentType: string
  payUrl: string
  outTradeNo: string
  clientSecret: string
  payAmount: number
  orderType: string
  paymentMode: string
  resumeToken: string
  createdAt: number
}

export interface SetupStatus {
  needs_setup: boolean
  step: string
}

export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  dbname: string
  sslmode: string
}

export interface RedisConfig {
  host: string
  port: number
  password: string
  db: number
  enable_tls: boolean
}

export interface AdminConfig {
  email: string
  password: string
}

export interface ServerConfig {
  host: string
  port: number
  mode: string
}

export interface InstallRequest {
  database: DatabaseConfig
  redis: RedisConfig
  admin: AdminConfig
  server: ServerConfig
}

export interface InstallResponse {
  message: string
  restart: boolean
}

// ==================== Settings Types ====================

export interface DefaultSubscriptionSetting {
  group_id: number
  validity_days: number
}

export type AuthSourceType = 'email' | 'linuxdo' | 'oidc' | 'wechat'

export interface AuthSourceDefaultsValue {
  balance: number
  concurrency: number
  subscriptions: DefaultSubscriptionSetting[]
  grant_on_signup: boolean
  grant_on_first_bind: boolean
}

export type AuthSourceDefaultsState = Record<AuthSourceType, AuthSourceDefaultsValue>

export type WeChatConnectMode = 'open' | 'mp' | 'mobile'

export interface WeChatConnectModeOption {
  value: WeChatConnectMode
  labelZh: string
  labelEn: string
}

export interface SystemSettings {
  registration_enabled: boolean
  email_verify_enabled: boolean
  registration_email_suffix_whitelist: string[]
  promo_code_enabled: boolean
  password_reset_enabled: boolean
  frontend_url: string
  invitation_code_enabled: boolean
  totp_enabled: boolean
  totp_encryption_key_configured: boolean
  default_balance: number
  default_concurrency: number
  default_subscriptions: DefaultSubscriptionSetting[]
  auth_source_default_email_balance?: number
  auth_source_default_email_concurrency?: number
  auth_source_default_email_subscriptions?: DefaultSubscriptionSetting[]
  auth_source_default_email_grant_on_signup?: boolean
  auth_source_default_email_grant_on_first_bind?: boolean
  auth_source_default_linuxdo_balance?: number
  auth_source_default_linuxdo_concurrency?: number
  auth_source_default_linuxdo_subscriptions?: DefaultSubscriptionSetting[]
  auth_source_default_linuxdo_grant_on_signup?: boolean
  auth_source_default_linuxdo_grant_on_first_bind?: boolean
  auth_source_default_oidc_balance?: number
  auth_source_default_oidc_concurrency?: number
  auth_source_default_oidc_subscriptions?: DefaultSubscriptionSetting[]
  auth_source_default_oidc_grant_on_signup?: boolean
  auth_source_default_oidc_grant_on_first_bind?: boolean
  auth_source_default_wechat_balance?: number
  auth_source_default_wechat_concurrency?: number
  auth_source_default_wechat_subscriptions?: DefaultSubscriptionSetting[]
  auth_source_default_wechat_grant_on_signup?: boolean
  auth_source_default_wechat_grant_on_first_bind?: boolean
  force_email_on_third_party_signup?: boolean
  site_name: string
  site_logo: string
  site_subtitle: string
  api_base_url: string
  contact_info: string
  doc_url: string
  home_content: string
  hide_ccs_import_button: boolean
  table_default_page_size: number
  table_page_size_options: number[]
  backend_mode_enabled: boolean
  custom_menu_items: CustomMenuItem[]
  custom_endpoints: CustomEndpoint[]
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password_configured: boolean
  smtp_from_email: string
  smtp_from_name: string
  smtp_use_tls: boolean
  turnstile_enabled: boolean
  turnstile_site_key: string
  turnstile_secret_key_configured: boolean
  linuxdo_connect_enabled: boolean
  linuxdo_connect_client_id: string
  linuxdo_connect_client_secret_configured: boolean
  linuxdo_connect_redirect_url: string
  wechat_connect_enabled: boolean
  wechat_connect_app_id: string
  wechat_connect_app_secret_configured: boolean
  wechat_connect_open_app_id?: string
  wechat_connect_open_app_secret_configured?: boolean
  wechat_connect_mp_app_id?: string
  wechat_connect_mp_app_secret_configured?: boolean
  wechat_connect_mobile_app_id?: string
  wechat_connect_mobile_app_secret_configured?: boolean
  wechat_connect_open_enabled?: boolean
  wechat_connect_mp_enabled?: boolean
  wechat_connect_mobile_enabled?: boolean
  wechat_connect_mode: string
  wechat_connect_scopes: string
  wechat_connect_redirect_url: string
  wechat_connect_frontend_redirect_url: string
  oidc_connect_enabled: boolean
  oidc_connect_provider_name: string
  oidc_connect_client_id: string
  oidc_connect_client_secret_configured: boolean
  oidc_connect_issuer_url: string
  oidc_connect_discovery_url: string
  oidc_connect_authorize_url: string
  oidc_connect_token_url: string
  oidc_connect_userinfo_url: string
  oidc_connect_jwks_url: string
  oidc_connect_scopes: string
  oidc_connect_redirect_url: string
  oidc_connect_frontend_redirect_url: string
  oidc_connect_token_auth_method: string
  oidc_connect_use_pkce: boolean
  oidc_connect_validate_id_token: boolean
  oidc_connect_allowed_signing_algs: string
  oidc_connect_clock_skew_seconds: number
  oidc_connect_require_email_verified: boolean
  oidc_connect_userinfo_email_path: string
  oidc_connect_userinfo_id_path: string
  oidc_connect_userinfo_username_path: string
  enable_model_fallback: boolean
  fallback_model_anthropic: string
  fallback_model_openai: string
  fallback_model_gemini: string
  fallback_model_antigravity: string
  enable_identity_patch: boolean
  identity_patch_prompt: string
  ops_monitoring_enabled: boolean
  ops_realtime_monitoring_enabled: boolean
  ops_query_mode_default: string
  ops_metrics_interval_seconds: number
  min_claude_code_version: string
  max_claude_code_version: string
  allow_ungrouped_key_scheduling: boolean
  enable_fingerprint_unification: boolean
  enable_metadata_passthrough: boolean
  enable_cch_signing: boolean
  web_search_emulation_enabled?: boolean
  payment_enabled: boolean
  payment_min_amount: number
  payment_max_amount: number
  payment_daily_limit: number
  payment_order_timeout_minutes: number
  payment_max_pending_orders: number
  payment_enabled_types: string[]
  payment_balance_disabled: boolean
  payment_balance_recharge_multiplier: number
  payment_recharge_fee_rate: number
  payment_load_balance_strategy: string
  payment_product_name_prefix: string
  payment_product_name_suffix: string
  payment_help_image_url: string
  payment_help_text: string
  payment_cancel_rate_limit_enabled: boolean
  payment_cancel_rate_limit_max: number
  payment_cancel_rate_limit_window: number
  payment_cancel_rate_limit_unit: string
  payment_cancel_rate_limit_window_mode: string
  payment_visible_method_alipay_source?: string
  payment_visible_method_wxpay_source?: string
  payment_visible_method_alipay_enabled?: boolean
  payment_visible_method_wxpay_enabled?: boolean
  openai_advanced_scheduler_enabled?: boolean
  balance_low_notify_enabled: boolean
  balance_low_notify_threshold: number
  balance_low_notify_recharge_url: string
  account_quota_notify_enabled: boolean
  account_quota_notify_emails: NotifyEmailEntry[]
}

export interface UpdateSettingsRequest {
  registration_enabled?: boolean
  email_verify_enabled?: boolean
  registration_email_suffix_whitelist?: string[]
  promo_code_enabled?: boolean
  password_reset_enabled?: boolean
  frontend_url?: string
  invitation_code_enabled?: boolean
  totp_enabled?: boolean
  default_balance?: number
  default_concurrency?: number
  default_subscriptions?: DefaultSubscriptionSetting[]
  auth_source_default_email_balance?: number
  auth_source_default_email_concurrency?: number
  auth_source_default_email_subscriptions?: DefaultSubscriptionSetting[]
  auth_source_default_email_grant_on_signup?: boolean
  auth_source_default_email_grant_on_first_bind?: boolean
  auth_source_default_linuxdo_balance?: number
  auth_source_default_linuxdo_concurrency?: number
  auth_source_default_linuxdo_subscriptions?: DefaultSubscriptionSetting[]
  auth_source_default_linuxdo_grant_on_signup?: boolean
  auth_source_default_linuxdo_grant_on_first_bind?: boolean
  auth_source_default_oidc_balance?: number
  auth_source_default_oidc_concurrency?: number
  auth_source_default_oidc_subscriptions?: DefaultSubscriptionSetting[]
  auth_source_default_oidc_grant_on_signup?: boolean
  auth_source_default_oidc_grant_on_first_bind?: boolean
  auth_source_default_wechat_balance?: number
  auth_source_default_wechat_concurrency?: number
  auth_source_default_wechat_subscriptions?: DefaultSubscriptionSetting[]
  auth_source_default_wechat_grant_on_signup?: boolean
  auth_source_default_wechat_grant_on_first_bind?: boolean
  force_email_on_third_party_signup?: boolean
  site_name?: string
  site_logo?: string
  site_subtitle?: string
  api_base_url?: string
  contact_info?: string
  doc_url?: string
  home_content?: string
  hide_ccs_import_button?: boolean
  table_default_page_size?: number
  table_page_size_options?: number[]
  backend_mode_enabled?: boolean
  custom_menu_items?: CustomMenuItem[]
  custom_endpoints?: CustomEndpoint[]
  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string
  smtp_from_email?: string
  smtp_from_name?: string
  smtp_use_tls?: boolean
  turnstile_enabled?: boolean
  turnstile_site_key?: string
  turnstile_secret_key?: string
  linuxdo_connect_enabled?: boolean
  linuxdo_connect_client_id?: string
  linuxdo_connect_client_secret?: string
  linuxdo_connect_redirect_url?: string
  wechat_connect_enabled?: boolean
  wechat_connect_app_id?: string
  wechat_connect_app_secret?: string
  wechat_connect_open_app_id?: string
  wechat_connect_open_app_secret?: string
  wechat_connect_mp_app_id?: string
  wechat_connect_mp_app_secret?: string
  wechat_connect_mobile_app_id?: string
  wechat_connect_mobile_app_secret?: string
  wechat_connect_open_enabled?: boolean
  wechat_connect_mp_enabled?: boolean
  wechat_connect_mobile_enabled?: boolean
  wechat_connect_mode?: string
  wechat_connect_scopes?: string
  wechat_connect_redirect_url?: string
  wechat_connect_frontend_redirect_url?: string
  oidc_connect_enabled?: boolean
  oidc_connect_provider_name?: string
  oidc_connect_client_id?: string
  oidc_connect_client_secret?: string
  oidc_connect_issuer_url?: string
  oidc_connect_discovery_url?: string
  oidc_connect_authorize_url?: string
  oidc_connect_token_url?: string
  oidc_connect_userinfo_url?: string
  oidc_connect_jwks_url?: string
  oidc_connect_scopes?: string
  oidc_connect_redirect_url?: string
  oidc_connect_frontend_redirect_url?: string
  oidc_connect_token_auth_method?: string
  oidc_connect_use_pkce?: boolean
  oidc_connect_validate_id_token?: boolean
  oidc_connect_allowed_signing_algs?: string
  oidc_connect_clock_skew_seconds?: number
  oidc_connect_require_email_verified?: boolean
  oidc_connect_userinfo_email_path?: string
  oidc_connect_userinfo_id_path?: string
  oidc_connect_userinfo_username_path?: string
  enable_model_fallback?: boolean
  fallback_model_anthropic?: string
  fallback_model_openai?: string
  fallback_model_gemini?: string
  fallback_model_antigravity?: string
  enable_identity_patch?: boolean
  identity_patch_prompt?: string
  ops_monitoring_enabled?: boolean
  ops_realtime_monitoring_enabled?: boolean
  ops_query_mode_default?: string
  ops_metrics_interval_seconds?: number
  min_claude_code_version?: string
  max_claude_code_version?: string
  allow_ungrouped_key_scheduling?: boolean
  enable_fingerprint_unification?: boolean
  enable_metadata_passthrough?: boolean
  enable_cch_signing?: boolean
  payment_enabled?: boolean
  payment_min_amount?: number
  payment_max_amount?: number
  payment_daily_limit?: number
  payment_order_timeout_minutes?: number
  payment_max_pending_orders?: number
  payment_enabled_types?: string[]
  payment_balance_disabled?: boolean
  payment_balance_recharge_multiplier?: number
  payment_recharge_fee_rate?: number
  payment_load_balance_strategy?: string
  payment_product_name_prefix?: string
  payment_product_name_suffix?: string
  payment_help_image_url?: string
  payment_help_text?: string
  payment_cancel_rate_limit_enabled?: boolean
  payment_cancel_rate_limit_max?: number
  payment_cancel_rate_limit_window?: number
  payment_cancel_rate_limit_unit?: string
  payment_cancel_rate_limit_window_mode?: string
  payment_visible_method_alipay_source?: string
  payment_visible_method_wxpay_source?: string
  payment_visible_method_alipay_enabled?: boolean
  payment_visible_method_wxpay_enabled?: boolean
  openai_advanced_scheduler_enabled?: boolean
  balance_low_notify_enabled?: boolean
  balance_low_notify_threshold?: number
  balance_low_notify_recharge_url?: string
  account_quota_notify_enabled?: boolean
  account_quota_notify_emails?: NotifyEmailEntry[]
}

// ==================== Backup Types ====================

export interface BackupS3Config {
  endpoint: string
  region: string
  bucket: string
  access_key_id: string
  secret_access_key?: string
  prefix: string
  force_path_style: boolean
}

export interface BackupScheduleConfig {
  enabled: boolean
  cron_expr: string
  retain_days: number
  retain_count: number
}

export interface BackupRecord {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  backup_type: string
  file_name: string
  s3_key: string
  size_bytes: number
  triggered_by: string
  error_message?: string
  started_at: string
  finished_at?: string
  expires_at?: string
  progress?: string
  restore_status?: string
  restore_error?: string
  restored_at?: string
}

// ==================== Gateway Types ====================

export interface OverloadCooldownSettings {
  enabled: boolean
  cooldown_minutes: number
}

export interface StreamTimeoutSettings {
  enabled: boolean
  action: 'temp_unsched' | 'error' | 'none'
  temp_unsched_minutes: number
  threshold_count: number
  threshold_window_minutes: number
}

export interface RectifierSettings {
  enabled: boolean
  thinking_signature_enabled: boolean
  thinking_budget_enabled: boolean
  apikey_signature_enabled: boolean
  apikey_signature_patterns: string[]
}

export interface BetaPolicyRule {
  beta_token: string
  action: 'pass' | 'filter' | 'block'
  scope: 'all' | 'oauth' | 'apikey' | 'bedrock'
  error_message?: string
  model_whitelist?: string[]
  fallback_action?: 'pass' | 'filter' | 'block'
  fallback_error_message?: string
}

export interface BetaPolicySettings {
  rules: BetaPolicyRule[]
}

export interface WebSearchProviderConfig {
  type: 'brave' | 'tavily'
  api_key: string
  api_key_configured: boolean
  quota_limit: number | null
  subscribed_at: number | null
  quota_used?: number
  proxy_id: number | null
  expires_at: number | null
}

export interface WebSearchEmulationConfig {
  enabled: boolean
  providers: WebSearchProviderConfig[]
}

// ==================== System Types ====================

export interface VersionInfo {
  current_version: string
  latest_version: string
  has_update: boolean
  release_info?: {
    name: string
    body: string
    published_at: string
    html_url: string
  }
  cached: boolean
  warning?: string
  build_type: string
}

export interface UpdateResult {
  message: string
  need_restart: boolean
}

export type { CheckoutInfoResponse, CreateOrderRequest, CreateOrderResult, PaymentChannel, PaymentConfig, PaymentDashboardStats, PaymentOrder, ProviderInstance, SubscriptionPlan } from './payment'
export * from './channels'
