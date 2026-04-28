<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Account } from '@/types'

defineProps<{
  show: boolean
  account: Account | null
  loading: boolean
  stats: Record<string, unknown> | null
  error: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const days = ref(30)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#080b14] shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-brand-400">用量统计</p>
            <h2 class="mt-1 text-xl font-black text-white">{{ account?.name || '账号统计' }}</h2>
          </div>
          <button
            class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-brand-500 hover:text-brand-300"
            @click="emit('close')"
          >
            关闭
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Loading -->
          <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="text-center">
              <div class="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-brand-500"></div>
              <p class="text-sm text-slate-400">加载统计数据...</p>
            </div>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="flex items-center justify-center py-20">
            <div class="text-center">
              <p class="text-4xl mb-2">⚠️</p>
              <p class="text-sm text-red-400">{{ error }}</p>
            </div>
          </div>

          <!-- Stats -->
          <div v-else-if="stats">
            <!-- Summary cards -->
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-6">
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">30天费用</p>
                <p class="mt-1 text-xl font-black text-white">${{ ((stats.summary as any)?.total_cost || 0).toFixed(4) }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">请求数</p>
                <p class="mt-1 text-xl font-black text-white">{{ ((stats.summary as any)?.total_requests || 0).toLocaleString() }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">日均费用</p>
                <p class="mt-1 text-xl font-black text-white">${{ ((stats.summary as any)?.avg_daily_cost || 0).toFixed(4) }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Token 总数</p>
                <p class="mt-1 text-xl font-black text-white">{{ ((stats.summary as any)?.total_tokens || 0).toLocaleString() }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">日均请求</p>
                <p class="mt-1 text-lg font-black text-white">{{ ((stats.summary as any)?.avg_daily_requests || 0).toLocaleString() }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">用户费用</p>
                <p class="mt-1 text-lg font-black text-white">${{ ((stats.summary as any)?.total_user_cost || 0).toFixed(4) }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">活跃天数</p>
                <p class="mt-1 text-lg font-black text-white">{{ (stats.summary as any)?.actual_days_used || 0 }} / {{ (stats.summary as any)?.days || 0 }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">平均响应</p>
                <p class="mt-1 text-lg font-black text-white">{{ ((stats.summary as any)?.avg_duration_ms || 0).toFixed(0) }}ms</p>
              </div>
            </div>

            <!-- Today -->
            <div v-if="(stats.summary as any)?.today" class="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 mb-6">
              <p class="text-xs font-bold text-emerald-400 mb-2">今日用量</p>
              <div class="grid grid-cols-4 gap-3 text-center">
                <div>
                  <p class="text-[10px] text-slate-500">请求</p>
                  <p class="text-sm font-bold text-white">{{ (stats.summary as any).today.requests.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-500">Token</p>
                  <p class="text-sm font-bold text-white">{{ (stats.summary as any).today.tokens.toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-500">费用</p>
                  <p class="text-sm font-bold text-white">${{ (stats.summary as any).today.cost.toFixed(4) }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-500">用户费用</p>
                  <p class="text-sm font-bold text-white">${{ ((stats.summary as any).today.user_cost || 0).toFixed(4) }}</p>
                </div>
              </div>
            </div>

            <!-- Model distribution -->
            <div v-if="(stats.models as any[])?.length" class="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-4">
              <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">模型分布</h3>
              <div class="space-y-2">
                <div v-for="m in (stats.models as any[]).slice(0, 10)" :key="m.model" class="flex items-center gap-3">
                  <span class="text-xs text-slate-300 flex-1 truncate">{{ m.model }}</span>
                  <span class="text-xs text-slate-500">{{ m.requests?.toLocaleString() }} 请求</span>
                  <span class="text-xs font-bold text-white">${{ (m.actual_cost || m.cost || 0).toFixed(4) }}</span>
                </div>
              </div>
            </div>

            <!-- Empty -->
            <div v-if="!stats.summary && !stats.models" class="flex items-center justify-center py-16">
              <div class="text-center">
                <p class="text-3xl mb-2">📊</p>
                <p class="text-sm text-slate-400">暂无统计数据</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
