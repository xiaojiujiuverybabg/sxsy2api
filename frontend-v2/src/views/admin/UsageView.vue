<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">📊 使用统计</h1>
          <p class="mt-2 text-sm text-slate-400">查看 API 使用日志和统计</p>
        </div>
        <button
          @click="loadUsageLogs"
          :disabled="loading"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
        >
          <span v-if="loading">🔄 加载中...</span>
          <span v-else>🔄 刷新</span>
        </button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="filters.user_id"
          type="number"
          placeholder="用户 ID"
          class="w-32 rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />

        <input
          v-model="filters.api_key_id"
          type="number"
          placeholder="密钥 ID"
          class="w-32 rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />

        <input
          v-model="filters.model"
          type="text"
          placeholder="模型名称"
          class="flex-1 min-w-[200px] rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />

        <button
          @click="applyFilters"
          class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30"
        >
          应用筛选
        </button>
      </div>
    </div>

    <!-- 使用日志列表 -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading && usageLogs.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
          <p class="text-sm text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="usageLogs.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 text-6xl">📊</div>
        <p class="text-lg font-medium text-slate-300">暂无使用记录</p>
      </div>

      <!-- 使用日志表格 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-700/50 bg-slate-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">时间</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">用户</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">密钥</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">模型</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Tokens</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">成本</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">耗时</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/30">
            <tr
              v-for="log in usageLogs"
              :key="log.id"
              class="transition hover:bg-slate-700/20"
            >
              <!-- 时间 -->
              <td class="px-4 py-3 text-sm text-slate-300">{{ formatDate(log.created_at) }}</td>

              <!-- 用户 -->
              <td class="px-4 py-3">
                <div class="text-sm text-white">{{ log.user?.email || `用户 #${log.user_id}` }}</div>
              </td>

              <!-- 密钥 -->
              <td class="px-4 py-3">
                <code class="text-xs text-slate-400">{{ log.api_key?.name || `密钥 #${log.api_key_id}` }}</code>
              </td>

              <!-- 模型 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-300">{{ log.model }}</span>
              </td>

              <!-- Tokens -->
              <td class="px-4 py-3">
                <div class="text-sm text-slate-300">
                  <div>输入: {{ log.prompt_tokens }}</div>
                  <div>输出: {{ log.completion_tokens }}</div>
                  <div class="font-semibold text-gold-400">总计: {{ log.total_tokens }}</div>
                </div>
              </td>

              <!-- 成本 -->
              <td class="px-4 py-3">
                <div class="text-sm">
                  <div class="text-emerald-400">${{ log.actual_cost?.toFixed(4) || '0.0000' }}</div>
                </div>
              </td>

              <!-- 耗时 -->
              <td class="px-4 py-3 text-sm text-slate-300">
                {{ log.duration_ms ? `${log.duration_ms}ms` : '-' }}
              </td>

              <!-- 状态 -->
              <td class="px-4 py-3">
                <span
                  :class="{
                    'bg-green-500/20 text-green-400 border-green-500/50': log.status === 'success',
                    'bg-red-500/20 text-red-400 border-red-500/50': log.status === 'error'
                  }"
                  class="rounded-full border px-2 py-0.5 text-xs font-medium"
                >
                  {{ log.status === 'success' ? '✓ 成功' : '✗ 失败' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="usageLogs.length > 0" class="border-t border-slate-700/50 bg-slate-900/50 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-400">
            显示 {{ usageLogs.length }} 条记录
          </div>
          <div class="flex gap-2">
            <button
              @click="loadMore"
              :disabled="loading"
              class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
            >
              加载更多
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { AdminUsageLog } from '@/types'
import { showError } from '@/utils/toast'

const loading = ref(false)
const usageLogs = ref<AdminUsageLog[]>([])
const filters = ref({
  user_id: '',
  api_key_id: '',
  model: ''
})
const page = ref(1)

onMounted(() => {
  loadUsageLogs()
})

async function loadUsageLogs() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: page.value,
      page_size: 50
    }

    if (filters.value.user_id) params.user_id = filters.value.user_id
    if (filters.value.api_key_id) params.api_key_id = filters.value.api_key_id
    if (filters.value.model) params.model = filters.value.model

    const response = await adminAPI.usage.list(params)
    usageLogs.value = response.data
  } catch (error: any) {
    showError(error.response?.data?.error || '加载使用日志失败')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  loadUsageLogs()
}

function loadMore() {
  page.value++
  loadUsageLogs()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>
