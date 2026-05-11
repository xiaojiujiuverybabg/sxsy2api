<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- Header Toolbar -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white">运维监控</h1>
        <p class="mt-1 text-sm text-slate-400">实时系统性能与健康监控面板</p>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="platform" class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 backdrop-blur-sm focus:border-gold-500 focus:outline-none">
          <option value="">全部平台</option>
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
          <option value="antigravity">Antigravity</option>
        </select>
        <div class="flex rounded-lg border border-slate-700/50 bg-slate-800/50 overflow-hidden">
          <button v-for="tr in timeRanges" :key="tr.key" @click="timeRange = tr.key" class="px-3 py-2 text-xs font-medium transition" :class="timeRange === tr.key ? 'bg-gold-500/20 text-gold-400 border-x border-gold-500/30' : 'text-slate-400 hover:text-white'">
            {{ tr.label }}
          </button>
        </div>
        <button @click="autoRefresh = !autoRefresh" class="rounded-lg border px-3 py-2 text-xs transition" :class="autoRefresh ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' : 'border-slate-700/50 bg-slate-800/50 text-slate-400'">
          {{ autoRefresh ? `自动刷新 ${countdown}s` : '自动刷新' }}
        </button>
        <button @click="refreshAll" :disabled="loading" class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 disabled:opacity-50">
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading && !overview" class="space-y-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 h-32"></div>
      </div>
      <div class="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 h-64"></div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 h-64"></div>
        <div class="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 h-64"></div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Row 1: Health Score + Realtime + Stats + Quality -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <!-- Health Score -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
          <div class="relative w-24 h-24">
            <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(51 65 85)" stroke-width="8" />
              <circle cx="50" cy="50" r="42" fill="none" :stroke="healthColor" stroke-width="8" stroke-linecap="round"
                :stroke-dasharray="264" :stroke-dashoffset="264 - (264 * (healthScore || 0)) / 100" class="transition-all duration-700" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-2xl font-bold" :class="healthScore >= 90 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-red-400'">
                {{ healthScore ?? '--' }}
              </span>
            </div>
          </div>
          <p class="mt-2 text-sm font-medium text-slate-300">健康评分</p>
        </div>

        <!-- Realtime QPS/TPS -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">实时流量</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-3xl font-bold text-white font-mono">{{ formatNumber(rtQps?.current) }}</p>
              <p class="text-xs text-slate-500 mt-1">QPS (当前)</p>
              <p class="text-xs text-slate-600">峰值 {{ formatNumber(rtQps?.peak) }} | 均值 {{ formatNumber(rtQps?.avg) }}</p>
            </div>
            <div>
              <p class="text-3xl font-bold text-white font-mono">{{ formatNumber(rtTps?.current) }}</p>
              <p class="text-xs text-slate-500 mt-1">TPS (当前)</p>
              <p class="text-xs text-slate-600">峰值 {{ formatNumber(rtTps?.peak) }} | 均值 {{ formatNumber(rtTps?.avg) }}</p>
            </div>
          </div>
        </div>

        <!-- Key Stats -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-6">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">请求统计</p>
          <div class="space-y-3">
            <div class="flex justify-between text-sm"><span class="text-slate-400">总请求数</span><span class="text-white font-mono">{{ formatNumber(overview?.request_count_total) }}</span></div>
            <div class="flex justify-between text-sm"><span class="text-slate-400">成功请求</span><span class="text-white font-mono">{{ formatNumber(overview?.success_count) }}</span></div>
            <div class="flex justify-between text-sm"><span class="text-slate-400">总 Token</span><span class="text-white font-mono">{{ formatNumber(overview?.token_consumed) }}</span></div>
            <div class="flex justify-between text-sm"><span class="text-slate-400">限流次数</span><span class="text-white font-mono">{{ formatNumber(overview?.business_limited_count) }}</span></div>
          </div>
        </div>

        <!-- Quality -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-6">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">质量指标</p>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-sm"><span class="text-slate-300">SLA</span><span :class="slaPercent >= 99.9 ? 'text-emerald-400' : slaPercent >= 99 ? 'text-amber-400' : 'text-red-400'">{{ slaPercent?.toFixed(2) }}%</span></div>
              <div class="mt-1 h-1.5 rounded-full bg-slate-700 overflow-hidden"><div class="h-full rounded-full transition-all" :class="slaPercent >= 99.9 ? 'bg-emerald-500' : slaPercent >= 99 ? 'bg-amber-500' : 'bg-red-500'" :style="{ width: Math.min(slaPercent || 0, 100) + '%' }"></div></div>
            </div>
            <div class="flex justify-between text-sm"><span class="text-slate-400">错误率</span><span class="text-white font-mono">{{ overview?.error_rate?.toFixed(2) }}%</span></div>
            <div class="flex justify-between text-sm"><span class="text-slate-400">上游错误率</span><span class="text-white font-mono">{{ overview?.upstream_error_rate?.toFixed(2) }}%</span></div>
            <div class="flex justify-between text-sm"><span class="text-slate-400">SLA 错误数</span><span class="text-white font-mono">{{ formatNumber(overview?.error_count_sla) }}</span></div>
          </div>
        </div>
      </div>

      <!-- Row 2: System Health (from overview.system_metrics) -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-4">
          <p class="text-xs text-slate-500 mb-2">CPU</p>
          <p class="text-xl font-bold font-mono" :class="(sysMetrics?.cpu_usage_percent || 0) >= 90 ? 'text-red-400' : (sysMetrics?.cpu_usage_percent || 0) >= 70 ? 'text-amber-400' : 'text-emerald-400'">{{ sysMetrics?.cpu_usage_percent ?? '--' }}<span class="text-sm">%</span></p>
          <div class="mt-2 h-1.5 rounded-full bg-slate-700 overflow-hidden"><div class="h-full rounded-full transition-all" :class="(sysMetrics?.cpu_usage_percent || 0) >= 90 ? 'bg-red-500' : (sysMetrics?.cpu_usage_percent || 0) >= 70 ? 'bg-amber-500' : 'bg-emerald-500'" :style="{ width: Math.min(sysMetrics?.cpu_usage_percent || 0, 100) + '%' }"></div></div>
        </div>
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-4">
          <p class="text-xs text-slate-500 mb-2">内存</p>
          <p class="text-xl font-bold font-mono" :class="(sysMetrics?.memory_usage_percent || 0) >= 95 ? 'text-red-400' : (sysMetrics?.memory_usage_percent || 0) >= 80 ? 'text-amber-400' : 'text-emerald-400'">{{ sysMetrics?.memory_usage_percent ?? '--' }}<span class="text-sm">%</span></p>
          <div class="mt-2 h-1.5 rounded-full bg-slate-700 overflow-hidden"><div class="h-full rounded-full transition-all" :class="(sysMetrics?.memory_usage_percent || 0) >= 95 ? 'bg-red-500' : (sysMetrics?.memory_usage_percent || 0) >= 80 ? 'bg-amber-500' : 'bg-emerald-500'" :style="{ width: Math.min(sysMetrics?.memory_usage_percent || 0, 100) + '%' }"></div></div>
          <p class="text-xs text-slate-600 mt-1">{{ sysMetrics?.memory_used_mb ?? '--' }} / {{ sysMetrics?.memory_total_mb ?? '--' }} MB</p>
        </div>
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-4">
          <p class="text-xs text-slate-500 mb-2">数据库</p>
          <p class="text-xl font-bold font-mono" :class="sysMetrics?.db_ok === true ? 'text-emerald-400' : sysMetrics?.db_ok === false ? 'text-red-400' : 'text-slate-500'">{{ sysMetrics?.db_ok === true ? '正常' : sysMetrics?.db_ok === false ? '异常' : '未知' }}</p>
          <p class="text-xs text-slate-500 mt-1">连接 {{ sysMetrics?.db_conn_active ?? '-' }} / {{ sysMetrics?.db_max_open_conns ?? '-' }}</p>
        </div>
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-4">
          <p class="text-xs text-slate-500 mb-2">Redis</p>
          <p class="text-xl font-bold font-mono" :class="sysMetrics?.redis_ok === true ? 'text-emerald-400' : sysMetrics?.redis_ok === false ? 'text-red-400' : 'text-slate-500'">{{ sysMetrics?.redis_ok === true ? '正常' : sysMetrics?.redis_ok === false ? '异常' : '未知' }}</p>
          <p class="text-xs text-slate-500 mt-1">连接 {{ sysMetrics?.redis_conn_total ?? '-' }} / {{ sysMetrics?.redis_pool_size ?? '-' }}</p>
        </div>
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-4">
          <p class="text-xs text-slate-500 mb-2">Goroutines</p>
          <p class="text-xl font-bold font-mono" :class="(sysMetrics?.goroutine_count || 0) >= 15000 ? 'text-red-400' : (sysMetrics?.goroutine_count || 0) >= 8000 ? 'text-amber-400' : 'text-emerald-400'">{{ formatNumber(sysMetrics?.goroutine_count) }}</p>
          <p class="text-xs text-slate-600 mt-1">队列深度 {{ sysMetrics?.concurrency_queue_depth ?? '--' }}</p>
        </div>
      </div>

      <!-- Row 3: Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-6">
          <h3 class="text-sm font-semibold text-white mb-4">吞吐量趋势</h3>
          <div class="h-64" :class="{ 'hidden': !tpPoints?.length }"><canvas ref="throughputChartRef"></canvas></div>
          <div v-if="!tpPoints?.length" class="text-center text-sm text-slate-500 py-8">暂无吞吐量数据</div>
        </div>
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-6">
          <h3 class="text-sm font-semibold text-white mb-4">错误分布</h3>
          <div class="h-64" :class="{ 'hidden': !errDistItems?.length }"><canvas ref="errorDistChartRef"></canvas></div>
          <div v-if="!errDistItems?.length" class="text-center text-sm text-slate-500 py-8">暂无错误分布数据</div>
        </div>
      </div>

      <!-- Row 4: Concurrency -->
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
        <div class="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">并发状态</h2>
          <span class="text-xs text-slate-500">按平台分组</span>
        </div>
        <div class="p-6">
          <div v-if="!concurrencyList?.length" class="text-center text-sm text-slate-500 py-4">暂无并发数据</div>
          <div v-else class="space-y-3">
            <div v-for="item in concurrencyList" :key="item.platform || item.group_id || item.account_id" class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-white">{{ item.platform || item.group_name || item.account_name || 'Unknown' }}</span>
                <span class="text-xs text-slate-400">{{ item.current_in_use ?? 0 }} / {{ item.max_capacity ?? 0 }} ({{ item.load_percentage?.toFixed(1) ?? '0' }}%)</span>
              </div>
              <div class="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div class="h-full rounded-full transition-all" :class="loadColor(item.load_percentage || 0)" :style="{ width: Math.min(item.load_percentage || 0, 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 5: Error Log Table -->
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
        <div class="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">错误日志</h2>
          <button @click="loadErrorLogs" class="text-xs text-slate-400 hover:text-white transition">刷新</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-700/50 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                <th class="px-6 py-3">时间</th>
                <th class="px-6 py-3">阶段</th>
                <th class="px-6 py-3">平台</th>
                <th class="px-6 py-3">模型</th>
                <th class="px-6 py-3">用户</th>
                <th class="px-6 py-3">状态码</th>
                <th class="px-6 py-3">消息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="errorLogsLoading" class="border-b border-slate-700/50"><td colspan="7" class="px-6 py-8 text-center text-sm text-slate-500">加载中...</td></tr>
              <tr v-else-if="!errorLogs?.length" class="border-b border-slate-700/50"><td colspan="7" class="px-6 py-8 text-center text-sm text-slate-500">暂无错误记录</td></tr>
              <tr v-for="log in errorLogs" :key="log.id" class="border-b border-slate-700/50 hover:bg-white/5 transition cursor-pointer" @click="showErrorDetail(log)">
                <td class="px-6 py-3 text-xs text-slate-400 font-mono">{{ formatTime(log.created_at) }}</td>
                <td class="px-6 py-3"><span class="rounded-full px-2 py-0.5 text-xs" :class="errorTypeBadge(log.phase)">{{ log.phase || log.type || '-' }}</span></td>
                <td class="px-6 py-3 text-xs text-slate-300">{{ log.platform || '-' }}</td>
                <td class="px-6 py-3 text-xs text-slate-400 font-mono max-w-[120px] truncate">{{ log.requested_model || log.model || '-' }}</td>
                <td class="px-6 py-3 text-xs text-slate-400">{{ log.user_email || '-' }}</td>
                <td class="px-6 py-3"><span class="rounded-full px-2 py-0.5 text-xs font-mono" :class="statusBadge(log.status_code)">{{ log.status_code }}</span></td>
                <td class="px-6 py-3 text-xs text-slate-400 max-w-[200px] truncate" :title="log.message">{{ log.message || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="errorTotal > errorPageSize" class="border-t border-slate-700/50 px-6 py-3 flex justify-between items-center">
          <span class="text-xs text-slate-500">共 {{ errorTotal }} 条，第 {{ currentErrorPage }} / {{ Math.ceil(errorTotal / errorPageSize) }} 页</span>
          <div class="flex gap-2">
            <button @click="currentErrorPage--; loadErrorLogs()" :disabled="currentErrorPage <= 1" class="rounded border border-slate-700/50 px-3 py-1 text-xs text-slate-400 hover:text-white disabled:opacity-30">上一页</button>
            <button @click="currentErrorPage++; loadErrorLogs()" :disabled="currentErrorPage * errorPageSize >= errorTotal" class="rounded border border-slate-700/50 px-3 py-1 text-xs text-slate-400 hover:text-white disabled:opacity-30">下一页</button>
          </div>
        </div>
      </div>

      <!-- Row 6: Alert Events -->
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm" v-if="alertEvents?.length">
        <div class="border-b border-slate-700/50 px-6 py-4"><h2 class="text-lg font-semibold text-white">告警事件</h2></div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-700/50 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"><th class="px-6 py-3">时间</th><th class="px-6 py-3">级别</th><th class="px-6 py-3">状态</th><th class="px-6 py-3">标题</th><th class="px-6 py-3">平台</th></tr></thead>
            <tbody>
              <tr v-for="event in alertEvents" :key="event.id" class="border-b border-slate-700/50 hover:bg-white/5 transition">
                <td class="px-6 py-3 text-xs text-slate-400 font-mono">{{ formatTime(event.fired_at) }}</td>
                <td class="px-6 py-3"><span class="rounded-full px-2 py-0.5 text-xs font-bold" :class="severityBadge(event.severity)">{{ event.severity }}</span></td>
                <td class="px-6 py-3"><span class="rounded-full px-2 py-0.5 text-xs" :class="event.status === 'firing' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'">{{ event.status === 'firing' ? '活跃' : '已解决' }}</span></td>
                <td class="px-6 py-3 text-xs text-white max-w-[300px] truncate">{{ event.title || event.description }}</td>
                <td class="px-6 py-3 text-xs text-slate-300">{{ event.platform || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Error Detail Modal -->
    <div v-if="errorDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="errorDetail = null">
      <div class="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">错误详情</h3>
          <button @click="errorDetail = null" class="rounded-lg p-1 text-slate-400 hover:text-white transition">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div><dt class="text-slate-500">请求 ID</dt><dd class="text-white font-mono text-xs mt-0.5">{{ errorDetail.request_id || '-' }}</dd></div>
          <div><dt class="text-slate-500">时间</dt><dd class="text-white mt-0.5">{{ formatTime(errorDetail.created_at) }}</dd></div>
          <div><dt class="text-slate-500">平台</dt><dd class="text-white mt-0.5">{{ errorDetail.platform || '-' }}</dd></div>
          <div><dt class="text-slate-500">模型</dt><dd class="text-white mt-0.5">{{ errorDetail.requested_model || errorDetail.model || '-' }}</dd></div>
          <div><dt class="text-slate-500">状态码</dt><dd class="text-white mt-0.5">{{ errorDetail.status_code }}</dd></div>
          <div><dt class="text-slate-500">阶段</dt><dd class="text-white mt-0.5">{{ errorDetail.phase || '-' }}</dd></div>
          <div class="col-span-2"><dt class="text-slate-500">用户</dt><dd class="text-white mt-0.5">{{ errorDetail.user_email || '-' }}</dd></div>
          <div class="col-span-2"><dt class="text-slate-500">入站端点</dt><dd class="text-white font-mono text-xs mt-0.5 break-all">{{ errorDetail.inbound_endpoint || '-' }}</dd></div>
          <div class="col-span-2"><dt class="text-slate-500">消息</dt><dd class="text-white mt-0.5 break-all">{{ errorDetail.message || '-' }}</dd></div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { adminAPI } from '@/api/admin'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// --- Filters ---
const timeRanges = [
  { key: '5m', label: '5分钟' },
  { key: '30m', label: '30分钟' },
  { key: '1h', label: '1小时' },
  { key: '6h', label: '6小时' },
  { key: '24h', label: '24小时' },
]
const timeRange = ref('30m')
const platform = ref('')
const autoRefresh = ref(true)
const countdown = ref(30)
let refreshTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

// --- Core Data ---
const loading = ref(false)
const overview = ref<Record<string, any> | null>(null)
const tpPoints = ref<any[]>([])
const errDistItems = ref<any[]>([])
const rtSummary = ref<Record<string, any> | null>(null)
const rawConcurrency = ref<Record<string, any> | null>(null)
const errorLogs = ref<any[]>([])
const errorLogsLoading = ref(false)
const errorTotal = ref(0)
const currentErrorPage = ref(1)
const errorPageSize = ref(20)
const alertEvents = ref<any[]>([])
const errorDetail = ref<Record<string, any> | null>(null)

// --- Chart refs ---
const throughputChartRef = ref<HTMLCanvasElement | null>(null)
const errorDistChartRef = ref<HTMLCanvasElement | null>(null)
let throughputChart: Chart | null = null
let errorDistChart: Chart | null = null

// --- Computed ---
const healthScore = computed(() => overview.value?.health_score ?? null)
const healthColor = computed(() => {
  const s = healthScore.value
  if (s == null) return 'rgb(100 116 139)'
  if (s >= 90) return 'rgb(52 211 153)'
  if (s >= 60) return 'rgb(251 191 36)'
  return 'rgb(248 113 113)'
})
const slaPercent = computed(() => overview.value?.sla ?? 100)
const sysMetrics = computed(() => overview.value?.system_metrics || {})

// Realtime traffic: summary.qps / summary.tps
const rtQps = computed(() => rtSummary.value?.summary?.qps || overview.value?.qps || {})
const rtTps = computed(() => rtSummary.value?.summary?.tps || overview.value?.tps || {})

// Concurrency: Record<string, Info> → Array<Info>
const concurrencyList = computed(() => {
  const raw = rawConcurrency.value
  if (!raw) return []
  const platforms = raw.platform || {}
  if (Object.keys(platforms).length) return Object.values(platforms)
  const groups = raw.group || {}
  if (Object.keys(groups).length) return Object.values(groups)
  const accounts = raw.account || {}
  return Object.values(accounts)
})

// --- Helpers ---
function formatNumber(n: any): string {
  if (n == null) return '--'
  const num = Number(n)
  if (isNaN(num)) return '--'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toFixed(num % 1 ? 1 : 0)
}
function formatTime(t: string | null | undefined): string {
  if (!t) return '-'
  try { return new Date(t).toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' }) }
  catch { return t }
}
function loadColor(pct: number): string {
  if (pct < 50) return 'bg-emerald-500'
  if (pct < 75) return 'bg-amber-500'
  return 'bg-red-500'
}
function errorTypeBadge(phase: string | undefined): string {
  switch (phase) {
    case 'upstream': return 'bg-purple-500/20 text-purple-400'
    case 'request': return 'bg-blue-500/20 text-blue-400'
    case 'auth': return 'bg-orange-500/20 text-orange-400'
    case 'routing': return 'bg-cyan-500/20 text-cyan-400'
    case 'internal': return 'bg-pink-500/20 text-pink-400'
    default: return 'bg-slate-500/20 text-slate-400'
  }
}
function statusBadge(code: number | undefined): string {
  if (!code) return 'bg-slate-500/20 text-slate-400'
  if (code >= 500) return 'bg-red-500/20 text-red-400'
  if (code >= 400) return 'bg-amber-500/20 text-amber-400'
  return 'bg-slate-500/20 text-slate-400'
}
function severityBadge(s: string | undefined): string {
  switch (s) {
    case 'P0': return 'bg-red-500/20 text-red-400'
    case 'P1': return 'bg-orange-500/20 text-orange-400'
    case 'P2': return 'bg-amber-500/20 text-amber-400'
    case 'P3': return 'bg-blue-500/20 text-blue-400'
    default: return 'bg-slate-500/20 text-slate-400'
  }
}

async function showErrorDetail(log: Record<string, any>) {
  try {
    const detail = await adminAPI.ops.getErrorLogDetail(String(log.id))
    errorDetail.value = detail || log
  } catch {
    errorDetail.value = log
  }
}

// --- API Loaders ---
async function loadSnapshot() {
  try {
    const params: Record<string, any> = { time_range: timeRange.value }
    if (platform.value) params.platform = platform.value
    const data = await adminAPI.ops.getDashboardSnapshotV2(params)
    // Extract overview + throughput_trend + error_trend from snapshot
    overview.value = data?.overview || null
    tpPoints.value = data?.throughput_trend?.points || data?.throughput_trend || []
    errDistItems.value = [] // will be loaded separately
  } catch { /* ignore */ }
}

async function loadRealtime() {
  try {
    const data = await adminAPI.ops.getRealtimeTrafficSummary({ window: '1min', platform: platform.value || undefined })
    rtSummary.value = data || null
  } catch { /* ignore */ }
}

async function loadConcurrency() {
  try {
    const data = await adminAPI.ops.getConcurrencyStats({ platform: platform.value || undefined })
    rawConcurrency.value = data || null
  } catch { /* ignore */ }
}

async function loadThroughput() {
  try {
    const params: Record<string, any> = { time_range: timeRange.value }
    if (platform.value) params.platform = platform.value
    const data = await adminAPI.ops.getThroughputTrend(params) as any
    tpPoints.value = data?.points || []
    await nextTick()
    renderThroughputChart()
  } catch { /* ignore */ }
}

async function loadErrorDist() {
  try {
    const params: Record<string, any> = { time_range: timeRange.value }
    if (platform.value) params.platform = platform.value
    const data = await adminAPI.ops.getErrorDistribution(params) as any
    errDistItems.value = data?.items || []
    await nextTick()
    renderErrorDistChart()
  } catch { /* ignore */ }
}

async function loadErrorLogs() {
  errorLogsLoading.value = true
  try {
    const params: Record<string, any> = { page: currentErrorPage.value, page_size: errorPageSize.value }
    if (platform.value) params.platform = platform.value
    const data = await adminAPI.ops.listErrorLogs(params)
    errorLogs.value = data.items || []
    errorTotal.value = data.total
  } catch { /* ignore */ }
  finally { errorLogsLoading.value = false }
}

async function loadAlertEvents() {
  try {
    const params: Record<string, any> = { page_size: 10, status: 'firing' }
    const data = await adminAPI.ops.listAlertEvents(params)
    alertEvents.value = data.items || []
  } catch { /* ignore */ }
}

// --- Charts ---
function renderThroughputChart() {
  if (!throughputChartRef.value) return
  if (throughputChart) { throughputChart.destroy(); throughputChart = null }
  const pts = tpPoints.value
  if (!pts?.length) return

  const labels = pts.map((d: any) => formatTime(d.bucket_start))
  const qpsData = pts.map((d: any) => d.qps || 0)
  const tpsData = pts.map((d: any) => (d.tps || 0) / 1000)

  throughputChart = new Chart(throughputChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'QPS', data: qpsData, borderColor: 'rgb(96 165 250)', backgroundColor: 'rgba(96,165,250,0.1)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
        { label: 'TPS (K)', data: tpsData, borderColor: 'rgb(52 211 153)', backgroundColor: 'rgba(52,211,153,0.1)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2, yAxisID: 'y1' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: { legend: { labels: { color: 'rgb(148 163 184)', usePointStyle: true, padding: 20, font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: 'rgb(100 116 139)', maxTicksLimit: 10, font: { size: 10 } }, grid: { color: 'rgba(51,65,85,0.5)' } },
        y: { type: 'linear', position: 'left', ticks: { color: 'rgb(96 165 250)', font: { size: 10 } }, grid: { color: 'rgba(51,65,85,0.5)' } },
        y1: { type: 'linear', position: 'right', ticks: { color: 'rgb(52 211 153)', font: { size: 10 } }, grid: { display: false } },
      },
    },
  })
}

function renderErrorDistChart() {
  if (!errorDistChartRef.value) return
  if (errorDistChart) { errorDistChart.destroy(); errorDistChart = null }
  const items = errDistItems.value
  if (!items?.length) return

  const labels = items.map((d: any) => `${d.status_code}`)
  const values = items.map((d: any) => d.total || 0)
  const colors = ['rgb(248 113 113)', 'rgb(251 146 60)', 'rgb(96 165 250)', 'rgb(148 163 184)', 'rgb(251 191 36)', 'rgb(52 211 153)']

  errorDistChart = new Chart(errorDistChartRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors.slice(0, values.length), borderColor: 'rgb(15 23 42)', borderWidth: 3 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: 'rgb(148 163 184)', usePointStyle: true, padding: 16, font: { size: 11 } } } },
    },
  })
}

