<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">兑换码</h1>
      <p class="mt-2 text-sm text-slate-400">使用兑换码充值余额或激活订阅</p>
    </div>

    <div class="space-y-6">
      <!-- 当前余额卡片 -->
      <div class="overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/20 to-brand-600/10 backdrop-blur-sm">
        <div class="p-8 text-center">
          <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-400/30 bg-brand-500/20">
            <span class="text-3xl">💰</span>
          </div>
          <p class="text-sm font-medium text-slate-300">当前余额</p>
          <p class="mt-2 text-4xl font-bold text-white">
            ${{ user?.balance?.toFixed(2) || '0.00' }}
          </p>
        </div>
      </div>

      <!-- 兑换表单 -->
      <div class="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
        <div class="mb-4 flex items-center gap-2">
          <span class="text-xl">🎁</span>
          <h2 class="text-lg font-bold text-white">兑换码</h2>
        </div>
        <form @submit.prevent="handleRedeem" class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">输入兑换码</label>
            <input
              v-model="redeemCode"
              type="text"
              required
              placeholder="请输入兑换码"
              :disabled="submitting"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-lg text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            />
            <p class="mt-2 text-xs text-slate-500">兑换码区分大小写，请准确输入</p>
          </div>

          <button
            type="submit"
            :disabled="!redeemCode || submitting"
            class="w-full rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting" class="inline-flex items-center gap-2">
              <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              兑换中...
            </span>
            <span v-else>立即兑换</span>
          </button>
        </form>
      </div>

      <!-- 成功提示 -->
      <transition name="fade">
        <div
          v-if="redeemResult"
          class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 backdrop-blur-sm"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              <span class="text-xl">✓</span>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-bold text-emerald-400">兑换成功</h3>
              <div class="mt-2 space-y-1 text-sm text-emerald-300">
                <p>{{ redeemResult.message }}</p>
                <p v-if="redeemResult.type === 'balance'" class="font-medium">
                  已充值: ${{ redeemResult.value.toFixed(2) }}
                </p>
                <p v-else-if="redeemResult.type === 'subscription'" class="font-medium">
                  订阅已激活
                  <span v-if="redeemResult.group_name"> - {{ redeemResult.group_name }}</span>
                </p>
                <p v-if="redeemResult.new_balance !== undefined">
                  新余额: <span class="font-semibold">${{ redeemResult.new_balance.toFixed(2) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 错误提示 -->
      <transition name="fade">
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-sm"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/20">
              <span class="text-xl">✕</span>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-bold text-red-400">兑换失败</h3>
              <p class="mt-2 text-sm text-red-300">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- 兑换历史 -->
      <div class="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
        <div class="border-b border-slate-700/50 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">📜</span>
              <h2 class="text-lg font-bold text-white">兑换历史</h2>
            </div>
            <button
              @click="fetchHistory"
              :disabled="loadingHistory"
              class="text-sm text-brand-400 transition hover:text-brand-300 disabled:opacity-50"
            >
              刷新
            </button>
          </div>
        </div>

        <div class="p-6">
          <!-- 加载状态 -->
          <div v-if="loadingHistory" class="flex items-center justify-center py-12">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
          </div>

          <!-- 历史列表 -->
          <div v-else-if="paginatedHistory.length > 0" class="space-y-3">
            <div
              v-for="item in paginatedHistory"
              :key="item.id"
              class="flex items-center justify-between rounded-xl border border-slate-700/30 bg-slate-900/30 p-4 transition hover:bg-slate-900/50"
            >
              <div class="flex items-center gap-4">
                <div
                  :class="[
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    getTypeColor(item.type)
                  ]"
                >
                  <span class="text-xl">{{ getTypeIcon(item.type) }}</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-white">{{ getTypeLabel(item.type) }}</p>
                  <p class="text-xs text-slate-500">{{ formatDateTime(item.used_at) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p :class="['text-sm font-bold', getValueColor(item.type)]">
                  {{ formatValue(item) }}
                </p>
                <p class="mt-1 font-mono text-xs text-slate-500">
                  {{ item.code.slice(0, 8) }}...
                </p>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="flex flex-col items-center justify-center py-12 text-center">
            <div class="mb-4 text-6xl">📭</div>
            <h3 class="mb-2 text-lg font-bold text-white">暂无兑换记录</h3>
            <p class="text-sm text-slate-400">使用兑换码后，记录将显示在这里</p>
          </div>

          <!-- 分页 -->
          <div v-if="history.length > pageSize" class="mt-6 flex items-center justify-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span class="text-sm text-slate-400">
              第 {{ currentPage }} / {{ totalPages }} 页
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { redeemAPI, type RedeemHistoryItem } from '@/api/redeem'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const redeemCode = ref('')
const submitting = ref(false)
const redeemResult = ref<{
  message: string
  type: string
  value: number
  new_balance?: number
  new_concurrency?: number
  group_name?: string
} | null>(null)
const errorMessage = ref('')

const history = ref<RedeemHistoryItem[]>([])
const loadingHistory = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = 10
const totalPages = computed(() => Math.ceil(history.value.length / pageSize))
const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return history.value.slice(start, end)
})

const getTypeIcon = (type: string) => {
  if (type === 'balance' || type === 'admin_balance') return '💰'
  if (type === 'subscription') return '⭐'
  return '🎁'
}

const getTypeColor = (type: string) => {
  if (type === 'balance' || type === 'admin_balance') return 'bg-emerald-500/20 border border-emerald-500/30'
  if (type === 'subscription') return 'bg-purple-500/20 border border-purple-500/30'
  return 'bg-blue-500/20 border border-blue-500/30'
}

const getValueColor = (type: string) => {
  if (type === 'balance' || type === 'admin_balance') return 'text-emerald-400'
  if (type === 'subscription') return 'text-purple-400'
  return 'text-blue-400'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    balance: '余额充值',
    admin_balance: '管理员调整',
    subscription: '订阅激活',
    concurrency: '并发调整',
    admin_concurrency: '管理员调整'
  }
  return labels[type] || '未知类型'
}

const formatValue = (item: RedeemHistoryItem) => {
  if (item.type === 'balance' || item.type === 'admin_balance') {
    const sign = item.value >= 0 ? '+' : ''
    return `${sign}$${item.value.toFixed(2)}`
  } else if (item.type === 'subscription') {
    const groupName = item.group?.name || ''
    return groupName || '订阅'
  }
  return `+${item.value}`
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchHistory = async () => {
  loadingHistory.value = true
  try {
    history.value = await redeemAPI.getHistory()
    currentPage.value = 1
  } catch (error) {
    console.error('获取兑换历史失败:', error)
  } finally {
    loadingHistory.value = false
  }
}

const handleRedeem = async () => {
  if (!redeemCode.value.trim()) return

  submitting.value = true
  errorMessage.value = ''
  redeemResult.value = null

  try {
    const result = await redeemAPI.redeem(redeemCode.value.trim())
    redeemResult.value = result
    redeemCode.value = ''

    await authStore.refreshUser()
    await fetchHistory()

    setTimeout(() => {
      redeemResult.value = null
    }, 5000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.detail || error.message || '兑换失败，请检查兑换码是否正确'

    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
