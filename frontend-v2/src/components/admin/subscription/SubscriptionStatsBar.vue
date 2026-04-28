<template>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <!-- 总订阅数 -->
    <div class="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20">
      <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20"></div>
      <div class="relative">
        <div class="text-xs font-medium uppercase tracking-wider text-slate-400">总订阅</div>
        <div class="mt-2 text-2xl font-bold text-white">{{ stats.total }}</div>
      </div>
    </div>

    <!-- 活跃中 -->
    <div class="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20">
      <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20"></div>
      <div class="relative">
        <div class="text-xs font-medium uppercase tracking-wider text-slate-400">活跃中</div>
        <div class="mt-2 text-2xl font-bold text-emerald-400">{{ stats.active }}</div>
      </div>
    </div>

    <!-- 即将到期 -->
    <div class="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20">
      <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20"></div>
      <div class="relative">
        <div class="text-xs font-medium uppercase tracking-wider text-slate-400">即将到期</div>
        <div class="mt-2 text-2xl font-bold text-amber-400">{{ stats.expiringSoon }}</div>
        <div class="mt-1 text-xs text-slate-500">7天内到期</div>
      </div>
    </div>

    <!-- 已过期 -->
    <div class="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20">
      <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-red-500/10 blur-2xl group-hover:bg-red-500/20"></div>
      <div class="relative">
        <div class="text-xs font-medium uppercase tracking-wider text-slate-400">已过期</div>
        <div class="mt-2 text-2xl font-bold text-red-400">{{ stats.expired }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface SubscriptionStats {
  total: number
  active: number
  expiringSoon: number
  expired: number
}

defineProps<{
  stats: SubscriptionStats
}>()
</script>
