<template>
  <div class="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
    <!-- Left Sidebar Navigation -->
    <aside class="flex w-56 flex-col border-r border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
      <div class="border-b border-slate-700/50 p-4">
        <h2 class="text-lg font-bold text-white">系统设置</h2>
        <p class="text-xs text-slate-400 mt-1">管理所有系统配置</p>
      </div>
      <nav class="flex-1 overflow-y-auto p-3 space-y-1">
        <button
          v-for="cat in categories"
          :key="cat.key"
          @click="activeCategory = cat.key"
          class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
          :class="activeCategory === cat.key
            ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
            : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'"
        >
          <span class="text-lg">{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
          <svg v-if="activeCategory === cat.key" class="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
      <div class="border-t border-slate-700/50 p-3">
        <div class="flex gap-2">
          <button
            @click="refreshAll"
            :disabled="loading"
            class="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            {{ loading ? '加载中...' : '刷新' }}
          </button>
          <button
            @click="saveAll"
            :disabled="saving"
            class="flex-1 rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-3 py-2 text-xs font-medium text-gold-400 transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30 disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto">
      <!-- Loading / Empty State -->
      <div v-if="!form" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
          <p class="text-sm text-slate-400">{{ loading ? '加载中...' : '加载设置失败，请刷新重试' }}</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="p-6">
        <component
          :is="currentComponent"
          :form="form"
          v-bind="currentProps"
          @update:form="handleFormUpdate"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, type Component } from 'vue'
import { adminAPI } from '@/api/admin'
import type { SystemSettings, UpdateSettingsRequest } from '@/types'
import { showSuccess, showError } from '@/utils/toast'

import GeneralSettings from '@/components/admin/settings/GeneralSettings.vue'
import SecuritySettings from '@/components/admin/settings/SecuritySettings.vue'
import UserDefaultsSettings from '@/components/admin/settings/UserDefaultsSettings.vue'
import GatewaySettings from '@/components/admin/settings/GatewaySettings.vue'
import PaymentSettings from '@/components/admin/settings/PaymentSettings.vue'
import EmailSettings from '@/components/admin/settings/EmailSettings.vue'
import BackupSettings from '@/components/admin/settings/BackupSettings.vue'
import SystemSettingsComp from '@/components/admin/settings/SystemSettings.vue'

const categories = [
  { key: 'general', label: '通用设置', icon: '🏠' },
  { key: 'security', label: '安全设置', icon: '🔐' },
  { key: 'users', label: '用户默认', icon: '👤' },
  { key: 'gateway', label: '网关配置', icon: '⚡' },
  { key: 'payment', label: '支付配置', icon: '💳' },
  { key: 'email', label: '邮件配置', icon: '📧' },
  { key: 'backup', label: '备份管理', icon: '🗄️' },
  { key: 'system', label: '系统信息', icon: 'ℹ️' },
] as const

type CategoryKey = typeof categories[number]['key']
const activeCategory = ref<CategoryKey>('general')

const componentMap: Record<CategoryKey, Component> = {
  general: GeneralSettings,
  security: SecuritySettings,
  users: UserDefaultsSettings,
  gateway: GatewaySettings,
  payment: PaymentSettings,
  email: EmailSettings,
  backup: BackupSettings,
  system: SystemSettingsComp,
}

const currentComponent = computed(() => componentMap[activeCategory.value])

// Extra props for specific components (e.g., independent data fetchers)
const currentProps = computed(() => {
  return {}
})

interface SettingsForm extends SystemSettings {
  smtp_password: string
  turnstile_secret_key: string
  linuxdo_connect_client_secret: string
  wechat_connect_app_secret: string
  wechat_connect_open_app_secret: string
  wechat_connect_mp_app_secret: string
  wechat_connect_mobile_app_secret: string
  oidc_connect_client_secret: string
}

const loading = ref(false)
const saving = ref(false)
const form = ref<SettingsForm | null>(null)

onMounted(() => {
  loadSettings()
})

async function loadSettings() {
  loading.value = true
  try {
    const data = await adminAPI.settings.getSettings() as any
    form.value = {
      ...data,
      smtp_password: '',
      turnstile_secret_key: '',
      linuxdo_connect_client_secret: '',
      wechat_connect_app_secret: '',
      wechat_connect_open_app_secret: '',
      wechat_connect_mp_app_secret: '',
      wechat_connect_mobile_app_secret: '',
      oidc_connect_client_secret: '',
    } as SettingsForm
  } catch (error: any) {
    showError(error.response?.data?.error || '加载设置失败')
  } finally {
    loading.value = false
  }
}

function handleFormUpdate(partial: Partial<SettingsForm>) {
  if (form.value) {
    Object.assign(form.value, partial)
  }
}

async function refreshAll() {
  await loadSettings()
  showSuccess('设置已刷新')
}

