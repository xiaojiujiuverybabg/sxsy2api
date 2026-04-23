<template>
  <AtlasPage eyebrow="用量统计" title="API 用量观测台" description="查看详细的 API 调用记录和统计数据">
    <template #actions>
      <div class="flex flex-wrap gap-3">
        <button
          class="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700"
          @click="exportUsage"
          :disabled="exporting"
        >
          {{ exporting ? '导出中...' : '导出 CSV' }}
        </button>
        <button
          class="rounded-full border border-line bg-white px-4 py-2 text-sm font-black text-text-secondary transition hover:border-brand-300"
          @click="loadUsage"
          :disabled="loading"
        >
          刷新
        </button>
      </div>
    </template>

    <section v-if="loading && usageLogs.length === 0" class="mt-8 flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        <p class="text-sm text-text-secondary">加载用量数据...</p>
      </div>
    </section>

    <template v-else>
      <section class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="总请求数"
          :value="formatNumber(stats?.total_requests || 0)"
          mark="◌"
          tone="ember"
          hint="选定时间范围内的请求总数"
        />
        <MetricTile
          label="总 Token"
          :value="formatTokens(stats?.total_tokens || 0)"
          mark="◈"
          tone="moss"
          :hint="`输入 ${formatTokens(stats?.total_input_tokens || 0)} / 输出 ${formatTokens(stats?.total_output_tokens || 0)}`"
        />
        <MetricTile
          label="总消费"
          :value="`$${formatCost(stats?.total_actual_cost || 0)}`"
          mark="$"
          tone="steel"
          :hint="`标准 $${formatCost(stats?.total_cost || 0)}`"
        />
        <MetricTile
          label="平均耗时"
          :value="formatDuration(stats?.average_duration_ms || 0)"
          mark="⏱"
          tone="ink"
          hint="每次请求的平均响应时间"
        />
      </section>

      <section class="mt-5 rounded-2xl border border-line bg-surface p-6">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-text-tertiary">筛选</p>
            <h3 class="mt-1 text-lg font-black text-text-primary">用量筛选</h3>
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="mb-2 block text-sm font-black text-text-primary">API 密钥</label>
            <select
              v-model="filterApiKeyId"
              class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
              @change="loadUsage"
            >
              <option value="">全部密钥</option>
              <option v-for="key in apiKeys" :key="key.id" :value="key.id">
                {{ key.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-black text-text-primary">开始日期</label>
            <input
              v-model="startDate"
              type="date"
              class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
              @change="loadUsage"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-black text-text-primary">结束日期</label>
            <input
              v-model="endDate"
              type="date"
              class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
              @change="loadUsage"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm font-black text-text-secondary transition hover:border-brand-300"
            >
              重置筛选
            </button>
          </div>
        </div>
      </section>

      <section v-if="usageLogs.length > 0" class="mt-5">
        <SmartTable eyebrow="调用记录" title="API 调用日志" :columns="columns" :rows="tableRows">
          <template #toolbar>
            <div class="text-sm text-text-secondary">共 {{ total }} 条记录</div>
          </template>
          <template #cell-model_name="{ value }">
            <code class="rounded bg-surface-secondary px-2 py-1 text-xs font-mono">{{ value }}</code>
          </template>
          <template #cell-status="{ value }">
            <StatusPill :label="String(value)" :tone="value === 200 ? 'success' : 'warning'" />
          </template>
          <template #cell-tokens="{ row }">
            <div class="text-sm">
              <div class="text-text-primary">{{ formatNumber((row as any).raw?.total_tokens || 0) }}</div>
              <div class="text-xs text-text-tertiary">
                输入: {{ formatNumber((row as any).raw?.input_tokens || 0) }} / 输出: {{ formatNumber((row as any).raw?.output_tokens || 0) }}
              </div>
            </div>
          </template>
          <template #cell-cost="{ row }">
            <div class="text-sm">
              <div class="font-mono text-text-primary">${{ formatCost((row as any).raw?.actual_cost || 0) }}</div>
              <div class="text-xs text-text-tertiary line-through">${{ formatCost((row as any).raw?.cost || 0) }}</div>
            </div>
          </template>
          <template #cell-duration="{ value }">
            <span class="font-mono text-sm">{{ formatDuration(Number(value) || 0) }}</span>
          </template>
        </SmartTable>

        <div v-if="total > pageSize" class="mt-4 flex items-center justify-center gap-2">
          <button
            @click="prevPage"
            :disabled="page === 1"
            class="rounded-lg border border-line bg-white px-4 py-2 text-sm font-black transition hover:border-brand-300 disabled:opacity-50"
          >
            上一页
          </button>
          <span class="text-sm text-text-secondary">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
          <button
            @click="nextPage"
            :disabled="page >= totalPages"
            class="rounded-lg border border-line bg-white px-4 py-2 text-sm font-black transition hover:border-brand-300 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </section>

      <EmptyScene v-else title="暂无用量记录" description="选定时间范围内没有 API 调用记录" mark="◌">
        <ActionButton label="查看全部时间" description="重置时间筛选" @click="resetFilters" />
      </EmptyScene>
    </template>
  </AtlasPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { keysAPI, usageAPI } from '@/api'
import type { ApiKey, UsageLog, UsageStatsResponse } from '@/types'
import {
  ActionButton,
  AtlasPage,
  EmptyScene,
  MetricTile,
  SmartTable,
  StatusPill,
} from '@/components/atlas'

const loading = ref(false)
const exporting = ref(false)
const usageLogs = ref<UsageLog[]>([])
const apiKeys = ref<ApiKey[]>([])
const stats = ref<UsageStatsResponse | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = 20

const filterApiKeyId = ref<number | string>('')
const startDate = ref(new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const columns = [
  { key: 'created_at', label: '时间' },
  { key: 'model_name', label: '模型' },
  { key: 'status', label: '状态' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'cost', label: '成本' },
  { key: 'duration', label: '耗时' },
]

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const tableRows = computed(() =>
  usageLogs.value.map((log) => ({
    id: String(log.id || log.request_id),
    created_at: new Date(log.created_at).toLocaleString('zh-CN'),
    model_name: log.model || '-',
    status: (log as any).status || 200,
    tokens: (log as any).total_tokens || 0,
    cost: log.actual_cost || 0,
    duration: (log as any).duration_ms || 0,
    raw: log,
  })),
)

const formatNumber = (n: number) => n.toLocaleString()
const formatCost = (c: number) => c.toFixed(4)
const formatTokens = (t: number) => {
  if (t >= 1_000_000) return `${(t / 1_000_000).toFixed(1)}M`
  if (t >= 1000) return `${(t / 1000).toFixed(1)}K`
  return t.toString()
}
const formatDuration = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(0)}ms`)

const loadUsage = async () => {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      page_size: pageSize,
      start_date: startDate.value,
      end_date: endDate.value,
    }
    if (filterApiKeyId.value) {
      params.api_key_id = filterApiKeyId.value
    }

    const [usageRes, statsRes] = await Promise.all([
      usageAPI.query(params),
      usageAPI.getStatsByDateRange(
        startDate.value,
        endDate.value,
        filterApiKeyId.value ? Number(filterApiKeyId.value) : undefined,
      ),
    ])

    usageLogs.value = usageRes.items
    total.value = usageRes.total
    stats.value = statsRes
  } catch (error) {
    console.error('加载用量数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadApiKeys = async () => {
  try {
    const res = await keysAPI.list(1, 100)
    apiKeys.value = res.items
  } catch (error) {
    console.error('加载密钥列表失败:', error)
  }
}

const resetFilters = () => {
  filterApiKeyId.value = ''
  startDate.value = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]
  endDate.value = new Date().toISOString().split('T')[0]
  page.value = 1
  loadUsage()
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    loadUsage()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    loadUsage()
  }
}

const exportUsage = async () => {
  exporting.value = true
  try {
    const params: Record<string, unknown> = {
      page: 1,
      page_size: 10000,
      start_date: startDate.value,
      end_date: endDate.value,
    }
    if (filterApiKeyId.value) {
      params.api_key_id = filterApiKeyId.value
    }

    const res = await usageAPI.query(params)
    const csv = convertToCSV(res.items)
    downloadCSV(csv, `usage_${startDate.value}_${endDate.value}.csv`)
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败: ' + (error as Error).message)
  } finally {
    exporting.value = false
  }
}

const convertToCSV = (data: UsageLog[]) => {
  const headers = ['时间', '模型', '状态', '输入Token', '输出Token', '总Token', '标准成本', '实际成本', '耗时(ms)']
  const rows = data.map((log) => [
    new Date(log.created_at).toLocaleString('zh-CN'),
    log.model || '-',
    (log as any).status || 200,
    log.input_tokens || 0,
    log.output_tokens || 0,
    (log as any).total_tokens || 0,
    ((log as any).cost || 0).toFixed(6),
    (log.actual_cost || 0).toFixed(6),
    (log as any).duration_ms || 0,
  ])

  return [headers, ...rows].map((row) => row.join(',')).join('\n')
}

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

onMounted(() => {
  loadUsage()
  loadApiKeys()
})
</script>