// --- Core ---
async function refreshAll() {
  loading.value = true
  try {
    await Promise.allSettled([
      loadSnapshot(),        // overview + system_metrics
      loadRealtime(),        // realtime QPS/TPS
      loadConcurrency(),     // concurrency stats
      loadThroughput(),      // throughput trend chart data
      loadErrorDist(),       // error distribution chart data
      loadErrorLogs(),
      loadAlertEvents(),
    ])
  } finally {
    loading.value = false
  }
}

// --- Auto-Refresh ---
function startAutoRefresh() {
  countdown.value = 30
  countdownTimer = setInterval(() => { countdown.value--; if (countdown.value <= 0) countdown.value = 30 }, 1000)
  refreshTimer = setInterval(() => {
    if (autoRefresh.value) {
      countdown.value = 30
      loadSnapshot(); loadRealtime(); loadConcurrency(); loadThroughput(); loadErrorDist()
    }
  }, 30000)
}
function stopAutoRefresh() {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

watch([timeRange, platform], () => { if (!loading.value) refreshAll() })
watch(autoRefresh, (v) => { if (v) countdown.value = 30 })

onMounted(() => { refreshAll(); startAutoRefresh() })
onUnmounted(() => {
  stopAutoRefresh()
  if (throughputChart) throughputChart.destroy()
  if (errorDistChart) errorDistChart.destroy()
})
</script>
<style scoped>canvas { max-height: 100%; }</style>