function sanitizePayload(f: SettingsForm): UpdateSettingsRequest {
  const payload: Record<string, unknown> = {
    registration_enabled: f.registration_enabled,
    email_verify_enabled: f.email_verify_enabled,
    registration_email_suffix_whitelist: f.registration_email_suffix_whitelist,
    promo_code_enabled: f.promo_code_enabled,
    invitation_code_enabled: f.invitation_code_enabled,
    password_reset_enabled: f.password_reset_enabled,
    totp_enabled: f.totp_enabled,
    default_balance: f.default_balance,
    default_concurrency: f.default_concurrency,
    default_subscriptions: f.default_subscriptions,
    force_email_on_third_party_signup: f.force_email_on_third_party_signup,
    site_name: f.site_name,
    site_logo: f.site_logo,
    site_subtitle: f.site_subtitle,
    api_base_url: f.api_base_url,
    contact_info: f.contact_info,
    doc_url: f.doc_url,
    home_content: f.home_content,
    backend_mode_enabled: f.backend_mode_enabled,
    hide_ccs_import_button: f.hide_ccs_import_button,
    table_default_page_size: f.table_default_page_size,
    table_page_size_options: f.table_page_size_options,
    custom_menu_items: f.custom_menu_items,
    custom_endpoints: f.custom_endpoints,
    frontend_url: f.frontend_url,
    smtp_host: f.smtp_host,
    smtp_port: f.smtp_port,
    smtp_username: f.smtp_username,
    smtp_password: f.smtp_password || undefined,
    smtp_from_email: f.smtp_from_email,
    smtp_from_name: f.smtp_from_name,
    smtp_use_tls: f.smtp_use_tls,
    turnstile_enabled: f.turnstile_enabled,
    turnstile_site_key: f.turnstile_site_key,
    turnstile_secret_key: f.turnstile_secret_key || undefined,
    linuxdo_connect_enabled: f.linuxdo_connect_enabled,
    linuxdo_connect_client_id: f.linuxdo_connect_client_id,
    linuxdo_connect_client_secret: f.linuxdo_connect_client_secret || undefined,
    linuxdo_connect_redirect_url: f.linuxdo_connect_redirect_url,
    wechat_connect_enabled: f.wechat_connect_enabled,
    wechat_connect_app_id: f.wechat_connect_open_app_id || f.wechat_connect_mp_app_id || f.wechat_connect_mobile_app_id || f.wechat_connect_app_id,
    wechat_connect_app_secret: f.wechat_connect_app_secret || undefined,
    wechat_connect_open_app_id: f.wechat_connect_open_app_id,
    wechat_connect_open_app_secret: f.wechat_connect_open_app_secret || undefined,
    wechat_connect_mp_app_id: f.wechat_connect_mp_app_id,
    wechat_connect_mp_app_secret: f.wechat_connect_mp_app_secret || undefined,
    wechat_connect_mobile_app_id: f.wechat_connect_mobile_app_id,
    wechat_connect_mobile_app_secret: f.wechat_connect_mobile_app_secret || undefined,
    wechat_connect_open_enabled: f.wechat_connect_open_enabled,
    wechat_connect_mp_enabled: f.wechat_connect_mp_enabled,
    wechat_connect_mobile_enabled: f.wechat_connect_mobile_enabled,
    wechat_connect_mode: f.wechat_connect_mode,
    wechat_connect_scopes: f.wechat_connect_scopes,
    wechat_connect_redirect_url: f.wechat_connect_redirect_url,
    wechat_connect_frontend_redirect_url: f.wechat_connect_frontend_redirect_url,
    oidc_connect_enabled: f.oidc_connect_enabled,
    oidc_connect_provider_name: f.oidc_connect_provider_name,
    oidc_connect_client_id: f.oidc_connect_client_id,
    oidc_connect_client_secret: f.oidc_connect_client_secret || undefined,
    oidc_connect_issuer_url: f.oidc_connect_issuer_url,
    oidc_connect_discovery_url: f.oidc_connect_discovery_url,
    oidc_connect_authorize_url: f.oidc_connect_authorize_url,
    oidc_connect_token_url: f.oidc_connect_token_url,
    oidc_connect_userinfo_url: f.oidc_connect_userinfo_url,
    oidc_connect_jwks_url: f.oidc_connect_jwks_url,
    oidc_connect_scopes: f.oidc_connect_scopes,
    oidc_connect_redirect_url: f.oidc_connect_redirect_url,
    oidc_connect_frontend_redirect_url: f.oidc_connect_frontend_redirect_url,
    oidc_connect_token_auth_method: f.oidc_connect_token_auth_method,
    oidc_connect_use_pkce: f.oidc_connect_use_pkce,
    oidc_connect_validate_id_token: f.oidc_connect_validate_id_token,
    oidc_connect_allowed_signing_algs: f.oidc_connect_allowed_signing_algs,
    oidc_connect_clock_skew_seconds: f.oidc_connect_clock_skew_seconds,
    oidc_connect_require_email_verified: f.oidc_connect_require_email_verified,
    oidc_connect_userinfo_email_path: f.oidc_connect_userinfo_email_path,
    oidc_connect_userinfo_id_path: f.oidc_connect_userinfo_id_path,
    oidc_connect_userinfo_username_path: f.oidc_connect_userinfo_username_path,
    enable_model_fallback: f.enable_model_fallback,
    fallback_model_anthropic: f.fallback_model_anthropic,
    fallback_model_openai: f.fallback_model_openai,
    fallback_model_gemini: f.fallback_model_gemini,
    fallback_model_antigravity: f.fallback_model_antigravity,
    enable_identity_patch: f.enable_identity_patch,
    identity_patch_prompt: f.identity_patch_prompt,
    ops_monitoring_enabled: f.ops_monitoring_enabled,
    ops_realtime_monitoring_enabled: f.ops_realtime_monitoring_enabled,
    ops_query_mode_default: f.ops_query_mode_default,
    ops_metrics_interval_seconds: f.ops_metrics_interval_seconds,
    min_claude_code_version: f.min_claude_code_version,
    max_claude_code_version: f.max_claude_code_version,
    allow_ungrouped_key_scheduling: f.allow_ungrouped_key_scheduling,
    enable_fingerprint_unification: f.enable_fingerprint_unification,
    enable_metadata_passthrough: f.enable_metadata_passthrough,
    enable_cch_signing: f.enable_cch_signing,
    payment_enabled: f.payment_enabled,
    payment_min_amount: Number(f.payment_min_amount) || 0,
    payment_max_amount: Number(f.payment_max_amount) || 0,
    payment_daily_limit: Number(f.payment_daily_limit) || 0,
    payment_max_pending_orders: Number(f.payment_max_pending_orders) || 0,
    payment_order_timeout_minutes: Number(f.payment_order_timeout_minutes) || 0,
    payment_balance_disabled: f.payment_balance_disabled,
    payment_balance_recharge_multiplier: Number(f.payment_balance_recharge_multiplier) || 1,
    payment_recharge_fee_rate: Number(f.payment_recharge_fee_rate) || 0,
    payment_enabled_types: f.payment_enabled_types,
    payment_load_balance_strategy: f.payment_load_balance_strategy,
    payment_product_name_prefix: f.payment_product_name_prefix,
    payment_product_name_suffix: f.payment_product_name_suffix,
    payment_help_image_url: f.payment_help_image_url,
    payment_help_text: f.payment_help_text,
    payment_cancel_rate_limit_enabled: f.payment_cancel_rate_limit_enabled,
    payment_cancel_rate_limit_max: Number(f.payment_cancel_rate_limit_max) || 10,
    payment_cancel_rate_limit_window: Number(f.payment_cancel_rate_limit_window) || 1,
    payment_cancel_rate_limit_unit: f.payment_cancel_rate_limit_unit,
    payment_cancel_rate_limit_window_mode: f.payment_cancel_rate_limit_window_mode,
    payment_visible_method_alipay_source: (f as any).payment_visible_method_alipay_source,
    payment_visible_method_wxpay_source: (f as any).payment_visible_method_wxpay_source,
    payment_visible_method_alipay_enabled: (f as any).payment_visible_method_alipay_enabled,
    payment_visible_method_wxpay_enabled: (f as any).payment_visible_method_wxpay_enabled,
    openai_advanced_scheduler_enabled: f.openai_advanced_scheduler_enabled,
    balance_low_notify_enabled: f.balance_low_notify_enabled,
    balance_low_notify_threshold: f.balance_low_notify_threshold,
    balance_low_notify_recharge_url: f.balance_low_notify_recharge_url,
    account_quota_notify_enabled: f.account_quota_notify_enabled,
    account_quota_notify_emails: f.account_quota_notify_emails,
  }

  // Auth source defaults
  for (const source of ['email', 'linuxdo', 'oidc', 'wechat']) {
    const s = source as string
    const fAny = f as any
    payload[`auth_source_default_${s}_balance`] = fAny[`auth_source_default_${s}_balance`] ?? 0
    payload[`auth_source_default_${s}_concurrency`] = fAny[`auth_source_default_${s}_concurrency`] ?? 5
    payload[`auth_source_default_${s}_subscriptions`] = fAny[`auth_source_default_${s}_subscriptions`] ?? []
    payload[`auth_source_default_${s}_grant_on_signup`] = fAny[`auth_source_default_${s}_grant_on_signup`] ?? false
    payload[`auth_source_default_${s}_grant_on_first_bind`] = fAny[`auth_source_default_${s}_grant_on_first_bind`] ?? false
  }

  return payload as UpdateSettingsRequest
}

async function saveAll() {
  if (!form.value) return
  saving.value = true
  try {
    const payload = sanitizePayload(form.value)
    await adminAPI.settings.updateSettings(payload as any)
    showSuccess('设置保存成功')
  } catch (error: any) {
    showError(error.response?.data?.error || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
