<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Account, AdminGroup, Proxy } from '@/types'
import DateTimePicker from '@/components/ui/DateTimePicker.vue'

const props = defineProps<{
  show: boolean
  editAccount?: Account | null
  groups: AdminGroup[]
  proxies: Proxy[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: Record<string, unknown>, isEdit: boolean): void
}>()

const isEdit = ref(false)
const showAdvanced = ref(false)

const form = ref<Record<string, unknown>>({
  name: '',
  notes: '',
  platform: 'anthropic' as string,
  type: 'apikey' as string,
  // credentials
  api_key: '',
  base_url: '',
  setup_token: '',
  oauth_method: 'manual',
  // capacity
  concurrency: 1,
  load_factor: 1,
  priority: 0,
  // billing
  rate_multiplier: 1.0,
  // scheduling
  status: 'active',
  schedulable: true,
  expires_at: '',
  auto_pause_on_expired: false,
  // relations
  proxy_id: null as number | null,
  group_ids: [] as number[],
  // advanced
  window_cost_limit: 0,
  window_cost_sticky_reserve: 0,
  max_sessions: 0,
  session_idle_timeout_minutes: 30,
  base_rpm: 0,
  rpm_strategy: 'tiered',
  enable_tls_fingerprint: false,
  tls_fingerprint_profile_id: null as number | null,
  session_id_masking_enabled: false,
  cache_ttl_override_enabled: false,
  cache_ttl_override_target: '',
  custom_base_url_enabled: false,
  custom_base_url: '',
  // quota
  quota_limit: 0,
  quota_daily_limit: 0,
  quota_weekly_limit: 0,
})

const platformTypeMap: Record<string, string[]> = {
  anthropic: ['oauth', 'setup-token', 'apikey', 'bedrock'],
  openai: ['oauth', 'apikey'],
  gemini: ['oauth', 'apikey'],
  antigravity: ['oauth', 'upstream'],
}

const availableTypes = ref<string[]>(platformTypeMap.anthropic)

watch(() => form.value.platform, (p) => {
  const types = platformTypeMap[p as string] || ['apikey']
  availableTypes.value = types
  if (!types.includes(form.value.type as string)) {
    form.value.type = types[0]
  }
  // reset credentials on platform change
  form.value.api_key = ''
  form.value.base_url = ''
  form.value.setup_token = ''
})

watch(() => props.show, (val) => {
  if (!val) return
  if (props.editAccount) {
    isEdit.value = true
    const a = props.editAccount
    form.value = {
      ...form.value,
      name: a.name,
      notes: a.notes || '',
      platform: a.platform,
      type: a.type,
      concurrency: a.concurrency,
      load_factor: a.load_factor ?? 1,
      priority: a.priority,
      rate_multiplier: a.rate_multiplier ?? 1.0,
      status: a.status || 'active',
      schedulable: a.schedulable !== false,
      expires_at: a.expires_at ? new Date(a.expires_at).toISOString().slice(0, 16) : '',
      proxy_id: a.proxy_id,
      group_ids: a.group_ids || [],
    }
    showAdvanced.value = false
  } else {
    isEdit.value = false
    showAdvanced.value = false
    resetForm()
  }
})

function resetForm() {
  form.value = {
    name: '',
    notes: '',
    platform: 'anthropic',
    type: 'apikey',
    api_key: '',
    base_url: '',
    setup_token: '',
    oauth_method: 'manual',
    concurrency: 1,
    load_factor: 1,
    priority: 0,
    rate_multiplier: 1.0,
    status: 'active',
    schedulable: true,
    expires_at: '',
    auto_pause_on_expired: false,
    proxy_id: null,
    group_ids: [],
    window_cost_limit: 0,
    window_cost_sticky_reserve: 0,
    max_sessions: 0,
    session_idle_timeout_minutes: 30,
    base_rpm: 0,
    rpm_strategy: 'tiered',
    enable_tls_fingerprint: false,
    tls_fingerprint_profile_id: null,
    session_id_masking_enabled: false,
    cache_ttl_override_enabled: false,
    cache_ttl_override_target: '',
    custom_base_url_enabled: false,
    custom_base_url: '',
    quota_limit: 0,
    quota_daily_limit: 0,
    quota_weekly_limit: 0,
  }
}

