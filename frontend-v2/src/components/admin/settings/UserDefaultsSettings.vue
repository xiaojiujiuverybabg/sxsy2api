<template>
  <div class="space-y-6">
    <!-- Default Settings -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">默认设置</h2>
        <p class="mt-1 text-sm text-slate-400">新注册用户默认的余额、并发和订阅配置</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">默认余额</label>
            <input v-model.number="form.default_balance" type="number" min="0" class="form-input" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">默认并发</label>
            <input v-model.number="form.default_concurrency" type="number" min="0" class="form-input" />
          </div>
        </div>

        <!-- Default Subscriptions -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-slate-300">默认订阅</label>
            <button
              type="button"
              @click="addSubscription('default')"
              class="rounded-lg border border-dashed border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:border-gold-500 hover:text-gold-400 transition"
            >
              + 添加订阅
            </button>
          </div>
          <div v-if="!form.default_subscriptions || form.default_subscriptions.length === 0" class="text-center text-sm text-slate-500 py-4 rounded-lg border border-slate-700/50 bg-slate-900/30">
            暂无默认订阅，点击上方按钮添加
          </div>
          <div v-for="(sub, i) in form.default_subscriptions" :key="i" class="flex gap-3 items-center rounded-lg border border-slate-700/50 bg-slate-900/30 p-3 mb-2">
            <select v-model.number="sub.group_id" class="form-input flex-1">
              <option :value="0" disabled>选择分组</option>
              <option v-for="g in subscriptionGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
            <div class="flex items-center gap-2">
              <input v-model.number="sub.validity_days" type="number" min="1" max="36500" class="form-input w-28" placeholder="天数" />
              <span class="text-xs text-slate-500">天</span>
            </div>
            <button type="button" @click="removeSubscription('default', i)" class="rounded-lg p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        <!-- Force email on third party signup -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">强制第三方登录绑定邮箱</p>
            <p class="text-xs text-slate-400 mt-0.5">第三方登录（LinuxDo / OIDC / 微信）时必须绑定邮箱</p>
          </div>
          <button
            type="button"
            @click="toggle('force_email_on_third_party_signup')"
            class="toggle-switch"
            :class="form.force_email_on_third_party_signup ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.force_email_on_third_party_signup ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Auth Source Defaults -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">认证源默认设置</h2>
        <p class="mt-1 text-sm text-slate-400">按不同注册来源为新用户配置默认余额、并发和订阅</p>
      </div>
      <div class="p-6 space-y-3">
        <div v-for="source in authSources" :key="source.key" class="rounded-lg border border-slate-700/50 bg-slate-900/30 overflow-hidden">
          <!-- Collapsible Header -->
          <button
            type="button"
            @click="toggleExpanded(source.key)"
            class="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-white/5 transition"
          >
            <div class="flex items-center gap-3">
              <svg
                class="h-4 w-4 text-slate-400 transition-transform duration-200"
                :class="expandedSources[source.key] ? 'rotate-90' : ''"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-sm font-medium text-white">{{ source.label }}</span>
            </div>
            <button
              type="button"
              @click.stop="setField(source.key, 'grant_on_signup', null)"
              class="toggle-switch"
              :class="authField(source.key, 'grant_on_signup') ? 'bg-gold-500' : 'bg-slate-700'"
            >
              <span class="toggle-knob" :class="authField(source.key, 'grant_on_signup') ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </button>

          <!-- Expanded Content -->
          <div v-if="expandedSources[source.key]" class="border-t border-slate-700/50 px-4 py-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">余额</label>
                <input :value="authField(source.key, 'balance')" @input="setField(source.key, 'balance', ($event.target as HTMLInputElement).value)" type="number" min="0" class="form-input" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">并发 (默认 5)</label>
                <input :value="authField(source.key, 'concurrency')" @input="setField(source.key, 'concurrency', ($event.target as HTMLInputElement).value)" type="number" min="0" class="form-input" />
              </div>
            </div>

            <!-- Grant on First Bind -->
            <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
              <div>
                <p class="text-sm font-medium text-white">首次绑定时授予</p>
                <p class="text-xs text-slate-400 mt-0.5">用户在已有账号上首次绑定此认证方式时，自动授予默认配置</p>
              </div>
              <button
                type="button"
                @click="setField(source.key, 'grant_on_first_bind', null)"
                class="toggle-switch"
                :class="authField(source.key, 'grant_on_first_bind') ? 'bg-gold-500' : 'bg-slate-700'"
              >
                <span class="toggle-knob" :class="authField(source.key, 'grant_on_first_bind') ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>

            <!-- Auth Source Subscriptions -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-medium text-slate-300">默认订阅</label>
                <button
                  type="button"
                  @click="addSubscription(source.key)"
                  class="rounded-lg border border-dashed border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:border-gold-500 hover:text-gold-400 transition"
                >
                  + 添加订阅
                </button>
              </div>
              <div v-if="!authField(source.key, 'subscriptions') || authField(source.key, 'subscriptions').length === 0" class="text-center text-sm text-slate-500 py-4 rounded-lg border border-slate-700/50 bg-slate-900/30">
                暂无默认订阅，点击上方按钮添加
              </div>
              <div v-for="(sub, i) in authField(source.key, 'subscriptions')" :key="i" class="flex gap-3 items-center rounded-lg border border-slate-700/50 bg-slate-900/30 p-3 mb-2">
                <select v-model.number="sub.group_id" class="form-input flex-1">
                  <option :value="0" disabled>选择分组</option>
                  <option v-for="g in subscriptionGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
                </select>
                <div class="flex items-center gap-2">
                  <input v-model.number="sub.validity_days" type="number" min="1" max="36500" class="form-input w-28" placeholder="天数" />
                  <span class="text-xs text-slate-500">天</span>
                </div>
                <button type="button" @click="removeSubscription(source.key, i)" class="rounded-lg p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminAPI } from '@/api/admin'
