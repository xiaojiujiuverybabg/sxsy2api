<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { adminAPI } from '@/api/admin'
import { showError } from '@/utils/toast'
import type { PaymentDashboardStats } from '@/types/payment'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const days = ref(30)
const loading = ref(false)
const stats = ref<PaymentDashboardStats | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function renderChart() {
  if (!chartCanvas.value || !stats.value?.daily_series) return
  if (chartInstance) chartInstance.destroy()
  const series = stats.value.daily_series
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: series.map(d => d.date.slice(5)),
      datasets: [
        { label: '收入 ($)', data: series.map(d => d.amount), borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.08)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2, yAxisID: 'y' },
        { label: '订单数', data: series.map(d => d.count), borderColor: '#22d3ee', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 2, yAxisID: 'y1' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true, padding: 20 } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 12 } },
        y: { type: 'linear', position: 'left', grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: (v: any) => `$${v}` } },
        y1: { type: 'linear', position: 'right', grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      },
    },
  })
}

const methodColors: Record<string, string> = { alipay: '#3b82f6', wxpay: '#10b981', alipay_direct: '#60a5fa', wxpay_direct: '#34d399', stripe: '#a78bfa' }

async function loadDashboard() {
  loading.value = true
  try {
    const resp = await adminAPI.payment.getDashboard(days.value)
    stats.value = resp.data || resp
    setTimeout(() => renderChart(), 50)
  } catch (e: any) { showError(e?.message || '加载失败') }
  finally { loading.value = false }
}

watch(days, () => loadDashboard())
onMounted(() => loadDashboard())
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <div class="mb-8 flex items-center justify-between">
      <div><h1 class="text-3xl font-black text-white">支付总览</h1><p class="mt-2 text-sm font-medium text-slate-400">收入趋势、支付分布与用户排行</p></div>
      <div class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
        <button v-for="d in [7,30,90]" :key="d" :class="['rounded-lg px-3 py-1.5 text-xs font-bold transition', days === d ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-white']" @click="days = d">{{ d }}天</button>
        <button :disabled="loading" class="ml-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-50" @click="loadDashboard">{{ loading ? '...' : '刷新' }}</button>
      </div>
    </div>

    <div v-if="loading && !stats" class="flex items-center justify-center py-24"><div class="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-rose-500"></div></div>

    <template v-else-if="stats">
      <!-- Metric strip: horizontal scroll on mobile, grid on desktop -->
      <div class="mb-6 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
        <div class="group shrink-0 w-44 lg:w-auto relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-rose-500/30">
          <div class="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-rose-500/10 blur-2xl transition group-hover:bg-rose-500/20"></div>
          <div class="relative"><p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">今日收入</p><p class="mt-1 text-2xl font-black text-rose-400">${{ (stats.today_amount || 0).toFixed(2) }}</p><p class="text-[10px] text-slate-500 mt-0.5">{{ stats.today_count || 0 }} 笔</p></div>
        </div>
        <div class="group shrink-0 w-44 lg:w-auto relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-500/30">
          <div class="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl transition group-hover:bg-blue-500/20"></div>
          <div class="relative"><p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">总收入</p><p class="mt-1 text-2xl font-black text-blue-400">${{ (stats.total_amount || 0).toFixed(2) }}</p><p class="text-[10px] text-slate-500 mt-0.5">{{ stats.total_count || 0 }} 笔</p></div>
        </div>
        <div class="group shrink-0 w-44 lg:w-auto relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-500/30">
          <div class="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div>
          <div class="relative"><p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">今日订单</p><p class="mt-1 text-2xl font-black text-emerald-400">{{ stats.today_count || 0 }}</p><p class="text-[10px] text-slate-500 mt-0.5">笔</p></div>
        </div>
        <div class="group shrink-0 w-44 lg:w-auto relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-amber-500/30">
          <div class="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20"></div>
          <div class="relative"><p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">平均客单</p><p class="mt-1 text-2xl font-black text-amber-400">${{ (stats.avg_amount || 0).toFixed(2) }}</p><p class="text-[10px] text-slate-500 mt-0.5">/ 笔</p></div>
        </div>
      </div>

      <!-- Chart: large hero -->
      <div class="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
        <h3 class="mb-4 text-sm font-bold text-white">收入趋势</h3>
        <div class="h-72"><canvas ref="chartCanvas"></canvas></div>
      </div>

      <!-- Bottom: payment distribution + top users -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Payment methods -->
        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
          <h3 class="mb-4 text-sm font-bold text-white">支付方式分布</h3>
          <div v-if="(stats.payment_methods || []).length === 0" class="py-8 text-center text-xs text-slate-500">暂无数据</div>
          <div v-else class="space-y-3">
            <div v-for="m in stats.payment_methods" :key="m.type" class="flex items-center gap-3">
              <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: methodColors[m.type] || '#64748b' }"></span>
              <span class="flex-1 text-xs text-slate-300 capitalize">{{ m.type.replace(/_/g, ' ') }}</span>
              <span class="text-xs text-slate-500">{{ m.count }} 笔</span>
              <span class="text-xs font-bold text-white w-20 text-right">${{ (m.amount || 0).toFixed(2) }}</span>
              <div class="hidden sm:block h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full transition-all" :style="{ width: `${Math.min(((m.amount || 0) / (stats.payment_methods || [{amount:1}])[0].amount) * 100, 100)}%`, backgroundColor: methodColors[m.type] || '#64748b' }" /></div>
            </div>
          </div>
        </div>

        <!-- Top users -->
        <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
          <h3 class="mb-4 text-sm font-bold text-white">消费排行</h3>
          <div v-if="(stats.top_users || []).length === 0" class="py-8 text-center text-xs text-slate-500">暂无数据</div>
          <div v-else class="space-y-2">
            <div v-for="(u, i) in (stats.top_users || []).slice(0, 10)" :key="u.user_id" class="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/[0.04]">
              <span :class="['flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black', i === 0 ? 'bg-rose-500/20 text-rose-400' : i === 1 ? 'bg-amber-500/20 text-amber-400' : i === 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/[0.06] text-slate-400']">{{ i + 1 }}</span>
              <span class="flex-1 text-xs text-slate-300 truncate">{{ u.email }}</span>
              <span class="text-xs font-bold text-white">${{ (u.amount || 0).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-center py-24"><p class="text-4xl mb-3">💰</p><p class="text-sm text-slate-400">暂无支付数据</p></div>
  </div>
</template>