function toggleGroup(id: number) {
  const ids = form.value.group_ids as number[]
  const idx = ids.indexOf(id)
  if (idx >= 0) ids.splice(idx, 1)
  else ids.push(id)
}

function handleSubmit() {
  const payload: Record<string, unknown> = {
    name: form.value.name,
    notes: form.value.notes || null,
    platform: form.value.platform,
    type: form.value.type,
    concurrency: form.value.concurrency,
    load_factor: form.value.load_factor,
    priority: form.value.priority,
    rate_multiplier: form.value.rate_multiplier,
    proxy_id: form.value.proxy_id || null,
    group_ids: (form.value.group_ids as number[]).length ? form.value.group_ids : undefined,
  }

  // credentials based on type
  if (form.value.type === 'apikey' || form.value.type === 'upstream') {
    payload.credentials = {
      api_key: form.value.api_key || '',
      ...(form.value.base_url ? { base_url: form.value.base_url } : {}),
    }
  } else if (form.value.type === 'setup-token') {
    payload.credentials = { setup_token: form.value.setup_token || '' }
  }
  // oauth type: credentials handled separately by re-auth flow

  if (isEdit.value) {
    payload.status = form.value.status
    payload.schedulable = form.value.schedulable
  }

  if (form.value.expires_at) {
    payload.expires_at = Math.floor(new Date(form.value.expires_at as string).getTime() / 1000)
  }
  payload.auto_pause_on_expired = form.value.auto_pause_on_expired

  // advanced
  const extra: Record<string, unknown> = {}
  if (showAdvanced.value) {
    if ((form.value.window_cost_limit as number) > 0) {
      extra.window_cost_limit = form.value.window_cost_limit
      extra.window_cost_sticky_reserve = form.value.window_cost_sticky_reserve
    }
    if ((form.value.max_sessions as number) > 0) {
      extra.max_sessions = form.value.max_sessions
      extra.session_idle_timeout_minutes = form.value.session_idle_timeout_minutes
    }
    if ((form.value.base_rpm as number) > 0) {
      extra.base_rpm = form.value.base_rpm
      extra.rpm_strategy = form.value.rpm_strategy
    }
    extra.enable_tls_fingerprint = form.value.enable_tls_fingerprint
    if (form.value.enable_tls_fingerprint && form.value.tls_fingerprint_profile_id) {
      extra.tls_fingerprint_profile_id = form.value.tls_fingerprint_profile_id
    }
    extra.session_id_masking_enabled = form.value.session_id_masking_enabled
    extra.cache_ttl_override_enabled = form.value.cache_ttl_override_enabled
    if (form.value.cache_ttl_override_enabled && form.value.cache_ttl_override_target) {
      extra.cache_ttl_override_target = form.value.cache_ttl_override_target
    }
    extra.custom_base_url_enabled = form.value.custom_base_url_enabled
    if (form.value.custom_base_url_enabled && form.value.custom_base_url) {
      extra.custom_base_url = form.value.custom_base_url
    }
    if ((form.value.quota_limit as number) > 0) {
      extra.quota_limit = form.value.quota_limit
    }
    if ((form.value.quota_daily_limit as number) > 0) {
      extra.quota_daily_limit = form.value.quota_daily_limit
    }
    if ((form.value.quota_weekly_limit as number) > 0) {
      extra.quota_weekly_limit = form.value.quota_weekly_limit
    }
  }
  if (Object.keys(extra).length > 0) {
    payload.extra = extra
  }

  emit('submit', payload, isEdit.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="channel-drawer">
      <div
        v-if="show"
        class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <aside class="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#080b14] shadow-2xl">
          <!-- Header -->
          <header class="flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-brand-400">
                {{ isEdit ? '编辑账号' : '新建账号' }}
              </p>
              <h2 class="mt-1 text-2xl font-black text-white">
                {{ isEdit ? (form.name as string) || '编辑账号' : '创建账号' }}
              </h2>
            </div>
            <button
              class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-brand-500 hover:text-brand-300"
              @click="emit('close')"
            >
              关闭
            </button>
          </header>

          <!-- Form -->
          <form class="flex-1 overflow-y-auto bg-[#080b14] p-6" @submit.prevent="handleSubmit">
            <div class="space-y-5">
              <!-- Basic Info -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-4 text-sm font-bold text-white">基本信息</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">名称 <span class="text-red-400">*</span></label>
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      placeholder="账号名称"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">备注</label>
                    <input
                      v-model="form.notes"
                      type="text"
                      placeholder="可选备注"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              </div>

              <!-- Platform & Type -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-4 text-sm font-bold text-white">平台与类型</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">平台</label>
                    <select
                      v-model="form.platform"
                      :disabled="isEdit"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                    >
                      <option value="anthropic">Anthropic</option>
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Gemini</option>
                      <option value="antigravity">Antigravity</option>
                    </select>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">类型</label>
                    <select
                      v-model="form.type"
                      :disabled="isEdit"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                    >
                      <option v-for="t in availableTypes" :key="t" :value="t">
                        {{ { oauth: 'OAuth', 'setup-token': 'Setup Token', apikey: 'API Key', upstream: 'Upstream', bedrock: 'Bedrock' }[t] || t }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Credentials (API Key / Upstream / Setup Token) -->
              <div
                v-if="form.type === 'apikey' || form.type === 'upstream' || form.type === 'setup-token'"
                class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"
              >
                <h3 class="mb-4 text-sm font-bold text-white">凭证配置</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div v-if="form.type !== 'setup-token'">
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">API Key</label>
                    <input
                      v-model="form.api_key"
                      type="text"
                      :placeholder="isEdit ? '留空则不修改' : '输入 API Key'"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div v-else>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">Setup Token</label>
                    <input
                      v-model="form.setup_token"
                      type="text"
                      :placeholder="isEdit ? '留空则不修改' : '输入 Setup Token'"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div v-if="form.type === 'apikey' || form.type === 'upstream'">
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">Base URL</label>
                    <input
                      v-model="form.base_url"
                      type="text"
                      placeholder="自定义 Base URL（可选）"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              </div>

              <!-- OAuth notice -->
              <div
                v-if="form.type === 'oauth'"
                class="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4"
              >
                <p class="text-xs text-amber-300/80">
                  OAuth 类型账号创建后需通过"重新授权"功能完成凭证配置。
                </p>
              </div>

              <!-- Capacity & Billing -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-4 text-sm font-bold text-white">容量与计费</h3>
                <div class="grid gap-4 md:grid-cols-3">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">并发数</label>
                    <input
                      v-model.number="form.concurrency"
                      type="number"
                      min="1"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">负载因子</label>
                    <input
                      v-model.number="form.load_factor"
                      type="number"
                      min="0"
                      step="0.1"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">优先级</label>
                    <input
                      v-model.number="form.priority"
                      type="number"
                      min="0"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">倍率</label>
                    <input
                      v-model.number="form.rate_multiplier"
                      type="number"
                      min="0"
                      step="0.1"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              </div>

              <!-- Scheduling -->
              <div v-if="isEdit" class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-4 text-sm font-bold text-white">调度与状态</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">状态</label>
                    <select
                      v-model="form.status"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="active">活跃</option>
                      <option value="inactive">未激活</option>
                      <option value="error">异常</option>
                    </select>
                  </div>
                  <div class="flex items-center gap-3 pt-5">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="form.schedulable" type="checkbox" class="rounded border-white/20 bg-white/10" />
                      <span class="text-xs text-slate-400">可调度</span>
                    </label>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">过期时间</label>
                    <DateTimePicker v-model="form.expires_at" placeholder="选择过期时间" />
                  </div>
                  <div class="flex items-center gap-3 pt-5">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="form.auto_pause_on_expired" type="checkbox" class="rounded border-white/20 bg-white/10" />
                      <span class="text-xs text-slate-400">过期自动暂停</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Relations -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-4 text-sm font-bold text-white">关联设置</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">代理</label>
                    <select
                      v-model.number="form.proxy_id"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option :value="null">无代理</option>
                      <option v-for="p in proxies" :key="p.id" :value="p.id">{{ p.name }}</option>
                    </select>
                  </div>
                </div>
                <!-- Group select -->
                <div class="mt-3">
                  <label class="mb-1.5 block text-xs font-medium text-slate-400">分组</label>
                  <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    <button
                      v-for="g in groups"
                      :key="g.id"
                      type="button"
                      :class="[
                        'rounded-lg px-2.5 py-1 text-xs font-medium transition',
                        (form.group_ids as number[]).includes(g.id)
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          : 'bg-white/[0.04] text-slate-400 border border-white/5 hover:border-white/10 hover:text-white'
                      ]"
                      @click="toggleGroup(g.id)"
                    >
                      {{ g.name }}
                    </button>
                    <span v-if="groups.length === 0" class="text-xs text-slate-600">无可用分组</span>
                  </div>
                </div>
              </div>

              <!-- Advanced toggle -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <button
                  type="button"
                  class="flex w-full items-center justify-between text-sm font-bold text-white"
                  @click="showAdvanced = !showAdvanced"
                >
                  <span>高级设置</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    :class="['h-4 w-4 text-slate-400 transition', showAdvanced ? 'rotate-180' : '']"
                  >
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>

                <div v-if="showAdvanced" class="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
                  <!-- Window cost -->
                  <div class="grid gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-slate-400">窗口费用限制</label>
                      <input v-model.number="form.window_cost_limit" type="number" min="0" step="0.01" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-slate-400">粘性预留</label>
                      <input v-model.number="form.window_cost_sticky_reserve" type="number" min="0" step="0.01" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                  </div>

                  <!-- Sessions & RPM -->
                  <div class="grid gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-slate-400">最大会话数</label>
                      <input v-model.number="form.max_sessions" type="number" min="0" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-slate-400">会话空闲超时(分钟)</label>
                      <input v-model.number="form.session_idle_timeout_minutes" type="number" min="1" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-slate-400">基础 RPM</label>
                      <input v-model.number="form.base_rpm" type="number" min="0" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-slate-400">RPM 策略</label>
                      <select v-model="form.rpm_strategy" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                        <option value="tiered">Tiered</option>
                        <option value="sticky_exempt">Sticky Exempt</option>
                      </select>
                    </div>
                  </div>

                  <!-- Quota limits -->
                  <div class="grid gap-4 md:grid-cols-3">
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-slate-400">总额度 ($)</label>
                      <input v-model.number="form.quota_limit" type="number" min="0" step="0.01" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-slate-400">每日额度 ($)</label>
                      <input v-model.number="form.quota_daily_limit" type="number" min="0" step="0.01" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-slate-400">每周额度 ($)</label>
                      <input v-model.number="form.quota_weekly_limit" type="number" min="0" step="0.01" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                  </div>

                  <!-- Toggles -->
                  <div class="flex flex-wrap gap-3">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="form.enable_tls_fingerprint" type="checkbox" class="rounded border-white/20 bg-white/10" />
                      <span class="text-xs text-slate-400">TLS 指纹</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="form.session_id_masking_enabled" type="checkbox" class="rounded border-white/20 bg-white/10" />
                      <span class="text-xs text-slate-400">会话 ID 伪装</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="form.cache_ttl_override_enabled" type="checkbox" class="rounded border-white/20 bg-white/10" />
                      <span class="text-xs text-slate-400">缓存 TTL 覆盖</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="form.custom_base_url_enabled" type="checkbox" class="rounded border-white/20 bg-white/10" />
                      <span class="text-xs text-slate-400">自定义 Base URL</span>
                    </label>
                  </div>

                  <div v-if="form.cache_ttl_override_enabled">
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">缓存 TTL 目标</label>
                    <input v-model="form.cache_ttl_override_target" type="text" placeholder="e.g. 5m" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div v-if="form.custom_base_url_enabled">
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">自定义 Base URL 地址</label>
                    <input v-model="form.custom_base_url" type="text" placeholder="https://..." class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                </div>
              </div>
            </div>
          </form>

          <!-- Footer -->
          <footer class="flex-shrink-0 flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            <button
              type="button"
              class="rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:border-brand-500 hover:text-brand-300"
              @click="emit('close')"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading || !form.name"
              class="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50"
              @click="handleSubmit"
            >
              <span v-if="loading">提交中...</span>
              <span v-else>{{ isEdit ? '保存' : '创建' }}</span>
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.channel-drawer-enter-active,
.channel-drawer-leave-active {
  transition: all 0.25s ease;
}
.channel-drawer-enter-active aside,
.channel-drawer-leave-active aside {
  transition: transform 0.25s ease;
}
.channel-drawer-enter-from,
.channel-drawer-leave-to {
  opacity: 0;
}
.channel-drawer-enter-from aside,
.channel-drawer-leave-to aside {
  transform: translateX(100%);
}
</style>