import type { AdminGroup, DefaultSubscriptionSetting, SystemSettings } from '@/types'

const props = defineProps<{
  form: SystemSettings & Record<string, any>
}>()

const form = computed(() => props.form)

function toggle(key: string) {
  ;(form.value as any)[key] = !(form.value as any)[key]
}

function setField(source: string, field: string, value: any) {
  const key = source === 'default' ? `default_${field}` : `auth_source_default_${source}_${field}`
  const f = form.value as any
  if (field === 'balance' || field === 'concurrency') {
    f[key] = Number(value) || 0
  } else if (field === 'grant_on_signup' || field === 'grant_on_first_bind') {
    f[key] = !f[key]
  }
}

// --- Groups for subscription selectors ---
const subscriptionGroups = ref<AdminGroup[]>([])

onMounted(async () => {
  try {
    const all = await adminAPI.groups.getAll()
    subscriptionGroups.value = all.filter(
      (g) => g.subscription_type === 'subscription' && g.status === 'active'
    )
  } catch {
    // silently ignore load failure; selector will be empty
  }
})

// --- Auth sources ---
const authSources = [
  { key: 'email', label: '邮箱注册' },
  { key: 'linuxdo', label: 'LinuxDo' },
  { key: 'oidc', label: 'OIDC' },
  { key: 'wechat', label: '微信' },
] as const

const expandedSources = ref<Record<string, boolean>>({
  email: false,
  linuxdo: false,
  oidc: false,
  wechat: false,
})

function toggleExpanded(key: string) {
  expandedSources.value[key] = !expandedSources.value[key]
}

function authField(source: string, field: string) {
  const key = `auth_source_default_${source}_${field}`
  return (form.value as any)[key] ?? (field === 'concurrency' ? 5 : field === 'subscriptions' ? [] : 0)
}

// --- Subscription helpers ---
function ensureSubscriptions(source: string): DefaultSubscriptionSetting[] {
  const fieldKey = source === 'default' ? 'default_subscriptions' : `auth_source_default_${source}_subscriptions`
  const f = form.value as any
  if (!f[fieldKey]) {
    f[fieldKey] = []
  }
  return f[fieldKey]
}

function addSubscription(source: string) {
  const subs = ensureSubscriptions(source)
  subs.push({
    group_id: 0,
    validity_days: 30,
  } as DefaultSubscriptionSetting)
}

function removeSubscription(source: string, index: number) {
  const subs = ensureSubscriptions(source)
  subs.splice(index, 1)
}
</script>

<style scoped>
.form-input {
  @apply w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-slate-600;
}
select.form-input {
  @apply appearance-none cursor-pointer;
}
.toggle-switch {
  @apply relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200;
}
.toggle-knob {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200;
}
</style>
