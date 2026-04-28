<script setup lang="ts">
import { computed } from 'vue'
import type { Account, AdminGroup } from '@/types'

const props = defineProps<{
  account: Account
  groups: AdminGroup[]
  todayStats?: Record<string, { requests: number; tokens: number; cost: number }> | null
}>()

const emit = defineEmits<{
  (e: 'edit', account: Account): void
  (e: 'delete', account: Account): void
  (e: 'toggleStatus', account: Account): void
  (e: 'test', account: Account): void
  (e: 'stats', account: Account): void
  (e: 'refresh', account: Account): void
}>()

const platformLabel: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Gemini',
  antigravity: 'Antigravity',
}

const platformColor: Record<string, string> = {
  anthropic: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
  openai: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
  gemini: 'from-blue-500/20 to-sky-500/10 border-blue-500/30',
  antigravity: 'from-violet-500/20 to-purple-500/10 border-violet-500/30',
}

const platformBgGlow: Record<string, string> = {
  anthropic: 'bg-amber-500/10',
  openai: 'bg-emerald-500/10',
  gemini: 'bg-blue-500/10',
  antigravity: 'bg-violet-500/10',
}

const statusColor: Record<string, string> = {
  active: 'bg-emerald-400',
  inactive: 'bg-slate-500',
  error: 'bg-red-400',
}

const typeLabel: Record<string, string> = {
  oauth: 'OAuth',
  'setup-token': 'Setup Token',
  apikey: 'API Key',
  upstream: 'Upstream',
  bedrock: 'Bedrock',
}

const accountGroups = computed(() => {
  if (!props.account.group_ids || !props.groups.length) return []
  return props.groups.filter(g => props.account.group_ids!.includes(g.id))
})

const todayStat = computed(() => {
  if (!props.todayStats) return null
  return props.todayStats[String(props.account.id)] || null
})

function statusLabel(s: string | undefined) {
  if (s === 'active') return '活跃'
  if (s === 'inactive') return '未激活'
  if (s === 'error') return '异常'
  return s || '未知'
}
</script>

<template>
  <div
    :class="[
      'group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300',
      'hover:-translate-y-0.5 hover:shadow-lg',
      platformColor[account.platform] || 'border-white/10'
    ]"
  >
    <!-- Background glow -->
    <div
      :class="[
        'pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl transition group-hover:scale-150',
        platformBgGlow[account.platform] || 'bg-white/5'
      ]"
    />

    <div class="relative bg-white/[0.03] p-5">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3 min-w-0">
          <!-- Platform icon -->
          <div :class="[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg',
            platformBgGlow[account.platform] || 'bg-white/5'
          ]">
            <span v-if="account.platform === 'anthropic'">🧠</span>
            <span v-else-if="account.platform === 'openai'">🤖</span>
            <span v-else-if="account.platform === 'gemini'">💎</span>
            <span v-else-if="account.platform === 'antigravity'">🌌</span>
            <span v-else>🔌</span>
          </div>
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-white truncate">{{ account.name }}</h3>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span :class="['inline-block h-1.5 w-1.5 rounded-full', statusColor[account.status || 'inactive']]" />
              <span class="text-[11px] text-slate-400">{{ statusLabel(account.status) }}</span>
              <span class="text-[10px] px-1.5 py-px rounded-full bg-white/10 text-slate-300">{{ platformLabel[account.platform] }}</span>
            </div>
          </div>
        </div>
        <!-- More actions dropdown -->
        <div class="relative">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="mb-4 grid grid-cols-3 gap-2">
        <div class="rounded-lg bg-white/[0.04] p-2 text-center">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">并发</p>
          <p class="mt-0.5 text-xs font-bold text-white">
            {{ account.current_concurrency ?? 0 }}<span class="text-slate-600">/{{ account.concurrency }}</span>
          </p>
        </div>
        <div class="rounded-lg bg-white/[0.04] p-2 text-center">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">优先级</p>
          <p class="mt-0.5 text-xs font-bold text-white">{{ account.priority }}</p>
        </div>
        <div class="rounded-lg bg-white/[0.04] p-2 text-center">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">今日费用</p>
          <p class="mt-0.5 text-xs font-bold text-white">
            <template v-if="todayStat">${{ (todayStat.cost || 0).toFixed(4) }}</template>
            <template v-else><span class="text-slate-600">-</span></template>
          </p>
        </div>
      </div>

      <!-- Group badges -->
      <div v-if="accountGroups.length" class="mb-4 flex flex-wrap gap-1">
        <span
          v-for="g in accountGroups.slice(0, 3)"
          :key="g.id"
          class="inline-block rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-slate-300"
        >
          {{ g.name }}
        </span>
        <span
          v-if="accountGroups.length > 3"
          class="inline-block rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
        >
          +{{ accountGroups.length - 3 }}
        </span>
      </div>

      <!-- Type badge + notes -->
      <div class="mb-4 flex items-center gap-2">
        <span class="inline-block rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {{ typeLabel[account.type] || account.type }}
        </span>
        <span v-if="account.rate_multiplier && account.rate_multiplier !== 1" class="inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
          ×{{ account.rate_multiplier }}
        </span>
        <span v-if="account.schedulable === false" class="inline-block rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
          已暂停
        </span>
        <span v-if="account.expires_at" class="inline-block rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-500">
          到期 {{ new Date(account.expires_at).toLocaleDateString('zh-CN') }}
        </span>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-1.5 border-t border-white/[0.06] pt-3">
        <button
          class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          @click.stop="emit('edit', account)"
        >
          编辑
        </button>
        <button
          class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          @click.stop="emit('test', account)"
        >
          测试
        </button>
        <button
          class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          @click.stop="emit('stats', account)"
        >
          统计
        </button>
        <button
          :class="[
            'flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition',
            account.status === 'active'
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          ]"
          @click.stop="emit('toggleStatus', account)"
        >
          {{ account.status === 'active' ? '停用' : '启用' }}
        </button>
        <button
          class="rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] font-medium text-red-400/60 transition hover:bg-red-500/10 hover:text-red-400"
          @click.stop="emit('delete', account)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>
