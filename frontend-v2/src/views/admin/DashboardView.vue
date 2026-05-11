<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">📊 管理总览</h1>
          <p class="mt-2 text-sm text-slate-400">系统运行状态与数据统计</p>
        </div>
        <button
          @click="loadDashboardStats"
          :disabled="loading"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
        >
          <span v-if="loading">🔄 加载中...</span>
          <span v-else>🔄 刷新</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && !stats" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
        <p class="text-sm text-slate-400">加载中...</p>
      </div>
    </div>

    <!-- 主内容 -->
    <template v-else-if="stats">
      <!-- 核心统计卡片 -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- API 密钥 -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">🔑 API 密钥</div>
            <div class="text-3xl font-bold text-white">{{ stats.total_api_keys }}</div>
            <div class="mt-1 text-xs text-emerald-400">{{ stats.active_api_keys }} 活跃</div>
          </div>
        </div>

        <!-- 服务账号 -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">🔌 服务账号</div>
            <div class="text-3xl font-bold text-white">{{ stats.total_accounts }}</div>
            <div class="mt-1 flex items-center gap-2 text-xs">
              <span class="text-emerald-400">{{ stats.normal_accounts }} 正常</span>
              <span v-if="stats.error_accounts > 0" class="text-red-400">{{ stats.error_accounts }} 异常</span>
            </div>
          </div>
        </div>

        <!-- 今日请求 -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">📈 今日请求</div>
            <div class="text-3xl font-bold text-white">{{ formatNumber(stats.today_requests) }}</div>
            <div class="mt-1 text-xs text-slate-400">总计: {{ formatNumber(stats.total_requests) }}</div>
          </div>
        </div>

        <!-- 新增用户 -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gold-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">👥 今日新增</div>
            <div class="text-3xl font-bold text-gold-400">+{{ stats.today_new_users }}</div>
            <div class="mt-1 text-xs text-slate-400">总用户: {{ formatNumber(stats.total_users) }}</div>
          </div>
        </div>
      </div>

      <!-- Token 统计卡片 -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- 今日 Token -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-amber-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">💎 今日 Token</div>
            <div class="text-3xl font-bold text-white">{{ formatTokens(stats.today_tokens) }}</div>
            <div class="mt-1 flex items-center gap-1 text-xs">
              <span class="text-emerald-400" title="实际成本">${{ formatCost(stats.today_actual_cost) }}</span>
              <span class="text-slate-500">/</span>
              <span class="text-orange-400" title="账号成本">${{ formatCost(stats.today_account_cost) }}</span>
              <span class="text-slate-500">/</span>
              <span class="text-slate-500" title="标准成本">${{ formatCost(stats.today_cost) }}</span>
            </div>
          </div>
        </div>

        <!-- 总 Token -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-indigo-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">💰 总 Token</div>
            <div class="text-3xl font-bold text-white">{{ formatTokens(stats.total_tokens) }}</div>
            <div class="mt-1 flex items-center gap-1 text-xs">
              <span class="text-emerald-400" title="实际成本">${{ formatCost(stats.total_actual_cost) }}</span>
              <span class="text-slate-500">/</span>
              <span class="text-orange-400" title="账号成本">${{ formatCost(stats.total_account_cost) }}</span>
              <span class="text-slate-500">/</span>
              <span class="text-slate-500" title="标准成本">${{ formatCost(stats.total_cost) }}</span>
            </div>
          </div>
        </div>

        <!-- 性能指标 -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-violet-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">⚡ 性能指标</div>
            <div class="flex items-baseline gap-2">
              <div class="text-2xl font-bold text-white">{{ formatTokens(stats.rpm) }}</div>
              <span class="text-xs text-slate-400">RPM</span>
            </div>
            <div class="mt-1 flex items-baseline gap-2">
              <div class="text-lg font-semibold text-violet-400">{{ formatTokens(stats.tpm) }}</div>
              <span class="text-xs text-slate-400">TPM</span>
            </div>
          </div>
        </div>

        <!-- 平均响应时间 -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-rose-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">⏱️ 平均响应</div>
            <div class="text-3xl font-bold text-white">{{ formatDuration(stats.average_duration_ms) }}</div>
            <div class="mt-1 text-xs text-slate-400">{{ stats.active_users }} 活跃用户</div>
          </div>
        </div>
      </div>

      <!-- 支付收入卡片 -->
      <div v-if="paymentStats" class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="group relative overflow-hidden rounded-xl border border-rose-500/20 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-rose-500/40">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-rose-500/10 blur-2xl"></div>
          <div class="relative"><div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">💰 今日收入</div><div class="text-3xl font-bold text-rose-400">${{ (paymentStats.today_amount || 0).toFixed(2) }}</div><div class="mt-1 text-xs text-slate-400">{{ paymentStats.today_count || 0 }} 笔订单</div></div>
        </div>
        <div class="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-blue-500/40">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div class="relative"><div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">🏦 总收入</div><div class="text-3xl font-bold text-blue-400">${{ (paymentStats.total_amount || 0).toFixed(2) }}</div><div class="mt-1 text-xs text-slate-400">{{ paymentStats.total_count || 0 }} 笔订单</div></div>
        </div>
        <div class="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-emerald-500/40">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-2xl"></div>
          <div class="relative"><div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">📊 平均客单</div><div class="text-3xl font-bold text-emerald-400">${{ (paymentStats.avg_amount || 0).toFixed(2) }}</div><div class="mt-1 text-xs text-slate-400">近30天</div></div>
        </div>
        <div class="group relative overflow-hidden rounded-xl border border-amber-500/20 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-amber-500/40">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-amber-500/10 blur-2xl"></div>
          <div class="relative"><div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">👥 消费用户</div><div class="text-3xl font-bold text-amber-400">{{ (paymentStats.top_users || []).length }}</div><div class="mt-1 text-xs text-slate-400">近30天</div></div>
        </div>
      </div>

      <!-- 时间范围筛选 -->
      <div class="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-300">📅 时间范围:</span>
            <input
              v-model="startDate"
              type="date"
              class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <span class="text-slate-500">至</span>
            <input
              v-model="endDate"
              type="date"
              class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-300">📊 粒度:</span>
            <select
              v-model="granularity"
              @change="loadChartData"
              class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="hour">小时</option>
              <option value="day">天</option>
            </select>
          </div>
          <button
            @click="loadChartData"
            :disabled="chartsLoading"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50 disabled:opacity-50"
          >
            应用筛选
          </button>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="space-y-6">
        <!-- 模型分布和 Token 趋势 -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- 模型分布 -->
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
            <h3 class="mb-4 text-lg font-bold text-white">🤖 模型分布</h3>
            <div v-if="chartsLoading" class="flex h-64 items-center justify-center">
              <div class="text-center">
                <div class="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
                <p class="text-xs text-slate-400">加载中...</p>
              </div>
            </div>
            <div v-else-if="modelStats.length > 0" class="space-y-3">
              <div v-for="model in modelStats.slice(0, 8)" :key="model.model" class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="mb-1 flex items-center justify-between text-sm">
                    <span class="font-medium text-white">{{ model.model }}</span>
                    <span class="text-slate-400">{{ formatTokens(model.total_tokens) }}</span>
                  </div>
                  <div class="h-2 overflow-hidden rounded-full bg-slate-700/50">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
                      :style="{ width: `${(model.total_tokens / modelStats[0].total_tokens) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex h-64 items-center justify-center text-sm text-slate-400">暂无数据</div>
          </div>

          <!-- Token 使用趋势 -->
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
            <h3 class="mb-4 text-lg font-bold text-white">📈 Token 使用趋势</h3>
            <div v-if="chartsLoading" class="flex h-64 items-center justify-center">
              <div class="text-center">
                <div class="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
                <p class="text-xs text-slate-400">加载中...</p>
              </div>
            </div>
            <div v-else-if="trendData.length > 0" class="h-64">
              <canvas ref="trendChartCanvas"></canvas>
            </div>
            <div v-else class="flex h-64 items-center justify-center text-sm text-slate-400">暂无数据</div>
          </div>

          <!-- 支付收入趋势 + 支付分布 + 消费排行 -->
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
            <h3 class="mb-4 text-lg font-bold text-white">💰 收入趋势 (近30天)</h3>
            <div v-if="!paymentStats" class="flex h-48 items-center justify-center"><div class="text-center"><div class="mb-2 inline-block h-6 w-6 animate-spin rounded-full border-3 border-slate-700 border-t-rose-500"></div><p class="text-xs text-slate-400">加载中...</p></div></div>
            <div v-else-if="paymentStats.daily_series?.length" class="h-48"><canvas ref="revenueChartCanvas"></canvas></div>
            <div v-else class="flex h-48 items-center justify-center text-sm text-slate-400">暂无支付数据</div>
          </div>

          <!-- 支付方式分布 -->
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
            <h3 class="mb-4 text-lg font-bold text-white">💳 支付方式分布</h3>
            <div v-if="!paymentStats" class="flex h-48 items-center justify-center"><p class="text-xs text-slate-400">加载中...</p></div>
            <div v-else-if="(paymentStats.payment_methods || []).length === 0" class="flex h-48 items-center justify-center text-sm text-slate-400">暂无数据</div>
            <div v-else class="space-y-3">
              <div v-for="m in paymentStats.payment_methods" :key="m.type" class="flex items-center gap-3">
                <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: ({ alipay:'#3b82f6', wxpay:'#10b981', alipay_direct:'#60a5fa', wxpay_direct:'#34d399', stripe:'#a78bfa' } as any)[m.type] || '#64748b' }"></span>
                <span class="flex-1 text-xs text-slate-300">{{ m.type }}</span>
                <span class="text-xs text-slate-500">{{ m.count }} 笔</span>
                <span class="text-xs font-bold text-white w-20 text-right">${{ (m.amount || 0).toFixed(2) }}</span>
                <div class="hidden sm:block h-1.5 w-20 rounded-full bg-slate-700/50 overflow-hidden"><div class="h-full rounded-full transition-all" :style="{ width: `${Math.min(((m.amount || 0) / (paymentStats.payment_methods[0]?.amount || 1)) * 100, 100)}%`, backgroundColor: ({ alipay:'#3b82f6', wxpay:'#10b981', alipay_direct:'#60a5fa', wxpay_direct:'#34d399', stripe:'#a78bfa' } as any)[m.type] || '#64748b' }" /></div>
              </div>
            </div>
          </div>

          <!-- 消费排行 -->
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
            <h3 class="mb-4 text-lg font-bold text-white">🏆 消费排行</h3>
            <div v-if="!paymentStats" class="flex h-48 items-center justify-center"><p class="text-xs text-slate-400">加载中...</p></div>
            <div v-else-if="(paymentStats.top_users || []).length === 0" class="flex h-48 items-center justify-center text-sm text-slate-400">暂无数据</div>
            <div v-else class="space-y-2">
              <div v-for="(u, i) in (paymentStats.top_users || []).slice(0, 8)" :key="u.user_id" class="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/[0.04]">
                <span :class="['flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black', i===0?'bg-rose-500/20 text-rose-400':i===1?'bg-amber-500/20 text-amber-400':i===2?'bg-yellow-500/20 text-yellow-400':'bg-white/[0.06] text-slate-400']">{{ i+1 }}</span>
                <span class="flex-1 text-xs text-slate-300 truncate">{{ u.email }}</span>
                <span class="text-xs font-bold text-white">${{ (u.amount || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 错误状态 -->
    <div v-else class="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/40 py-20 backdrop-blur-sm">
      <div class="mb-4 text-6xl">⚠️</div>
      <h3 class="mb-2 text-xl font-bold text-white">加载失败</h3>
      <p class="mb-6 text-sm text-slate-400">无法加载统计数据</p>
      <button
        @click="loadDashboardStats"
        class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
      >
        重试
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { adminAPI } from '@/api/admin'
import type { DashboardStats, TrendDataPoint, ModelStat } from '@/types'
import type { PaymentDashboardStats } from '@/types/payment'
import Chart from 'chart.js/auto'

const stats = ref<DashboardStats | null>(null)
const paymentStats = ref<PaymentDashboardStats | null>(null)
const paymentLoading = ref(false)
const loading = ref(false)
const chartsLoading = ref(false)

// 图表数据
const trendData = ref<TrendDataPoint[]>([])
const modelStats = ref<ModelStat[]>([])
const trendChartCanvas = ref<HTMLCanvasElement | null>(null)
const revenueChartCanvas = ref<HTMLCanvasElement | null>(null)
let trendChart: Chart | null = null
let revenueChart: Chart | null = null

// 时间范围
const formatLocalDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getLast24HoursRangeDates = (): { start: string; end: string } => {
  const end = new Date()
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
  return {
    start: formatLocalDate(start),
    end: formatLocalDate(end)
  }
}

const defaultRange = getLast24HoursRangeDates()
const startDate = ref(defaultRange.start)
const endDate = ref(defaultRange.end)
const granularity = ref<'day' | 'hour'>('hour')

// 格式化函数
const formatTokens = (value: number | undefined): string => {
  if (value === undefined || value === null) return '0'
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return value.toLocaleString()
}

const formatNumber = (value: number): string => {
  return value.toLocaleString()
}

const formatCost = (value: number): string => {
  if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K'
  } else if (value >= 1) {
    return value.toFixed(2)
  } else if (value >= 0.01) {
    return value.toFixed(3)
  }
  return value.toFixed(4)
}

const formatDuration = (ms: number): string => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  return `${Math.round(ms)}ms`
}

// 创建趋势图表
const createTrendChart = () => {
  if (!trendChartCanvas.value || trendData.value.length === 0) return

  // 销毁旧图表
  if (trendChart) {
    trendChart.destroy()
    trendChart = null
  }

  const ctx = trendChartCanvas.value.getContext('2d')
  if (!ctx) return

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.value.map(d => d.date),
      datasets: [
        {
          label: 'Token 使用量',
          data: trendData.value.map(d => d.total_tokens),
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `Token: ${formatTokens(context.parsed.y ?? 0)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatTokens(Number(value)),
            color: '#94a3b8'
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#94a3b8'
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.1)'
          }
        }
      }
    }
  })
}

const createRevenueChart = () => {
  if (!revenueChartCanvas.value || !paymentStats.value?.daily_series?.length) return
  if (revenueChart) { revenueChart.destroy(); revenueChart = null }
  const ctx = revenueChartCanvas.value.getContext('2d')
  if (!ctx) return
  const series = paymentStats.value.daily_series
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: series.map(d => d.date.slice(5)),
      datasets: [
        { label: '收入 ($)', data: series.map(d => d.amount), borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.1)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2, yAxisID: 'y' },
        { label: '订单数', data: series.map(d => d.count), borderColor: '#22d3ee', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 2, yAxisID: 'y1' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true } } },
      scales: {
        x: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 10 } },
        y: { type: 'linear', position: 'left', grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v: any) => `$${v}` } },
        y1: { type: 'linear', position: 'right', grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
      },
    },
  })
}

// 加载数据
const loadDashboardStats = async () => {
  loading.value = true
  chartsLoading.value = true
  try {
    const response = await adminAPI.dashboard.getSnapshotV2({
      start_date: startDate.value,
      end_date: endDate.value,
      granularity: granularity.value,
      include_stats: true,
      include_trend: true,
      include_model_stats: true
    })

    if (response.stats) {
      stats.value = response.stats
    }
    trendData.value = response.trend || []
    modelStats.value = (response as any).models || []

    // 同时加载支付收入数据
    paymentLoading.value = true
    try {
      const pResp = await adminAPI.payment.getDashboard(30)
      const d = (pResp as any).data
      // 取第一个 truthy：d.data（二次解包）/ d / pResp.data / pResp
      const pd = (d && typeof d === 'object' && !Array.isArray(d) && 'data' in d) ? d.data : d
      paymentStats.value = pd && typeof pd.today_amount === 'number' ? pd : null
      await nextTick()
      createRevenueChart()
    } catch { /* 非关键 */ }
    finally { paymentLoading.value = false }
    await nextTick()
    createTrendChart()
  } catch (error) {
    console.error('加载管理统计失败:', error)
  } finally {
    loading.value = false
    chartsLoading.value = false
  }
}

const loadChartData = async () => {
  chartsLoading.value = true
  try {
    const response = await adminAPI.dashboard.getSnapshotV2({
      start_date: startDate.value,
      end_date: endDate.value,
      granularity: granularity.value,
      include_stats: false,
      include_trend: true,
      include_model_stats: true
    })

    trendData.value = response.trend || []
    modelStats.value = (response as any).models || []

    await nextTick()
    createTrendChart()
  } catch (error) {
    console.error('加载图表数据失败:', error)
  } finally {
    chartsLoading.value = false
  }
}

// 监听日期变化自动调整粒度
watch([startDate, endDate], () => {
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 1) {
    granularity.value = 'hour'
  } else {
    granularity.value = 'day'
  }
})

onMounted(() => {
  loadDashboardStats()
})
</script>
