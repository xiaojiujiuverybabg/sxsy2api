<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">📅 订阅管理</h1>
          <p class="mt-2 text-sm text-slate-400">管理用户订阅和权限</p>
        </div>
        <button
          @click="loadSubscriptions"
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
        <select
          v-model="filters.status"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="expired">已过期</option>
          <option value="revoked">已撤销</option>
        </select>

        <input
          v-model="filters.search"
          type="text"
          placeholder="搜索用户..."
          class="flex-1 min-w-[200px] rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 订阅列表 -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading && subscriptions.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
          <p class="text-sm text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="subscriptions.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 text-6xl">📅</div>
        <p class="text-lg font-medium text-slate-300">暂无订阅</p>
      </div>

      <!-- 订阅表格 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-700/50 bg-slate-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">用户</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">分组</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">日用量</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">周用量</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">月用量</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">过期时间</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">创建时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/30">
            <tr
              v-for="sub in subscriptions"
              :key="sub.id"
              class="transition hover:bg-slate-700/20"
            >
              <!-- 用户 -->
              <td class="px-4 py-3">
                <div class="text-sm text-white">{{ sub.user?.email || `用户 #${sub.user_id}` }}</div>
                <div class="text-xs text-slate-400">ID: {{ sub.user_id }}</div>
              </td>

              <!-- 分组 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-300">{{ sub.group?.name || `分组 #${sub.group_id}` }}</span>
              </td>

              <!-- 状态 -->
              <td class="px-4 py-3">
                <span
                  :class="{
                    'bg-green-500/20 text-green-400 border-green-500/50': sub.status === 'active',
                    'bg-red-500/20 text-red-400 border-red-500/50': sub.status === 'expired',
                    'bg-slate-500/20 text-slate-400 border-slate-500/50': sub.status === 'revoked'
                  }"
                  class="rounded-full border px-2 py-0.5 text-xs font-medium"
                >
                  {{ statusText(sub.status) }}
                </span>
              </td>

              <!-- 日用量 -->
              <td class="px-4 py-3 text-sm text-slate-300">${{ sub.daily_usage_usd.toFixed(2) }}</td>

              <!-- 周用量 -->
              <td class="px-4 py-3 text-sm text-slate-300">${{ sub.weekly_usage_usd.toFixed(2) }}</td>

              <!-- 月用量 -->
              <td class="px-4 py-3 text-sm text-slate-300">${{ sub.monthly_usage_usd.toFixed(2) }}</td>

              <!-- 过期时间 -->
              <td class="px-4 py-3 text-sm text-slate-300">
                {{ sub.expires_at ? formatDate(sub.expires_at) : '永久' }}
              </td>

              <!-- 创建时间 -->
              <td class="px-4 py-3 text-sm text-slate-400">{{ formatDate(sub.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { UserSubscription } from '@/types'
import { showError } from '@/utils/toast'

const loading = ref(false)
const subscriptions = ref<UserSubscription[]>([])
const filters = ref({
  status: '',
  search: ''
})

let searchTimeout: NodeJS.Timeout | null = null

onMounted(() => {
  loadSubscriptions()
})

async function loadSubscriptions() {
  loading.value = true
  try {
    const response = await adminAPI.subscriptions.list(1, 100, filters.value)
    subscriptions.value = response.data
  } catch (error: any) {
    showError(error.response?.data?.error || '加载订阅失败')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadSubscriptions()
}

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadSubscriptions()
  }, 500)
}

function statusText(status: string): string {
  const map: Record<string, string> = {
    active: '✓ 活跃',
    expired: '✗ 已过期',
    revoked: '✗ 已撤销'
  }
  return map[status] || status
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>
