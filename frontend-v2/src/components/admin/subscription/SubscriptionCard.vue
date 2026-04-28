<template>
  <div class="group relative rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800/60">
    <!-- 卡片头部：用户信息 + 状态 -->
    <div class="mb-4 flex items-start justify-between">
      <div class="flex items-center gap-3">
        <!-- 用户头像 -->
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-500/20 to-amber-500/20 ring-1 ring-gold-500/30">
          <span class="text-sm font-bold text-gold-400">
            {{ (subscription.user?.email || subscription.user?.username || '?').charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <div class="text-sm font-medium text-white">
            {{ subscription.user?.email || subscription.user?.username || `用户 #${subscription.user_id}` }}
          </div>
          <div class="mt-0.5 flex items-center gap-2">
            <!-- 分组名称 -->
            <span v-if="subscription.group" class="inline-flex items-center gap-1 text-xs text-slate-400">
              <span class="h-1.5 w-1.5 rounded-full" :class="platformDotClass"></span>
              {{ subscription.group.name }}
            </span>
            <span v-else class="text-xs text-slate-500">分组 #{{ subscription.group_id }}</span>
          </div>
        </div>
      </div>
      <!-- 状态徽章 -->
      <span
        :class="[
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
          statusClass
        ]"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass"></span>
        {{ statusText }}
      </span>
    </div>

    <!-- 用量进度条区域 -->
    <div class="mb-4 space-y-3">
      <!-- 日用量 -->
      <div v-if="subscription.group?.daily_limit_usd" class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400">日用量</span>
          <span class="tabular-nums text-slate-300">
            ${{ (subscription.daily_usage_usd || 0).toFixed(2) }}
            <span class="text-slate-500">/ ${{ subscription.group.daily_limit_usd.toFixed(2) }}</span>
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/50">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="progressColor(subscription.daily_usage_usd, subscription.group.daily_limit_usd)"
            :style="{ width: progressWidth(subscription.daily_usage_usd, subscription.group.daily_limit_usd) }"
          ></div>
        </div>
        <div v-if="subscription.daily_window_start" class="flex items-center gap-1 text-[10px] text-blue-400">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ formatResetTime(subscription.daily_window_start, 'daily') }}
        </div>
      </div>

      <!-- 周用量 -->
      <div v-if="subscription.group?.weekly_limit_usd" class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400">周用量</span>
          <span class="tabular-nums text-slate-300">
            ${{ (subscription.weekly_usage_usd || 0).toFixed(2) }}
            <span class="text-slate-500">/ ${{ subscription.group.weekly_limit_usd.toFixed(2) }}</span>
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/50">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="progressColor(subscription.weekly_usage_usd, subscription.group.weekly_limit_usd)"
            :style="{ width: progressWidth(subscription.weekly_usage_usd, subscription.group.weekly_limit_usd) }"
          ></div>
        </div>
        <div v-if="subscription.weekly_window_start" class="flex items-center gap-1 text-[10px] text-blue-400">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ formatResetTime(subscription.weekly_window_start, 'weekly') }}
        </div>
      </div>

      <!-- 月用量 -->
      <div v-if="subscription.group?.monthly_limit_usd" class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400">月用量</span>
          <span class="tabular-nums text-slate-300">
            ${{ (subscription.monthly_usage_usd || 0).toFixed(2) }}
            <span class="text-slate-500">/ ${{ subscription.group.monthly_limit_usd.toFixed(2) }}</span>
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/50">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="progressColor(subscription.monthly_usage_usd, subscription.group.monthly_limit_usd)"
            :style="{ width: progressWidth(subscription.monthly_usage_usd, subscription.group.monthly_limit_usd) }"
          ></div>
        </div>
        <div v-if="subscription.monthly_window_start" class="flex items-center gap-1 text-[10px] text-blue-400">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ formatResetTime(subscription.monthly_window_start, 'monthly') }}
        </div>
      </div>

      <!-- 无限配额 -->
      <div
        v-if="!subscription.group?.daily_limit_usd && !subscription.group?.weekly_limit_usd && !subscription.group?.monthly_limit_usd"
        class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-3 py-2"
      >
        <span class="text-lg text-emerald-400">∞</span>
        <span class="text-xs font-medium text-emerald-300">无限配额</span>
      </div>
    </div>

    <!-- 底部：到期时间 + 操作 -->
    <div class="flex items-center justify-between border-t border-slate-700/30 pt-3">
      <div>
        <div v-if="subscription.expires_at" class="flex items-center gap-1.5">
          <svg class="h-3.5 w-3.5" :class="isExpiringSoon ? 'text-amber-400' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-xs" :class="isExpiringSoon ? 'font-medium text-amber-400' : 'text-slate-400'">
            {{ formatDate(subscription.expires_at) }}
          </span>
          <span
            v-if="daysRemaining !== null"
            class="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            :class="isExpiringSoon ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-400'"
          >
            {{ daysRemaining }}天
          </span>
        </div>
        <span v-else class="text-xs text-slate-500">永久有效</span>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-1.5">
        <button
          v-if="subscription.status === 'active' || subscription.status === 'expired'"
          @click="$emit('extend', subscription)"
          class="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-400"
          title="调整"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          v-if="subscription.status === 'active'"
          @click="$emit('resetQuota', subscription)"
          class="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-500/10 hover:text-amber-400"
          title="重置配额"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          v-if="subscription.status === 'active'"
          @click="$emit('revoke', subscription)"
          class="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          title="撤销"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserSubscription } from '@/types'

