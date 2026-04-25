<template>
  <div
    v-if="show && user"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div class="w-full max-w-5xl rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-950 to-slate-900 shadow-2xl">
      <!-- Header -->
      <div class="border-b border-slate-700/50 bg-slate-900/50 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-white">余额历史记录</h2>
            <p class="mt-1 text-sm text-slate-400">查看用户的所有余额变动记录</p>
          </div>
          <button
            @click="handleClose"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
        <!-- User Info Card -->
        <div class="mb-6 rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5">
          <div class="flex items-start gap-4">
            <!-- Avatar -->
            <div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg">
              <span class="text-2xl font-bold text-white">
                {{ user.email.charAt(0).toUpperCase() }}
              </span>
            </div>

            <!-- User Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-bold text-white truncate">{{ user.email }}</h3>
                <span
                  v-if="user.username"
                  class="flex-shrink-0 rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-medium text-brand-400"
                >
                  {{ user.username }}
                </span>
              </div>
              <p class="text-sm text-slate-400">
                注册时间: {{ formatDateTime(user.created_at) }}
              </p>
              <p v-if="user.remark" class="mt-1 text-sm text-slate-500 truncate" :title="user.remark">
                备注: {{ user.remark }}
              </p>
            </div>

            <!-- Balance Stats -->
            <div class="flex-shrink-0 text-right space-y-3">
              <div>
                <p class="text-xs text-slate-400 mb-1">当前余额</p>
                <p class="text-2xl font-bold text-emerald-400">
                  ${{ user.balance?.toFixed(2) || '0.00' }}
                </p>
              </div>
              <div class="rounded-lg bg-slate-800/50 px-3 py-2">
                <p class="text-xs text-slate-400 mb-0.5">累计充值</p>
                <p class="text-lg font-bold text-brand-400">
                  ${{ totalRecharged.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Actions -->
        <div class="mb-5 flex flex-wrap items-center gap-3">
          <!-- Type Filter -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-300">类型筛选:</label>
            <select
              v-model="typeFilter"
              @change="loadHistory(1)"
              class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition"
            >
              <option value="">全部类型</option>
              <option value="balance">💰 余额（兑换码）</option>
              <option value="admin_balance">👨‍💼 管理员余额</option>
              <option value="concurrency">⚡ 并发数（兑换码）</option>
              <option value="admin_concurrency">🔧 管理员并发数</option>
              <option value="subscription">🎫 订阅</option>
            </select>
          </div>

          <div class="flex-1"></div>

          <!-- Action Buttons -->
          <button
            @click="handleDeposit"
            class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 hover:scale-105"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            充值
          </button>
          <button
            @click="handleRefund"
            class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/30 transition hover:shadow-orange-500/50 hover:scale-105"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            退款
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-16">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
          <p class="mt-4 text-sm text-slate-400">加载中...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="history.length === 0" class="flex flex-col items-center justify-center py-16">
          <div class="mb-4 text-7xl">📊</div>
          <h3 class="mb-2 text-lg font-bold text-white">暂无历史记录</h3>
          <p class="text-sm text-slate-400">该用户还没有余额变动记录</p>
        </div>

        <!-- History Grid -->
        <div v-else class="grid gap-4">
          <div
            v-for="item in history"
            :key="item.id"
            class="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition hover:border-slate-600 hover:bg-slate-800/50"
          >
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div
                :class="[
                  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition group-hover:scale-110',
                  getIconBg(item)
                ]"
              >
                <span class="text-2xl">{{ getIconEmoji(item) }}</span>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <h4 class="text-base font-semibold text-white mb-1">
                      {{ getItemTitle(item) }}
                    </h4>
                    <p
                      v-if="item.notes"
                      class="text-sm text-slate-400 mb-2 line-clamp-2"
                      :title="item.notes"
                    >
                      {{ item.notes }}
                    </p>
                    <div class="flex items-center gap-4 text-xs text-slate-500">
                      <span class="flex items-center gap-1">
                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ formatDateTime(item.used_at || item.created_at) }}
                      </span>
                      <span v-if="!isAdminType(item.type)" class="font-mono">
                        {{ item.code.slice(0, 12) }}...
                      </span>
                      <span v-else class="rounded bg-slate-700/50 px-2 py-0.5">
                        管理员操作
                      </span>
                    </div>
                  </div>

                  <!-- Value -->
                  <div class="flex-shrink-0 text-right">
                    <p :class="['text-xl font-bold', getValueColor(item)]">
                      {{ formatValue(item) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-3">
          <button
            :disabled="currentPage <= 1"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="loadHistory(currentPage - 1)"
          >
            上一页
          </button>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-400">第</span>
            <span class="rounded-lg bg-brand-500/20 px-3 py-1 text-sm font-bold text-brand-400">
              {{ currentPage }}
            </span>
            <span class="text-sm text-slate-400">/ {{ totalPages }} 页</span>
          </div>
          <button
            :disabled="currentPage >= totalPages"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="loadHistory(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { adminAPI } from '@/api/admin'
import type { AdminUser } from '@/types'
import { showError } from '@/utils/toast'

interface BalanceHistoryItem {
  id: number
  code: string
  type: string
  value: number
  status: string
  used_by: number | null
  used_at: string | null
  created_at: string
  group_id: number | null
  group?: { name: string }
  validity_days: number
  notes: string
}

const props = defineProps<{
  show: boolean
  user: AdminUser | null
}>()

const emit = defineEmits<{
  close: []
  deposit: []
  refund: []
}>()

const loading = ref(false)
const history = ref<BalanceHistoryItem[]>([])
const currentPage = ref(1)
const total = ref(0)
const totalRecharged = ref(0)
const pageSize = 15
const typeFilter = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)

watch(() => props.show, (v) => {
  if (v && props.user) {
    typeFilter.value = ''
    loadHistory(1)
  }
})

const loadHistory = async (page: number) => {
  if (!props.user) return
  loading.value = true
  currentPage.value = page
  try {
    const response = await adminAPI.users.getBalanceHistory(
      props.user.id,
      page,
      pageSize,
      typeFilter.value || undefined
    )
    history.value = response.items || []
    total.value = response.total || 0
    totalRecharged.value = response.total_recharged || 0
  } catch (error: any) {
    console.error('Failed to load balance history:', error)
    showError(error.response?.data?.error || '加载余额历史失败')
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}

const handleDeposit = () => {
  emit('deposit')
}

const handleRefund = () => {
  emit('refund')
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper: check if admin type
const isAdminType = (type: string) => type === 'admin_balance' || type === 'admin_concurrency'

// Helper: check if balance type (includes admin_balance)
const isBalanceType = (type: string) => type === 'balance' || type === 'admin_balance'

// Helper: check if subscription type
const isSubscriptionType = (type: string) => type === 'subscription'

// Icon emoji based on type
const getIconEmoji = (item: BalanceHistoryItem) => {
  if (isBalanceType(item.type)) return item.value >= 0 ? '💰' : '💸'
  if (isSubscriptionType(item.type)) return '🎫'
  return item.value >= 0 ? '⚡' : '🔋'
}

// Icon background color
const getIconBg = (item: BalanceHistoryItem) => {
  if (isBalanceType(item.type)) {
    return item.value >= 0
      ? 'bg-emerald-500/20 shadow-emerald-500/20'
      : 'bg-red-500/20 shadow-red-500/20'
  }
  if (isSubscriptionType(item.type)) return 'bg-purple-500/20 shadow-purple-500/20'
  return item.value >= 0
    ? 'bg-blue-500/20 shadow-blue-500/20'
    : 'bg-orange-500/20 shadow-orange-500/20'
}

// Value text color
const getValueColor = (item: BalanceHistoryItem) => {
  if (isBalanceType(item.type)) {
    return item.value >= 0
      ? 'text-emerald-400'
      : 'text-red-400'
  }
  if (isSubscriptionType(item.type)) return 'text-purple-400'
  return item.value >= 0
    ? 'text-blue-400'
    : 'text-orange-400'
}

// Item title
const getItemTitle = (item: BalanceHistoryItem) => {
  switch (item.type) {
    case 'balance':
      return '余额充值（兑换码）'
    case 'admin_balance':
      return item.value >= 0 ? '管理员充值' : '管理员扣款'
    case 'concurrency':
      return '并发数增加（兑换码）'
    case 'admin_concurrency':
      return item.value >= 0 ? '管理员增加并发数' : '管理员减少并发数'
    case 'subscription':
      return '订阅分配'
    default:
      return '未知类型'
  }
}

// Format display value
const formatValue = (item: BalanceHistoryItem) => {
  if (isBalanceType(item.type)) {
    const sign = item.value >= 0 ? '+' : ''
    return `${sign}$${item.value.toFixed(2)}`
  }
  if (isSubscriptionType(item.type)) {
    const days = item.validity_days || Math.round(item.value)
    const groupName = item.group?.name || ''
    return groupName ? `${days}d - ${groupName}` : `${days}d`
  }
  // concurrency types
  const sign = item.value >= 0 ? '+' : ''
  return `${sign}${item.value}`
}
</script>