const props = defineProps<{
  subscription: UserSubscription
}>()

defineEmits<{
  extend: [subscription: UserSubscription]
  resetQuota: [subscription: UserSubscription]
  revoke: [subscription: UserSubscription]
}>()

// 状态
const statusText = computed(() => {
  const map: Record<string, string> = { active: '活跃', expired: '已过期', revoked: '已撤销' }
  return map[props.subscription.status] || props.subscription.status
})

const statusClass = computed(() => {
  const map: Record<string, string> = {
    active: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    expired: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    revoked: 'border-red-500/50 bg-red-500/10 text-red-400'
  }
  return map[props.subscription.status] || 'border-slate-500/50 bg-slate-500/10 text-slate-400'
})

const statusDotClass = computed(() => {
  const map: Record<string, string> = {
    active: 'bg-emerald-400',
    expired: 'bg-amber-400',
    revoked: 'bg-red-400'
  }
  return map[props.subscription.status] || 'bg-slate-400'
})

// 平台颜色
const platformDotClass = computed(() => {
  const map: Record<string, string> = {
    anthropic: 'bg-orange-400',
    openai: 'bg-emerald-400',
    gemini: 'bg-blue-400',
    antigravity: 'bg-purple-400'
  }
  return map[props.subscription.group?.platform || ''] || 'bg-slate-400'
})

// 到期相关
const daysRemaining = computed(() => {
  if (!props.subscription.expires_at) return null
  const now = new Date()
  const expires = new Date(props.subscription.expires_at)
  const diff = expires.getTime() - now.getTime()
  if (diff < 0) return null
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const isExpiringSoon = computed(() => {
  const days = daysRemaining.value
  return days !== null && days <= 7
})

// 进度条
const progressWidth = (used: number | null | undefined, limit: number | null): string => {
  if (!limit || limit === 0) return '0%'
  const u = used ?? 0
  return `${Math.min((u / limit) * 100, 100)}%`
}

const progressColor = (used: number | null | undefined, limit: number | null): string => {
  if (!limit || limit === 0) return 'bg-slate-500'
  const u = used ?? 0
  const pct = (u / limit) * 100
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

// 重置倒计时
const formatResetTime = (windowStart: string, period: 'daily' | 'weekly' | 'monthly'): string => {
  if (!windowStart) return '窗口未激活'

  const start = new Date(windowStart)
  const now = new Date()
  let resetTime: Date
  switch (period) {
    case 'daily': resetTime = new Date(start.getTime() + 24 * 60 * 60 * 1000); break
    case 'weekly': resetTime = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); break
    case 'monthly': resetTime = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); break
  }

  const diffMs = resetTime.getTime() - now.getTime()
  if (diffMs <= 0) return '即将重置'

  const diffSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(diffSeconds / 86400)
  const hours = Math.floor((diffSeconds % 86400) / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)

  if (days > 0) return `${days}天${hours}小时后重置`
  if (hours > 0) return `${hours}小时${minutes}分钟后重置`
  return `${minutes}分钟后重置`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>
